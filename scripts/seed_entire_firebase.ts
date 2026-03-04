import { adminDB } from '../src/lib/server/admin.ts';
import { FieldValue } from 'firebase-admin/firestore';

async function seedFirebase() {
    console.log("🚀 Starting comprehensive Firebase schema initialization...");

    const batch = adminDB.batch();

    // 1. bonusQuestions (Requested by URL: bonus_campus_mystery_01)
    const bonusRef = adminDB.collection('bonusQuestions').doc('bonus_campus_mystery_01');
    batch.set(bonusRef, {
        qrString: "campus_code_01", // The string embedded in the QR code
        title: "Campus Mystery",
        description: "Solve the riddle hidden at the fountain.",
        hint: "Look for the plaque with the year.",
        answer: "1984", // Note: will be matched against lowercase trimmed user input
        points: 50,
        negative_points: 10,
        isSolved: false,      // Will be set to true when solved
        isVisible: true,      // Admin control, also hidden after solve
        solvedByTeamId: null, // Will be updated to teamId
        solvedAt: null,       // Will be updated to timestamp
    });

    // 2. levels (Main game questions)
    const levelRef = adminDB.collection('levels').doc('level_demo_01');
    batch.set(levelRef, {
        uid: "level_demo_01",
        prompt: "Welcome to CipherSaga! What is the name of our university?",
        answer: "gsv",
        level: 1,
        comment: "This is a demo question.",
        files: [],
        images: [],
        creator: "admin_user_id",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });

    // 3. users (Sample authenticated user record)
    const userRef = adminDB.collection('users').doc('sample_user_01');
    batch.set(userRef, {
        name: "Demo Player",
        email: "demo@gsv.ac.in",
        username: "demoplayer",
        role: "user", // or "admin"
        team: "sample_team_01",
        joinedAt: FieldValue.serverTimestamp()
    });

    // 4. usernames (Reverse lookup for scalable username checks)
    const usernameRef = adminDB.collection('usernames').doc('demoplayer');
    batch.set(usernameRef, {
        uid: "sample_user_01",
        migrated: true,
        migratedAt: FieldValue.serverTimestamp()
    });

    // 5. teams (Team data and game state)
    const teamRef = adminDB.collection('teams').doc('sample_team_01');
    batch.set(teamRef, {
        teamName: "The Pioneers",
        uid: "sample_team_01",
        code: "x8ya2b4c", // Example 8-char invite code
        owner: "sample_user_01",
        members: ["sample_user_01"],
        level: 1, // Current level number
        banned: false,
        gsv_verified: true,
        bonusPoints: 0,
        bonus_score: 0,
        completed_levels: [], // Array of level uid strings
        scannedQRCodes: [],   // Array of qrStrings
        solved_bonuses: [],   // Array of bonus doc IDs
        created: FieldValue.serverTimestamp(),
        last_change: FieldValue.serverTimestamp()
    });

    // 6. teamNames (Reverse lookup for unique team names)
    const teamNameRef = adminDB.collection('teamNames').doc('the pioneers');
    batch.set(teamNameRef, {
        teamId: "sample_team_01",
        createdAt: FieldValue.serverTimestamp()
    });

    // 7. logs (Audit trail per team)
    const logRef = adminDB.collection('logs').doc('sample_team_01');
    batch.set(logRef, {
        count: 0,
        logs: []
    });

    await batch.commit();
    console.log("✅ Successfully initialized all collections with template documents.");
    process.exit(0);
}

seedFirebase().catch(err => {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
});
