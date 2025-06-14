// firebase-config.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ นำเข้า getStorage

export const firebaseConfig = {
  apiKey: "AIzaSyCcioU-ZElHNPjbFMIeLDr0UjHC-LRFxJY",
  authDomain: "project-scripting-e2427.firebaseapp.com",
  projectId: "project-scripting-e2427",
  storageBucket: "project-scripting-e2427.appspot.com",
  messagingSenderId: "55288593922",
  appId: "1:55288593922:web:87bea2a526ce44bd65711b"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ เพิ่มตรงนี้

export { auth, db, storage }; // ✅ export storage ด้วย
