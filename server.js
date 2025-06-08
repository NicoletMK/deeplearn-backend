import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import cors from 'cors';

const app = express();
const FRONTEND_ORIGIN = 'https://deeplearn-frontend.vercel.app';
const dataDir = path.join(__dirname, 'data');
const PORT = process.env.PORT || 4000;

// ✅ Manual CORS Middleware for Render with credentials
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

// ✅ Ensure `data/` folder exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// ✅ Endpoint to save any data file
app.post('/api/save/:filename', (req: Request, res: Response) => {
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

// ✅ Multer setup
const upload = multer();

// ✅ Mock /generate endpoint (multipart/form-data)
app.post('/generate', upload.fields([
  { name: 'image' }, { name: 'audio' }
]), (req: Request, res: Response) => {
  const files = req.files as {
    image?: Express.Multer.File[];
    audio?: Express.Multer.File[];
  };

  if (!files?.image?.[0] || !files?.audio?.[0]) {
    return res.status(400).json({ error: 'Missing image or audio file' });
  }

  console.log('🎬 /generate received:');
  console.log('Image:', files.image[0].originalname);
  console.log('Audio:', files.audio[0].originalname);

  res.json({
    videoUrl: 'https://storage.googleapis.com/deeplearn-assets/placeholder.mp4'
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ DeepLearn API running on http://localhost:${PORT}`);
});
