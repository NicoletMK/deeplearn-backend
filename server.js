const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// ✅ Allow only your Vercel frontend to access the backend
const corsOptions = {
  origin: 'https://deeplearn-frontend.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

const dataDir = path.join(__dirname, 'data');

// ✅ Ensure the data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// ✅ API to save incoming data to the correct JSON file
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

// ✅ Mock endpoint for Creator Mode video generation
app.post('/generate', (req, res) => {
  console.log('🎬 Received /generate request (Creator Mode)');
  res.json({
    videoUrl: 'https://storage.googleapis.com/deeplearn-assets/placeholder.mp4'
  });
});

// ✅ Start server on provided or default port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ DeepLearn API server running on http://localhost:${PORT}`);
});
