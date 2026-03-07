import type { RequestHandler } from '@sveltejs/kit';
import { adminDB, adminAuth } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies, locals }: any) => {

    if (locals.userID === null || !locals.userExists || locals.userTeam === null) {
        return error(401, 'Unauthorized');
    } else {

        const userDoc = await adminDB.collection('/users').doc(locals.userID).get();
        const teamId = userDoc.data()?.team;
        if (!teamId) return error(400, "User not in a team");
        const team = await adminDB.collection('/teams').doc(teamId).get();
        const level = team.data()?.level || 0;
        let isAdmin = false;
        try {
            if (userDoc.exists) {
                const userData = userDoc.data();
                isAdmin = userData?.role === 'admin' || userData?.role === 'exception';
            } else {
                console.error('User not found in database');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
        const now = new Date();
        const startTime = new Date("2026-03-10T06:30:00Z");
  
        await adminDB.runTransaction(async (transaction) => {
            const userRef = adminDB.collection('users').doc(locals.userID!);
            const teamRef = adminDB.collection("teams").doc(locals.userTeam!);

            const teamData = (await transaction.get(teamRef)).data();
            if (!(now <= startTime) && !isAdmin) return error(405, "Method Not Allowed");
            if (teamData === undefined) return error(404, "Not Found");

            let newMembers = teamData.members.filter((e: string) => e !== locals.userID);

            if (newMembers.length === 0) {
                // Last member leaving - delete team and release the team name
                transaction.delete(teamRef);

                // Delete from teamNames collection to release the name
                const teamNameRef = adminDB.collection('teamNames').doc(teamData.teamName);
                transaction.delete(teamNameRef);

                // NO UPDATES TO 'nameIndex' - Legacy schema removed
            } else {
                // Other members remain - update team
                let data = {
                    owner: newMembers[0],
                    members: newMembers,
                    gsv_verified: true,
                };
                for (const id of newMembers) {
                    const userRecord = await adminAuth.getUser(id);
                    if (!userRecord.email?.toString().endsWith("gsv.ac.in")) {
                        data.gsv_verified = false;
                        break;
                    }
                }
                transaction.update(teamRef, data);

                // NO UPDATES TO 'nameIndex' - Legacy schema removed
            }

            // Update user to remove team reference
            transaction.update(userRef, {
                team: null,
            });

            // NO UPDATES TO 'userIndex' - Legacy schema removed
        });
        return json({ success: true, message: "Successfully left the team" }, { status: 200 });
    }


};
