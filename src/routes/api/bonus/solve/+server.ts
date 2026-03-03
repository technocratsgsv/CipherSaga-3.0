import { json, error } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    // 1. Verify user is authenticated and in a team
    if (!locals.userID || !locals.userTeam) {
        return error(401, 'Unauthorized: You must be in a team to submit answers.');
    }

    const { questionId, answer } = await request.json();

    if (!questionId || typeof questionId !== 'string') {
        return error(400, 'Bad Request: Missing or invalid questionId.');
    }
    if (!answer || typeof answer !== 'string') {
        return error(400, 'Bad Request: Missing or invalid answer.');
    }

    const teamId = locals.userTeam;

    try {
        await adminDB.runTransaction(async (transaction) => {
            const questionRef = adminDB.collection('bonusQuestions').doc(questionId);
            const teamRef = adminDB.collection('teams').doc(teamId);

            const questionDoc = await transaction.get(questionRef);
            if (!questionDoc.exists) {
                throw new Error('Question not found.');
            }

            const data = questionDoc.data();
            if (!data) throw new Error('No data found for question.');

            // 2. Check if isSolved is true
            if (data.isSolved) {
                throw new Error('This question has already been solved by another team.');
            }

            // 3. Check if isVisible is false (optional safeguard)
            if (data.isVisible === false) {
                throw new Error('This question is not currently active.');
            }

            // 4. Check answer (case-insensitive trim)
            const submission = answer.trim().toLowerCase();
            const correctAnswer = (data.answer || '').trim().toLowerCase();

            if (submission !== correctAnswer) {
                throw new Error('Incorrect answer.');
            }

            // 5. Success! Update question and team
            transaction.update(questionRef, {
                isSolved: true,
                solvedByTeamId: teamId,
                solvedAt: FieldValue.serverTimestamp(),
                isVisible: false // Immediately hide from others as per requirement
            });

            const pointsToAdd = data.points || 0;
            transaction.update(teamRef, {
                bonusPoints: FieldValue.increment(pointsToAdd)
            });
        });

        return json({ success: true, message: 'Correct answer! Points added.' });

    } catch (err: any) {
        // Distinguish between handled errors and system errors
        const message = err.message;
        if (message === 'Incorrect answer.' || message === 'This question has already been solved by another team.' || message === 'Question not found.' || message === 'This question is not currently active.') {
            // Return 400 for logic errors so frontend can display message easily
            // Or 200 with success: false? strict REST says 4xx, but convenient JSON often 200.
            // Let's stick to standard error() for now, or json with success:false.
            // User request didn't specify, standard error is safer for SvelteKit handling.
            // But "Incorrect Answer" is a valid state, not necessarily an exception.
            // Let's return json with explicit error message for easier UI handling without try-catch blocks on fetch if possible, 
            // OR use error(400) and let frontend handle it. 
            // error(400) is best practice.
            return error(400, message);
        }

        console.error('Error solving bonus question:', err);
        return error(500, `Internal Server Error: ${message}`);
    }
};
