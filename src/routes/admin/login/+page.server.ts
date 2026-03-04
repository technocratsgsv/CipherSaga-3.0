import { fail, redirect } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    // If already verified, go straight to admin
    if (locals.isAdmin) throw redirect(302, '/admin');
    return { isAdminEmail: locals.isAdminEmail };
};

export const actions: Actions = {
    default: async ({ request, cookies, locals }) => {
        if (!locals.isAdminEmail) {
            return fail(403, { error: 'Access denied. Your account is not authorised.' });
        }

        const data = await request.formData();
        const password = data.get('password') as string;

        if (password !== ADMIN_PASSWORD) {
            return fail(401, { error: 'Incorrect password. Please try again.' });
        }

        // Set admin_verified cookie for 24 hours
        cookies.set('admin_verified', 'true', {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
        });

        throw redirect(302, '/admin');
    }
};
