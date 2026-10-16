import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { authenticate, escapeHtml, isValidEmail } from '../../api/_lib/security.js';
import app from '../index.js';

describe('authenticate', () => {
  it('erlaubt anonymen Zugriff außerhalb von Production, solange nichts konfiguriert ist', async () => {
    expect(await authenticate({}, { NODE_ENV: 'test' })).toEqual({ user: null });
  });

  it('blockiert in Production ohne Konfiguration (fail closed)', async () => {
    expect((await authenticate({}, { NODE_ENV: 'production' })).error.status).toBe(503);
  });

  it('verlangt den richtigen Dienst-Token, sobald APP_ACCESS_TOKEN gesetzt ist', async () => {
    const env = { APP_ACCESS_TOKEN: 'geheim', NODE_ENV: 'production' };
    expect((await authenticate({}, env)).error.status).toBe(401);
    expect((await authenticate({ authorization: 'Bearer falsch' }, env)).error.status).toBe(401);
    expect((await authenticate({ authorization: 'geheim' }, env)).error.status).toBe(401);
    expect((await authenticate({ authorization: 'Bearer geheim' }, env)).user).toEqual({ email: 'service', role: 'service' });
  });

  it('verlangt eine Anmeldung, sobald AUTH_ALLOWED_EMAILS gesetzt ist', async () => {
    expect((await authenticate({}, { AUTH_ALLOWED_EMAILS: '@firma.de', NODE_ENV: 'test' })).error.status).toBe(401);
  });
});

describe('escapeHtml / isValidEmail', () => {
  it('escaped HTML-Sonderzeichen', () => {
    expect(escapeHtml('<a href="x">&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
    expect(escapeHtml(undefined)).toBe('');
  });

  it('validiert E-Mail-Adressen', () => {
    expect(isValidEmail('kunde@beispiel.de')).toBe(true);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('a@b.de, evil@x.de')).toBe(false);
    expect(isValidEmail('<x>@b.de')).toBe(false);
    expect(isValidEmail(42)).toBe(false);
  });
});

describe('API-Zugriffsschutz (APP_ACCESS_TOKEN gesetzt)', () => {
  it('liefert 401 ohne und 200 mit Token', async () => {
    process.env.APP_ACCESS_TOKEN = 'testtoken';
    try {
      const denied = await request(app).get('/api/tickets');
      expect(denied.status).toBe(401);
      const ok = await request(app).get('/api/tickets').set('Authorization', 'Bearer testtoken');
      expect(ok.status).toBe(200);
    } finally {
      delete process.env.APP_ACCESS_TOKEN;
    }
  });

  it('lehnt mehrere Empfänger in der E-Mail-Route ab', async () => {
    const res = await request(app)
      .post('/api/reports/send-email')
      .send({ recipientEmail: 'a@b.de, evil@x.de' });
    expect(res.status).toBe(400);
  });
});
