const express = require('express');
const router = express.Router();
const db = require('../firebase/firebase');

router.post('/', async (req, res) => {
  try {
    const {
      userId,
      videoFile,
      actualLabel,
      userGuess,
      correct,
      session, // either "pre" or "post"
      timestamp,
    } = req.body;

    const collectionName = session === 'pre' ? 'preSurvey' : 'postSurvey';

    await db.collection(collectionName).add({
      userId,
      videoFile,
      actualLabel,
      userGuess,
      correct,
      session,
      timestamp,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error writing detective data to Firestore:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
