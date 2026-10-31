import { describe, it, expect } from 'vitest';
import {
  parseMarkdown,
  parseInline,
  slugify,
  blocksToPlainText,
  extractToc,
  collectImageSources,
  estimateReadMinutes
} from './markdownEngine';

describe('markdownEngine – Inline', () => {
  it('erkennt fett, kursiv, Code und Links', () => {
    expect(parseInline('a **b** *c* `d` [e](https://x.de)')).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'strong', children: [{ type: 'text', value: 'b' }] },
      { type: 'text', value: ' ' },
      { type: 'em', children: [{ type: 'text', value: 'c' }] },
      { type: 'text', value: ' ' },
      { type: 'code', value: 'd' },
      { type: 'text', value: ' ' },
      { type: 'link', href: 'https://x.de', children: [{ type: 'text', value: 'e' }] }
    ]);
  });

  it('lässt Malzeichen und Unterstriche stehen', () => {
    expect(parseInline('2 * 3 = 6 und max_value')).toEqual([{ type: 'text', value: '2 * 3 = 6 und max_value' }]);
  });

  it('macht aus unsicheren Link-Zielen reinen Text', () => {
    expect(parseInline('[klick](javascript:alert(1))')).toEqual([{ type: 'text', value: 'klick' }]);
  });

  it('übernimmt maskierte Zeichen wörtlich', () => {
    expect(parseInline('\\*kein kursiv\\*')).toEqual([{ type: 'text', value: '*kein kursiv*' }]);
  });
});

describe('markdownEngine – Blöcke', () => {
  it('parst Überschriften mit eindeutigen IDs', () => {
    const blocks = parseMarkdown('## Übersicht\n\n## Übersicht\n### Größe & Maß');
    expect(blocks.map((b) => b.type === 'heading' && [b.level, b.id])).toEqual([
      [2, 'uebersicht'],
      [2, 'uebersicht-2'],
      [3, 'groesse-mass']
    ]);
  });

  it('fasst Absatzzeilen zusammen und trennt an Leerzeilen', () => {
    const blocks = parseMarkdown('Zeile eins\nZeile zwei\n\nNeuer Absatz');
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({ type: 'paragraph', children: [{ type: 'text', value: 'Zeile eins Zeile zwei' }] });
  });

  it('parst Listen mit Unterliste und Startnummer', () => {
    const [list] = parseMarkdown('3. drei\n   - a\n   - b\n4. vier');
    expect(list.type).toBe('list');
    expect(list.ordered).toBe(true);
    expect(list.start).toBe(3);
    expect(list.items).toHaveLength(2);
    expect(list.items[0].sublist.items).toHaveLength(2);
  });

  it('parst Tabellen mit Ausrichtung und maskiertem Senkrechtstrich', () => {
    const [table] = parseMarkdown('| A | B |\n| :--- | ---: |\n| 1 | a \\| b |');
    expect(table.type).toBe('table');
    expect(table.align).toEqual(['left', 'right']);
    expect(table.rows[0][1]).toEqual([{ type: 'text', value: 'a | b' }]);
  });

  it('übernimmt Code-Blöcke unverändert', () => {
    const [code] = parseMarkdown('```sql\nSELECT *\n  FROM t;\n```');
    expect(code).toEqual({ type: 'code', lang: 'sql', value: 'SELECT *\n  FROM t;' });
  });

  it('erkennt Callouts und Zitate', () => {
    const blocks = parseMarkdown('> [!exam] IHK-Tipp\n> Immer **Einheit** angeben.\n\n> Ein Zitat');
    expect(blocks[0].type).toBe('callout');
    expect(blocks[0].kind).toBe('exam');
    expect(blocks[0].title).toBe('IHK-Tipp');
    expect(blocks[0].children[0].type).toBe('paragraph');
    expect(blocks[1].type).toBe('blockquote');
  });

  it('setzt unbekannte Callout-Arten auf info', () => {
    expect(parseMarkdown('> [!quatsch] X')[0].kind).toBe('info');
  });

  it('erkennt Abbildungen mit Bildunterschrift', () => {
    const [img] = parseMarkdown('![OSI-Modell](osi-modell.svg "Die 7 Schichten")');
    expect(img).toEqual({ type: 'image', alt: 'OSI-Modell', src: 'osi-modell.svg', caption: 'Die 7 Schichten' });
  });

  it('erkennt Trennlinien', () => {
    expect(parseMarkdown('a\n\n---\n\nb').map((b) => b.type)).toEqual(['paragraph', 'hr', 'paragraph']);
  });
});

describe('markdownEngine – Hilfsfunktionen', () => {
  it('slugify schreibt Umlaute aus', () => {
    expect(slugify('Prüfungs-Tipp: Größe!')).toBe('pruefungs-tipp-groesse');
    expect(slugify('???')).toBe('abschnitt');
  });

  it('liefert Klartext ohne Markdown-Zeichen und ohne Code', () => {
    const text = blocksToPlainText(parseMarkdown('## Titel\n**fett** und `x`\n\n```js\ncode()\n```'));
    expect(text).toBe('Titel. fett und x');
  });

  it('baut das Inhaltsverzeichnis aus Ebene-2-Überschriften', () => {
    expect(extractToc(parseMarkdown('## A\n### B\n## C'))).toEqual([
      { id: 'a', text: 'A' },
      { id: 'c', text: 'C' }
    ]);
  });

  it('sammelt Bildquellen auch aus Callouts', () => {
    expect(collectImageSources(parseMarkdown('![a](x.svg)\n\n> [!tip] T\n> ![b](y.svg)'))).toEqual(['x.svg', 'y.svg']);
  });

  it('schätzt die Lesezeit', () => {
    expect(estimateReadMinutes('wort '.repeat(1300))).toBe(10);
    expect(estimateReadMinutes('')).toBe(1);
  });
});
