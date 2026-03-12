import { error } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';
import NodeCache from 'node-cache';

const bonusCache = new NodeCache({ stdTTL: 30 }); // 30s cache

export const load: PageServerLoad = async ({ locals }) => {
    // Admins see ALL bonus questions with full data
    if (locals.isAdminEmail) {
        let questions = bonusCache.get<any[]>("adminBonusQuestions");
        if (!questions) {
            const qSnapshot = await adminDB.collection('bonusQuestions').get();
            questions = qSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    description: data.description,
                    points: data.points,
                    isSolved: data.isSolved || false,
                    solvedByTeamId: data.solvedByTeamId || null,
                    isUnlocked: true,
                    isSolvedByMe: false,
                    hint: data.hint,
                    isVisible: data.isVisible,
                    negative_points: data.negative_points,
                    answer: data.answer, // admins see answers
                    imageUrl: data.imageUrl || '',
                };
            });
            bonusCache.set("adminBonusQuestions", questions, 60); // 1 minute Admin Cache
        }
        return { questions, userTeam: locals.userTeam };
    }

    // 1. Verify Authentication
    if (!locals.userID || !locals.userTeam) {

        // If not in a team, they can't see bonuses? Or maybe just read-only?
        // Let's assume they need to be in a team.
        // We can return empty or redirect.
        // For now, return empty list if no team.
        return {
            questions: [],
            userTeam: null
        };
    }

    try {
        // 2. Fetch Team Data with caching
        const teamCacheKey = `teamScans_${locals.userTeam}`;
        let teamData: any = bonusCache.get(teamCacheKey);

        if (!teamData) {
            const teamDoc = await adminDB.collection('teams').doc(locals.userTeam).get();
            if (!teamDoc.exists) {
                throw error(404, "Team not found");
            }
            teamData = teamDoc.data() || {};
            bonusCache.set(teamCacheKey, teamData);
        }

        const scannedCodes = teamData.scannedQRCodes || [];

        // 3. Fetch Bonus Questions with caching
        let allBonusQuestions = bonusCache.get<any[]>("allBonusQuestions");
        if (!allBonusQuestions) {
            const qRef = adminDB.collection('bonusQuestions');
            const qSnapshot = await qRef.get();
            allBonusQuestions = qSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            bonusCache.set("allBonusQuestions", allBonusQuestions);
        }

        const questions = allBonusQuestions.map(data => {
            const id = data.id;

            // Check if user's team solved it
            const solvedByMe = data.solvedByTeamId === locals.userTeam;

            // Unlocked if scanned or solved by me
            const isUnlocked = scannedCodes.includes(data.qrString) || solvedByMe;

            // Visibility Check:
            // If isVisible is false: ONLY show if it was solved by THIS team (so they know they won).
            // If isVisible is false and NOT solved by me -> Hide (it was solved by someone else or admin hidden).
            if (data.isVisible === false && !solvedByMe) {
                return null;
            }

            return {
                id: id,
                title: data.title,
                description: data.description, // Public info? Or only if unlocked? plan said "The main question"
                // Usually question is visible, Hint is hidden.
                points: data.points,
                isSolved: data.isSolved || false,
                solvedByTeamId: data.solvedByTeamId,
                // STATUS FLAGS
                isUnlocked: isUnlocked,
                isSolvedByMe: solvedByMe,
                // SENSITIVE DATA
                hint: isUnlocked ? data.hint : null, // Only show hint if unlocked
                imageUrl: isUnlocked ? (data.imageUrl || '') : '', // Only show image if unlocked
                // NEVER return answer
            };
        }).filter(q => q !== null); // Remove hidden ones

        // Sort by solved status (active first) or points
        questions.sort((a, b) => {
            if (a!.isSolved === b!.isSolved) return 0;
            return a!.isSolved ? 1 : -1; // Active first
        });

        return {
            questions,
            userTeam: locals.userTeam
        };

    } catch (err: any) {
        console.error("Error loading bonus questions:", err);
        throw error(500, "Failed to load bonus questions");
    }
};
