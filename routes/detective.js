const express = require('express');
const router = express.Router();
const db = require('../firebase/firebase');

// Example array of pre-detective video IDs for repetition check
const preDetectiveVideoIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

router.post('/', async (req, res) => {
  try {
    console.log('📥 Detective payload received:', req.body); // <-- DEBUG

    const {
      userId,
      session,       // "pre" or "post"
      timestamp,
      video,         // frontend sends this
      label,         // actual label: "real" | "fake"
      userLabel,     // user’s choice: "real" | "fake"
      cluesChosen,   // array of strings
      reasoning,     // free text
      confidence,    // number
      correct
    } = req.body;

    const collectionName = session === 'pre' ? 'detectivePre' : 'detectivePost';

    // Map frontend → backend fields
    const videoUrl = video;
    const actualLabel = label;
    const selectedIndex = userLabel === 'real' ? 0 : 1;
    const reasonType = cluesChosen && cluesChosen.length > 0 ? cluesChosen[0] : null;

    // If frontend doesn’t send videoIndex, set to null
    const videoIndex = null;

    // Detect repeated videos in post-session
    let isRepeated = false;
    if (session === 'post' && typeof videoIndex === 'number') {
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
      reasoning,
      confidence,
      isRepeated
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Error writing detective data to Firestore:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
