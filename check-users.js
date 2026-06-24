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

async function checkUsers() {
  const snapshot = await adminDb.collection("users").get();
  console.log("Total users:", snapshot.size);
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data().name, "-", doc.data().restaurant_id);
  });
  process.exit(0);
}

checkUsers();
