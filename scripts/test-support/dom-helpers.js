/**
 * Helpers for the happy-dom unit tests: an in-memory stand-in for the globals that
 * components.js / constants.js provide on the real pages (AppStorage, STORAGE_KEYS, APP).
 * Lives in scripts/ so it is never copied into dist/ or the Service Worker precache list.
 */

/** @returns {{getItem: (key: string, fallback?: any) => any, setItem: (key: string, value: any) => void, removeItem: (key: string) => void, data: Map<string, string>}} */
function createMemoryStorage() {
    /** @type {Map<string, string>} */
    const data = new Map();
    return {
        data,
        getItem: (key, fallback = null) => (data.has(key) ? data.get(key) : fallback),
        setItem: (key, value) => {
            data.set(key, String(value));
        },
        removeItem: (key) => {
            data.delete(key);
        },
    };
}

/** Installs AppStorage, STORAGE_KEYS and APP as globals and returns the storage for assertions. */
function installPageGlobals(overrides = {}) {
    const storage = createMemoryStorage();
    Object.assign(globalThis, {
        AppStorage: storage,
        STORAGE_KEYS: {
            THEME: 'portfolio_theme',
            LANG: 'portfolio_lang',
            COOKIE_CONSENT: 'cookie_consent',
            SNAKE_HIGHSCORE: 'snake_highscore',
            MEMORY_BEST_MOVES: 'memory_best_moves',
            MEMORY_BEST_TIME: 'memory_best_time',
        },
        APP: { SCROLL_THRESHOLD: 300, DEFAULT_LANG: 'de', SEARCHABLE_PAGES: ['portfolio.html'] },
        ...overrides,
    });
    return storage;
}

/** Removes the globals installed by installPageGlobals. */
function removePageGlobals() {
    const scope = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (globalThis));
    for (const name of ['AppStorage', 'STORAGE_KEYS', 'APP']) delete scope[name];
}

/** Resets document content and the attributes the modules read from <html>. */
function resetDocument(bodyHtml = '') {
    document.body.innerHTML = bodyHtml;
    for (const name of ['data-theme', 'data-accent', 'lang']) document.documentElement.removeAttribute(name);
}

/**
 * Records the listeners a module adds to `document` so a test can remove them again. Tests that
 * re-import a module per case (vi.resetModules) would otherwise pile up the listeners of every
 * earlier instance, and all of them would react to the next event.
 * @returns {() => void} removes the recorded listeners and restores document.addEventListener
 */
function trackDocumentListeners() {
    const original = document.addEventListener.bind(document);
    /** @type {Array<[string, any, any]>} */
    const added = [];
    document.addEventListener = (
        /** @type {string} */ type,
        /** @type {any} */ listener,
        /** @type {any} */ options
    ) => {
        added.push([type, listener, options]);
        original(type, listener, options);
    };
    return () => {
        document.addEventListener = original;
        for (const [type, listener, options] of added) document.removeEventListener(type, listener, options);
    };
}

module.exports = { createMemoryStorage, installPageGlobals, removePageGlobals, resetDocument, trackDocumentListeners };
