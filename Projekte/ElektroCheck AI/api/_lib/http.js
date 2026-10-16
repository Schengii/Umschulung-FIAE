import { handleCors } from './cors.js';
import { rateLimit } from './rate-limit.js';
import { authenticate } from './security.js';
import { dailyQuota } from './quota.js';

/**
 * Gemeinsamer Eingang aller Handler: CORS, Rate-Limit, Anmeldung, HTTP-Methode.
 * Rückgabe true = Handler darf weiterlaufen (req.user gesetzt), sonst wurde bereits geantwortet.
 * public: true überspringt die Anmeldung (Login-Endpunkte).
 * quota: Tageskontingent pro Nutzer (siehe quota.js), wird nach der Anmeldung geprüft.
 * Der Express-Adapter (backend/index.js) setzt req.skipHandlerRateLimit,
 * weil dort ein eigener (Redis-fähiger) Limiter vorgeschaltet ist.
 */
export async function guard(req, res, { methods = ['POST'], rate, quota, public: isPublic = false } = {}) {
  // CORS zuerst: Preflight-Anfragen (OPTIONS) brauchen weder Login noch Rate-Limit
  if (handleCors(req, res)) return false;

  if (!req.skipHandlerRateLimit && !(await rateLimit(req, res, rate))) return false;

  if (!isPublic) {
    const auth = await authenticate(req.headers);
    if (auth.error) {
      res.status(auth.error.status).json({ error: auth.error.error });
      return false;
    }
    req.user = auth.user;
  }

  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '));
    res.status(405).json({ error: 'Method Not Allowed' });
    return false;
  }

  if (quota && !(await dailyQuota(req, res, quota))) return false;
  return true;
}

export function logError(req, message, error) {
  if (req.log) req.log.error({ err: error }, message);
  else console.error(message, error);
}
