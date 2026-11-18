/**
 * Entscheidungslogik des Service Workers als reine Funktionen (Plan 5.1 bis 5.3).
 *
 * Wird von sw.js per importScripts() als klassisches Script geladen (daher weder import noch
 * export) und in den Unit-Tests über module.exports. Alles hier ist frei von Cache-, Fetch- und
 * Event-Zugriffen, damit es ohne Worker-Umgebung testbar bleibt.
 */
(function (root) {
    /** Höchstzahl der Einträge im Laufzeit-Cache (alles, was nicht zum Precache gehört). */
    const RUNTIME_CACHE_LIMIT = 120;

    /** So lange wartet eine Seitenanfrage auf das Netz, bevor die Kopie aus dem Cache gewinnt. */
    const NETWORK_TIMEOUT_MS = 3000;

    /**
     * Die Demo-Projekte unter /Projekte/ sind zusammen rund 80 MB groß und kommen aus eigenen
     * Repos: Sie laufen am Service Worker vorbei, damit sie den Speicher des Besuchers nicht füllen.
     * @param {string} pathname
     */
    function isDemoPath(pathname) {
        return /(^|\/)Projekte\//.test(pathname);
    }

    /**
     * @typedef {object} RequestInfo
     * @property {string} method
     * @property {string} url
     * @property {string} origin Origin des Service Workers
     * @property {string} [accept] Wert des Accept-Headers
     * @property {boolean} [hasRange] Anfrage mit Range-Header
     * @property {string} [destination] Request.destination
     */

    /**
     * Welche Strategie gilt für eine Anfrage?
     *  - bypass: der Service Worker greift nicht ein
     *  - network-first: Seiten (frisch, mit Cache-Kopie als Rückfall)
     *  - stale-while-revalidate: statische Dateien
     * @param {RequestInfo} req
     * @returns {'bypass' | 'network-first' | 'stale-while-revalidate'}
     */
    function chooseStrategy(req) {
        // The Cache API only stores GET responses.
        if (req.method !== 'GET') return 'bypass';
        if (!req.url.startsWith(req.origin)) return 'bypass';

        const { pathname } = new URL(req.url);
        // Vercel-internal routes (Insights/Analytics) and the large demo builds.
        if (pathname.startsWith('/_vercel/') || isDemoPath(pathname)) return 'bypass';

        // Media is fetched with Range requests: a 206 cannot be cached and a full cached copy is
        // no valid answer to a Range request (Firefox aborts playback).
        if (req.hasRange || req.destination === 'video' || req.destination === 'audio') return 'bypass';

        if ((req.accept || '').includes('text/html') || pathname.endsWith('.html') || pathname === '/') {
            return 'network-first';
        }
        return 'stale-while-revalidate';
    }

    /**
     * Wie viele der ältesten Einträge müssen raus, damit der Cache `limit` nicht überschreitet?
     * @param {number} entryCount
     * @param {number} [limit]
     */
    function evictionCount(entryCount, limit = RUNTIME_CACHE_LIMIT) {
        return Math.max(0, entryCount - limit);
    }

    /**
     * Name des Laufzeit-Caches zu einem Precache-Namen.
     * @param {string} cacheName
     */
    function runtimeCacheName(cacheName) {
        return `${cacheName}-runtime`;
    }

    /**
     * Welche Caches soll `activate` behalten? Der aktuelle Precache und sein Laufzeit-Cache.
     * @param {string} key
     * @param {string} cacheName
     */
    function isCurrentCache(key, cacheName) {
        return key === cacheName || key === runtimeCacheName(cacheName);
    }

    /**
     * Wartet auf `promise`, höchstens `ms` Millisekunden; danach `fallback` (die Anfrage selbst
     * läuft weiter, der Aufrufer kann sie z. B. für die Cache-Aktualisierung weiter nutzen).
     * @template T, F
     * @param {Promise<T>} promise
     * @param {number} ms
     * @param {F} fallback
     * @returns {Promise<T | F>}
     */
    function withTimeout(promise, ms, fallback) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => resolve(fallback), ms);
            promise.then(
                (value) => {
                    clearTimeout(timer);
                    resolve(value);
                },
                (error) => {
                    clearTimeout(timer);
                    reject(error);
                }
            );
        });
    }

    const api = {
        RUNTIME_CACHE_LIMIT,
        NETWORK_TIMEOUT_MS,
        isDemoPath,
        chooseStrategy,
        evictionCount,
        runtimeCacheName,
        isCurrentCache,
        withTimeout,
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    /** @type {any} */ (root).SwStrategy = api;
})(typeof self !== 'undefined' ? self : globalThis);
