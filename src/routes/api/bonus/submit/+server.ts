import { error, json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    // 1. Auth Check
    if (!locals.userID || !locals.userTeam) {
        return error(401, 'Unauthorized');
    }

    const body = await request.json();
    const { qrCode, answer } = body;

    if (!qrCode || !answer) {
        return error(400, 'Missing ID or Answer');
    }

    try {
        const result = await adminDB.runTransaction(async (t) => {
            const bonusRef = adminDB.collection('bonuses').doc(qrCode);
            const teamRef = adminDB.collection('teams').doc(locals.userTeam!);
            const logRef = adminDB.collection('logs').doc(locals.userTeam!);

            const bonusDoc = await t.get(bonusRef);
            if (!bonusDoc.exists) throw new Error('BONUS_NOT_FOUND');

            const bonusData = bonusDoc.data()!;

            // Verify ownership
            if (bonusData.claimedBy !== locals.userTeam) {
                throw new Error('NOT_OWNER');
            }
            if (bonusData.isSolved) {
                return { success: true, message: "Already solved!" };
            }

            // Check Answer
            const correctAnswer = (bonusData.answer || "").trim().toLowerCase();
            const userAnswer = answer.trim().toLowerCase();

            if (userAnswer === correctAnswer) {
                // CORRECT
                t.update(bonusRef, {
                    isSolved: true,
                    solvedAt: FieldValue.serverTimestamp()
                });
                t.update(teamRef, {
                    bonus_score: FieldValue.increment(bonusData.points || 10),
                    // move from active to solved if you want, or just keep track
                    solved_bonuses: FieldValue.arrayUnion(qrCode),
                    last_change: FieldValue.serverTimestamp()
                });
                t.set(logRef, {
                    count: FieldValue.increment(1),
                    logs: FieldValue.arrayUnion({
                        "timestamp": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                        "type": "bonus_solve_correct",
                        "bonusId": qrCode,
                        "userId": locals.userID
                    })
                }, { merge: true });

                return { correct: true, points: bonusData.points || 10 };
            } else {
                // INCORRECT
                const neg = Math.abs(bonusData.negative_points || 0);
                t.update(teamRef, {
                    bonus_score: FieldValue.increment(-neg),
                    last_change: FieldValue.serverTimestamp()
                });
                t.set(logRef, {
                    count: FieldValue.increment(1),
                    logs: FieldValue.arrayUnion({
                        "timestamp": new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                        "type": "bonus_solve_fail",
                        "bonusId": qrCode,
                        "userId": locals.userID,
                        "answer": userAnswer // careful with logging answers if they are secrets, but usually fine here
                    })
                }, { merge: true });

                return { correct: false, penalty: neg };
            }
        });

        if (result.correct === true) {
            return json({ success: true, correct: true, message: `Correct! +${result.points} points.` });
        } else if (result.correct === false) {
            return json({ success: true, correct: false, message: `Wrong! -${result.penalty} points.` });
        } else {
            return json(result); // catch-all for "Already solve"
        }

    } catch (e: any) {
        if (e.message === 'BONUS_NOT_FOUND') return error(404, 'Bonus not found');
        if (e.message === 'NOT_OWNER') return error(403, 'You have not scanned this bonus yet.');
        console.error("Submit Error", e);
        return error(500, 'Internal Server Error');
    }
};
