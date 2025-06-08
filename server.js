const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

const FRONTEND_ORIGIN = 'https://deeplearn-frontend.vercel.app';

// ✅ CORS setup
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

// ✅ Serve generated videos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Video generation route
app.post('/generate', upload.fields([{ name: 'image' }, { name: 'audio' }]), (req, res) => {
  try {
    const imageFile = req.files.image[0];
    const audioFile = req.files.audio[0];

    const imagePath = `${imageFile.path}.png`;
    const audioPath = `${audioFile.path}.mp3`;

    // ✅ Rename temp files to include extensions
    fs.renameSync(imageFile.path, imagePath);
    fs.renameSync(audioFile.path, audioPath);

    const outputName = `output-${Date.now()}.mp4`;
    const outputPath = path.join('uploads', outputName);

    const command = `ffmpeg -loop 1 -i ${imagePath} -i ${audioPath} -shortest -c:v libx264 -c:a aac -b:a 192k -pix_fmt yuv420p ${outputPath}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ ffmpeg error:', error.message);
        return res.status(500).send('Failed to generate video');
      }

      // ✅ Clean up temp files
      fs.unlink(imagePath, () => {});
      fs.unlink(audioPath, () => {});

      console.log(`✅ Video created: ${outputName}`);
      res.json({ videoUrl: `https://deeplearn-backend.onrender.com/${outputPath}` });
    });
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ DeepLearn backend running on http://localhost:${PORT}`);
});
