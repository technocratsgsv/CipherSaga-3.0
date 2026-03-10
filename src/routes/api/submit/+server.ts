import type { RequestHandler } from './$types';
import { error, json, redirect } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDB } from '$lib/server/admin';
import NodeCache from 'node-cache';

const questionsCollectionRef = adminDB.collection("levels");
// Cache questions for 5 minutes — they don't change mid-game
const questionCache = new NodeCache({ stdTTL: 300 });

export const POST: RequestHandler = async ({ request, locals }) => {

    if (!locals.userTeam || !locals.userExists || !locals.userID) {
        throw redirect(302, "/ready");
    }

    let { questionId, answer } = await request.json();

    if (!questionId || typeof questionId !== "string") {
        throw error(400, "Invalid questionId");
    }

    if (!answer || typeof answer !== "string") {
        throw error(400, "Invalid answer");
    }

    answer = answer.toLowerCase().trim();

    // ✅ locals.userTeam is set by hooks.server.ts — no need to re-fetch user doc
    const teamId = locals.userTeam;

    if (!teamId) {
        throw error(400, "User not in a team");
    }

    const now = new Date();
    const startTime = new Date("2026-03-10T06:30:00Z");
    const endTime = new Date("2026-03-13T06:30:00Z");

    const questionsVisible = now >= startTime && now <= endTime;
    const isAdmin = locals.isAdminEmail;

    if (!isAdmin && !questionsVisible) {
        throw error(405, "Event not active");
    }

    // ✅ Cache question docs — they only change when admin updates them
    let questionData = questionCache.get<any>(questionId);
    if (!questionData) {
        const questionDoc = await questionsCollectionRef.doc(questionId).get();
        if (!questionDoc.exists) {
            throw error(404, "Question not found");
        }
        questionData = questionDoc.data();
        questionCache.set(questionId, questionData);
    }


    const submittedLevel = questionData?.level;
    const actualAnswer = questionData?.answer?.toLowerCase();

    if (submittedLevel === undefined || !actualAnswer) {
        throw error(500, "Invalid question data");
    }

    let wasCorrect = false;

    await adminDB.runTransaction(async (transaction) => {

        const teamRef = adminDB.collection("teams").doc(teamId);
        const teamSnap = await transaction.get(teamRef);

        if (!teamSnap.exists) {
            throw error(500, "Team missing");
        }

        const teamData = teamSnap.data();
        const level = teamData?.level || 0;
        const completedLevels: string[] = teamData?.completed_levels || [];

        if (completedLevels.includes(questionId)) {
            wasCorrect = true;
            return;
        }

        const logRef = adminDB.collection("logs").doc(teamId);

        if (answer === actualAnswer) {

            const nextLevel = (teamData?.level || 0) + 1;

            transaction.update(teamRef, {
                completed_levels: FieldValue.arrayUnion(questionId),
                level: nextLevel,
                last_change: FieldValue.serverTimestamp()
            });

            transaction.set(logRef, {
                count: FieldValue.increment(1),
                logs: FieldValue.arrayUnion({
                    timestamp: new Date().toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour12: true
                    }),
                    questionId,
                    type: "correct_answer",
                    entered: answer,
                    userId: locals.userID
                })
            }, { merge: true });

            wasCorrect = true;

        } else {

            transaction.set(logRef, {
                count: FieldValue.increment(1),
                logs: FieldValue.arrayUnion({
                    timestamp: new Date().toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        hour12: true
                    }),
                    questionId,
                    type: "wrong_answer",
                    entered: answer,
                    userId: locals.userID
                })
            }, { merge: true });

            wasCorrect = false;
        }

    });

    return json({
        correct: wasCorrect
    });
};