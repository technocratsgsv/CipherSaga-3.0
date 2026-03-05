import { requireAdmin } from '$lib/server/adminGuard';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    // Allow access to the login page without admin verification
    if (url.pathname === '/admin/login') return { locals };
    requireAdmin(locals);
    return { locals };
};
