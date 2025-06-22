const express = require('express');
const cors = require('cors');
const app = express();

// Route imports
const detectiveRoute = require('./routes/detective');
const ethicsRoute = require('./routes/ethical');
const welcomeRoute = require('./routes/welcome'); // if needed

// CORS middleware
app.use(cors({
  origin: 'https://deeplearn-frontend.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Register routes
app.use('/api/detective', detectiveRoute);
app.use('/api/ethics', ethicsRoute);
app.use('/api/welcome', welcomeRoute); // optional

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
