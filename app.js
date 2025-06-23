const express = require('express');
const cors = require('cors');
const app = express();

// ✅ FIXED CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://deeplearn-frontend.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

// Routes
const detectiveRoute = require('./routes/detective');
const ethicsRoute = require('./routes/ethical');
const welcomeRoute = require('./routes/welcome');

app.use('/api/detective', detectiveRoute);
app.use('/api/ethics', ethicsRoute);
app.use('/api/welcome', welcomeRoute);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
