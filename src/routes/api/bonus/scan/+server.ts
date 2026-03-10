import { json, error } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { RequestHandler } from './$types';
import NodeCache from 'node-cache';

const scanCache = new NodeCache({ stdTTL: 30 }); // 30s cache

export const POST: RequestHandler = async ({ request, locals }) => {
    // 1. Verify user is authenticated and in a team
    if (!locals.userID || !locals.userTeam) {
        return error(401, 'Unauthorized: You must be in a team to scan QR codes.');
    }

    const { qrString } = await request.json();

    if (!qrString || typeof qrString !== 'string') {
        return error(400, 'Bad Request: Missing or invalid qrString.');
    }

    try {
        // 2. Check if qrString exists in memory-cached bonusQuestions
        let allBonusQuestions = scanCache.get<any[]>("allBonusQuestions");
        if (!allBonusQuestions) {
            const questionsRef = adminDB.collection('bonusQuestions');
            const querySnapshot = await questionsRef.get();
            allBonusQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            scanCache.set("allBonusQuestions", allBonusQuestions);
        }

        const questionData = allBonusQuestions.find(q => q.qrString === qrString);

        if (!questionData) {
            return error(404, 'Invalid QR Code.');
        }

        // Optional: Check if question is visible/active? 
        // For now, even if solved, we might want to allow scanning to see the hint/question context
        // But maybe not if it's "invisible"? 
        // The requirement says: "Instantly the question will be invisible to all other teams"
        // This likely refers to the "solve" state.
        // Let's assume if it is NOT solved, it is scannable.
        // If it IS solved, maybe it shouldn't be scannable?
        // Let's stick to the plan: update scannedQRCodes regardless, frontend handles visibility logic.

        // 3. Update teams/{teamId}: scannedQRCodes arrayUnion(qrString)
        const teamRef = adminDB.collection('teams').doc(locals.userTeam);

        await teamRef.update({
            scannedQRCodes: FieldValue.arrayUnion(qrString)
        });

        return json({
            success: true,
            message: 'QR Code scanned successfully.',
            hint: questionData.hint // Return hint immediately for convenience
        });

    } catch (err: any) {
        console.error('Error scanning QR code:', err);
        return error(500, `Internal Server Error: ${err.message}`);
    }
};
