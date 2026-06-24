const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = admin.firestore();

async function checkPasses() {
  const snapshot = await adminDb.collection("passes").get();
  const restNames = new Set();
  snapshot.forEach(doc => {
    restNames.add(doc.data().restaurante_nombre);
  });
  console.log("Unique restaurants in passes:", Array.from(restNames));
  process.exit(0);
}

checkPasses();
