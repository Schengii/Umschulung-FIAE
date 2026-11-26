import { describe, it, expect } from 'vitest';
import { ANFAENGER_GUIDES } from './anfaengerGuides';
import { GRUNDKURS_EXTRA } from './anfaengerGrundkurs';
import { TOPIC_IMAGE_NAMES } from './topicImages';
import { parseMarkdown } from '../utils/markdownLite';
import { toLineBreakMarkdown } from '../components/Shared/MiniAufgaben';

describe('Einsteiger-Kurs Teil 1: Ausbau (anfaengerGrundkurs)', () => {
  it('liefert zu jedem der Grundkurs-Kapitel einen Ausbau und keinen zu fremden IDs', () => {
    const ids = ANFAENGER_GUIDES.map((g) => g.id);
    expect(Object.keys(GRUNDKURS_EXTRA).sort()).toEqual([...ids].sort());
  });

  for (const guide of ANFAENGER_GUIDES) {
    describe(guide.id, () => {
      const extra = GRUNDKURS_EXTRA[guide.id];

      it('hat ausführliche Theorie mit Überschriften und Lesezeit', () => {
        expect(extra.theorie.length).toBeGreaterThan(3500);
        expect(extra.readTime).toMatch(/^\d+ Min$/);
        const blocks = parseMarkdown(extra.theorie);
        expect(blocks.filter((b) => b.type === 'heading').length).toBeGreaterThanOrEqual(5);
      });

      it('nutzt nur Markdown, den der Kurs darstellt', () => {
        expect(extra.theorie).not.toMatch(/\[!\w+\]/);
        expect(extra.theorie).not.toMatch(/^!\[/m);
        for (const b of parseMarkdown(extra.theorie).filter((x) => x.type === 'table')) {
          for (const row of b.rows) expect(row.length, `${guide.id}: Tabellenzeile`).toBe(b.header.length);
        }
      });

      it('hat eine vorhandene Grafik mit Alternativtext', () => {
        expect(TOPIC_IMAGE_NAMES, extra.bild.src).toContain(extra.bild.src);
        expect(extra.bild.alt.length).toBeGreaterThan(20);
        expect(extra.bild.caption.length).toBeGreaterThan(10);
      });

      it('hat mindestens drei Aufgaben mit eindeutiger ID und Lösung', () => {
        expect(extra.aufgaben.length).toBeGreaterThanOrEqual(3);
        const ids = extra.aufgaben.map((a) => a.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const a of extra.aufgaben) {
          expect(a.id).toMatch(/^[a-z0-9-]+$/);
          expect(a.frage.length, a.id).toBeGreaterThan(30);
          expect(a.loesung.length, a.id).toBeGreaterThan(30);
        }
      });

      it('nennt mindestens zwei Quellen mit https-Adresse', () => {
        expect(extra.sources.length).toBeGreaterThanOrEqual(2);
        for (const s of extra.sources) {
          expect(s.url).toMatch(/^https:\/\//);
          expect(s.label.length).toBeGreaterThan(5);
        }
        expect(new Set(extra.sources.map((s) => s.url)).size).toBe(extra.sources.length);
      });
    });
  }

  it('Aufgaben-IDs sind über alle Kapitel eindeutig', () => {
    const ids = Object.values(GRUNDKURS_EXTRA).flatMap((e) => e.aufgaben.map((a) => a.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('toLineBreakMarkdown', () => {
  it('macht aus jeder Textzeile einen eigenen Absatz, lässt Listen und Codeblöcke ganz', () => {
    const md = toLineBreakMarkdown('a) eins\nb) zwei');
    expect(parseMarkdown(md).filter((b) => b.type === 'paragraph')).toHaveLength(2);

    const list = parseMarkdown(toLineBreakMarkdown('1. A\n2. B\n3. C'));
    expect(list).toHaveLength(1);
    expect(list[0].items).toHaveLength(3);

    const code = parseMarkdown(toLineBreakMarkdown('Text\n```python\nx = 1\n    y = 2\n```'));
    expect(code.find((b) => b.type === 'code').text).toBe('x = 1\n    y = 2');
  });
});
