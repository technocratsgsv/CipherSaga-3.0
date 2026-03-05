import { requireAdmin } from '$lib/server/adminGuard';
import { adminDB } from '$lib/server/admin';
import { fail } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    requireAdmin(locals);

    // Fetch all bonus questions
    const bqSnap = await adminDB.collection('bonusQuestions').get();

    // Fetch all teams to resolve solver name
    const teamsSnap = await adminDB.collection('teams').get();
    const teamMap: Record<string, string> = {};
    teamsSnap.docs.forEach(doc => {
        teamMap[doc.id] = doc.data().teamName || doc.id;
    });

    // Count how many teams have scanned each qrString
    const allTeams = teamsSnap.docs.map(doc => doc.data());

    const questions = bqSnap.docs.map(doc => {
        const data = doc.data();
        const scannedByCount = allTeams.filter(t =>
            (t.scannedQRCodes || []).includes(data.qrString)
        ).length;

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
            solvedByTeamName: data.solvedByTeamId ? (teamMap[data.solvedByTeamId] || data.solvedByTeamId) : null,
            solvedAt: data.solvedAt ? data.solvedAt.toDate().toISOString() : null,
            scannedByCount,
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
