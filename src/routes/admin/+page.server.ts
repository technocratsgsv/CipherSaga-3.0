import { requireAdmin } from '$lib/server/adminGuard';
import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    requireAdmin(locals);

    const [teamsSnap, questionsSnap, bannedSnap, bonusSnap, solvedBonusSnap] = await Promise.all([
        adminDB.collection('teams').get(),
        adminDB.collection('levels').get(),
        adminDB.collection('teams').where('banned', '==', true).get(),
        adminDB.collection('bonusQuestions').get(),
        adminDB.collection('bonusQuestions').where('isSolved', '==', true).get(),
    ]);

    return {
        locals,
        stats: {
            totalTeams: teamsSnap.size,
            totalQuestions: questionsSnap.size,
            bannedTeams: bannedSnap.size,
            totalBonus: bonusSnap.size,
            solvedBonus: solvedBonusSnap.size,
        }
    };
};
