// routes/welcome.js
const express = require('express');
const router = express.Router();
const db = require('../firebase/firebase');

router.post('/', async (req, res) => {
  const { userId, firstName, lastName, age, grade } = req.body;

  if (!userId || !firstName || !lastName || !age || !grade) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.collection('welcomeUsers').doc(userId).set({
      firstName,
      lastName,
      age,
      grade,
      createdAt: new Date().toISOString()
    });
    res.status(200).json({ message: 'Saved to Firestore ✅' });
  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

module.exports = router;
