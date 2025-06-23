const express = require('express');
const router = express.Router();
const db = require('../firebase/firebase');

router.post('/', async (req, res) => {
  try {
    const { userId, grade, reflectionText, timestamp } = req.body;

    // ✅ Prevent undefined from being saved
    if (!userId || !reflectionText || !timestamp || grade === undefined) {
      return res.status(400).json({ error: 'Missing required field' });
    }

    await db.collection('ethicsResponses').add({
      userId,
      grade,
      reflectionText,
      timestamp
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Ethics reflection error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
