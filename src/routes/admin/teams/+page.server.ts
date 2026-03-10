import { requireAdmin } from '$lib/server/adminGuard';
import { adminDB } from '$lib/server/admin';
import { fail } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import type { Actions, PageServerLoad } from './$types';
import NodeCache from 'node-cache';

const adminTeamsCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export const load: PageServerLoad = async ({ locals }) => {
    requireAdmin(locals);

    let pageData = adminTeamsCache.get<any>('adminTeamsData');

    if (!pageData) {
        const snap = await adminDB.collection('teams').orderBy('level', 'desc').get();
        const usersSnap = await adminDB.collection('users').get();
        const userMap = new Map();
        usersSnap.docs.forEach(doc => {
            const d = doc.data();
            let name = (d.first && d.last) ? `${d.first} ${d.last}` : (d.username || doc.id);
            userMap.set(doc.id, name);
        });

        const teams = snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                teamName: d.teamName ?? doc.id,
                members: (d.members ?? []).map((mId: string) => userMap.get(mId) ?? mId),
                level: d.level ?? 0,
                gsv_verified: d.gsv_verified ?? false,
                banned: d.banned ?? false,
                last_change: d.last_change?.toDate?.()?.toISOString() ?? null,
            };
        });
        pageData = { teams };
        adminTeamsCache.set('adminTeamsData', pageData);
    }

    return { locals, ...pageData };
};

export const actions: Actions = {
    ban: async ({ request, locals }) => {

        requireAdmin(locals);
        const data = await request.formData();
        const id = data.get('id') as string;
        if (!id) return fail(400, { error: 'Missing team ID' });

        await adminDB.collection('teams').doc(id).update({ banned: true });
        return { success: true };
    },

    unban: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();
        const id = data.get('id') as string;
        if (!id) return fail(400, { error: 'Missing team ID' });

        await adminDB.collection('teams').doc(id).update({ banned: false });
        return { success: true };
    },

    delete: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();
        const id = data.get('id') as string;
        if (!id) return fail(400, { error: 'Missing team ID' });

        // Remove team from members' user docs
        const teamDoc = await adminDB.collection('teams').doc(id).get();
        const members: string[] = teamDoc.data()?.members ?? [];
        const batch = adminDB.batch();

        for (const memberId of members) {
            const userRef = adminDB.collection('users').doc(memberId);
            batch.update(userRef, { team: null });
        }

        // Delete teamName entry
        const teamName = teamDoc.data()?.teamName;
        if (teamName) {
            batch.delete(adminDB.collection('teamNames').doc(teamName));
        }

        batch.delete(adminDB.collection('teams').doc(id));
        await batch.commit();

        return { success: true };
    }
};
