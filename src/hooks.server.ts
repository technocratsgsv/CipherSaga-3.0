import { sequence } from "@sveltejs/kit/hooks";
import * as Sentry from "@sentry/sveltekit";
import { adminAuth, adminDB } from "$lib/server/admin";
import { ADMIN_EMAILS } from "$lib/server/adminGuard";
import type { Handle } from "@sveltejs/kit";
import { PUBLIC_SENTRY_DSN } from '$env/static/public';
import NodeCache from 'node-cache';

Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1
});

// Cache for 5 minutes (300 seconds) to drastically reduce Firestore reads per navigation
const appCache = new NodeCache({ stdTTL: 300 });

export const handle = sequence(Sentry.sentryHandle(), (async ({ event, resolve }) => {
    const pathname = event.url.pathname;

    // Skip all Firebase logic for static assets (favicon, images, CSS, JS bundles, etc.)
    // Running DB code on these requests causes 500 errors when Firebase is unavailable.
    const isStaticAsset = pathname.startsWith('/_app/')
        || pathname.endsWith('.ico')
        || pathname.endsWith('.png')
        || pathname.endsWith('.svg')
        || pathname.endsWith('.jpg')
        || pathname.endsWith('.webp')
        || pathname.endsWith('.woff2')
        || pathname.endsWith('.css')
        || pathname.endsWith('.js');

    if (isStaticAsset) {
        return resolve(event);
    }

    const sessionCookie = event.cookies.get("__session");

    // Load banned teams cache
    let bannedTeams = appCache.get<Set<string>>("bannedTeams");
    if (!bannedTeams) {
        bannedTeams = new Set<string>();
        const bannedTeamsQuery = adminDB.collection("teams").where("banned", "==", true);
        const qSnap = await bannedTeamsQuery.get();
        qSnap.docs.forEach((e) => bannedTeams!.add(e.id));
        appCache.set("bannedTeams", bannedTeams);
    }

    // Default admin flags
    event.locals.isAdmin = false;
    event.locals.isAdminEmail = false;

    try {
        if (sessionCookie === undefined) {
            event.locals.userID = null;
            event.locals.userExists = false;
            event.locals.userTeam = null;
            return resolve(event);
        }

        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie!);
        event.locals.userID = decodedClaims.uid;

        // Check admin email
        const email = decodedClaims.email ?? '';
        const isAdminEmail = ADMIN_EMAILS.includes(email);
        event.locals.isAdminEmail = isAdminEmail;

        // Admin is fully verified only if email matches AND admin_verified cookie is set
        const adminVerified = event.cookies.get('admin_verified');
        event.locals.isAdmin = isAdminEmail && adminVerified === 'true';

        // Query user document directly but wrap in cache
        const cacheKey = `user_${event.locals.userID}`;
        let userData: any = appCache.get(cacheKey);
        let userExists = appCache.get(`exists_${cacheKey}`) as boolean | undefined;

        if (userData === undefined || userExists === undefined) {
            const docRef = adminDB.collection('users').doc(event.locals.userID);
            const doc = await docRef.get();
            userExists = doc.exists;
            userData = doc.exists ? doc.data() : null;

            appCache.set(cacheKey, userData);
            appCache.set(`exists_${cacheKey}`, userExists);
        }

        if (userExists && userData) {
            const team = userData?.team;
            event.locals.userExists = true;
            event.locals.userTeam = team;
            event.locals.banned = team ? (bannedTeams?.has(team) ?? false) : false;
        } else {
            event.locals.userExists = false;
            event.locals.userTeam = null;
            event.locals.banned = false;
        }

        return resolve(event);
    } catch (e: any) {
        // If the cookie verification fails (e.g. auth/session-cookie-expired or revoked)
        // We should clear the cookie so the user isn't stuck in a crash loop and is forced to re-login.
        if (e.code === 'auth/session-cookie-expired' || e.code === 'auth/session-cookie-revoked' || sessionCookie) {
            event.cookies.delete('__session', { path: '/' });
            event.cookies.delete('admin_verified', { path: '/' });
        }
        console.error("Firebase Auth Error in hooks:", e.message);

        event.locals.userID = null;
        event.locals.userExists = false;
        event.locals.userTeam = null;
        event.locals.banned = false;
        event.locals.isAdmin = false;
        event.locals.isAdminEmail = false;
        return resolve(event);
    }
}) satisfies Handle);
export const handleError = Sentry.handleErrorWithSentry();
