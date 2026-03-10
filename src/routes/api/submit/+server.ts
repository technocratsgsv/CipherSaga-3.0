import type { RequestHandler } from './$types';
import { error, json, redirect } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDB } from '$lib/server/admin';

const questionsCollectionRef = adminDB.collection("levels");
const questionMap = new Map<string, any>();
let loaded = false;

export const POST: RequestHandler = async ({ request, locals }) => {

    if (!loaded) {
        const querySnap = await questionsCollectionRef.get();

        querySnap.docs.forEach((q) => {
            questionMap.set(q.id, q.data());
        });

        questionsCollectionRef.onSnapshot((snap) => {
            snap.docs.forEach((q) => {
                questionMap.set(q.id, q.data());
            });
        });

        loaded = true;
    }

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

    console.log("Submission:", questionId, answer);
    const userDoc = await adminDB.collection('users').doc(locals.userID).get();

    if (!userDoc.exists) {
        throw error(404, "User not found");
    }

    const userData = userDoc.data();
    const teamId = userData?.team;

    if (!teamId) {
        throw error(400, "User not in a team");
    }

    const teamDoc = await adminDB.collection('/teams').doc(teamId).get();

    if (!teamDoc.exists) {
        throw error(404, "Team not found");
    }

    const teamData = teamDoc.data();
    const level = teamData?.level || 0;

    const now = new Date();
    const startTime = new Date("2026-03-10T06:30:00Z");
    const endTime = new Date("2026-03-13T06:30:00Z");

    const questionsVisible = now >= startTime && now <= endTime;
    const isAdmin = locals.isAdminEmail;

    if (!isAdmin && !questionsVisible) {
        throw error(405, "Event not active");
    }

    if (!questionMap.has(questionId)) {
        throw error(404, "Question not found");
    }

    const questionData = questionMap.get(questionId);

    const submittedLevel = questionData?.level;
    const actualAnswer = questionData?.answer?.toLowerCase();

    if (submittedLevel === undefined || !actualAnswer) {
        throw error(500, "Invalid question data");
    }

    if (level < submittedLevel) {
        throw error(405, "Level locked");
    }

    let wasCorrect = false;

    await adminDB.runTransaction(async (transaction) => {

        const teamRef = adminDB.collection("teams").doc(teamId);
        const teamSnap = await transaction.get(teamRef);

        if (!teamSnap.exists) {
            throw error(500, "Team missing");
        }

        const teamData = teamSnap.data();
        const completedLevels: string[] = teamData?.completed_levels || [];

        if (completedLevels.includes(questionId)) {
            wasCorrect = true;
            return;
        }

        const logRef = adminDB.collection("logs").doc(teamId);

        if (answer === actualAnswer) {

            const nextLevel = (teamData.level || 0) + 1;

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