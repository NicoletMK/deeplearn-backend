const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'DeepLearnData');

// Save incoming data to a specific file
app.post('/api/save/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(dataDir, `${filename}.json`);

  fs.readFile(filepath, 'utf-8', (err, data) => {
    const existing = err ? [] : JSON.parse(data || '[]');
    const updated = [...existing, req.body];

    fs.writeFile(filepath, JSON.stringify(updated, null, 2), (err) => {
      if (err) {
        console.error('Error writing file', err);
        return res.status(500).send('Failed to save data');
      }
      res.send('Data saved successfully');
    });
  });
});

app.listen(4000, () => {
  console.log('✅ DeepLearn API server running on http://localhost:4000');
});
