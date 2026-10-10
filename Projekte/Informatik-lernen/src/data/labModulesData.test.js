import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LAB_MODULES } from './labModulesData';
import { LAB_REGISTRY, buildRegistryIndex } from './labRegistry';

const APP_SOURCE = readFileSync(new URL('../App.jsx', import.meta.url), 'utf-8');
const SWITCH_TABS = [...APP_SOURCE.matchAll(/activeTab === '([^']+)'/g)].map((m) => m[1]);
const REGISTRY_TABS = LAB_REGISTRY.flatMap((e) => e.tabs);
const ROUTED_TABS = new Set([...SWITCH_TABS, ...REGISTRY_TABS]);
// Dashboard-Einträge, die bewusst keinen eigenen Tab haben (siehe onSelectLab in App.jsx)
const SPECIAL_ROUTES = new Set(['sqldungeon']);
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

describe('LAB_MODULES Datenintegrität', () => {
  it('hat eindeutige IDs', () => {
    const ids = LAB_MODULES.map((l) => l.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it('hat in jedem Eintrag alle Pflichtfelder', () => {
    for (const lab of LAB_MODULES) {
      expect(typeof lab.id, lab.id).toBe('string');
      expect(lab.title?.length, `${lab.id}: title`).toBeGreaterThan(0);
      expect(lab.category?.length, `${lab.id}: category`).toBeGreaterThan(0);
      expect(lab.desc?.length, `${lab.id}: desc`).toBeGreaterThan(0);
      expect(lab.icon, `${lab.id}: icon`).toBeTruthy();
      expect(lab.color, `${lab.id}: color`).toMatch(/^#[0-9a-f]{6}$/i);
      expect(Array.isArray(lab.tags) && lab.tags.length > 0, `${lab.id}: tags`).toBe(true);
      expect(lab.tags.every((t) => t.startsWith('#')), `${lab.id}: tags beginnen mit #`).toBe(true);
      expect(DIFFICULTIES, `${lab.id}: difficulty`).toContain(lab.difficulty);
    }
  });

  it('listet jedes Registry-Lab im Dashboard (sonst fehlt es in Suche, Filter und Fortschritt)', () => {
    const ids = new Set(LAB_MODULES.map((l) => l.id));
    const unlisted = LAB_REGISTRY.filter((e) => !e.tabs.some((t) => ids.has(t))).map((e) => e.tabs[0]);
    expect(unlisted).toEqual([]);
  });

  it('verweist nur auf Tabs, die in App.jsx gerendert werden', () => {
    const dead = LAB_MODULES.map((l) => l.id).filter((id) => !ROUTED_TABS.has(id) && !SPECIAL_ROUTES.has(id));
    expect(dead).toEqual([]);
  });
});

describe('LAB_REGISTRY', () => {
  it('hat keine doppelten Tab-IDs (auch nicht gegenüber der Switch-Tabelle)', () => {
    expect(() => buildRegistryIndex()).not.toThrow();
    const clash = REGISTRY_TABS.filter((t) => SWITCH_TABS.includes(t));
    expect(clash).toEqual([]);
  });

  // Über 200 Lab-Module: parallel laden, sonst reicht das Standard-Timeout nicht.
  it('lädt für jeden Eintrag eine Default-Komponente', async () => {
    const modules = await Promise.all(LAB_REGISTRY.map((entry) => entry.load()));
    modules.forEach((mod, i) => {
      expect(typeof mod.default, LAB_REGISTRY[i].tabs[0]).toMatch(/function|object/);
    });
  }, 60000);

  it('lehnt doppelte Tabs ab', () => {
    const e = { tabs: ['a'], load: () => null };
    expect(() => buildRegistryIndex([e, { ...e }])).toThrow(/Doppelte/);
  });
});
