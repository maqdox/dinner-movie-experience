import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBLYwJk5LTG-OSj1HonUFnSsKqG4ymmU_c",
  authDomain: "dinner-movie-experience.firebaseapp.com",
  projectId: "dinner-movie-experience",
  storageBucket: "dinner-movie-experience.firebasestorage.app",
  messagingSenderId: "612597307077",
  appId: "1:612597307077:web:db79693b175844db3342ac"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
