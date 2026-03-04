import { requireAdmin } from '$lib/server/adminGuard';
import { adminDB } from '$lib/server/admin';
import { fail, redirect } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    requireAdmin(locals);

    const snap = await adminDB.collection('levels').orderBy('level').get();
    const questions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { locals, questions };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();

        const prompt = (data.get('prompt') as string)?.trim();
        const answer = (data.get('answer') as string)?.trim().toLowerCase();
        const level = parseInt(data.get('level') as string, 10);
        const comment = (data.get('comment') as string)?.trim() ?? '';

        if (!prompt || !answer || isNaN(level)) {
            return fail(400, { createError: 'Prompt, answer, and level are required.' });
        }

        const newDoc = adminDB.collection('levels').doc();
        await newDoc.set({
            uid: newDoc.id,
            prompt,
            answer,
            level,
            comment,
            files: [],
            images: [],
            creator: locals.userID,
            createdAt: FieldValue.serverTimestamp(),
        });

        return { success: true };
    },

    update: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();

        const id = data.get('id') as string;
        const prompt = (data.get('prompt') as string)?.trim();
        const answer = (data.get('answer') as string)?.trim().toLowerCase();
        const level = parseInt(data.get('level') as string, 10);
        const comment = (data.get('comment') as string)?.trim() ?? '';

        if (!id || !prompt || !answer || isNaN(level)) {
            return fail(400, { updateError: 'All fields are required.' });
        }

        await adminDB.collection('levels').doc(id).update({
            prompt, answer, level, comment,
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { success: true };
    },

    delete: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();
        const id = data.get('id') as string;

        if (!id) return fail(400, { deleteError: 'Missing question ID.' });

        await adminDB.collection('levels').doc(id).delete();
        return { success: true };
    }
};
