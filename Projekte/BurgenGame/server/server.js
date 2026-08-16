// --- BURGENGAME BACKEND SERVER (Node.js & Express) ---

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-Memory & File Persistence Databases
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CHAT_FILE = path.join(DATA_DIR, 'chat.json');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

let globalChat = fs.existsSync(CHAT_FILE) 
  ? JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8')) 
  : [{ sender: 'System', text: 'Willkommen auf dem offiziellen BurgenGame Server! 🏰', time: Date.now() }];

let leaderboard = fs.existsSync(LEADERBOARD_FILE)
  ? JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'))
  : [
      { name: 'König Arthur', score: 15400, age: 'Imperialzeit' },
      { name: 'Herzog Barbarossa', score: 12200, age: 'Ritterzeit' },
      { name: 'Graf von Luxemburg', score: 9800, age: 'Feudalzeit' }
    ];

// --- REST API ENDPOINTS ---

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', game: 'BurgenGame Server v1.0', time: new Date().toISOString() });
});

// Save Game State
app.post('/api/save', (req, res) => {
  const { username, state } = req.body;
  if (!username || !state) {
    return res.status(400).json({ error: 'Username und State erforderlich.' });
  }

  const userFile = path.join(DATA_DIR, `user_${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
  fs.writeFileSync(userFile, JSON.stringify(state, null, 2));

  res.json({ success: true, message: `Spielstand für ${username} erfolgreich auf Server gespeichert.` });
});

// Load Game State
app.get('/api/load/:username', (req, res) => {
  const username = req.params.username;
  const userFile = path.join(DATA_DIR, `user_${username.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);

  if (!fs.existsSync(userFile)) {
    return res.status(404).json({ error: 'Kein serverseitiger Spielstand gefunden.' });
  }

  const data = JSON.parse(fs.readFileSync(userFile, 'utf8'));
  res.json({ success: true, state: data });
});

// Global Chat
app.get('/api/chat', (req, res) => {
  res.json({ messages: globalChat });
});

app.post('/api/chat', (req, res) => {
  const { sender, text } = req.body;
  if (!sender || !text) {
    return res.status(400).json({ error: 'Sender und Text erforderlich.' });
  }

  const msg = { sender, text, time: Date.now() };
  globalChat.push(msg);
  if (globalChat.length > 50) globalChat.shift();

  fs.writeFileSync(CHAT_FILE, JSON.stringify(globalChat, null, 2));
  res.json({ success: true, message: msg });
});

// Global Leaderboard
app.get('/api/leaderboard', (req, res) => {
  res.json({ leaderboard });
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score, age } = req.body;
  if (!name || score === undefined) {
    return res.status(400).json({ error: 'Name und Score erforderlich.' });
  }

  const existing = leaderboard.find(e => e.name === name);
  if (existing) {
    if (score > existing.score) {
      existing.score = score;
      existing.age = age || existing.age;
    }
  } else {
    leaderboard.push({ name, score, age: age || 'Dunkles Zeitalter' });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 20);

  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
  res.json({ success: true, leaderboard });
});

app.listen(PORT, () => {
  console.log(`🏰 BurgenGame Backend Server läuft auf http://localhost:${PORT}`);
});
