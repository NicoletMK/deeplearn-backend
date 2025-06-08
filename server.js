const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

const FRONTEND_ORIGIN = 'https://deeplearn-frontend.vercel.app';

// ✅ Manual CORS handling for Render to work with credentials
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

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

app.post('/generate', (req, res) => {
  console.log('🎬 /generate endpoint hit (mock)');
  res.json({
    videoUrl: 'https://storage.googleapis.com/deeplearn-assets/placeholder.mp4'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ DeepLearn API running on http://localhost:${PORT}`);
});
