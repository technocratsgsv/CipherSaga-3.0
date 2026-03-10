import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

let cachedLeaderboard: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

export const load: PageServerLoad = async () => {

    try {
        const now = Date.now();
        if (cachedLeaderboard && now - lastCacheTime < CACHE_TTL) {
            return { leaderboard: cachedLeaderboard };
        }

        const snapshot = await adminDB
            .collection("teams")
            .orderBy("level", "desc")
            .orderBy("last_change")
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

        cachedLeaderboard = leaderboard;
        lastCacheTime = now;

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
