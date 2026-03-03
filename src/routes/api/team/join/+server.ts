import type { RequestHandler } from '@sveltejs/kit';
import { adminAuth, adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }: any) => {
    if (locals.userID === null || !locals.userExists) {
        return error(401, 'Unauthorized');
    }

    const body = await request.json();
    let { inviteCode } = body;
    if (!inviteCode || typeof inviteCode !== 'string' || inviteCode.trim() === "") return error(400, "Bad Request");
    inviteCode = inviteCode.toLowerCase().trim();

    if (locals.userTeam !== null) {
        return error(403, "Already in a team");
    }

    try {
        // 1. Find the team by code (READ)
        // We query the 'teams' collection. We need an index on 'code'.
        const teamQuery = await adminDB.collection('teams').where('code', '==', inviteCode).limit(1).get();

        if (teamQuery.empty) {
            return error(404, "Team not found");
        }

        const teamDocSnapshot = teamQuery.docs[0];
        const teamID = teamDocSnapshot.id;

        // 2. Transactional Join
        await adminDB.runTransaction(async (transaction) => {
            const teamRef = adminDB.collection('teams').doc(teamID);
            const userRef = adminDB.collection('users').doc(locals.userID!);

            // Re-read team inside transaction to ensure we don't overfill
            const teamDoc = await transaction.get(teamRef);
            if (!teamDoc.exists) throw new Error("Team not found during transaction");

            const teamData = teamDoc.data();
            const members = teamData?.members || [];

            // VALIDATIONS
            if (members.length >= 3) {
                throw new Error("Team is full");
            }
            if (members.includes(locals.userID)) {
                throw new Error("Already in this team");
            }

            // USER VALIDATION
            const userRecord = await adminAuth.getUser(locals.userID!);

            // PREPARE UPDATES
            let updateData: any = {
                members: FieldValue.arrayUnion(locals.userID)
            };

            // If user is from outside organization, maybe flag team? 
            // Original logic: if NOT endsWith gsv.ac.in -> gsv_verified = false
            if (!(userRecord.email || "").endsWith("gsv.ac.in")) {
                updateData.gsv_verified = false;
            }

            transaction.update(teamRef, updateData);
            transaction.update(userRef, { team: teamID });

            // NO UPDATES TO 'nameIndex' or 'userIndex'
        });

        // Set local state for client session immediately if possible (locals is server-side only for this req)
        locals.userTeam = teamID;

        return json({ success: true, teamID });

    } catch (e: any) {
        const msg = e.message;
        if (msg === "Team is full") return error(419, "Team is full");
        if (msg === "Already in this team") return error(418, "Already in this team");
        if (msg === "Team not found") return error(404, "Team not found"); // Should be caught by query check usually

        console.error("Join Team Error:", e);
        return error(500, `Internal Server Error: ${msg}`);
    }
};