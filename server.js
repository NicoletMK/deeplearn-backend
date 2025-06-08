const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });
const FRONTEND_ORIGIN = 'https://deeplearn-frontend.vercel.app';

// ✅ Middleware
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Ensure uploads and data folders exist
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// ✅ Deepfake Video Generation
app.post('/generate', upload.fields([{ name: 'image' }, { name: 'audio' }]), (req, res) => {
  const imagePath = req.files.image[0].path;
  const audioPath = req.files.audio[0].path;
  const outputName = `output-${Date.now()}.mp4`;
  const outputPath = path.join('uploads', outputName);

  const command = `ffmpeg -loop 1 -i ${imagePath} -i ${audioPath} -shortest -c:v libx264 -c:a aac -b:a 192k -pix_fmt yuv420p ${outputPath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ ffmpeg error:', error.message);
      console.error('stderr:', stderr);
      return res.status(500).send('Failed to generate video');
    }

    console.log(`✅ Video created: ${outputName}`);
    res.json({ videoUrl: `https://deeplearn-backend.onrender.com/${outputPath}` });
  });
});

// ✅ Data Saving Route
app.post('/api/save/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(dataDir, `${filename}.json`);

  fs.readFile(filepath, 'utf-8', (err, data) => {
    const existing = err ? [] : JSON.parse(data || '[]');
    const updated = [...existing, req.body];

    fs.writeFile(filepath, JSON.stringify(updated, null, 2), (err) => {
      if (err) {
        console.error('❌ Error writing file:', err);
        return res.status(500).send('Failed to save data');
      }
      res.send('✅ Data saved successfully');
    });
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ DeepLearn backend running on port ${PORT}`);
});
