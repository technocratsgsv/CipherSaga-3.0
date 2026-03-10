import { requireAdmin } from '$lib/server/adminGuard';
import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';
import NodeCache from 'node-cache';

const adminDashCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export const load: PageServerLoad = async ({ locals }) => {
    requireAdmin(locals);

    let stats = adminDashCache.get<any>('dashboardStats');

    if (!stats) {
        const [teamsSnap, questionsSnap, bannedSnap, bonusSnap, solvedBonusSnap] = await Promise.all([
            adminDB.collection('teams').get(),
            adminDB.collection('levels').get(),
            adminDB.collection('teams').where('banned', '==', true).get(),
            adminDB.collection('bonusQuestions').get(),
            adminDB.collection('bonusQuestions').where('isSolved', '==', true).get(),
        ]);
        stats = {
            totalTeams: teamsSnap.size,
            totalQuestions: questionsSnap.size,
            bannedTeams: bannedSnap.size,
            totalBonus: bonusSnap.size,
            solvedBonus: solvedBonusSnap.size,
        };
        adminDashCache.set('dashboardStats', stats);
    }

    return { locals, stats };
};
