import { error } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
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
        // 2. Fetch Team Data (to get scannedQRCodes)
        const teamDoc = await adminDB.collection('teams').doc(locals.userTeam).get();
        if (!teamDoc.exists) {
            throw error(404, "Team not found");
        }
        const teamData = teamDoc.data() || {};
        const scannedCodes = teamData.scannedQRCodes || [];

        // 3. Fetch Bonus Questions
        // Only visible active questions + solved questions (history)
        // Requirement: "Instantly the question will be invisible to all other teams" -> solved questions are hidden?
        // "Once solved, the bonus question cannot be attempted by any other team."
        // Usually in CTFs, you show "Solved by X" as a status, rather than making it disappear completely.
        // If it disappears, people might wonder where it went.
        // Let's fetch ALL items for now and let the UI decide potential display, 
        // OR filtering on usage of 'isVisible'.
        // The Plan said: "isVisible: boolean; // Default true. Admin control to release/hide."
        // And update logic: "isVisible: false // Immediately hide from others"
        // So if isVisible is false, we generally don't show it.
        // BUT if *I* solved it, maybe I want to see my victory?
        // Query: where 'isVisible' == true?
        // Let's query ALL and filter in memory since dataset is small, to ensure logic is correct.

        const qRef = adminDB.collection('bonusQuestions');
        const qSnapshot = await qRef.get(); // Get ALL for admin logic flexibility

        const questions = qSnapshot.docs.map(doc => {
            const data = doc.data();
            const id = doc.id;

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
