import type { RequestHandler } from './$types';
import { adminDB } from '$lib/server/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { error, json } from '@sveltejs/kit';
import axios from "axios";

export const POST: RequestHandler = async ({ request, cookies, locals }) => {

    if (locals.userID === null) {
        return error(401, 'Unauthorized');
    } else {
        const body = await request.json();
        let { first, last, username } = body;

        console.log(body)
        console.log(first, last, username);
        if (typeof first !== 'string' || typeof last !== 'string' || typeof username !== 'string') {
            console.log('Invalid request');
            return error(400, 'Invalid request');
        }

        username = username.toString().toLowerCase().trim();

        // SCALABLE CHECK: Check if username exists in 'usernames' collection
        const usernameRef = adminDB.collection('usernames').doc(username);
        const usernameDoc = await usernameRef.get();

        if (usernameDoc.exists) {
            return error(409, 'Username already exists');
        } else {
            // Transaction to create user and reserve username
            try {
                await adminDB.runTransaction(async (transaction) => {
                    // Re-check username inside transaction involves a read, which is fine
                    const currentUsernameDoc = await transaction.get(usernameRef);
                    if (currentUsernameDoc.exists) {
                        throw new Error("Username already taken");
                    }

                    const userRef = adminDB.collection('users').doc(locals.userID!);

                    transaction.set(userRef, {
                        first,
                        last,
                        username: username,
                        team: null,
                        uid: locals.userID,
                        created: FieldValue.serverTimestamp(),
                    });

                    // Reserve the username
                    transaction.set(usernameRef, {
                        uid: locals.userID,
                        createdAt: FieldValue.serverTimestamp()
                    });

                    // NO UPDATES TO 'nameIndex' or 'userIndex' - Legacy schema removed
                });

                // Webhook Notification (Fire and Forget)
                let usercount = 0; // Optimization: Don't count every time if unnecessary, or use a distributed counter if needed. 
                // If count is strictly required, separate fetch.
                try {
                    // For now, removing the heavy count query or making it optional.
                    // If you really need it, query it separately, but it slows down user creation.
                    // usercount = (await adminDB.collection('users').count().get()).data().count;
                } catch (e) { }

                try {
                    if (process.env.WEBHOOK) await axios.post(process.env.WEBHOOK, {
                        "content": "**New User**\nName: " + first + " " + last + "\nUsername: " + username + "\n(User Count omitted for performance)"
                    });
                } catch (e) {
                    console.error("Webhook error:", e);
                }

                return json({ success: true });

            } catch (e: any) {
                console.error("User Creation Transaction Error:", e);
                if (e.message === "Username already taken") {
                    return error(409, 'Username already exists');
                }
                return error(500, `Internal Server Error: ${e.message}`);
            }
        }
    }
};