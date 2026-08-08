// backend/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_EXPIRES = '7d';

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email und Passwort erforderlich' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User bereits vorhanden' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), email, name: name || '', password: hashed };
  db.saveUser(user);
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email und Passwort erforderlich' });
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
  }
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Middleware to verify JWT
export function verifyToken(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Kein Token provided' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Get current user info
router.get('/me', verifyToken, (req, res) => {
  const userId = req.user.sub;
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  // Return user without password hash
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

export default router;
