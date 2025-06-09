// firebase/firebase.js
const admin = require('firebase-admin');
const path = require('path');

// Prevent reinitialization in serverless environments
if (!admin.apps.length) {
  const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
module.exports = db;
