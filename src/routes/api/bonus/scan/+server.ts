import { json, error } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { RequestHandler } from './$types';

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
        // 2. Check if qrString exists in bonusQuestions
        // We query by the 'qrString' field in the 'bonusQuestions' collection
        const questionsRef = adminDB.collection('bonusQuestions');
        const querySnapshot = await questionsRef.where('qrString', '==', qrString).limit(1).get();

        if (querySnapshot.empty) {
            return error(404, 'Invalid QR Code.');
        }

        const questionDoc = querySnapshot.docs[0];
        const questionData = questionDoc.data();

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
