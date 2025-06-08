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
  const imagePath = req.files.image[0].path;
  const audioPath = req.files.audio[0].path;
  const outputName = `output-${Date.now()}.mp4`;
  const outputPath = path.join('uploads', outputName);

  const command = `ffmpeg -loop 1 -i ${imagePath} -i ${audioPath} -shortest -c:v libx264 -c:a aac -b:a 192k -pix_fmt yuv420p ${outputPath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ ffmpeg error:', error.message);
      return res.status(500).send('Failed to generate video');
    }

    console.log(`✅ Video created: ${outputName}`);
    res.json({ videoUrl: `https://deeplearn-backend.onrender.com/${outputPath}` });
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ DeepLearn backend running on http://localhost:${PORT}`);
});
