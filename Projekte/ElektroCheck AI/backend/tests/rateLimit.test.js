import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rateLimit } from '../../api/_lib/rate-limit.js';

const mockRes = () => {
  const res = { headers: {}, statusCode: 200, body: null };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};
const mockReq = (ip) => ({ headers: { 'x-forwarded-for': ip }, socket: {} });

describe('rateLimit ohne Redis (In-Memory)', () => {
  it('lässt Requests bis max durch und blockiert danach mit 429', async () => {
    const ip = `mem-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(await rateLimit(mockReq(ip), mockRes(), { max: 3, key: 'mem' })).toBe(true);
    }
    const res = mockRes();
    expect(await rateLimit(mockReq(ip), res, { max: 3, key: 'mem' })).toBe(false);
    expect(res.statusCode).toBe(429);
    expect(res.body.retryAfter).toBeGreaterThan(0);
  });
});

describe('rateLimit mit Redis (instanzübergreifender Zähler)', () => {
  const calls = [];
  beforeEach(() => {
    vi.resetModules();
    calls.length = 0;
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.test';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
  });
  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.doUnmock('../../api/_lib/kv.js');
  });

  async function loadWithCounter(incr) {
    vi.doMock('../../api/_lib/kv.js', () => ({
      isRedisConfigured: () => true,
      kvIncr: async (key, ttl) => { calls.push({ key, ttl }); return incr(); },
    }));
    return (await import('../../api/_lib/rate-limit.js')).rateLimit;
  }

  it('zählt über kvIncr, auch wenn eine andere Instanz schon gezählt hat', async () => {
    const limit = await loadWithCounter(() => 6); // andere Instanzen haben bereits 5 Requests gezählt
    const res = mockRes();
    expect(await limit(mockReq('1.2.3.4'), res, { max: 5, key: 'email' })).toBe(false);
    expect(res.statusCode).toBe(429);
    expect(calls[0].key).toContain('email');
    expect(calls[0].key).toContain('1.2.3.4');
    expect(calls[0].ttl).toBeGreaterThan(0);
  });

  it('lässt Requests unter dem Limit durch und setzt die RateLimit-Header', async () => {
    const limit = await loadWithCounter(() => 2);
    const res = mockRes();
    expect(await limit(mockReq('1.2.3.4'), res, { max: 5, key: 'x' })).toBe(true);
    expect(res.headers['X-RateLimit-Remaining']).toBe(3);
  });

  it('fällt bei Redis-Ausfall auf den In-Memory-Zähler zurück (fail open nur lokal begrenzt)', async () => {
    const limit = await loadWithCounter(() => { throw new Error('redis down'); });
    expect(await limit(mockReq('9.9.9.9'), mockRes(), { max: 1, key: 'down' })).toBe(true);
    const res = mockRes();
    expect(await limit(mockReq('9.9.9.9'), res, { max: 1, key: 'down' })).toBe(false);
    expect(res.statusCode).toBe(429);
  });
});
