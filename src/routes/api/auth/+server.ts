import { adminAuth } from '$lib/server/admin';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { idToken } = await request.json();

    const expiresIn = 5 * 24 * 60 * 60 * 1000; // ✅ Firebase max

    const decoded = await adminAuth.verifyIdToken(idToken);

    if (Date.now() / 1000 - decoded.auth_time < 5 * 60) {
        const sessionCookie =
            await adminAuth.createSessionCookie(idToken, { expiresIn });

        cookies.set('__session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: true,
            path: '/',
            sameSite: 'lax'
        });

        return json({ status: 'signedIn' });
    }

    throw error(401, 'Recent sign-in required');
};


export const DELETE: RequestHandler = async ({ cookies }) => {
    cookies.delete('__session', { path: '/' });
    return json({ status: 'signedOut' });
}