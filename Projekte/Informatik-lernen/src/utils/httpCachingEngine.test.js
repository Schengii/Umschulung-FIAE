import { describe, it, expect } from 'vitest';
import { evaluateHttpCache } from './httpCachingEngine';

describe('httpCachingEngine', () => {
  const baseResource = {
    url: 'https://api.ihk-lernen.de/v1/profile',
    etag: '"v1-hash-abc"',
    cachedAt: 1000000,
    directives: { maxAge: 120 },
    body: '{"id": 42, "role": "FIAE"}'
  };

  it('returns memory-cache hit when resource is fresh', () => {
    // 30 Sekunden vergangen, maxAge 120 -> Fresh
    const res = evaluateHttpCache(baseResource, 1030000);
    expect(res.source).toBe('memory-cache');
    expect(res.freshness).toBe('fresh');
    expect(res.status).toBe(200);
    expect(res.headers['X-Cache']).toBe('HIT');
    expect(res.ttlRemainingSeconds).toBe(90);
  });

  it('returns 304 Not Modified when resource is stale but ETag matches If-None-Match', () => {
    // 200 Sekunden vergangen, maxAge 120 -> Stale
    const res = evaluateHttpCache(baseResource, 1200000, { ifNoneMatch: '"v1-hash-abc"' });
    expect(res.status).toBe(304);
    expect(res.statusText).toBe('Not Modified');
    expect(res.source).toBe('304-revalidated');
    expect(res.body).toBe('');
  });

  it('bypasses cache when no-store directive is set', () => {
    const noStoreResource = {
      ...baseResource,
      directives: { noStore: true }
    };
    const res = evaluateHttpCache(noStoreResource, 1005000);
    expect(res.source).toBe('network');
    expect(res.headers['X-Cache']).toBe('MISS');
  });
});
