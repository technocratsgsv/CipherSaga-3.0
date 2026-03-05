import { requireAdmin } from '$lib/server/adminGuard';
import { adminDB } from '$lib/server/admin';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    requireAdmin(locals);

    let settings = {
        gameStartTime: '2026-02-14T18:39',
        gameEndTime: '2026-02-18T18:39',
        maintenanceMode: false,
        maintenanceMessage: 'The game is currently under maintenance. Please check back soon!',
    };

    const doc = await adminDB.collection('siteSettings').doc('main').get();
    if (doc.exists) {
        const data = doc.data() || {};
        if (data.gameStartTime) settings.gameStartTime = data.gameStartTime;
        if (data.gameEndTime) settings.gameEndTime = data.gameEndTime;
        if (data.maintenanceMode !== undefined) settings.maintenanceMode = data.maintenanceMode;
        if (data.maintenanceMessage) settings.maintenanceMessage = data.maintenanceMessage;
    }

    return { locals, settings };
};

export const actions: Actions = {
    save: async ({ request, locals }) => {
        requireAdmin(locals);
        const data = await request.formData();

        const gameStartTime = (data.get('gameStartTime') as string)?.trim();
        const gameEndTime = (data.get('gameEndTime') as string)?.trim();
        const maintenanceMode = data.get('maintenanceMode') === 'on';
        const maintenanceMessage = (data.get('maintenanceMessage') as string)?.trim() || '';

        if (!gameStartTime || !gameEndTime) {
            return fail(400, { error: 'Start and end times are required.' });
        }

        await adminDB.collection('siteSettings').doc('main').set({
            gameStartTime,
            gameEndTime,
            maintenanceMode,
            maintenanceMessage,
            updatedAt: new Date().toISOString(),
            updatedBy: locals.userID,
        }, { merge: true });

        return { success: true };
    }
};
