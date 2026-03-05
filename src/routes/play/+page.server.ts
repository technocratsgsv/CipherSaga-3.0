import { redirect } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';

const collectionRef = adminDB.collection('/levels').orderBy('level');

let loaded = false;
let questions: any[] = [];

export const load = async ({ locals }: any) => {
  // Admins (any admin email) can always see all questions — bypass time gate and team check
  if (locals.isAdminEmail) {
    const querySnapshot = await collectionRef.get();
    const adminQuestions: any[] = [];
    querySnapshot.docs.forEach((d) => {
      let data = d.data();
      // Keep answers visible for admin
      adminQuestions.push(data);
    });
    return { locals, questions: adminQuestions };
  }

  if (!locals.userID) return { locals, questions: [] };
  const userDoc = await adminDB.collection('/users').doc(locals.userID).get();
  const teamId = userDoc.data()?.team;
  if (!teamId) return { locals, questions: [] };
  const team = await adminDB.collection('/teams').doc(teamId).get();
  const level = team.data()?.level || 0;

  // Read game times from Firestore siteSettings, fall back to hardcoded defaults
  let startTime = new Date("2026-02-14T18:39:00Z");
  let endTime = new Date("2026-02-18T18:39:00Z");
  try {
    const settingsDoc = await adminDB.collection('siteSettings').doc('main').get();
    if (settingsDoc.exists) {
      const settings = settingsDoc.data() || {};
      if (settings.gameStartTime) startTime = new Date(settings.gameStartTime);
      if (settings.gameEndTime) endTime = new Date(settings.gameEndTime);
    }
  } catch (e) {
    // Ignore, use defaults
  }

  const now = new Date();
  const questionsVisible = now >= startTime && now <= endTime;

  console.log("⏰ TIME DEBUG");
  console.log("Server now (UTC):", now.toISOString());
  console.log("Start (UTC):", startTime.toISOString());
  console.log("End (UTC):", endTime.toISOString());
  console.log("questionsVisible:", questionsVisible);

  if (questionsVisible) {
    if (locals.banned) {
      return redirect(302, '/team');
    }

    if (!loaded) {
      const querySnapshot = await collectionRef.get();
      console.log("📦 DB DEBUG");
      console.log("Levels fetched:", querySnapshot.docs.length);
      querySnapshot.docs.forEach((d) => {
        let data = d.data();
        data['answer'] = null;
        data['creator'] = null;
        questions.push(data);
      });

      collectionRef.onSnapshot((newSnapshot) => {
        const newQuestions: any[] = [];
        newSnapshot.docs.forEach((d) => {
          let newData = d.data();
          newData['answer'] = null;
          newData['creator'] = null;
          newQuestions.push(newData);
        });
        questions = newQuestions;
        console.log('new update');
      });
      loaded = true;
    }

    if (!locals.userID || !locals.userExists || !locals.userTeam) {
      return redirect(302, '/ready');
    }
  }

  return {
    locals,
    questions: questions.slice(0, level),
  };
};
