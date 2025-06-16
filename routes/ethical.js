const express = require('express');
const router = express.Router();
const db = require('../firebase/firebase');

router.post('/', async (req, res) => {
  try {
    const {
      userId,
      scenarioId,
      userResponse,
      reflection,
      session, // "pre" or "post" if applicable
      timestamp,
    } = req.body;

    await db.collection('ethicalReflections').add({
      userId,
      scenarioId,
      userResponse,
      reflection,
      session,
      timestamp,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error writing ethical reflection to Firestore:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
