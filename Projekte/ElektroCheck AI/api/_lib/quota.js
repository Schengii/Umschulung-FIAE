import { kvIncr } from './kv.js';

const DAY_SECONDS = 24 * 60 * 60;

/** Kontingent der KI-Endpunkte (Gemini): Aufrufe pro Nutzer und UTC-Tag. `GEMINI_DAILY_LIMIT=0` schaltet das Limit ab. */
export const GEMINI_QUOTA = { key: 'gemini', envVar: 'GEMINI_DAILY_LIMIT', defaultMax: 300 };

function limitFor({ envVar, defaultMax }, env) {
  const raw = env[envVar];
  if (raw === undefined || raw === '') return defaultMax;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : defaultMax;
}

/**
 * Tageskontingent pro Nutzer (angemeldete E-Mail, sonst Rolle bzw. IP). Schützt vor unbeabsichtigten Kosten,
 * z. B. durch eine Endlosschleife im Client. Rückgabe true = erlaubt, sonst wurde bereits mit 429 geantwortet.
 * Fällt der Zähler aus (Redis-Fehler), wird die Anfrage nicht blockiert.
 */
export async function dailyQuota(req, res, quota, env = process.env) {
  const max = limitFor(quota, env);
  if (max === 0) return true;

  const who = req.user?.email
    || (req.user ? `role:${req.user.role}` : null)
    || req.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown';
  const day = new Date().toISOString().slice(0, 10);

  let count;
  try {
    count = await kvIncr(`quota:${quota.key}:${who}:${day}`, DAY_SECONDS * 2);
  } catch (error) {
    console.error('Tageskontingent: Zähler nicht verfügbar, Anfrage wird nicht blockiert.', error);
    return true;
  }

  res.setHeader('X-Quota-Limit', max);
  res.setHeader('X-Quota-Remaining', Math.max(0, max - count));
  if (count > max) {
    res.status(429).json({ error: 'Das Tageskontingent für KI-Analysen ist aufgebraucht. Bitte morgen erneut versuchen.' });
    return false;
  }
  return true;
}
