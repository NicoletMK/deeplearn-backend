const express = require('express');
const router = express.Router();
const db = require('../firebase/firebase');

// Example array of pre-detective video IDs for repetition check
// You can generate this dynamically if needed
const preDetectiveVideoIds = [0,1,2,3,4,5,6,7,8,9];

router.post('/', async (req, res) => {
  try {
    const {
      userId,
      session,          // 'pre' or 'post'
      timestamp,
      videoIndex,       // index of the current video in the session
      selectedIndex,    // 0 or 1
      actualLabel,      // 'real' or 'fake'
      correct,          // boolean
      videoUrl,         // single video URL
      reasonType        // 'artifact' or 'knowledge'
    } = req.body;

    const collectionName = session === 'pre' ? 'detectivePre' : 'detectivePost';

    // Determine if the video is repeated from pre-detective
    let isRepeated = false;
    if (session === 'post') {
      isRepeated = preDetectiveVideoIds.includes(videoIndex);
    }

    await db.collection(collectionName).add({
      userId,
      timestamp,
      videoIndex,
      selectedIndex,
      actualLabel,
      correct,
      videoUrl,
      reasonType,
      isRepeated
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error writing detective data to Firestore:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
