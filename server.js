const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const FRONTEND_ORIGIN = 'https://deeplearn-frontend.vercel.app';

// ✅ CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// ✅ Test /generate route
app.post('/generate', (req, res) => {
  console.log('🎬 /generate called');
  res.json({
    videoUrl: 'https://storage.googleapis.com/deeplearn-assets/placeholder.mp4'
  });
});

// ✅ Save endpoint (optional)
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

app.post('/api/save/:filename', (req, res) => {
  const filepath = path.join(dataDir, `${req.params.filename}.json`);
  const body = req.body;

  fs.readFile(filepath, 'utf8', (err, content) => {
    const existing = err ? [] : JSON.parse(content || '[]');
    const updated = [...existing, body];

    fs.writeFile(filepath, JSON.stringify(updated, null, 2), err => {
      if (err) {
        console.error('❌ Failed to write:', err);
        return res.status(500).send('Error saving data');
      }
      res.send('✅ Saved successfully');
    });
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
