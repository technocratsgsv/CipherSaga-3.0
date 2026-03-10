import { adminDB } from './src/lib/server/admin.js';

async function test() {
    const teamsSnap = await adminDB.collection('teams').limit(1).get();
    if(teamsSnap.empty) { console.log('no teams'); return; }
    
    const team = teamsSnap.docs[0].data();
    console.log('Team members:', team.members);
    
    const usersSnap = await adminDB.collection('users').limit(5).get();
    console.log('Sample users:');
    usersSnap.forEach(doc => {
        console.log(doc.id, doc.data());
    });
}
test().catch(console.error);
