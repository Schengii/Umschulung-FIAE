import { describe, it, expect } from 'vitest';
import { ANFAENGER_GUIDES } from './anfaengerGuides';

describe('Einsteiger-Kurs (anfaengerGuides)', () => {
  it('hat eindeutige IDs und gefüllte Pflichtfelder', () => {
    const ids = ANFAENGER_GUIDES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const g of ANFAENGER_GUIDES) {
      expect(g.title?.trim().length, g.id).toBeGreaterThan(0);
      expect(g.category?.trim().length, g.id).toBeGreaterThan(0);
      expect(g.content?.trim().length, g.id).toBeGreaterThan(0);
      expect(g.example?.trim().length, g.id).toBeGreaterThan(0);
    }
  });

  it('jedes Kapitel hat einen Selbsttest mit gültigem Antwortindex', () => {
    for (const g of ANFAENGER_GUIDES) {
      expect(g.quiz?.length, `${g.id}: quiz`).toBeGreaterThan(0);
      for (const q of g.quiz) {
        expect(q.optionen.length, `${g.id}: Optionen`).toBeGreaterThanOrEqual(2);
        expect(Number.isInteger(q.korrekt) && q.korrekt >= 0 && q.korrekt < q.optionen.length, `${g.id}: korrekt`).toBe(true);
        expect(q.erklaerung?.trim().length, `${g.id}: Erklärung`).toBeGreaterThan(0);
        expect(new Set(q.optionen).size, `${g.id}: doppelte Optionen`).toBe(q.optionen.length);
      }
    }
  });

  it('Quellenangaben sind https-Links mit Beschriftung', () => {
    for (const g of ANFAENGER_GUIDES.filter((x) => x.source)) {
      expect(g.source.url, g.id).toMatch(/^https:\/\//);
      expect(g.source.label?.length, g.id).toBeGreaterThan(0);
    }
  });
});
