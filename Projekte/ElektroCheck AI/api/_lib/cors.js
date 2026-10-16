/**
 * CORS für die API. Erlaubt sind die Origins aus FRONTEND_URL (kommagetrennt, "*" als Platzhalter,
 * z. B. https://elektro-*.vercel.app) und APP_URL sowie die Origins der Capacitor-Apps
 * (Android: https://localhost, iOS: capacitor://localhost) – dadurch erreicht die native App
 * ein Backend mit anderer Origin.
 *
 * CORS ist hier kein Zugriffsschutz: Die API arbeitet mit Bearer-Tokens, nicht mit Cookies.
 * Nicht freigegebene Origins bekommen lediglich keine CORS-Header (Browser blockieren dann die Antwort);
 * Anfragen derselben Origin und von Servern/Skripten sind davon nicht betroffen.
 */
const CAPACITOR_ORIGINS = ['https://localhost', 'http://localhost', 'capacitor://localhost', 'ionic://localhost'];
const DEV_DEFAULT_ORIGIN = 'http://localhost:5173';

export const ALLOWED_HEADERS = 'Authorization, Content-Type, x-request-id, x-gemini-api-key, x-perplexity-api-key';
export const ALLOWED_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';

const splitList = (value) => String(value || '').split(',').map((entry) => entry.trim()).filter(Boolean);
const escapeRegExp = (value) => value.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

function matches(pattern, origin) {
  if (!pattern.includes('*')) return pattern === origin;
  return new RegExp('^' + pattern.split('*').map(escapeRegExp).join('.*') + '$').test(origin);
}

export function isOriginAllowed(origin, env = process.env) {
  if (!origin) return false;
  const configured = [...splitList(env.FRONTEND_URL), ...splitList(env.APP_URL)].map((o) => o.replace(/\/+$/, ''));
  const patterns = [...(configured.length > 0 ? configured : [DEV_DEFAULT_ORIGIN]), ...CAPACITOR_ORIGINS];
  return patterns.some((pattern) => matches(pattern, origin));
}

/**
 * Setzt die CORS-Header und beantwortet Preflight-Anfragen (OPTIONS) direkt.
 * Rückgabe true = Anfrage ist damit erledigt (Preflight), der Handler soll nichts mehr tun.
 */
export function handleCors(req, res, env = process.env) {
  const origin = req.headers?.origin;
  const allowed = isOriginAllowed(origin, env);

  if (origin) res.setHeader('Vary', 'Origin');
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Expose-Headers', 'x-request-id, Retry-After');
  }

  if (req.method !== 'OPTIONS') return false;

  if (origin && !allowed) {
    res.status(403).json({ error: 'Origin nicht erlaubt.' });
    return true;
  }
  if (allowed) {
    res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
    res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
    res.setHeader('Access-Control-Max-Age', '600');
  }
  res.status(204).end();
  return true;
}
