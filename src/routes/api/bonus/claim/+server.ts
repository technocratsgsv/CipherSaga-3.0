import { error, json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    // 1. Auth Check
    if (!locals.userID || !locals.userTeam) {
        return error(401, 'Unauthorized');
    }

    const { qrCode } = await request.json();

    if (!qrCode) {
        return error(400, 'Missing QR code');
    }

    // 2. Transaction for Race Condition
    try {
        const result = await adminDB.runTransaction(async (t) => {
            const bonusRef = adminDB.collection('bonuses').doc(qrCode);
            const teamRef = adminDB.collection('teams').doc(locals.userTeam!);
            const logRef = adminDB.collection('logs').doc(locals.userTeam!);

            const bonusDoc = await t.get(bonusRef);

            // Check if bonus exists
            if (!bonusDoc.exists) {
                throw new Error('BONUS_NOT_FOUND');
            }

            const bonusData = bonusDoc.data()!;

            // Check if already claimed
            if (bonusData.isClaimed) {
                // If claimed by US, return the info again (idempotent)
                if (bonusData.claimedBy === locals.userTeam) {
                    return {
                        alreadyClaimedByUs: true,
                        hint: bonusData.hint,
                        question: bonusData.question
                    };
                }
                throw new Error('ALREADY_CLAIMED');
            }

            // Claim it (Lock it)
            // DO NOT award points yet.
            const hint = bonusData.hint || "No hint provided.";
            const question = bonusData.question || "No question provided.";

            t.update(bonusRef, {
                isClaimed: true,
                claimedBy: locals.userTeam,
                claimedAt: FieldValue.serverTimestamp(),
                // We keep 'isSolved' false until they answer correctly
                isSolved: false
            });

            t.update(teamRef, {
                // Track that we have claimed this bonus, but not solved it
                active_bonuses: FieldValue.arrayUnion(qrCode),
                last_change: FieldValue.serverTimestamp()
            });

            t.set(logRef, {
                count: FieldValue.increment(1),
                logs: FieldValue.arrayUnion({
                    "timestamp": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                    "type": "bonus_scan", // changed from bonus_claim
                    "bonusId": qrCode,
                    "userId": locals.userID
                })
            }, { merge: true });

            return { success: true, hint, question };
        });

        if (result.alreadyClaimedByUs) {
            return json({
                success: true,
                message: "You already scanned this! Check your active bonuses.",
                hint: result.hint,
                question: result.question
            });
        }

        return json({
            success: true,
            message: "Bonus Locked! Answer the question now.",
            hint: result.hint,
            question: result.question
        });

    } catch (e: any) {
        if (e.message === 'BONUS_NOT_FOUND') {
            return error(404, 'Invalid QR Code');
        }
        if (e.message === 'ALREADY_CLAIMED') {
            return error(409, 'This bonus has already been snatched by another team!');
        }
        console.error("Bonus Claim Error", e);
        return error(500, 'Internal Server Error');
    }
};
