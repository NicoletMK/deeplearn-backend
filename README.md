# DeepLearn Backend 🧠📦

This is the backend service for the **DeepLearn** AI literacy app — an educational tool designed to teach kids about deepfakes, AI detection, and ethical reflection.

---

## ⚙️ Overview

The backend handles:

- ✅ Data storage (JSON file-based)
- 📤 Receiving and saving survey responses
- 🔁 Managing deepfake detection and ethical reflection logs
- 🌐 Serving endpoints to the frontend (deployed on Vercel)

---

## 🛠️ Tech Stack

- **Node.js** (Express for server)
- **File-based JSON storage**
- Optional: Python integration for future deepfake generation (e.g., [Wav2Lip](https://github.com/Rudrabha/Wav2Lip))

---

## 📁 Folder Structure

```
deeplearn-backend/
├── data/                    # JSON files storing all app data
│   ├── welcomeData.json
│   ├── preSurveyData.json
│   ├── detectiveData.json
│   ├── ethicsData.json
│   └── postSurveyData.json
├── assets/                  # Optional assets (e.g., videos)
├── temp/                    # Temporary files (e.g., generated videos)
├── app.py                   # (Optional) Python deepfake utilities
├── server.js                # Main Express server
└── README.md
```

---

## 🚀 Running the Server

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
node server.js
```

The server will run at `http://localhost:3001` by default.

---

## 📬 API Endpoints

Each of these accepts a `POST` request with JSON data and appends it to a corresponding file:

- `POST /api/welcome` → `data/welcomeData.json`
- `POST /api/pre-survey` → `data/preSurveyData.json`
- `POST /api/detective` → `data/detectiveData.json`
- `POST /api/ethics` → `data/ethicsData.json`
- `POST /api/post-survey` → `data/postSurveyData.json`

---

## 📦 Deployment Plan

- Host backend on **Render**, **Railway**, or similar Node.js-compatible platforms
- Ensure CORS is enabled for frontend (Vercel) to access the endpoints

---

## 🧼 Data Notes

All `.json` files are initialized as empty arrays: `[]`

### To reset data before pushing to GitHub:

```bash
echo "[]" > data/welcomeData.json
echo "[]" > data/preSurveyData.json
echo "[]" > data/detectiveData.json
echo "[]" > data/ethicsData.json
echo "[]" > data/postSurveyData.json
```

Then commit:

```bash
git add data/*.json
git commit -m "Reset data files before deployment"
git push origin main
```

---

## 👩‍🏫 Made for Classrooms

> Helping the next generation think critically about what’s real in the age of AI.

---

## 📄 License

MIT License — free to use, remix, and expand ✌️
