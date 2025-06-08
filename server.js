const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const upload = multer(); // to handle multipart/form-data

const FRONTEND_ORIGIN = 'https://deeplearn-frontend.vercel.app';

// ✅ Manual CORS headers for Render (allow credentials)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// ✅ Save data to /data/*.json
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

app.post('/api/save/:filename', (req, res) => {
  const file = path.join(dataDir, `${req.params.filename}.json`);
  fs.readFile(file, 'utf-8', (err, data) => {
    const current = err ? [] : JSON.parse(data || '[]');
    const updated = [...current, req.body];
    fs.writeFile(file, JSON.stringify(updated, null, 2), err => {
      if (err) return res.status(500).send('Failed to save');
      res.send('✅ Saved');
    });
  });
});

// ✅ /generate accepts multipart image/audio and returns a placeholder video
app.post('/generate', upload.fields([{ name: 'image' }, { name: 'audio' }]), (req, res) => {
  console.log('🎬 /generate hit. Files received:', Object.keys(req.files || {}));
  res.json({
    videoUrl: 'https://storage.googleapis.com/deeplearn-assets/placeholder.mp4'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
