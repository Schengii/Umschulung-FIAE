import { describe, it, expect } from 'vitest';
import { ANFAENGER_GUIDES } from './anfaengerGuides';
import { ANFAENGER_THEORIE } from './anfaengerTheorie';
import { parseMarkdown } from '../utils/markdownLite';

describe('Einsteiger-Kurs Teil 2 (Theorie-Lesebuch)', () => {
  it('hat eindeutige IDs, auch gegenüber dem Grundkurs', () => {
    const ids = [...ANFAENGER_GUIDES, ...ANFAENGER_THEORIE].map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('jedes Kapitel hat Einleitung, Beispiel, ausführliche Theorie und Lesezeit', () => {
    expect(ANFAENGER_THEORIE.length).toBeGreaterThanOrEqual(10);
    for (const g of ANFAENGER_THEORIE) {
      expect(g.title.trim().length, g.id).toBeGreaterThan(0);
      expect(g.content.trim().length, g.id).toBeGreaterThan(40);
      expect(g.example.trim().length, g.id).toBeGreaterThan(40);
      expect(g.theorie.length, `${g.id}: Theorie`).toBeGreaterThan(2500);
      expect(g.readTime, g.id).toMatch(/^\d+ Min$/);
    }
  });

  it('jedes Kapitel hat einen gültigen Selbsttest', () => {
    for (const g of ANFAENGER_THEORIE) {
      expect(g.quiz.length, g.id).toBeGreaterThanOrEqual(3);
      for (const q of g.quiz) {
        expect(q.optionen.length, g.id).toBeGreaterThanOrEqual(3);
        expect(Number.isInteger(q.korrekt) && q.korrekt >= 0 && q.korrekt < q.optionen.length, g.id).toBe(true);
        expect(new Set(q.optionen).size, `${g.id}: doppelte Optionen`).toBe(q.optionen.length);
        expect(q.erklaerung.length, g.id).toBeGreaterThan(20);
      }
    }
  });

  it('nennt zu jedem Kapitel mindestens zwei Quellen mit https-Adresse und Beschriftung', () => {
    for (const g of ANFAENGER_THEORIE) {
      expect(g.sources.length, g.id).toBeGreaterThanOrEqual(2);
      for (const s of g.sources) {
        expect(s.url, g.id).toMatch(/^https:\/\//);
        expect(s.label.length, g.id).toBeGreaterThan(5);
      }
      expect(new Set(g.sources.map((s) => s.url)).size, `${g.id}: doppelte Quellen`).toBe(g.sources.length);
    }
  });

  it('nutzt nur Markdown, den der Kurs darstellt (keine [!Hinweis]-Kästen, Tabellen mit gleich vielen Spalten)', () => {
    for (const g of ANFAENGER_THEORIE) {
      expect(g.theorie, g.id).not.toMatch(/\[!\w+\]/);
      const blocks = parseMarkdown(g.theorie);
      expect(blocks.some((b) => b.type === 'heading'), g.id).toBe(true);
      for (const b of blocks.filter((x) => x.type === 'table')) {
        for (const row of b.rows) expect(row.length, `${g.id}: Tabellenzeile`).toBe(b.header.length);
      }
    }
  });
});
