import { redirect } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {

  const snapshot = await adminDB
    .collection('levels')
    .orderBy('level')
    .get();

  const allQuestions = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      uid: doc.id,
      level: data.level,
      prompt: data.prompt,
      files: data.files || [],
      images: data.images || [],
      comment: data.comment || ""
    };
  });

  if (!locals.userID) {
    return {
      locals,
      questions: [],
      teamData: {},
      logs: []
    };
  }

  const userDoc = await adminDB.collection('users').doc(locals.userID).get();

  if (!userDoc.exists) {
    return {
      locals,
      questions: [],
      teamData: {},
      logs: []
    };
  }

  const teamId = userDoc.data()?.team;

  if (!teamId) {
    return {
      locals,
      questions: [],
      teamData: {},
      logs: []
    };
  }

  const teamDoc = await adminDB.collection('teams').doc(teamId).get();

  if (!teamDoc.exists) {
    return {
      locals,
      questions: [],
      teamData: {},
      logs: []
    };
  }

  const rawTeamData = teamDoc.data() || {};
  const teamData = {
    ...rawTeamData,
    created: rawTeamData.created?.toDate?.().toISOString?.() || null,
    last_change: rawTeamData.last_change?.toDate?.().toISOString?.() || null
  };

  const level = teamData.level || 0;

  const logsDoc = await adminDB.collection('logs').doc(teamId).get();

  const logs = logsDoc.exists
    ? logsDoc.data()?.logs || []
    : [];


  if (locals.isAdminEmail) {
    return {
      locals,
      questions: allQuestions,
      teamData,
      logs
    };
  }

  let startTime = new Date("2026-02-14T18:39:00Z");
  let endTime = new Date("2026-02-18T18:39:00Z");

  try {
    const settingsDoc = await adminDB
      .collection('siteSettings')
      .doc('main')
      .get();

    if (settingsDoc.exists) {
      const settings = settingsDoc.data() || {};

      if (settings.gameStartTime?.toDate) {
        startTime = settings.gameStartTime.toDate();
      }

      if (settings.gameEndTime?.toDate) {
        endTime = settings.gameEndTime.toDate();
      }
    }
  } catch (e) {
    console.log("Using default game times");
  }

  const now = new Date();
  const questionsVisible = now >= startTime && now <= endTime;

  if (!questionsVisible) {
    return {
      locals,
      questions: [],
      teamData,
      logs
    };
  }

  if (locals.banned) {
    throw redirect(302, '/team');
  }

  if (!locals.userExists || !locals.userTeam) {
    throw redirect(302, '/ready');
  }

  return {
    locals,
    questions: allQuestions.slice(0, level),
    teamData,
    logs
  };
};