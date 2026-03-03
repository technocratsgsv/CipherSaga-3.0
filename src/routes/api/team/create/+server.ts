import type { RequestHandler } from '@sveltejs/kit';
import { adminDB, adminAuth } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import * as referralCodes from 'referral-codes';
import { error, json } from '@sveltejs/kit';
import axios from "axios";

export const POST: RequestHandler = async ({ request, cookies, locals }: any) => {

    if (locals.userID === null || !locals.userExists || locals.userTeam !== null) {
        return error(401, 'Unauthorized');
    }

    const body = await request.json();
    let { teamName } = body;
    if (teamName === undefined || teamName === null || teamName.trim() === "") return error(400, "Bad Request");
    teamName = teamName.toLowerCase();

    // NEW SCHALABILITY PATTERN:
    // 1. Check if teamName is taken by trying to create a document in 'teamNames' collection.
    // We do this inside the transaction or check beforehand.
    // To minimize transaction contention, we can check beforehand (read), but must strict verify in transaction (create).

    try {
        await adminDB.runTransaction(async (transaction) => {
            // 1. Uniqueness Check for Name
            // We use a dedicated collection 'teamNames' where docID = teamName
            const nameRef = adminDB.collection('teamNames').doc(teamName);
            const nameDoc = await transaction.get(nameRef);
            if (nameDoc.exists) {
                throw new Error("Team name is already taken");
            }

            // 2. Generate Unique Team Code
            // We can't easily check global uniqueness without a query or a big map.
            // But with 8 chars, collision is rare.
            // We'll generate one, query if it exists. If it does, fail (client retries) or we retry here.
            // In a transaction, queries are allowed.
            let teamCode = referralCodes.generate({ length: 8, count: 1 })[0].toLowerCase();

            // Query to see if this code is taken.
            // Note: In high traffic, 'count()' or index checks are better.
            const codeQuery = await adminDB.collection('teams').where('code', '==', teamCode).limit(1).get();
            if (!codeQuery.empty) {
                // Collision! Abort current transaction to be safe or try generating another?
                // Transactions should be fast. Let's just fail and let client/frontend retry (or simple recursion).
                // Probability is low enough (`26+10`^8) that we can just throw.
                throw new Error("Collision detected, please try again");
            }

            const newTeamRef = adminDB.collection('teams').doc();
            const userRef = adminDB.collection('users').doc(locals.userID!);
            const teamID = newTeamRef.id;

            const teamMembers = [locals.userID,];
            const userRecord = await adminAuth.getUser(locals.userID!);
            let data = {
                created: FieldValue.serverTimestamp(),
                last_change: FieldValue.serverTimestamp(),
                teamName,
                uid: teamID,
                code: teamCode,
                owner: locals.userID,
                members: teamMembers,
                level: 1,
                banned: false,
                gsv_verified: false,
                bonusPoints: 0,
                scannedQRCodes: []
            };
            if ((userRecord.email || "").endsWith("gsv.ac.in")) {
                data['gsv_verified'] = true;
            }

            // Writes
            transaction.set(newTeamRef, data);

            // Reserve the name
            transaction.set(nameRef, {
                teamId: teamID,
                createdAt: FieldValue.serverTimestamp()
            });

            // Update User
            transaction.update(userRef, { team: teamID });

            // NO UPDATES TO 'nameIndex' or 'userIndex'
        });

        // Webhook (Fire and Forget)
        try {
            if (process.env.WEBHOOK) {
                // Get count - might be slow if collection is huge, but aggregated count is okay-ish to read occasionally
                // or just skip count for performance? User wanted optimization.
                // let's skip count or use a cached counter if we had one.
                // For now, just say "New Team".
                await axios.post(process.env.WEBHOOK, {
                    "content": `**New Team Created**\nName: ${teamName}`
                });
            }
        } catch (webhookError) {
            console.error("Webhook error:", webhookError);
        }

        return json({ success: true });

    } catch (e: any) {
        console.error("Team Creation Error:", e.message);
        if (e.message === "Team name is already taken") {
            return error(429, "Team name is already taken");
        }
        if (e.message.includes("Collision")) {
            return error(409, "System busy, please try again");
        }
        return error(500, `Internal Server Error: ${e.message}`);
    }
};
