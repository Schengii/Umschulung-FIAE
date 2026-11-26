import { describe, it, expect } from 'vitest';
import { ARCH_NODES, ARCH_PATTERNS, ARCH_PRINCIPLES, ARCH_QUIZ } from './architectureData';

const unique = (arr) => new Set(arr).size === arr.length;

describe('Systemarchitektur-Inhalte', () => {
  it('Komponenten, Muster und Prinzipien haben eindeutige IDs und gefüllte Felder', () => {
    for (const list of [ARCH_NODES, ARCH_PATTERNS, ARCH_PRINCIPLES]) {
      expect(unique(list.map((x) => x.id))).toBe(true);
    }
    for (const n of ARCH_NODES) {
      for (const f of ['name', 'type', 'desc', 'details']) expect(n[f]?.trim().length, `${n.id}.${f}`).toBeGreaterThan(0);
    }
    for (const p of ARCH_PATTERNS) {
      expect(p.pros.length, p.id).toBeGreaterThan(0);
      expect(p.cons.length, p.id).toBeGreaterThan(0);
      expect(p.useWhen?.length, p.id).toBeGreaterThan(0);
    }
    for (const p of ARCH_PRINCIPLES) {
      expect(p.title?.length, p.id).toBeGreaterThan(0);
      expect(p.text?.length, p.id).toBeGreaterThan(0);
    }
  });

  it('Selbsttest: gültiger Antwortindex, keine doppelten Optionen', () => {
    for (const [i, q] of ARCH_QUIZ.entries()) {
      expect(Number.isInteger(q.korrekt) && q.korrekt >= 0 && q.korrekt < q.optionen.length, `Frage ${i + 1}`).toBe(true);
      expect(unique(q.optionen), `Frage ${i + 1}: Optionen`).toBe(true);
      expect(q.erklaerung?.length, `Frage ${i + 1}: Erklärung`).toBeGreaterThan(0);
    }
  });

  it('Quellenangaben sind https-Links mit Beschriftung', () => {
    for (const x of [...ARCH_PATTERNS, ...ARCH_PRINCIPLES].filter((y) => y.source)) {
      expect(x.source.url, x.id).toMatch(/^https:\/\//);
      expect(x.source.label?.length, x.id).toBeGreaterThan(0);
    }
  });
});
