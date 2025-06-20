const express = require('express');
const router = express.Router();
const db = require('../firebase/firebase');

router.post('/', async (req, res) => {
  try {
    const {
      userId,
      session,          // 'pre' or 'post'
      timestamp,
      pairIndex,        // index of the video pair
      selectedIndex,    // 0 or 1
      actualLabel,      // 'real' or 'fake'
      correct,          // boolean
      videos            // [url1, url2]
    } = req.body;

    const collectionName = session === 'pre' ? 'detectivePre' : 'detectivePost';

    await db.collection(collectionName).add({
      userId,
      timestamp,
      pairIndex,
      selectedIndex,
      actualLabel,
      correct,
      videos,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error writing detective data to Firestore:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
