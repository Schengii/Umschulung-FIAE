import { describe, it, expect, vi } from 'vitest';
import { isChunkLoadError, recoverFromChunkError, RELOAD_GUARD_KEY, RELOAD_GUARD_MS } from './chunkErrorRecovery';

const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = v; } };
};

const setup = (storageInit) => {
  const unregister = vi.fn().mockResolvedValue(true);
  const del = vi.fn().mockResolvedValue(true);
  const reload = vi.fn();
  return {
    unregister, del, reload,
    options: {
      storage: memoryStorage(storageInit),
      now: () => 1_000_000,
      cacheStorage: { keys: async () => ['a', 'b'], delete: del },
      serviceWorker: { getRegistrations: async () => [{ unregister }] },
      reload
    }
  };
};

describe('isChunkLoadError', () => {
  it('erkennt Chunk-Fehler der gängigen Browser', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: http://x/assets/A-1.js'))).toBe(true);
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new Error('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError('ChunkLoadError: Loading chunk 3 failed')).toBe(true);
  });
  it('ignoriert andere Fehler', () => {
    expect(isChunkLoadError(new Error('x is undefined'))).toBe(false);
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError({})).toBe(false);
  });
});

describe('recoverFromChunkError', () => {
  it('entfernt Service Worker und Caches und lädt neu', async () => {
    const s = setup();
    expect(await recoverFromChunkError(s.options)).toBe(true);
    expect(s.unregister).toHaveBeenCalledTimes(1);
    expect(s.del).toHaveBeenCalledTimes(2);
    expect(s.reload).toHaveBeenCalledTimes(1);
  });

  it('lädt innerhalb der Sperrfrist nicht erneut (keine Reload-Schleife)', async () => {
    const s = setup({ [RELOAD_GUARD_KEY]: String(1_000_000 - RELOAD_GUARD_MS + 5_000) });
    expect(await recoverFromChunkError(s.options)).toBe(false);
    expect(s.reload).not.toHaveBeenCalled();
  });

  it('lädt nach Ablauf der Sperrfrist wieder neu', async () => {
    const s = setup({ [RELOAD_GUARD_KEY]: String(1_000_000 - RELOAD_GUARD_MS - 1) });
    expect(await recoverFromChunkError(s.options)).toBe(true);
  });

  it('force ignoriert die Sperrfrist (manuelles „Erneut versuchen“)', async () => {
    const s = setup({ [RELOAD_GUARD_KEY]: '999999' });
    expect(await recoverFromChunkError({ ...s.options, force: true })).toBe(true);
    expect(s.reload).toHaveBeenCalledTimes(1);
  });

  it('lädt auch bei Fehlern beim Aufräumen neu', async () => {
    const s = setup();
    s.options.serviceWorker = { getRegistrations: async () => { throw new Error('boom'); } };
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await recoverFromChunkError(s.options)).toBe(true);
    expect(s.reload).toHaveBeenCalled();
    warn.mockRestore();
  });
});
