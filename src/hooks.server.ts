import { sequence } from "@sveltejs/kit/hooks";
import * as Sentry from "@sentry/sveltekit";
import { adminAuth, adminDB } from "$lib/server/admin";
import { ADMIN_EMAILS } from "$lib/server/adminGuard";
import type { Handle } from "@sveltejs/kit";
import { PUBLIC_SENTRY_DSN } from '$env/static/public';
Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1
});

let bannedTeams = new Set<string>();
let bannedTeamsLoaded = false;
const bannedTeamsQuery = adminDB.collection("teams").where("banned", "==", true);

export const handle = sequence(Sentry.sentryHandle(), (async ({ event, resolve }) => {
    const sessionCookie = event.cookies.get("__session");

    // Load banned teams cache on first request
    if (!bannedTeamsLoaded) {
        const qSnap = await bannedTeamsQuery.get();
        qSnap.docs.forEach((e) => bannedTeams.add(e.id));

        // Listen for changes to banned teams
        bannedTeamsQuery.onSnapshot((snap) => {
            bannedTeams.clear();
            snap.docs.forEach((e) => bannedTeams.add(e.id));
        });
        bannedTeamsLoaded = true;
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

        // Query user document directly (no more userIndex caching)
        const docRef = adminDB.collection('users').doc(event.locals.userID);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            const team = data?.team;
            event.locals.userExists = true;
            event.locals.userTeam = team;
            event.locals.banned = team ? bannedTeams.has(team) : false;
        } else {
            event.locals.userExists = false;
            event.locals.userTeam = null;
            event.locals.banned = false;
        }

        return resolve(event);
    } catch (e) {
        console.error(e);
        event.locals.userID = null;
        event.locals.userExists = false;
        event.locals.userTeam = null;
        event.locals.banned = false;
        return resolve(event);
    }
}) satisfies Handle);
export const handleError = Sentry.handleErrorWithSentry();
