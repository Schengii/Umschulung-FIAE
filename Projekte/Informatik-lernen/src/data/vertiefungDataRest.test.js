import { describe, it, expect } from 'vitest';
import { GUIDE_DEEPDIVES } from './vertiefungData';
import { LANGUAGE_EXTRA_TOPICS } from './vertiefungDataPraxis';
import { ARCH_NODE_DEEPDIVES, FLASHCARD_MORE } from './vertiefungDataRest';
import { ANFAENGER_GUIDES } from './anfaengerGuides';
import { ARCH_NODES } from './architectureData';
import { FLASHCARDS_DATA } from './flashcardsData';
import { PROGRAMMING_LANGUAGES } from './languageData';
import { parseMarkdown } from '../utils/markdownLite';

function checkMd(label, dd) {
  expect(dd.md?.trim().length, `${label}: md`).toBeGreaterThan(200);
  const blocks = parseMarkdown(dd.md);
  expect(blocks.some((b) => b.type === 'heading'), `${label}: Überschrift`).toBe(true);
  const fences = dd.md.split('\n').filter((l) => /^```/.test(l)).length;
  expect(fences % 2, `${label}: Codezäune`).toBe(0);
  for (const block of blocks.filter((b) => b.type === 'table')) {
    for (const row of block.rows) expect(row.length, `${label}: Tabellenzeile`).toBe(block.header.length);
  }
  for (const s of dd.sources || []) {
    expect(s.url, label).toMatch(/^https:\/\//);
    expect(s.label?.length, label).toBeGreaterThan(0);
  }
}

describe('Vertiefungen: restliche Bereiche', () => {
  it('Jedes der zwölf Einsteiger-Kapitel hat eine Vertiefung', () => {
    for (const g of ANFAENGER_GUIDES) {
      expect(GUIDE_DEEPDIVES[g.id], g.id).toBeDefined();
      checkMd(`Einsteiger.${g.id}`, GUIDE_DEEPDIVES[g.id]);
    }
  });

  it('Jede Architektur-Komponente hat eine Vertiefung', () => {
    for (const n of ARCH_NODES) {
      expect(ARCH_NODE_DEEPDIVES[n.id], n.id).toBeDefined();
      checkMd(`Architektur.${n.id}`, ARCH_NODE_DEEPDIVES[n.id]);
    }
    const nodeIds = new Set(ARCH_NODES.map((n) => n.id));
    for (const id of Object.keys(ARCH_NODE_DEEPDIVES)) expect(nodeIds.has(id), `unbekannte Komponente ${id}`).toBe(true);
  });

  it('Karteikarten 1 bis 20 tragen Zusatzwissen, alle Zuordnungen verweisen auf vorhandene Karten', () => {
    const byId = new Map(FLASHCARDS_DATA.map((c) => [c.id, c]));
    for (let id = 1; id <= 20; id++) {
      expect(FLASHCARD_MORE[id]?.length, `Karte ${id}`).toBeGreaterThan(80);
      expect(byId.get(id)?.more, `Karte ${id}: more nicht eingebunden`).toBe(FLASHCARD_MORE[id]);
    }
    for (const id of Object.keys(FLASHCARD_MORE)) expect(byId.has(Number(id)), `Karte ${id} fehlt`).toBe(true);
  });

  it('SQL und Bash haben zusätzliche Fachthemen ohne doppelte Titel', () => {
    for (const id of ['sql', 'bash']) {
      expect(LANGUAGE_EXTRA_TOPICS[id]?.length, id).toBeGreaterThanOrEqual(3);
      const lang = PROGRAMMING_LANGUAGES.find((l) => l.id === id);
      const titles = lang.topics.map((t) => t.title);
      expect(new Set(titles).size, `${id}: doppelte Titel`).toBe(titles.length);
      for (const t of LANGUAGE_EXTRA_TOPICS[id]) {
        expect(t.desc.length, `${id}: desc`).toBeGreaterThan(30);
        expect(t.code.trim().length, `${id}: code`).toBeGreaterThan(30);
      }
    }
  });
});
