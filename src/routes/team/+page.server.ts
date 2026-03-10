import { redirect } from "@sveltejs/kit";
import { adminDB } from "$lib/server/admin";
import NodeCache from 'node-cache';

const teamCache = new NodeCache({ stdTTL: 30 }); // 30s cache

export const load = async ({ locals }) => {
    // Admins can always view the team page, even without a team
    if (locals.isAdminEmail) return { ...locals, teamInfo: null };
    if (!locals.userTeam) return redirect(302, '/ready');

    const cacheKey = `teamPage_${locals.userTeam}`;
    let teamInfo = teamCache.get<any>(cacheKey);

    if (!teamInfo) {
        const teamDoc = await adminDB.collection('teams').doc(locals.userTeam).get();

        if (!teamDoc.exists) {
            return redirect(302, '/ready');
        }

        const teamData = teamDoc.data()!;
        const membersList = teamData.members || [];

        // Fetch usernames for each member to prevent client-side document lookups
        const memberDetails = await Promise.all(membersList.map(async (memberId: string) => {
            const userDoc = await adminDB.collection('users').doc(memberId).get();
            return {
                id: memberId,
                username: userDoc.exists ? userDoc.data()?.username : "Unknown User"
            };
        }));

        teamInfo = {
            teamName: teamData.teamName,
            level: teamData.level || 0,
            code: teamData.code,
            owner: teamData.owner,
            banned: teamData.banned || false,
            members: memberDetails
        };
        teamCache.set(cacheKey, teamInfo);
    }

    return { ...locals, teamInfo };
};