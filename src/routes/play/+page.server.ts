import { redirect } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import type { PageServerLoad } from './$types';
import NodeCache from 'node-cache';

const playCache = new NodeCache({ stdTTL: 15 }); // 15 Second TTL for fast-moving game data

export const load: PageServerLoad = async ({ locals }) => {

  let allQuestions = playCache.get<any[]>("allQuestions");

  if (!allQuestions) {
    const snapshot = await adminDB
      .collection('levels')
      .orderBy('level')
      .get();

    allQuestions = snapshot.docs.map((doc) => {
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

    playCache.set("allQuestions", allQuestions);
  }
  if (!locals.userID) {
    return {
      locals,
      questions: [],
      teamData: {},
      logs: []
    };
  }

  // Cache user data to avoid db hit on every play page load
  const userCacheKey = `user_${locals.userID}`;
  let userExists = playCache.get<boolean>(`exists_${userCacheKey}`);
  let teamId = playCache.get<string>(`team_${userCacheKey}`);

  if (userExists === undefined || teamId === undefined) {
    const userDoc = await adminDB.collection('users').doc(locals.userID).get();
    userExists = userDoc.exists;
    teamId = userDoc.exists ? userDoc.data()?.team : null;
    playCache.set(`exists_${userCacheKey}`, userExists);
    playCache.set(`team_${userCacheKey}`, teamId);
  }

  if (!userExists || !teamId) {
    return {
      locals,
      questions: [],
      teamData: {},
      logs: []
    };
  }

  // Cache Team Data and Logs
  const teamCacheKey = `teamData_${teamId}`;
  let cachedTeamBundle = playCache.get<any>(teamCacheKey);

  if (!cachedTeamBundle) {
    const teamDoc = await adminDB.collection('teams').doc(teamId).get();

    if (!teamDoc.exists) {
      return { locals, questions: [], teamData: {}, logs: [] };
    }

    const rawTeamData = teamDoc.data() || {};
    const teamData = {
      ...rawTeamData,
      created: rawTeamData.created?.toDate?.().toISOString?.() || null,
      last_change: rawTeamData.last_change?.toDate?.().toISOString?.() || null
    };

    const logsDoc = await adminDB.collection('logs').doc(teamId).get();
    const logs = logsDoc.exists ? logsDoc.data()?.logs || [] : [];

    cachedTeamBundle = { teamData, logs };
    playCache.set(teamCacheKey, cachedTeamBundle);
  }

  const { teamData, logs } = cachedTeamBundle;
  const level = teamData.level || 0;


  if (locals.isAdminEmail) {
    return {
      locals,
      questions: allQuestions,
      teamData,
      logs
    };
  }

  let startTime = playCache.get<Date>("startTime");
  let endTime = playCache.get<Date>("endTime");

  if (!startTime || !endTime) {
    startTime = new Date("2026-03-10T06:30:00Z");
    endTime = new Date("2026-03-13T06:30:00Z");
    try {
      const settingsDoc = await adminDB.collection('siteSettings').doc('main').get();
      if (settingsDoc.exists) {
        const settings = settingsDoc.data() || {};
        if (settings.gameStartTime?.toDate) startTime = settings.gameStartTime.toDate();
        if (settings.gameEndTime?.toDate) endTime = settings.gameEndTime.toDate();
      }
    } catch (e) {
      console.log("Using default game times");
    }
    playCache.set("startTime", startTime, 600); // 10 minutes cache for static DB configs
    playCache.set("endTime", endTime, 600);
  }

  const now = new Date();
  const questionsVisible = now >= (startTime as Date) && now <= (endTime as Date);

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
    questions: allQuestions.slice(0, level + 1),
    teamData,
    logs
  };
};
