import { json, error } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
    // Admin Only Check (You might want to secure this better in production)
    // For now, checks if user is authenticated. ideally check for specific admin UID.
    if (!locals.userID) {
        return error(401, 'Unauthorized');
    }

    try {
        // MIGRATION STRATEGY:
        // 1. Migrate all teams to 'teamNames' collection
        // 2. Migrate all users to 'usernames' collection
        // This ensures the new scalable schema is populated from existing data

        const results = {
            teams: 0,
            users: 0,
            errors: [] as string[]
        };

        // PART 1: Migrate Teams to 'teamNames' collection
        try {
            const teamsSnapshot = await adminDB.collection('teams').get();
            const teamBatch = adminDB.batch();

            teamsSnapshot.forEach(doc => {
                const teamData = doc.data();
                const name = teamData.teamName;
                const id = doc.id;

                if (name) {
                    const nameRef = adminDB.collection('teamNames').doc(name);
                    teamBatch.set(nameRef, {
                        teamId: id,
                        migrated: true,
                        migratedAt: new Date()
                    }, { merge: true }); // Merge so we don't overwrite if already exists
                    results.teams++;
                }
            });

            await teamBatch.commit();
        } catch (err: any) {
            results.errors.push(`Team migration error: ${err.message}`);
        }

        // PART 2: Migrate Users to 'usernames' collection
        try {
            const usersSnapshot = await adminDB.collection('users').get();
            const userBatch = adminDB.batch();

            usersSnapshot.forEach(doc => {
                const userData = doc.data();
                const username = userData.username;
                const uid = doc.id;

                if (username) {
                    const usernameRef = adminDB.collection('usernames').doc(username);
                    userBatch.set(usernameRef, {
                        uid: uid,
                        migrated: true,
                        migratedAt: new Date()
                    }, { merge: true }); // Merge so we don't overwrite if already exists
                    results.users++;
                }
            });

            await userBatch.commit();
        } catch (err: any) {
            results.errors.push(`User migration error: ${err.message}`);
        }

        return json({
            success: results.errors.length === 0,
            message: `Migrated ${results.teams} teams to 'teamNames' collection and ${results.users} users to 'usernames' collection.`,
            details: results
        });

    } catch (err: any) {
        console.error("Migration Error:", err);
        return error(500, err.message);
    }
};
