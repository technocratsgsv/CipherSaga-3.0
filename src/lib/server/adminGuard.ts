import { redirect } from '@sveltejs/kit';

export const ADMIN_EMAILS = [
    'neerajkohli472@gmail.com',
    'shreyamohanty.p6@gmail.com',
    'pratikranjan3011@gmail.com',
];

/** Call this in any /admin/* ldayout/page server-side load or action. */
export function requireAdmin(locals: App.Locals): void {
    if (!locals.isAdmin) {
        throw redirect(302, '/admin/login');
    }
}
