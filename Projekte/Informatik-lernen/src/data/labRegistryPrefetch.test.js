import { describe, it, expect } from 'vitest';
import { prefetchLab, LAB_REGISTRY } from './labRegistry';

describe('prefetchLab', () => {
  it('ignoriert unbekannte Tab-IDs ohne Fehler', () => {
    expect(() => prefetchLab('gibt_es_nicht')).not.toThrow();
  });

  it('lädt den Chunk eines bekannten Labs höchstens einmal', async () => {
    const entry = LAB_REGISTRY[0];
    const original = entry.load;
    let calls = 0;
    entry.load = () => { calls += 1; return Promise.resolve({}); };
    try {
      prefetchLab(entry.tabs[0]);
      prefetchLab(entry.tabs[0]);
      await Promise.resolve();
      await Promise.resolve();
      expect(calls).toBe(1);
    } finally {
      entry.load = original;
    }
  });
});
