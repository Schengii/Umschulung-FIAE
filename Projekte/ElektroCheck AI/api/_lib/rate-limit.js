import { isRedisConfigured, kvIncr } from './kv.js';

const requestCounts = new Map();

const WINDOW_MS = 60 * 1000; // 1 Minute
const DEFAULT_MAX_REQUESTS = 20; // 20 Requests pro Minute pro IP

/**
 * Rate-Limit pro IP und Schlüssel (Festes Zeitfenster, 1 Minute).
 * Mit Upstash Redis zählt der Zähler instanzübergreifend (nötig auf Vercel, wo jede Funktionsinstanz
 * eigenen Speicher hat); ohne Redis oder bei Redis-Ausfall zählt ein In-Memory-Zähler pro Instanz.
 * Rückgabe true = Request darf weiterlaufen, sonst wurde bereits mit 429 geantwortet.
 */
export async function rateLimit(req, res, { max = DEFAULT_MAX_REQUESTS, key = 'default' } = {}) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();

  let count = await countInRedis(`${key}:${ip}`, now);
  if (count === null) count = countInMemory(`${key}:${ip}`, now);

  const retryAfter = Math.ceil((WINDOW_MS - (now % WINDOW_MS)) / 1000);
  if (count > max) {
    res.status(429).json({
      error: 'Zu viele Anfragen. Bitte warte eine Minute und versuche es erneut.',
      retryAfter
    });
    return false;
  }

  res.setHeader('X-RateLimit-Limit', max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
  return true;
}

/** Zählerstand aus Redis oder null, wenn Redis nicht konfiguriert/erreichbar ist. */
async function countInRedis(id, now) {
  if (!isRedisConfigured()) return null;
  try {
    // Zeitfenster im Schlüssel; TTL etwas länger als das Fenster, damit alte Schlüssel verfallen
    return await kvIncr(`rl:${id}:${Math.floor(now / WINDOW_MS)}`, (WINDOW_MS / 1000) * 2);
  } catch (error) {
    console.error('Rate-Limit: Redis nicht erreichbar, nutze In-Memory-Zähler.', error);
    return null;
  }
}

function countInMemory(id, now) {
  const entry = requestCounts.get(id) || { count: 0, windowStart: now };

  if (now - entry.windowStart > WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count++;
  requestCounts.set(id, entry);

  // Map periodisch aufräumen (alle 1000 Einträge)
  if (requestCounts.size > 1000) {
    for (const [k, val] of requestCounts.entries()) {
      if (now - val.windowStart > WINDOW_MS * 2) requestCounts.delete(k);
    }
  }
  return entry.count;
}
