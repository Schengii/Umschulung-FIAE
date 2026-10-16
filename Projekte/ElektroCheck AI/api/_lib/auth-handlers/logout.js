import { guard, logError } from '../http.js';
import { destroySession } from '../auth.js';

/** Beendet die Session serverseitig (das Token wird ungültig). */
export default async function handler(req, res) {
  if (!(await guard(req, res, { public: true }))) return;

  try {
    const token = /^Bearer (.+)$/.exec(req.headers?.authorization || '')?.[1];
    if (token) await destroySession(token);
    res.json({ ok: true });
  } catch (error) {
    logError(req, 'Fehler beim Abmelden', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
}
