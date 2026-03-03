import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAhglte1ATWbzr8dmdkaCB0mMPWGLUMCxQ",
  authDomain: "ciphersaga-dev.firebaseapp.com",
  projectId: "ciphersaga-dev",
  storageBucket: "ciphersaga-dev.firebasestorage.app",
  messagingSenderId: "12391029088",
  appId: "1:12391029088:web:ff77946b0be11ff363a605",
  measurementId: "G-G5RJW9F4RF"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
