// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setCache,
  getCache,
  hasCache,
  deleteCache,
  clearCache,
  getCacheStats,
  pruneExpiredCache,
  getOrSetCache,
  setPersistentCache,
  getPersistentCache,
  deletePersistentCache,
  getOrSetIndexedDbCache,
  invalidateIndexedDbCache
} from './cacheEngine';
import { clearStore } from './indexedDbStorage';

describe('cacheEngine – In-Memory-Cache', () => {
  beforeEach(() => {
    clearCache();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('speichert und liest einen Wert zurück', () => {
    setCache('foo', { bar: 42 });
    expect(getCache('foo')).toEqual({ bar: 42 });
    expect(hasCache('foo')).toBe(true);
  });

  it('liefert undefined für einen unbekannten Schlüssel', () => {
    expect(getCache('unbekannt')).toBeUndefined();
    expect(hasCache('unbekannt')).toBe(false);
  });

  it('isoliert Werte über Namespaces', () => {
    setCache('key', 'a', { namespace: 'ns1' });
    setCache('key', 'b', { namespace: 'ns2' });
    expect(getCache('key', { namespace: 'ns1' })).toBe('a');
    expect(getCache('key', { namespace: 'ns2' })).toBe('b');
    expect(getCache('key')).toBeUndefined();
  });

  it('lässt Einträge nach Ablauf der TTL verfallen', () => {
    vi.useFakeTimers();
    setCache('temp', 'wert', { ttl: 1000 });
    expect(getCache('temp')).toBe('wert');

    vi.advanceTimersByTime(1001);
    expect(getCache('temp')).toBeUndefined();
  });

  it('behält Einträge ohne Ablauf (ttl: Infinity) dauerhaft', () => {
    vi.useFakeTimers();
    setCache('ewig', 'wert', { ttl: Infinity });
    vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 365);
    expect(getCache('ewig')).toBe('wert');
  });

  it('löscht einen einzelnen Eintrag', () => {
    setCache('x', 1);
    expect(deleteCache('x')).toBe(true);
    expect(getCache('x')).toBeUndefined();
  });

  it('leert den gesamten Cache oder nur einen Namespace', () => {
    setCache('a', 1, { namespace: 'ns' });
    setCache('b', 2);

    clearCache('ns');
    expect(getCache('a', { namespace: 'ns' })).toBeUndefined();
    expect(getCache('b')).toBe(2);

    clearCache();
    expect(getCache('b')).toBeUndefined();
  });

  it('entfernt abgelaufene Einträge über pruneExpiredCache', () => {
    vi.useFakeTimers();
    setCache('a', 1, { ttl: 500 });
    setCache('b', 2, { ttl: Infinity });

    vi.advanceTimersByTime(600);
    const pruned = pruneExpiredCache();

    expect(pruned).toBe(1);
    expect(getCacheStats().size).toBe(1);
  });

  it('zählt Treffer, Verfehlungen und Schreibvorgänge in den Stats', () => {
    setCache('a', 1);
    getCache('a'); // hit
    getCache('nicht-vorhanden'); // miss

    const stats = getCacheStats();
    expect(stats.hits).toBeGreaterThanOrEqual(1);
    expect(stats.misses).toBeGreaterThanOrEqual(1);
    expect(stats.sets).toBeGreaterThanOrEqual(1);
  });
});

describe('cacheEngine – getOrSetCache', () => {
  beforeEach(() => {
    clearCache();
  });

  it('ruft die Factory nur einmal auf und cached danach das Ergebnis', async () => {
    const factory = vi.fn().mockResolvedValue('teures-ergebnis');

    const first = await getOrSetCache('rechenintensiv', factory);
    const second = await getOrSetCache('rechenintensiv', factory);

    expect(first).toBe('teures-ergebnis');
    expect(second).toBe('teures-ergebnis');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('unterstützt synchrone Factories', async () => {
    const result = await getOrSetCache('sync-key', () => 123);
    expect(result).toBe(123);
  });
});

describe('cacheEngine – LocalStorage-Persistenz', () => {
  beforeEach(() => {
    clearCache();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('persistiert einen Wert und liest ihn nach Leeren des In-Memory-Caches erneut', () => {
    setPersistentCache('persist-key', { xp: 100 });
    clearCache();

    expect(getPersistentCache('persist-key')).toEqual({ xp: 100 });
  });

  it('gibt undefined zurück, wenn der persistente Eintrag abgelaufen ist', () => {
    vi.useFakeTimers();
    setPersistentCache('temp-persist', 'wert', { ttl: 1000 });
    clearCache();

    vi.advanceTimersByTime(1001);
    expect(getPersistentCache('temp-persist')).toBeUndefined();
  });

  it('löscht einen persistenten Eintrag vollständig', () => {
    setPersistentCache('to-delete', 'wert');
    deletePersistentCache('to-delete');

    clearCache();
    expect(getPersistentCache('to-delete')).toBeUndefined();
  });
});

describe('cacheEngine – IndexedDB-Persistenz', () => {
  beforeEach(async () => {
    clearCache();
    await clearStore('keyvalue');
  });

  it('berechnet den Wert einmalig und liest ihn danach aus IndexedDB', async () => {
    const factory = vi.fn().mockResolvedValue({ report: 'ergebnis' });

    const first = await getOrSetIndexedDbCache('report-key', factory);
    clearCache(); // In-Memory-Treffer erzwingen ausschließen

    const second = await getOrSetIndexedDbCache('report-key', factory);

    expect(first).toEqual({ report: 'ergebnis' });
    expect(second).toEqual({ report: 'ergebnis' });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('berechnet den Wert nach Invalidierung erneut', async () => {
    const factory = vi.fn().mockResolvedValue('v1').mockResolvedValueOnce('v1').mockResolvedValue('v2');

    await getOrSetIndexedDbCache('invalidate-key', factory);
    await invalidateIndexedDbCache('invalidate-key');
    const result = await getOrSetIndexedDbCache('invalidate-key', factory);

    expect(result).toBe('v2');
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
