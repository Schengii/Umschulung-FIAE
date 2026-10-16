import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dailyQuota, GEMINI_QUOTA } from '../../api/_lib/quota.js';
import { kvResetMemory } from '../../api/_lib/kv.js';

function fakeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; }
  };
}

const reqFor = (email) => ({ user: email ? { email, role: 'member' } : undefined, headers: { 'x-forwarded-for': '10.0.0.1' } });

beforeEach(() => kvResetMemory());
afterEach(() => { delete process.env.GEMINI_DAILY_LIMIT; });

describe('Tageskontingent (dailyQuota)', () => {
  it('lässt Anfragen bis zum Limit zu und blockiert danach mit 429', async () => {
    const env = { GEMINI_DAILY_LIMIT: '2' };
    const req = reqFor('a@firma.de');

    for (let i = 0; i < 2; i++) {
      const res = fakeRes();
      expect(await dailyQuota(req, res, GEMINI_QUOTA, env)).toBe(true);
    }
    const blocked = fakeRes();
    expect(await dailyQuota(req, blocked, GEMINI_QUOTA, env)).toBe(false);
    expect(blocked.statusCode).toBe(429);
    expect(blocked.body.error).toMatch(/Tageskontingent/);
  });

  it('zählt je Nutzer getrennt', async () => {
    const env = { GEMINI_DAILY_LIMIT: '1' };
    expect(await dailyQuota(reqFor('a@firma.de'), fakeRes(), GEMINI_QUOTA, env)).toBe(true);
    expect(await dailyQuota(reqFor('b@firma.de'), fakeRes(), GEMINI_QUOTA, env)).toBe(true);
    expect(await dailyQuota(reqFor('a@firma.de'), fakeRes(), GEMINI_QUOTA, env)).toBe(false);
  });

  it('meldet verbleibendes Kontingent im Header', async () => {
    const res = fakeRes();
    await dailyQuota(reqFor('a@firma.de'), res, GEMINI_QUOTA, { GEMINI_DAILY_LIMIT: '5' });
    expect(res.headers['X-Quota-Limit']).toBe(5);
    expect(res.headers['X-Quota-Remaining']).toBe(4);
  });

  it('ist mit GEMINI_DAILY_LIMIT=0 abgeschaltet', async () => {
    const env = { GEMINI_DAILY_LIMIT: '0' };
    for (let i = 0; i < 5; i++) {
      expect(await dailyQuota(reqFor('a@firma.de'), fakeRes(), GEMINI_QUOTA, env)).toBe(true);
    }
  });

  it('nutzt bei ungültigem Wert den Standard', async () => {
    const res = fakeRes();
    await dailyQuota(reqFor('a@firma.de'), res, GEMINI_QUOTA, { GEMINI_DAILY_LIMIT: 'viel' });
    expect(res.headers['X-Quota-Limit']).toBe(GEMINI_QUOTA.defaultMax);
  });

  it('unterscheidet anonyme Nutzer nach IP', async () => {
    const env = { GEMINI_DAILY_LIMIT: '1' };
    const a = { headers: { 'x-forwarded-for': '1.1.1.1' } };
    const b = { headers: { 'x-forwarded-for': '2.2.2.2' } };
    expect(await dailyQuota(a, fakeRes(), GEMINI_QUOTA, env)).toBe(true);
    expect(await dailyQuota(b, fakeRes(), GEMINI_QUOTA, env)).toBe(true);
    expect(await dailyQuota(a, fakeRes(), GEMINI_QUOTA, env)).toBe(false);
  });
});
