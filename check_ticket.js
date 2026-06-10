const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSy...",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dinner-movie-experience.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dinner-movie-experience",
};

// we will just write a fetch using the REST API to be safe, since we don't have the full config handy
async function check() {
  const url = `https://firestore.googleapis.com/v1/projects/dinner-movie-experience/databases/(default)/documents/movie_passes/SPM-00009`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.fields.ticket_imagen.stringValue);
}
check();
