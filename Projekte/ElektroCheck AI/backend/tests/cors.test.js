import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { isOriginAllowed } from '../../api/_lib/cors.js';
import ticketsCollection from '../../api/tickets/index.js';

const ENV_KEYS = ['FRONTEND_URL', 'APP_URL', 'AUTH_ALLOWED_EMAILS'];
let saved;

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  process.env.FRONTEND_URL = 'https://elektro-check-ai.vercel.app, https://elektro-*.vercel.app';
  delete process.env.APP_URL;
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('isOriginAllowed', () => {
  it('erlaubt konfigurierte Origins, Platzhalter und Capacitor-Apps', () => {
    expect(isOriginAllowed('https://elektro-check-ai.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://elektro-pr-12.vercel.app')).toBe(true);
    expect(isOriginAllowed('https://localhost')).toBe(true); // Android
    expect(isOriginAllowed('capacitor://localhost')).toBe(true); // iOS
  });

  it('lehnt fremde Origins ab; der Platzhalter ist an Anfang und Ende verankert', () => {
    expect(isOriginAllowed('https://evil.example')).toBe(false);
    expect(isOriginAllowed('https://elektro-x.vercel.app.evil.example')).toBe(false);
    expect(isOriginAllowed('https://evil-elektro-x.vercel.app')).toBe(false);
    expect(isOriginAllowed(undefined)).toBe(false);
  });

  it('nutzt ohne Konfiguration den lokalen Dev-Server als Standard', () => {
    expect(isOriginAllowed('http://localhost:5173', {})).toBe(true);
    expect(isOriginAllowed('http://localhost:9999', {})).toBe(false);
  });

  it('nimmt APP_URL (auch mit Slash am Ende) mit auf', () => {
    expect(isOriginAllowed('https://app.firma.de', { APP_URL: 'https://app.firma.de/' })).toBe(true);
  });
});

describe('Preflight (OPTIONS)', () => {
  it('beantwortet Preflight erlaubter Origins ohne Anmeldung, auch wenn Login Pflicht ist', async () => {
    process.env.AUTH_ALLOWED_EMAILS = '@firma.de';
    const res = await request(app)
      .options('/api/tickets')
      .set('Origin', 'https://localhost')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://localhost');
    expect(res.headers['access-control-allow-headers']).toContain('Authorization');
    expect(res.headers['access-control-allow-methods']).toContain('PUT');
    expect(res.headers.vary).toContain('Origin');
  });

  it('weist Preflight fremder Origins mit 403 ab', async () => {
    const res = await request(app).options('/api/tickets').set('Origin', 'https://evil.example');
    expect(res.status).toBe(403);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('CORS-Header auf echten Antworten', () => {
  it('setzt Access-Control-Allow-Origin für erlaubte Origins – auch bei 401', async () => {
    process.env.AUTH_ALLOWED_EMAILS = '@firma.de';
    const res = await request(app).get('/api/tickets').set('Origin', 'https://elektro-check-ai.vercel.app');
    expect(res.status).toBe(401);
    expect(res.headers['access-control-allow-origin']).toBe('https://elektro-check-ai.vercel.app');
  });

  it('setzt keine CORS-Header für fremde Origins und ohne Origin', async () => {
    const foreign = await request(app).get('/api/tickets').set('Origin', 'https://evil.example');
    expect(foreign.headers['access-control-allow-origin']).toBeUndefined();
    const none = await request(app).get('/api/tickets');
    expect(none.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('Vercel-Handler ohne Express', () => {
  it('beantwortet OPTIONS selbst (204) und lässt Fremde nicht durch', async () => {
    const run = (origin) =>
      new Promise((resolve) => {
        const res = {
          headers: {},
          statusCode: 200,
          setHeader(k, v) { this.headers[k] = v; },
          status(c) { this.statusCode = c; return this; },
          json() { resolve(this); },
          end() { resolve(this); }
        };
        ticketsCollection({ method: 'OPTIONS', headers: { origin }, skipHandlerRateLimit: true }, res);
      });

    const ok = await run('https://localhost');
    expect(ok.statusCode).toBe(204);
    expect(ok.headers['Access-Control-Allow-Origin']).toBe('https://localhost');
    expect((await run('https://evil.example')).statusCode).toBe(403);
  });
});
