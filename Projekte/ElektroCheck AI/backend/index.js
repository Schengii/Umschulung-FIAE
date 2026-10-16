import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';
import helmet from 'helmet';
import pino from 'pino';

import { handleCors } from '../api/_lib/cors.js';
import diagnosis from '../api/gemini/diagnosis.js';
import scanTypePlate from '../api/gemini/scan-type-plate.js';
import transcribe from '../api/gemini/transcribe.js';
import thermalAnalysis from '../api/gemini/thermal-analysis.js';
import scanMultimeter from '../api/gemini/scan-multimeter.js';
import schematicAnalysis from '../api/gemini/schematic-analysis.js';
import chat from '../api/gemini/chat.js';
import sendEmail from '../api/reports/send-email.js';
import perplexitySearch from '../api/perplexity/search.js';
import ticketsCollection from '../api/tickets/index.js';
import ticketItem from '../api/tickets/[id].js';
import auth from '../api/auth/[action].js';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Lokaler Express-Adapter für die Vercel-Functions in /api.
 * Die gesamte Fachlogik (Validierung, Prompts, Auth, Ticket-Speicher) liegt in /api –
 * dieser Server ergänzt nur Helmet, CORS, Request-IDs, Rate-Limiting und Logging
 * für Entwicklung, Tests und Docker.
 */
const __dir = path.dirname(fileURLToPath(import.meta.url));
for (const envPath of [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(__dir, '.env'),
  path.resolve(__dir, '..', '.env')
]) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Hinter Reverse-Proxy/Docker: TRUST_PROXY=1 (Anzahl Proxys), sonst sehen Rate-Limiter nur die Proxy-IP.
// Standard bleibt aus, damit X-Forwarded-For nicht von Clients gefälscht werden kann.
const trustProxy = process.env.TRUST_PROXY;
if (trustProxy) {
  app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
}

app.use(helmet());

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req-${Math.random().toString(36).substring(2, 11)}`;
  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  req.log = logger.child({ requestId });
  req.log.info({ method: req.method, url: req.url }, 'Request received');
  next();
});

// CORS-Header vor allem anderen, damit auch 429-Antworten des Limiters lesbar sind (Logik: api/_lib/cors.js)
app.use('/api/', (req, res, next) => (handleCors(req, res) ? undefined : next()));

// Rate limiting: RedisStore falls REDIS_URL gesetzt ist, sonst InMemory.
const limiterOptions = { windowMs: 60 * 1000, standardHeaders: true, legacyHeaders: false, skip: (req) => req.method === 'OPTIONS' };
// Obergrenzen sind für Tests per Umgebungsvariable anhebbar
const apiMax = Number(process.env.API_RATE_LIMIT_MAX) || 0;
let apiLimiter = rateLimit({ ...limiterOptions, max: apiMax || 30 });
if (process.env.REDIS_URL) {
  try {
    const redisClient = new Redis(process.env.REDIS_URL);
    apiLimiter = rateLimit({ ...limiterOptions, max: apiMax || 60, store: new RedisStore({ sendCommand: (...args) => redisClient.call(...args) }) });
    logger.info('Rate-Limiter mit Redis-Store aktiviert.');
  } catch (e) {
    logger.error({ err: e }, 'Fehler beim Initialisieren des Redis-Rate-Limiters, Fallback auf InMemory.');
  }
}
app.use('/api/', apiLimiter);

// Strengeres Limit für den E-Mail-Versand (Missbrauchsschutz)
const emailLimiter = rateLimit({ ...limiterOptions, max: 5 });
const loginLimiter = rateLimit({ ...limiterOptions, max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10 });

// Die Handler in /api verwenden sonst ihren eigenen In-Memory-Limiter
app.use('/api/', (req, res, next) => {
  req.skipHandlerRateLimit = true;
  next();
});

// Größeres Body-Limit nur für Routen mit Base64-Bildern/Audio/PDFs, sonst 100 kb.
// Vercel lehnt Request-Bodies über 4,5 MB hart ab – lokal dieselbe Grenze, damit Fehler früh auffallen.
const smallJson = express.json({ limit: '100kb' });
const largeJson = express.json({ limit: process.env.BODY_LIMIT_LARGE || '4.5mb' });
app.use((req, res, next) => {
  const needsLarge = req.path.startsWith('/api/gemini/') || req.path === '/api/reports/send-email';
  return (needsLarge ? largeJson : smallJson)(req, res, next);
});

// Zu große Bodies als JSON beantworten (wie die Handler), nicht als Express-HTML-Fehlerseite
app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Anfrage zu groß. Bitte Bild verkleinern oder kürzere Aufnahme senden.' });
  }
  return next(err);
});

if (process.env.GEMINI_API_KEY) {
  logger.info('GEMINI_API_KEY wurde erfolgreich geladen.');
} else if (process.env.NODE_ENV !== 'test') {
  logger.error('GEMINI_API_KEY ist nicht konfiguriert. Bitte erstelle eine .env-Datei basierend auf .env.example oder setze GEMINI_API_KEY in deiner Umgebung (für Tests: NODE_ENV=test setzen).');
  process.exit(1);
} else {
  logger.warn('GEMINI_API_KEY nicht gesetzt (Testmodus erlaubt).');
}

const wrap = (handler, prepare) => (req, res) => {
  prepare?.(req);
  Promise.resolve(handler(req, res)).catch((error) => {
    req.log.error({ err: error }, 'Unbehandelter Fehler im Handler');
    if (!res.headersSent) res.status(500).json({ error: 'Interner Serverfehler.' });
  });
};

// Routen (Pfade entsprechen den Rewrites in vercel.json)
app.all('/api/gemini/diagnosis', wrap(diagnosis));
app.all('/api/gemini/scan-type-plate', wrap(scanTypePlate));
app.all('/api/gemini/transcribe', wrap(transcribe));
app.all('/api/gemini/thermal-analysis', wrap(thermalAnalysis));
app.all('/api/gemini/scan-multimeter', wrap(scanMultimeter));
app.all('/api/gemini/schematic-analysis', wrap(schematicAnalysis));
app.all('/api/gemini/chat', wrap(chat));
app.all('/api/reports/send-email', emailLimiter, wrap(sendEmail));
app.all('/api/perplexity/search', wrap(perplexitySearch));
app.use('/api/auth/request-link', loginLimiter);
app.all('/api/auth/:action', wrap(auth, (req) => {
  req.query = { ...req.query, action: req.params.action };
}));
app.all('/api/tickets', wrap(ticketsCollection));
app.all('/api/tickets/:id', wrap(ticketItem, (req) => {
  req.query = { ...req.query, id: req.params.id };
}));

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Backend läuft auf http://localhost:${port}`);
  });
}

export default app;
