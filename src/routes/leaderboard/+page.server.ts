import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {

    try {

        const snapshot = await adminDB
            .collection("teams")
            .orderBy("level", "desc")
            .get();

        const leaderboard = snapshot.docs.map((doc) => {

            const data = doc.data() || {};

            const level = data.level || 1;
            const bonusPoints = data.bonusPoints || 0;

            const baseScore = (level - 1) * 100;
            const totalScore = baseScore + bonusPoints;

            const members = data.members || [];

            return {
                teamName: data.teamName || "Unknown Team",
                score: totalScore,
                baseScore,
                bonusPoints,
                members: members.length,
                gsv: data.gsv_verified || false
            };

        });

        leaderboard.sort((a, b) => b.score - a.score);

        return {
            leaderboard
        };

    } catch (error: any) {

        console.error("Leaderboard Load Error:", error);

        return {
            leaderboard: [],
            error: error.message
        };

    }
};