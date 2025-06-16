// backend/routes/api/welcome.js
const express = require('express');
const router = express.Router();
const db = require('../firebase/firebase'); // uses firebase.js

router.post('/', async (req, res) => {
  try {
    const { userId, firstName, lastName, age, grade, timestamp } = req.body;

    await db.collection('welcomeUsers').add({
      userId,
      firstName,
      lastName,
      age,
      grade,
      timestamp,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error writing to Firestore:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
