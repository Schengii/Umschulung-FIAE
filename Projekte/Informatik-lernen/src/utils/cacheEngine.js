// @ts-check
/**
 * Generischer Caching-Layer für teure Berechnungen, Simulationsergebnisse und Fetches.
 * Drei Ebenen, je nach Bedarf des Aufrufers:
 *  - In-Memory (synchron, flüchtig, sehr schnell) – Standardfall.
 *  - LocalStorage-persistent (überlebt Reloads, nur für kleine, synchron benötigte Werte).
 *  - IndexedDB-persistent (überlebt Reloads, geeignet für größere/teurere Ergebnisse).
 * Alle Ebenen unterstützen TTL-basiertes Ablaufen und Namespace-Isolation, damit
 * unterschiedliche Labs/Engines denselben Cache nutzen können, ohne Schlüssel-Kollisionen.
 */
import { getItem, saveItem, deleteItem } from './indexedDbStorage';

/**
 * @typedef {object} CacheOptions
 * @property {number} [ttl] - Time-to-live in Millisekunden. `Infinity` = läuft nie ab. Default: 5 Minuten.
 * @property {string} [namespace] - Optionaler Präfix zur Isolation verschiedener Cache-Nutzer.
 *
 * @typedef {object} CacheEntry
 * @property {unknown} value
 * @property {number} expiresAt - Unix-Timestamp (ms), `Infinity` falls kein TTL gesetzt ist.
 * @property {number} createdAt
 *
 * @typedef {object} CacheStats
 * @property {number} hits
 * @property {number} misses
 * @property {number} sets
 * @property {number} evictions
 * @property {number} size
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 Minuten
const IDB_CACHE_PREFIX = 'cache_entry_';
const LS_CACHE_PREFIX = 'idg_cache_';

/** @type {Map<string, CacheEntry>} */
const memoryStore = new Map();

const stats = { hits: 0, misses: 0, sets: 0, evictions: 0 };

function now() {
  return Date.now();
}

/**
 * @param {string | undefined} namespace
 * @param {string} key
 * @returns {string}
 */
function buildKey(namespace, key) {
  return namespace ? `${namespace}:${key}` : key;
}

/**
 * @param {number} [ttl]
 * @returns {number}
 */
function resolveExpiresAt(ttl) {
  const effectiveTtl = ttl ?? DEFAULT_TTL_MS;
  return effectiveTtl === Infinity ? Infinity : now() + effectiveTtl;
}

/**
 * @param {CacheEntry | undefined} entry
 * @returns {boolean}
 */
function isExpired(entry) {
  if (!entry) return true;
  return Number.isFinite(entry.expiresAt) && entry.expiresAt <= now();
}

/**
 * Legt einen Wert im In-Memory-Cache ab.
 * @template T
 * @param {string} key
 * @param {T} value
 * @param {CacheOptions} [options]
 * @returns {T}
 */
export function setCache(key, value, options = {}) {
  const fullKey = buildKey(options.namespace, key);
  memoryStore.set(fullKey, {
    value,
    createdAt: now(),
    expiresAt: resolveExpiresAt(options.ttl)
  });
  stats.sets += 1;
  return value;
}

/**
 * Liest einen Wert aus dem In-Memory-Cache. Liefert `undefined` bei Miss oder Ablauf.
 * @param {string} key
 * @param {Pick<CacheOptions, 'namespace'>} [options]
 * @returns {unknown}
 */
export function getCache(key, options = {}) {
  const fullKey = buildKey(options.namespace, key);
  const entry = memoryStore.get(fullKey);
  if (isExpired(entry)) {
    if (entry) {
      memoryStore.delete(fullKey);
      stats.evictions += 1;
    }
    stats.misses += 1;
    return undefined;
  }
  stats.hits += 1;
  return /** @type {CacheEntry} */ (entry).value;
}

/**
 * @param {string} key
 * @param {Pick<CacheOptions, 'namespace'>} [options]
 * @returns {boolean}
 */
export function hasCache(key, options = {}) {
  return getCache(key, options) !== undefined;
}

/**
 * @param {string} key
 * @param {Pick<CacheOptions, 'namespace'>} [options]
 * @returns {boolean}
 */
export function deleteCache(key, options = {}) {
  return memoryStore.delete(buildKey(options.namespace, key));
}

/**
 * Leert den gesamten In-Memory-Cache oder nur einen bestimmten Namespace.
 * @param {string} [namespace]
 */
export function clearCache(namespace) {
  if (!namespace) {
    memoryStore.clear();
    return;
  }
  const prefix = `${namespace}:`;
  for (const k of memoryStore.keys()) {
    if (k.startsWith(prefix)) memoryStore.delete(k);
  }
}

/**
 * @returns {CacheStats}
 */
export function getCacheStats() {
  return { ...stats, size: memoryStore.size };
}

/**
 * Entfernt abgelaufene In-Memory-Einträge, z. B. periodisch via `setInterval`.
 * @returns {number} Anzahl der entfernten Einträge
 */
export function pruneExpiredCache() {
  let pruned = 0;
  for (const [k, entry] of memoryStore.entries()) {
    if (isExpired(entry)) {
      memoryStore.delete(k);
      pruned += 1;
    }
  }
  stats.evictions += pruned;
  return pruned;
}

/**
 * Liest einen Wert aus dem Cache oder berechnet ihn per Factory (sync oder async)
 * und speichert das Ergebnis anschließend im In-Memory-Cache.
 * @template T
 * @param {string} key
 * @param {() => T | Promise<T>} factory
 * @param {CacheOptions} [options]
 * @returns {Promise<T>}
 */
export async function getOrSetCache(key, factory, options = {}) {
  const cached = getCache(key, options);
  if (cached !== undefined) return /** @type {T} */ (cached);
  const value = await factory();
  setCache(key, value, options);
  return value;
}

// --- Persistenter Cache (LocalStorage) für kleine, synchron benötigte Daten ---

/**
 * Persistiert einen Wert zusätzlich zum In-Memory-Cache in LocalStorage (überlebt Reloads).
 * @template T
 * @param {string} key
 * @param {T} value
 * @param {CacheOptions} [options]
 * @returns {T}
 */
export function setPersistentCache(key, value, options = {}) {
  setCache(key, value, options);
  if (typeof window === 'undefined' || !window.localStorage) return value;
  try {
    const storageKey = LS_CACHE_PREFIX + buildKey(options.namespace, key);
    window.localStorage.setItem(storageKey, JSON.stringify({
      value,
      expiresAt: resolveExpiresAt(options.ttl)
    }));
  } catch (err) {
    console.warn('[CacheEngine] LocalStorage-Persistenz fehlgeschlagen:', err);
  }
  return value;
}

/**
 * Liest einen persistenten Cache-Eintrag; hydriert bei Treffer den In-Memory-Cache.
 * @param {string} key
 * @param {Pick<CacheOptions, 'namespace'>} [options]
 * @returns {unknown}
 */
export function getPersistentCache(key, options = {}) {
  const memoryHit = getCache(key, options);
  if (memoryHit !== undefined) return memoryHit;

  if (typeof window === 'undefined' || !window.localStorage) return undefined;
  try {
    const storageKey = LS_CACHE_PREFIX + buildKey(options.namespace, key);
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw);
    if (Number.isFinite(parsed.expiresAt) && parsed.expiresAt <= now()) {
      window.localStorage.removeItem(storageKey);
      return undefined;
    }

    memoryStore.set(buildKey(options.namespace, key), {
      value: parsed.value,
      createdAt: now(),
      expiresAt: parsed.expiresAt
    });
    return parsed.value;
  } catch (err) {
    console.warn('[CacheEngine] LocalStorage-Lesefehler:', err);
    return undefined;
  }
}

/**
 * @param {string} key
 * @param {Pick<CacheOptions, 'namespace'>} [options]
 */
export function deletePersistentCache(key, options = {}) {
  deleteCache(key, options);
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(LS_CACHE_PREFIX + buildKey(options.namespace, key));
  } catch (err) {
    console.warn('[CacheEngine] LocalStorage-Löschfehler:', err);
  }
}

// --- Persistenter Cache (IndexedDB) für größere/teurere Ergebnisse ---

/**
 * Liest einen Wert aus dem Cache (Memory → IndexedDB) oder berechnet ihn per Factory
 * und persistiert das Ergebnis dauerhaft in IndexedDB. Geeignet für größere Datenmengen,
 * z. B. Simulationsergebnisse oder Report-Daten, die einen Reload überleben sollen.
 * @template T
 * @param {string} key
 * @param {() => T | Promise<T>} factory
 * @param {CacheOptions} [options]
 * @returns {Promise<T>}
 */
export async function getOrSetIndexedDbCache(key, factory, options = {}) {
  const memoryHit = getCache(key, options);
  if (memoryHit !== undefined) return /** @type {T} */ (memoryHit);

  const idbKey = IDB_CACHE_PREFIX + buildKey(options.namespace, key);
  try {
    const record = await getItem('keyvalue', idbKey);
    if (record && (!Number.isFinite(record.expiresAt) || record.expiresAt > now())) {
      setCache(key, record.value, options);
      return /** @type {T} */ (record.value);
    }
  } catch (err) {
    console.warn('[CacheEngine] IndexedDB-Lesefehler:', err);
  }

  const value = await factory();
  setCache(key, value, options);

  try {
    await saveItem('keyvalue', {
      key: idbKey,
      value,
      createdAt: now(),
      expiresAt: resolveExpiresAt(options.ttl)
    });
  } catch (err) {
    console.warn('[CacheEngine] IndexedDB-Schreibfehler:', err);
  }

  return value;
}

/**
 * Entfernt einen Eintrag aus dem In-Memory-Cache und der IndexedDB-Persistenz.
 * @param {string} key
 * @param {Pick<CacheOptions, 'namespace'>} [options]
 */
export async function invalidateIndexedDbCache(key, options = {}) {
  deleteCache(key, options);
  const idbKey = IDB_CACHE_PREFIX + buildKey(options.namespace, key);
  try {
    await deleteItem('keyvalue', idbKey);
  } catch (err) {
    console.warn('[CacheEngine] IndexedDB-Löschfehler:', err);
  }
}
