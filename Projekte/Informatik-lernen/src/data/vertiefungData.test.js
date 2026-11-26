import { describe, it, expect } from 'vitest';
import { GUIDE_DEEPDIVES, AI_DEEPDIVES, WC_DEEPDIVES } from './vertiefungData';
import { PROJECT_DEEPDIVES, CAMPAIGN_DEEPDIVES, LANGUAGE_EXTRA_TOPICS } from './vertiefungDataPraxis';
import { ANFAENGER_GUIDES } from './anfaengerGuides';
import { AI_BUSINESS_MODULES } from './aiBusinessData';
import { WEB_COMPONENTS_DATA } from './webComponentsData';
import { MICRO_PROJECTS } from './projectsData';
import { CAMPAIGN_CHAPTERS } from './campaignData';
import { PROGRAMMING_LANGUAGES } from './languageData';
import { parseMarkdown } from '../utils/markdownLite';

const idsOf = (list) => new Set(list.map((x) => x.id));

function checkDeepDives(label, deepDives, existingIds) {
  for (const [id, dd] of Object.entries(deepDives)) {
    expect(existingIds.has(id), `${label}: Eintrag "${id}" existiert nicht`).toBe(true);
    expect(dd.md?.trim().length, `${label}.${id}: md`).toBeGreaterThan(200);
    const blocks = parseMarkdown(dd.md);
    expect(blocks.some((b) => b.type === 'heading'), `${label}.${id}: Überschrift`).toBe(true);
    const fences = dd.md.split('\n').filter((l) => /^```/.test(l)).length;
    expect(fences % 2, `${label}.${id}: ungerade Anzahl Codezäune`).toBe(0);
    for (const block of blocks.filter((b) => b.type === 'table')) {
      for (const row of block.rows) expect(row.length, `${label}.${id}: Tabellenzeile`).toBe(block.header.length);
    }
    for (const s of dd.sources || []) {
      expect(s.url, `${label}.${id}`).toMatch(/^https:\/\//);
      expect(s.label?.length, `${label}.${id}`).toBeGreaterThan(0);
    }
  }
}

describe('Fachliche Vertiefungen in Kurse & Wissen', () => {
  it('Einsteiger-Kurs: alle vier ursprünglichen Kapitel sind vertieft', () => {
    checkDeepDives('Einsteiger', GUIDE_DEEPDIVES, idsOf(ANFAENGER_GUIDES));
    for (const id of ['eva_prinzip', 'cpu_brain', 'binary_system', 'internet_dns']) expect(GUIDE_DEEPDIVES[id], id).toBeDefined();
  });

  it('KI-Masterclass: alle vier ursprünglichen Module sind vertieft', () => {
    checkDeepDives('KI', AI_DEEPDIVES, idsOf(AI_BUSINESS_MODULES));
    for (const id of ['prompt_templates', 'chain_of_thought', 'few_shot', 'deep_learning']) expect(AI_DEEPDIVES[id], id).toBeDefined();
  });

  it('Web Components: Lit, Vaadin und native Komponenten sind vertieft', () => {
    checkDeepDives('WebComponents', WC_DEEPDIVES, idsOf(WEB_COMPONENTS_DATA));
    for (const id of ['lit', 'vaadin', 'native_wc']) expect(WC_DEEPDIVES[id], id).toBeDefined();
  });

  it('Praxisprojekte: die drei ursprünglichen Projekte sind vertieft', () => {
    checkDeepDives('Projekte', PROJECT_DEEPDIVES, idsOf(MICRO_PROJECTS));
    for (const id of ['proj_react_todo', 'proj_py_scraper', 'proj_docker_api']) expect(PROJECT_DEEPDIVES[id], id).toBeDefined();
  });

  it('Kampagne: jedes der fünf Kapitel hat einen fachlichen Hintergrund', () => {
    checkDeepDives('Kampagne', CAMPAIGN_DEEPDIVES, idsOf(CAMPAIGN_CHAPTERS));
    for (const ch of CAMPAIGN_CHAPTERS) expect(CAMPAIGN_DEEPDIVES[ch.id], ch.id).toBeDefined();
  });

  it('Sprachen: Zusatzthemen gehören zu vorhandenen Sprachen und sind vollständig', () => {
    const langs = idsOf(PROGRAMMING_LANGUAGES);
    for (const [id, topics] of Object.entries(LANGUAGE_EXTRA_TOPICS)) {
      expect(langs.has(id), `Sprache ${id}`).toBe(true);
      for (const t of topics) {
        expect(t.title?.length, `${id}: title`).toBeGreaterThan(0);
        expect(t.desc?.length, `${id}: desc`).toBeGreaterThan(30);
        expect(t.code?.trim().length, `${id}: code`).toBeGreaterThan(30);
      }
      const lang = PROGRAMMING_LANGUAGES.find((l) => l.id === id);
      const titles = lang.topics.map((t) => t.title);
      expect(new Set(titles).size, `${id}: doppelte Titel`).toBe(titles.length);
    }
    for (const id of ['python', 'javascript', 'typescript', 'java', 'csharp', 'golang', 'rust']) {
      expect(LANGUAGE_EXTRA_TOPICS[id]?.length, id).toBeGreaterThan(0);
    }
  });
});
