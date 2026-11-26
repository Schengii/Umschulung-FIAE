import { describe, it, expect } from 'vitest';
import { parseInline, parseMarkdown } from './markdownLite';

describe('parseInline', () => {
  it('erkennt fett und Code im Fließtext', () => {
    expect(parseInline('Nutze **fett** und `code` hier')).toEqual([
      { type: 'text', text: 'Nutze ' },
      { type: 'bold', text: 'fett' },
      { type: 'text', text: ' und ' },
      { type: 'code', text: 'code' },
      { type: 'text', text: ' hier' }
    ]);
  });

  it('lässt Text ohne Auszeichnung unverändert und behandelt leere Eingaben', () => {
    expect(parseInline('nur Text')).toEqual([{ type: 'text', text: 'nur Text' }]);
    expect(parseInline('')).toEqual([]);
    expect(parseInline(undefined)).toEqual([]);
  });

  it('gibt HTML nicht als Markup weiter, sondern als Text', () => {
    expect(parseInline('<img src=x onerror=alert(1)>')).toEqual([{ type: 'text', text: '<img src=x onerror=alert(1)>' }]);
  });
});

describe('parseMarkdown', () => {
  it('parst Überschriften mit Ebene', () => {
    const [h3, h4] = parseMarkdown('### Titel\n#### Unter');
    expect(h3).toMatchObject({ type: 'heading', level: 3 });
    expect(h4).toMatchObject({ type: 'heading', level: 4 });
  });

  it('parst Codeblöcke inklusive Sprache und lässt Inhalt unverändert', () => {
    const [block] = parseMarkdown('```bash\ngit status\n# kein **fett**\n```');
    expect(block).toEqual({ type: 'code', lang: 'bash', text: 'git status\n# kein **fett**' });
  });

  it('schließt einen nicht beendeten Codeblock am Dateiende', () => {
    const [block] = parseMarkdown('```\nabc');
    expect(block).toMatchObject({ type: 'code', text: 'abc' });
  });

  it('parst Aufzählungen und nummerierte Listen', () => {
    const [ul, ol] = parseMarkdown('- eins\n- zwei\n\n1. a\n2. b');
    expect(ul).toMatchObject({ type: 'list', ordered: false });
    expect(ul.items).toHaveLength(2);
    expect(ol).toMatchObject({ type: 'list', ordered: true });
    expect(ol.items).toHaveLength(2);
  });

  it('parst Tabellen mit Kopfzeile und Zeilen', () => {
    const [table] = parseMarkdown('| Präfix | Hosts |\n|---|---|\n| /24 | 254 |\n| /25 | 126 |');
    expect(table.type).toBe('table');
    expect(table.header).toHaveLength(2);
    expect(table.rows).toHaveLength(2);
    expect(table.rows[1][1]).toEqual([{ type: 'text', text: '126' }]);
  });

  it('führt Zeilen eines Absatzes zusammen und trennt durch Leerzeilen', () => {
    const blocks = parseMarkdown('Zeile eins\nZeile zwei\n\nNeuer Absatz');
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ type: 'paragraph', tokens: [{ type: 'text', text: 'Zeile eins Zeile zwei' }] });
  });

  it('parst Zitate', () => {
    const [quote] = parseMarkdown('> Hinweis\n> weiter');
    expect(quote).toMatchObject({ type: 'quote' });
  });

  it('behandelt leere Eingaben und CRLF', () => {
    expect(parseMarkdown('')).toEqual([]);
    expect(parseMarkdown(undefined)).toEqual([]);
    expect(parseMarkdown('# A\r\n\r\ntext')).toHaveLength(2);
  });
});
