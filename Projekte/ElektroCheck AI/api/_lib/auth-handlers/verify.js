import { guard, logError } from '../http.js';
import { consumeLoginCode, consumeLoginToken, createSession, isEmailAllowed } from '../auth.js';
import { isValidEmail } from '../security.js';

/** Löst Magic-Link-Token oder E-Mail+Code ein und liefert ein Session-Token (30 Tage). */
export default async function handler(req, res) {
  if (!(await guard(req, res, { public: true, rate: { max: 20, key: 'verify' } }))) return;

  try {
    const { token, email, code } = req.body || {};

    let verifiedEmail = null;
    if (typeof token === 'string' && token) {
      verifiedEmail = await consumeLoginToken(token);
    } else if (isValidEmail(email) && typeof code === 'string') {
      verifiedEmail = await consumeLoginCode(email, code);
    } else {
      return res.status(400).json({ error: 'Token oder E-Mail und Code erforderlich.' });
    }

    if (!verifiedEmail || !isEmailAllowed(verifiedEmail)) {
      return res.status(401).json({ error: 'Link oder Code ist ungültig oder abgelaufen.' });
    }

    const { sessionToken, user } = await createSession(verifiedEmail);
    res.json({ sessionToken, user });
  } catch (error) {
    logError(req, 'Fehler bei der Login-Bestätigung', error);
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
}
