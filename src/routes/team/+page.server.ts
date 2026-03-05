import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').PageLoad} */
export const load
    = (async ({ locals, params }) => {
        console.log("locals", locals);
        // Admins can always view the team page, even without a team
        if (locals.isAdminEmail) return locals;
        if (locals.userTeam === undefined || locals.userTeam === null) return redirect(302, '/ready');
        return locals;
    });