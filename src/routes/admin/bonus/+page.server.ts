import { requireAdmin } from '$lib/server/adminGuard';
import { adminDB } from '$lib/server/admin';
import { fail } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    requireAdmin(locals);

    // Fetch all bonus questions
    const bqSnap = await adminDB.collection('bonusQuestions').get();

    // Fetch all teams to resolve solver name and members
    const usersSnap = await adminDB.collection('users').get();
    const userMap: Record<string, string> = {};
    usersSnap.docs.forEach(doc => {
        const d = doc.data();
        userMap[doc.id] = (d.first && d.last) ? `${d.first} ${d.last}` : (d.username || doc.id);
    });

    const teamsSnap = await adminDB.collection('teams').get();
    const teamMap: Record<string, string> = {};
    const teamMembersMap: Record<string, string[]> = {};
    teamsSnap.docs.forEach(doc => {
        const data = doc.data();
        teamMap[doc.id] = data.teamName || doc.id;
        teamMembersMap[doc.id] = (data.members || []).map((mId: string) => userMap[mId] || mId);
    });

    const questions = bqSnap.docs.map(doc => {
        const data = doc.data();
        const scannedByTeams = teamsSnap.docs
            .filter(doc => (doc.data().scannedQRCodes || []).includes(data.qrString))
            .map(doc => {
                const tName = doc.data().teamName || doc.id;
                const members = teamMembersMap[doc.id] || [];
                return members.length > 0 ? `${tName} (${members.join(', ')})` : tName;
            });

        let solvedByTeamName = null;
        if (data.solvedByTeamId) {
            const tName = teamMap[data.solvedByTeamId] || data.solvedByTeamId;
            const members = teamMembersMap[data.solvedByTeamId] || [];
            solvedByTeamName = members.length > 0 ? `${tName} (${members.join(', ')})` : tName;
        }

        return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            hint: data.hint || '',
            answer: data.answer || '',
            qrString: data.qrString || '',
            points: data.points || 0,
            negative_points: data.negative_points || 0,
            isSolved: data.isSolved || false,
            isVisible: data.isVisible !== undefined ? data.isVisible : true,
            solvedByTeamId: data.solvedByTeamId || null,
            solvedByTeamName,
            solvedAt: data.solvedAt ? data.solvedAt.toDate().toISOString() : null,
            scannedByTeams,
            scannedByCount: scannedByTeams.length,
        };
    });

    return { locals, questions };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();

        const title = (data.get('title') as string)?.trim();
        const description = (data.get('description') as string)?.trim();
        const hint = (data.get('hint') as string)?.trim() ?? '';
        const answer = (data.get('answer') as string)?.trim().toLowerCase();
        const qrString = (data.get('qrString') as string)?.trim();
        const points = parseInt(data.get('points') as string, 10);
        const negative_points = parseInt(data.get('negative_points') as string, 10) || 0;

        if (!title || !description || !answer || !qrString || isNaN(points)) {
            return fail(400, { createError: 'Title, description, answer, QR string, and points are required.' });
        }

        await adminDB.collection('bonusQuestions').add({
            title, description, hint, answer, qrString,
            points, negative_points,
            isSolved: false,
            isVisible: true,
            solvedByTeamId: null,
            solvedAt: null,
            creator: locals.userID,
            createdAt: FieldValue.serverTimestamp(),
        });

        return { success: true };
    },

    update: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();
        const id = data.get('id') as string;

        if (!id) return fail(400, { updateError: 'Missing question ID.' });

        await adminDB.collection('bonusQuestions').doc(id).update({
            title: (data.get('title') as string)?.trim(),
            description: (data.get('description') as string)?.trim(),
            hint: (data.get('hint') as string)?.trim() ?? '',
            answer: (data.get('answer') as string)?.trim().toLowerCase(),
            qrString: (data.get('qrString') as string)?.trim(),
            points: parseInt(data.get('points') as string, 10),
            negative_points: parseInt(data.get('negative_points') as string, 10) || 0,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true };
    },

    toggleVisible: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();
        const id = data.get('id') as string;
        const currentVisible = data.get('isVisible') === 'true';

        if (!id) return fail(400, { updateError: 'Missing question ID.' });

        await adminDB.collection('bonusQuestions').doc(id).update({
            isVisible: !currentVisible,
        });

        return { success: true };
    },

    reset: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();
        const id = data.get('id') as string;

        if (!id) return fail(400, { resetError: 'Missing question ID.' });

        await adminDB.collection('bonusQuestions').doc(id).update({
            isSolved: false,
            solvedByTeamId: null,
            solvedAt: null,
            isVisible: true,
        });

        return { success: true };
    },

    delete: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();
        const id = data.get('id') as string;

        if (!id) return fail(400, { deleteError: 'Missing question ID.' });

        await adminDB.collection('bonusQuestions').doc(id).delete();
        return { success: true };
    }
};
