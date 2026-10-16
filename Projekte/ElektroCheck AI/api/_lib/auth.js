import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { kvDel, kvGet, kvGetDel, kvIncr, kvSet } from './kv.js';

export const LOGIN_TTL_SECONDS = 15 * 60;
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const MAX_CODE_ATTEMPTS = 5;
export const MAX_LOGIN_REQUESTS_PER_WINDOW = 3;

const sha256Hex = (value) => createHash('sha256').update(value).digest('hex');
const normalizeEmail = (email) => String(email).trim().toLowerCase();

function list(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

/** Ist AUTH_ALLOWED_EMAILS gesetzt, ist der Login-Zwang aktiv. */
export function isAuthConfigured(env = process.env) {
  return list(env.AUTH_ALLOWED_EMAILS).length > 0;
}

/** Erlaubt: exakte Adresse ("a@firma.de") oder ganze Domain ("@firma.de"). Ohne Liste nur außerhalb von Production. */
export function isEmailAllowed(email, env = process.env) {
  const allowed = list(env.AUTH_ALLOWED_EMAILS);
  if (allowed.length === 0) return env.NODE_ENV !== 'production';
  const normalized = normalizeEmail(email);
  const domain = normalized.slice(normalized.indexOf('@'));
  return allowed.some((entry) => entry === normalized || (entry.startsWith('@') && entry === domain));
}

export function roleFor(email, env = process.env) {
  return list(env.AUTH_ADMIN_EMAILS).includes(normalizeEmail(email)) ? 'admin' : 'member';
}

/** Basis-URL für Login-Links; bewusst NICHT aus Request-Headern abgeleitet (Host-Header-Injection). */
export function appBaseUrl(env = process.env) {
  const explicit = String(env.APP_URL || '').trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  const firstOrigin = list(env.FRONTEND_URL).find((origin) => !origin.includes('*'));
  return (firstOrigin || 'http://localhost:5173').replace(/\/+$/, '');
}

/** Legt Magic-Link-Token und 6-stelligen Code an (nur Hashes werden gespeichert). */
export async function createLogin(email) {
  const normalized = normalizeEmail(email);
  const token = randomBytes(32).toString('base64url');
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await kvSet(`login:${sha256Hex(token)}`, { email: normalized }, LOGIN_TTL_SECONDS);
  await kvSet(`code:${normalized}`, { hash: sha256Hex(`${code}:${normalized}`) }, LOGIN_TTL_SECONDS);
  return { token, code };
}

/** Begrenzt Login-Anfragen pro Adresse. Rückgabe false = Limit erreicht. */
export async function allowLoginRequest(email) {
  const count = await kvIncr(`rl:login:${normalizeEmail(email)}`, LOGIN_TTL_SECONDS);
  return count <= MAX_LOGIN_REQUESTS_PER_WINDOW;
}

/** Löst einen Magic-Link-Token ein (einmalig). Rückgabe: E-Mail oder null. */
export async function consumeLoginToken(token) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 200) return null;
  const entry = await kvGetDel(`login:${sha256Hex(token)}`);
  return entry?.email ?? null;
}

/**
 * Prüft den Code aus der E-Mail (einmalig). Fehlversuche werden atomar je Adresse und Zeitfenster gezählt
 * (kvIncr, max. MAX_CODE_ATTEMPTS); ein neuer Code setzt den Zähler nicht zurück. Rückgabe: E-Mail oder null.
 */
export async function consumeLoginCode(email, code) {
  const normalized = normalizeEmail(email);
  const key = `code:${normalized}`;
  const attemptsKey = `codeattempts:${normalized}`;
  const entry = await kvGet(key);
  if (!entry || typeof code !== 'string' || !/^\d{6}$/.test(code)) return null;

  // Zählen vor dem Vergleich: parallele Anfragen bekommen jeweils eigene Zählerstände
  if ((await kvIncr(attemptsKey, LOGIN_TTL_SECONDS)) > MAX_CODE_ATTEMPTS) {
    await kvDel(key);
    return null;
  }

  const expected = Buffer.from(entry.hash);
  const actual = Buffer.from(sha256Hex(`${code}:${normalized}`));
  if (expected.length === actual.length && timingSafeEqual(expected, actual)) {
    await kvDel(key);
    await kvDel(attemptsKey);
    return normalized;
  }
  return null;
}

export async function createSession(email, env = process.env) {
  const normalized = normalizeEmail(email);
  const user = { email: normalized, role: roleFor(normalized, env) };
  const existing = await kvGet(`user:${normalized}`);
  await kvSet(`user:${normalized}`, { email: normalized, createdAt: existing?.createdAt ?? new Date().toISOString() }, 365 * 24 * 60 * 60);

  const sessionToken = randomBytes(32).toString('base64url');
  await kvSet(`session:${sha256Hex(sessionToken)}`, { email: normalized }, SESSION_TTL_SECONDS);
  return { sessionToken, user };
}

/** Liefert den angemeldeten Nutzer zu einem Session-Token (Rolle wird live aus der Admin-Liste bestimmt). */
export async function getSessionUser(token, env = process.env) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 200) return null;
  const session = await kvGet(`session:${sha256Hex(token)}`);
  if (!session?.email) return null;
  if (!isEmailAllowed(session.email, env)) return null; // aus der Freigabeliste entfernt → Session wertlos
  return { email: session.email, role: roleFor(session.email, env) };
}

export async function destroySession(token) {
  if (typeof token === 'string' && token) await kvDel(`session:${sha256Hex(token)}`);
}
