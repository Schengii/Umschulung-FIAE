import { describe, it, expect } from 'vitest';
import { NOTEBOOK_TEMPLATES } from './notebookTemplates';
import { parseMarkdown } from '../utils/markdownLite';

describe('Spickzettel-Vorlagen fürs Notizbuch', () => {
  it('haben eindeutige IDs und gefüllte Pflichtfelder', () => {
    const ids = NOTEBOOK_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of NOTEBOOK_TEMPLATES) {
      expect(t.title?.trim().length, t.id).toBeGreaterThan(0);
      expect(t.description?.trim().length, t.id).toBeGreaterThan(0);
      expect(t.content?.trim().length, t.id).toBeGreaterThan(50);
      expect(Array.isArray(t.tags) && t.tags.length > 0, `${t.id}: Tags`).toBe(true);
    }
  });

  it('enthalten gültiges Markdown ohne offene Codeblöcke und mit mindestens einer Überschrift', () => {
    for (const t of NOTEBOOK_TEMPLATES) {
      const fences = t.content.split('\n').filter((l) => /^```/.test(l)).length;
      expect(fences % 2, `${t.id}: ungerade Anzahl Codezäune`).toBe(0);
      const blocks = parseMarkdown(t.content);
      expect(blocks.some((b) => b.type === 'heading'), `${t.id}: Überschrift`).toBe(true);
    }
  });

  it('Tabellen sind vollständig (jede Zeile hat so viele Zellen wie der Kopf)', () => {
    for (const t of NOTEBOOK_TEMPLATES) {
      for (const block of parseMarkdown(t.content).filter((b) => b.type === 'table')) {
        for (const row of block.rows) {
          expect(row.length, `${t.id}: Tabellenzeile`).toBe(block.header.length);
        }
      }
    }
  });
});
