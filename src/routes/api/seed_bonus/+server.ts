import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const GET = async () => {
    try {
        const bonusId = "sample_bonus_01";
        await adminDB.collection('bonusQuestions').doc(bonusId).set({
            // Core identification
            qrString: "secret_qr_code_xyz123",

            // Display content
            title: "The Hidden Cipher",
            description: "Find the message hidden in the main hall.",
            hint: "Look under the blue carpet.",

            // Game Logic
            answer: "blue", // NOTE: will be checked against lowercase trimmed user input
            points: 50,

            // State checks (required by the code)
            isSolved: false,
            isVisible: true,

            // Will be populated dynamically on solve:
            // solvedByTeamId: null,
            // solvedAt: null,
        });

        return json({
            success: true,
            message: "Seeded! Now check your Firebase Console under 'bonusQuestions' collection to see the document 'sample_bonus_01'.",
            qrCode: bonusId
        });
    } catch (e: any) {
        return json({ error: e.message }, { status: 500 });
    }
};
