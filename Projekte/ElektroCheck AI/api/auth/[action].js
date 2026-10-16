import requestLink from '../_lib/auth-handlers/request-link.js';
import verify from '../_lib/auth-handlers/verify.js';
import me from '../_lib/auth-handlers/me.js';
import logout from '../_lib/auth-handlers/logout.js';

/**
 * Eine Vercel-Function für alle Auth-Endpunkte (/api/auth/request-link, verify, me, logout):
 * Der Hobby-Plan erlaubt höchstens 12 Functions pro Deployment. Die Logik liegt in api/_lib/auth-handlers/.
 */
const HANDLERS = { 'request-link': requestLink, verify, me, logout };

export default async function handler(req, res) {
  const action = String(req.query?.action || '');
  const run = Object.hasOwn(HANDLERS, action) ? HANDLERS[action] : null;
  if (!run) return res.status(404).json({ error: 'Nicht gefunden.' });
  return run(req, res);
}
