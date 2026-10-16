import { timingSafeEqual, createHash } from 'node:crypto';
import { getSessionUser, isAuthConfigured } from './auth.js';

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;

export const MAX_EMAIL_PDF_BASE64_LENGTH = 4_000_000; // Vercel-Body-Limit 4,5 MB

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value);
}

const sha256 = (value) => createHash('sha256').update(value).digest();

const bearerToken = (headers) => {
  const header = headers?.authorization || headers?.Authorization || '';
  return /^Bearer (.+)$/.exec(header)?.[1] ?? null;
};

/**
 * Prüft die Anmeldung einer Anfrage (Authorization: Bearer …):
 *  1. APP_ACCESS_TOKEN (Dienst-/Legacy-Token) → Rolle "service"
 *  2. Session-Token aus dem Magic-Link-Login → Nutzer mit Rolle member/admin
 * Ohne gültige Anmeldung ist der Zugriff nur erlaubt, wenn nichts davon konfiguriert ist und
 * NODE_ENV nicht "production" ist (lokale Entwicklung); in Production fail closed (503).
 * Rückgabe: { user } (user = null bei anonymem Zugriff) oder { error: { status, error } }.
 */
export async function authenticate(headers, env = process.env) {
  const token = bearerToken(headers);

  if (token && env.APP_ACCESS_TOKEN && timingSafeEqual(sha256(token), sha256(env.APP_ACCESS_TOKEN))) {
    return { user: { email: 'service', role: 'service' } };
  }
  if (token) {
    const user = await getSessionUser(token, env);
    if (user) return { user };
  }

  const configured = Boolean(env.APP_ACCESS_TOKEN) || isAuthConfigured(env);
  if (!configured && env.NODE_ENV !== 'production') return { user: null };
  if (!configured) {
    return { error: { status: 503, error: 'Server nicht konfiguriert: AUTH_ALLOWED_EMAILS oder APP_ACCESS_TOKEN fehlt.' } };
  }
  return { error: { status: 401, error: 'Nicht autorisiert.' } };
}

/** Sieht der Nutzer alle Tickets? (Admins, Dienst-Token und anonyme lokale Entwicklung) */
export const canSeeAll = (user) => !user || user.role === 'admin' || user.role === 'service';
