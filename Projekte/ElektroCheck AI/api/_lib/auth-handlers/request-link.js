import { guard, logError } from '../http.js';
import {
  allowLoginRequest,
  appBaseUrl,
  createLogin,
  isAuthConfigured,
  isEmailAllowed,
  LOGIN_TTL_SECONDS
} from '../auth.js';
import { isDurable } from '../kv.js';
import { MailError, sendMail } from '../mailer.js';
import { escapeHtml, isValidEmail } from '../security.js';

/**
 * Fordert einen Magic-Link an. Die Antwort ist immer { ok: true }, egal ob die Adresse freigegeben ist –
 * so lässt sich nicht herausfinden, wer Zugang hat.
 */
export default async function handler(req, res) {
  if (!(await guard(req, res, { public: true, rate: { max: 10, key: 'login' } }))) return;

  try {
    const { email } = req.body || {};
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' });
    }
    if (process.env.NODE_ENV === 'production' && !isAuthConfigured()) {
      return res.status(503).json({ error: 'Login ist nicht konfiguriert (AUTH_ALLOWED_EMAILS fehlt).' });
    }
    if (!isDurable()) {
      return res.status(503).json({ error: 'Login benötigt einen persistenten Speicher (UPSTASH_REDIS_REST_URL/TOKEN).' });
    }

    if (!isEmailAllowed(email) || !(await allowLoginRequest(email))) {
      return res.json({ ok: true });
    }

    const { token, code } = await createLogin(email);
    const link = `${appBaseUrl()}/?login_token=${encodeURIComponent(token)}`;
    const minutes = Math.round(LOGIN_TTL_SECONDS / 60);

    const result = await sendMail({
      to: email.trim(),
      subject: 'Dein Anmelde-Link für ElektroCheck AI',
      html: `
        <h2>Anmeldung bei ElektroCheck AI</h2>
        <p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 18px;background:#005fcc;color:#fff;border-radius:6px;text-decoration:none;">Jetzt anmelden</a></p>
        <p>Oder gib diesen Code in der App ein: <strong style="font-size:1.3em;letter-spacing:2px;">${code}</strong></p>
        <p style="color:#555;font-size:0.9em;">Link und Code sind ${minutes} Minuten gültig und nur einmal nutzbar. Wenn du die Anmeldung nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>
      `
    });

    // Nur lokal ohne Mailversand: Link/Code direkt zurückgeben, damit man sich ohne Postfach anmelden kann
    if (result.mode === 'simulated' && process.env.NODE_ENV !== 'production') {
      return res.json({ ok: true, devLink: link, devCode: code });
    }
    res.json({ ok: true });
  } catch (error) {
    logError(req, 'Fehler beim Anfordern des Login-Links', error);
    if (error instanceof MailError) {
      return res.status(error.status === 503 ? 503 : 502).json({ error: 'Der Anmelde-Link konnte nicht gesendet werden.' });
    }
    res.status(500).json({ error: 'Interner Serverfehler.' });
  }
}
