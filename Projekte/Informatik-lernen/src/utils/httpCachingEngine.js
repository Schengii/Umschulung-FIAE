// @ts-check
/**
 * @file httpCachingEngine.js
 * RFC 9111 HTTP Caching Engine (Browser- & Gateway-Cache, Freshness, ETag, 304 Not Modified)
 */

/**
 * @typedef {object} CacheDirective
 * @property {number} [maxAge] - Sekunden
 * @property {number} [sMaxAge] - Sekunden für Shared / CDN Caches
 * @property {boolean} [noCache] - Revalidierung vor Verwendung erzwingen
 * @property {boolean} [noStore] - Speicherung komplett untersagen
 * @property {boolean} [mustRevalidate] - Veraltete Antworten nicht ausliefern
 * @property {number} [staleWhileRevalidate] - Sekunden, in denen veraltete Daten geduldet werden, während im Hintergrund neu geladen wird
 */

/**
 * @typedef {object} CachedResource
 * @property {string} url
 * @property {string} etag - z.B. '"33a64df551425fcc3e397894a4c814473b9f9" oder W/"weak-tag"'
 * @property {number} cachedAt - Timestamp in ms
 * @property {CacheDirective} directives
 * @property {string} body
 */

/**
 * Bewertet eine Cache-Anfrage nach RFC 9111
 * @param {CachedResource | null} cachedResource
 * @param {number} currentTimeMs
 * @param {{ ifNoneMatch?: string }} [clientHeaders]
 * @returns {{
 *   status: number,
 *   statusText: string,
 *   source: 'memory-cache' | 'network' | '304-revalidated',
 *   freshness: 'fresh' | 'stale' | 'none',
 *   ageSeconds: number,
 *   ttlRemainingSeconds: number,
 *   headers: Record<string, string>,
 *   body: string
 * }}
 */
export function evaluateHttpCache(cachedResource, currentTimeMs, clientHeaders = {}) {
  // Kein Cache vorhanden -> Voller Network-Fetch
  if (!cachedResource || cachedResource.directives.noStore) {
    return {
      status: 200,
      statusText: 'OK',
      source: 'network',
      freshness: 'none',
      ageSeconds: 0,
      ttlRemainingSeconds: 0,
      headers: {
        'Cache-Control': 'no-store',
        'X-Cache': 'MISS'
      },
      body: cachedResource ? cachedResource.body : '{"message": "Fresh content from origin server"}'
    };
  }

  const ageSeconds = Math.max(0, Math.floor((currentTimeMs - cachedResource.cachedAt) / 1000));
  const maxAge = cachedResource.directives.maxAge ?? 60;
  const isFresh = ageSeconds < maxAge;

  // Wenn no-cache aktiv ist, muss IMMER revalidiert werden
  const requiresRevalidation = cachedResource.directives.noCache || !isFresh;

  if (requiresRevalidation) {
    // Conditional Request: If-None-Match Prüfung gegen Server-ETag
    if (clientHeaders.ifNoneMatch && clientHeaders.ifNoneMatch === cachedResource.etag) {
      return {
        status: 304,
        statusText: 'Not Modified',
        source: '304-revalidated',
        freshness: isFresh ? 'fresh' : 'stale',
        ageSeconds,
        ttlRemainingSeconds: 0,
        headers: {
          'ETag': cachedResource.etag,
          'X-Cache': 'REVALIDATED',
          'Age': String(ageSeconds)
        },
        body: '' // 304 hat keinen Body!
      };
    }

    // Wenn ETag nicht passt oder If-None-Match fehlt -> Neuer Request
    return {
      status: 200,
      statusText: 'OK',
      source: 'network',
      freshness: 'stale',
      ageSeconds: 0,
      ttlRemainingSeconds: maxAge,
      headers: {
        'ETag': cachedResource.etag,
        'Cache-Control': `max-age=${maxAge}`,
        'X-Cache': 'MISS-STALE'
      },
      body: cachedResource.body
    };
  }

  // Ressource ist FRESH im Cache -> Schneller Cache-Hit (0ms Latenz)
  return {
    status: 200,
    statusText: 'OK (from disk cache)',
    source: 'memory-cache',
    freshness: 'fresh',
    ageSeconds,
    ttlRemainingSeconds: Math.max(0, maxAge - ageSeconds),
    headers: {
      'ETag': cachedResource.etag,
      'Cache-Control': `max-age=${maxAge}`,
      'Age': String(ageSeconds),
      'X-Cache': 'HIT'
    },
    body: cachedResource.body
  };
}
