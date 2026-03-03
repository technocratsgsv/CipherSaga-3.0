import { redirect } from '@sveltejs/kit';
import { adminDB } from '@/server/admin';

const collectionRef = adminDB.collection('/levels').orderBy('level');

let loaded = false;
let questions: any[] = [];

export const load = async ({ locals }: any) => {
  if (!locals.userID) return { locals, questions: [] };
  const userDoc = await adminDB.collection('/users').doc(locals.userID).get();
  const teamId = userDoc.data()?.team;
  if (!teamId) return { locals, questions: [] };
  const team = await adminDB.collection('/teams').doc(teamId).get();
  const level = team.data()?.level || 0;

  const now = new Date();
  const startTime = new Date("2026-02-14T18:39:00Z");
  const endTime = new Date("2026-02-18T18:39:00Z");
  
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

    if (
      !locals.userID ||
      !locals.userExists ||
      !locals.userTeam
    ) {
      return redirect(302, '/ready');
    }
  }

  return {
    locals,
    questions: questions.slice(0, level),
  };
};
