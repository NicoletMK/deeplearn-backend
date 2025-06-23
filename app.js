const express = require('express');
const cors = require('cors');
const app = express();

// ✅ Allow CORS for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://deeplearn-frontend.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// ✅ Allow preflight OPTIONS for all routes
app.options('*', cors());

app.use(express.json());

// ✅ Import Routes
const detectiveRoute = require('./routes/detective');
const ethicsRoute = require('./routes/ethical');
const welcomeRoute = require('./routes/welcome');

// ✅ Register Routes
app.use('/api/detective', detectiveRoute);
app.use('/api/ethics', ethicsRoute);
app.use('/api/welcome', welcomeRoute);

// ✅ Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
