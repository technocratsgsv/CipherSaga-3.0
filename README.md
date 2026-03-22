# Cipher Saga 3.0
Cipher Saga 3.0 : The Upcoming Epic Event of Epitome'26. CipherSaga is an online cryptic hunt event hosted during EPITOME, the annual techno-management fest of Gati Shakti Vishwavidyalaya

# Features
1. Levels displayed within set start and endtime
2. Realtime Leaderboard for high points and least time
3. Create Team and Join Team
4. Implemented QR code Hunt with Scanner and Questions for bonus points
5. Admin Dashboard to control the game

# Setup Guide to Run CipherSaga Locally

## 1. Clone the Repository

```bash
git clone https://github.com/ShreyaPMohanty6/CipherSaga-Ref.git
cd CipherSaga-Ref
```
Open the project in VS Code
Install Node.js (version > 18)
Install dependencies:

```bash
npm install
```
## 2. Create a firebase project (Web App)

Go to Firebase Console and create a new project
Add a Web App
Enable Authentication → Google Sign-In
Setup Firestore Database
Go to Project Settings → General → Firebase Config
Copy the configuration inside firebaseConfig

**Service Account Setup**
Go to Project Settings → Service Accounts
Click Generate New Private Key
Download the JSON file

## 3. Configure Firebase in Project
Navigate to:
src/lib/firebase.ts
Replace the existing config with your Firebase project config

## 4. Setup Environment Variables

1. Rename: .env.example to .env
2. Add the following values:

```env
FB_PROJECT_ID=your_project_id
FB_PRIVATE_KEY=your_private_key
FB_CLIENT_MAIL=your_client_email

SENTRY_AUTH_TOKEN="your_sentry_auth_token"
PUBLIC_SENTRY_DSN="your_sentry_dsn"

PUBLIC_FIREBASE_API_KEY = 
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_FIREBASE_MEASUREMENT_ID=

ADMIN_PASSWORD = your_password
```
## 5. Firestore Database Setup

Create Required Collections/Documents

/index/userIndex
```json
{
  "0": null
}
```

/index/nameIndex
```json
{
  "teamcodes": [],
  "teamcounts": [],
  "teamnames": [],
  "usernames": []
}
```

## 6. Setup Firebase CLI

Install Firebase CLI globally:
```bash
npm install -g firebase-cli
```

Login to Firebase:
```bash
firebase login
```
Initialize Firebase:
```bash
firebase init
```

Select:
✅ Firestore
✅ Indexes
✅ Security Rules

## 7. Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore
```

## 8. Run Project locally

```bash
npm run dev
```
Open the URL shown in the terminal (usually http://localhost:5173 or similar)

**You're Good to Go!

Your local instance of CipherSaga should now be running 🚀**

