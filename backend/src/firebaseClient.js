// src/lib/firebaseClient.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcioU-ZElHNPjbFMIeLDr0UjHC-LRFxJY",
  authDomain: "project-scripting-e2427.firebaseapp.com",
  projectId: "project-scripting-e2427",
  storageBucket: "project-scripting-e2427.appspot.com",
  messagingSenderId: "55288593922",
  appId: "1:55288593922:web:87bea2a526ce44bd65711b"
};

// Initialize only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };