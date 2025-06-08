const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// ✅ CORS options to fix credential issues
const corsOptions = {
  origin: 'https://deeplearn-frontend.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// ✅ Save data to JSON files dynamically
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

// ✅ Mock Creator Mode video generation endpoint
app.post('/generate', (req, res) => {
  console.log('🎬 /generate endpoint hit (mock)');
  res.json({
    videoUrl: 'https://storage.googleapis.com/deeplearn-assets/placeholder.mp4'
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ DeepLearn API running on http://localhost:${PORT}`);
});
