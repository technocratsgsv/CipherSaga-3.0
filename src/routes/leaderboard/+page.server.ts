import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

let leaderboardCache: any[] = [];
let lastFetch = 0;

export const load: PageServerLoad = async () => {

    try {

        const now = Date.now();

        // refresh leaderboard only every 10 minutes
        if (!leaderboardCache.length || now - lastFetch > 600000) {

            const snapshot = await adminDB
                .collection("teams")
                .orderBy("level", "desc")
                .orderBy("last_change")
                .limit(20) // reduce reads further
                .get();

            leaderboardCache = snapshot.docs.map((doc) => {

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

            leaderboardCache.sort((a, b) => b.score - a.score);

            lastFetch = now;
        }

        return {
            leaderboard: leaderboardCache
        };

    } catch (error: any) {

        console.error("Leaderboard Load Error:", error);

        return {
            leaderboard: leaderboardCache,
            error: error.message
        };

    }
};
