
import { json } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';

export const GET = async () => {
    try {
        const bonusId = "bonus_test_01";
        await adminDB.collection('bonuses').doc(bonusId).set({
            title: "The First Cipher",
            description: "A test quest to verify the system.",
            points: 100,
            negative_points: 50,
            hint: "It starts with 'H' and ends with 'o'.",
            question: "What is the standard greeting in programming?",
            answer: "Hello World",
            isClaimed: false,
            createdAt: new Date()
        });
        return json({
            success: true,
            message: "Seeded! Now go to /bonus and scan a QR code with content: 'bonus_test_01'",
            qrCode: bonusId
        });
    } catch (e: any) {
        return json({ error: e.message }, { status: 500 });
    }
};
