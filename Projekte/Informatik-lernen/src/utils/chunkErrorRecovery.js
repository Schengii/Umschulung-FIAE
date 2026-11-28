// Selbstheilung nach einem Deploy: Eine offene Seite kennt noch alte Chunk-Hashes, der Server
// (SPA-Fallback) oder der Service Worker liefert dafür kein JavaScript mehr, und `import()` scheitert
// mit „Failed to fetch dynamically imported module“. Ein erneuter Versuch lädt denselben kaputten
// Chunk – erst Service Worker + Caches leeren und neu laden bringt die aktuelle Version.

const CHUNK_ERROR_PATTERN =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Unable to preload CSS/i;

export const RELOAD_GUARD_KEY = 'it_devgame_chunk_reload_at';
export const RELOAD_GUARD_MS = 60_000;

/** @param {unknown} error */
export function isChunkLoadError(error) {
  const message = typeof error === 'string' ? error : /** @type {{message?: unknown}} */ (error)?.message;
  return typeof message === 'string' && CHUNK_ERROR_PATTERN.test(message);
}

/**
 * Leert Service Worker und Caches und lädt die Seite neu. Ohne `force` höchstens einmal pro Minute
 * (sessionStorage-Wächter), damit ein dauerhaft fehlender Chunk keine Reload-Schleife auslöst.
 * @param {{ force?: boolean, storage?: Pick<Storage, 'getItem'|'setItem'>, now?: () => number,
 *   cacheStorage?: Pick<CacheStorage, 'keys'|'delete'>, serviceWorker?: Pick<ServiceWorkerContainer, 'getRegistrations'>,
 *   reload?: () => void }} [options]
 * @returns {Promise<boolean>} true, wenn neu geladen wurde
 */
export async function recoverFromChunkError(options = {}) {
  const {
    force = false,
    storage = typeof sessionStorage !== 'undefined' ? sessionStorage : undefined,
    now = Date.now,
    cacheStorage = typeof caches !== 'undefined' ? caches : undefined,
    serviceWorker = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined,
    reload = () => window.location.reload()
  } = options;

  if (!force && storage) {
    const last = Number(storage.getItem(RELOAD_GUARD_KEY));
    if (Number.isFinite(last) && last > 0 && now() - last < RELOAD_GUARD_MS) return false;
  }
  try {
    storage?.setItem(RELOAD_GUARD_KEY, String(now()));
  } catch {
    // Speicher gesperrt (z. B. privater Modus): trotzdem versuchen zu heilen
  }

  try {
    const registrations = serviceWorker ? await serviceWorker.getRegistrations() : [];
    await Promise.all(registrations.map((r) => r.unregister()));
    const keys = cacheStorage ? await cacheStorage.keys() : [];
    await Promise.all(keys.map((k) => cacheStorage?.delete(k)));
  } catch (e) {
    console.warn('[chunkErrorRecovery] Aufräumen fehlgeschlagen:', e);
  }
  reload();
  return true;
}
