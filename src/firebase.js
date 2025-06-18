// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider  } from "firebase/auth";

// 🔐 Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBMI4UvYAm5SpLQVp4oPGbQupfX8T9Q4xI",
  authDomain: "r-canvas-5c0f2.firebaseapp.com",
  projectId: "r-canvas-5c0f2",
  storageBucket: "r-canvas-5c0f2.firebasestorage.app",
  messagingSenderId: "973509630618",
  appId: "1:973509630618:web:e562454bff06153a9e9d23",
  measurementId: "G-HN2CWJWL3L"
};

const app = initializeApp(firebaseConfig);

// ✅ EXPORT BOTH db and auth
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();