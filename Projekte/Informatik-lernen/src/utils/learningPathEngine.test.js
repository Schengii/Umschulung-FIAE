import { describe, it, expect } from 'vitest';
import { domainOfLab, daysUntil, countMistakesByDomain, countMistakesByLab, recommendLearningPath } from './learningPathEngine';

const NOW = new Date(2026, 5, 10); // 10.06.2026
const lab = (id, category, extra = {}) => ({ id, category, tags: [], difficulty: 'Intermediate', ...extra });

const MODULES = [
  lab('wiso_a', 'wiso'),
  lab('net_a', 'network'),
  lab('db_a', 'databases'),
  lab('sec_a', 'security'),
  lab('ihk_a', 'ihk', { badge: 'IHK Neu', tags: ['#IHK'] })
];

describe('domainOfLab', () => {
  it('ordnet Kategorien und Tags zu; examDomain hat Vorrang', () => {
    expect(domainOfLab(lab('x', 'wiso'))).toBe('wiso');
    expect(domainOfLab(lab('x', 'ihk', { tags: ['#AP1'] }))).toBe('ap1');
    expect(domainOfLab(lab('x', 'databases'))).toBe('ap2_2');
    expect(domainOfLab(lab('x', 'network'))).toBe('ap2_1');
    expect(domainOfLab(lab('x', 'ihk'))).toBeNull();
    expect(domainOfLab(lab('x', 'network', { examDomain: 'wiso' }))).toBe('wiso');
  });
});

describe('daysUntil', () => {
  it('rechnet in Kalendertagen und liefert null ohne gültiges Datum', () => {
    expect(daysUntil('2026-06-10', NOW)).toBe(0);
    expect(daysUntil('2026-06-20', NOW)).toBe(10);
    expect(daysUntil('2026-06-01', NOW)).toBe(-9);
    expect(daysUntil('', NOW)).toBeNull();
    expect(daysUntil('morgen', NOW)).toBeNull();
  });
});

describe('countMistakesByDomain', () => {
  it('zählt nur Fragen aus dem Katalog je Bereich', () => {
    const questions = [
      { id: 1, examType: 'ap1', category: 'Netzwerke' },
      { id: 2, examType: 'ap2_fiae', category: 'WiSo & KLR' }
    ];
    expect(countMistakesByDomain({ 1: {}, 2: {}, 99: {} }, questions)).toEqual({ ap1: 1, wiso: 1 });
  });
});

describe('recommendLearningPath', () => {
  it('stellt den schwächsten Bereich aus dem Einstufungstest voran und begründet ihn', () => {
    const placement = { domains: { ap1: { correct: 3, total: 3 }, ap2_1: { correct: 3, total: 3 }, ap2_2: { correct: 3, total: 3 }, wiso: { correct: 1, total: 3 } } };
    const res = recommendLearningPath({ modules: MODULES, placement, now: NOW });
    expect(res[0].lab.id).toBe('wiso_a');
    expect(res[0].reason).toMatch(/schwächster Bereich: WiSo \(33 %/);
  });

  it('bevorzugt Bereiche mit offenen Fehlern und nennt deren Anzahl', () => {
    const res = recommendLearningPath({ modules: MODULES, mistakeCounts: { ap2_2: 5 }, now: NOW });
    expect(res[0].lab.id).toBe('db_a');
    expect(res[0].reason).toMatch(/5 offene Fehler/);
  });

  it('nimmt bei Prüfung in unter 60 Tagen IHK-Labs hoch, bei späterem Termin nicht', () => {
    const near = recommendLearningPath({ modules: MODULES, examDate: '2026-07-10', now: NOW });
    expect(near[0].lab.id).toBe('ihk_a');
    expect(near[0].reason).toMatch(/Prüfung in 30 Tagen/);
    const far = recommendLearningPath({ modules: MODULES, examDate: '2027-01-10', now: NOW });
    expect(far[0].lab.id).not.toBe('ihk_a');
  });

  it('schließt abgeschlossene, ausgeblendete und nicht zum Beruf passende Labs aus', () => {
    const res = recommendLearningPath({
      modules: MODULES,
      progress: { wiso_a: { completed: true } },
      snoozed: { net_a: '2026-06-11', db_a: '2026-06-10' },
      now: NOW,
      limit: 10
    });
    const ids = res.map((r) => r.lab.id);
    expect(ids).not.toContain('wiso_a');
    expect(ids).not.toContain('net_a'); // ausgeblendet bis 11.06.
    expect(ids).toContain('db_a'); // Ausblendung am 10.06. abgelaufen
    const wisoOnly = recommendLearningPath({ modules: MODULES, careerId: 'wiso', now: NOW, limit: 10 });
    expect(wisoOnly.every((r) => r.lab.category === 'wiso')).toBe(true);
  });

  it('wählt je Kategorie höchstens ein Lab, füllt aber bei zu wenig Kategorien auf', () => {
    const same = [lab('a', 'network'), lab('b', 'network'), lab('c', 'network'), lab('d', 'security')];
    const res = recommendLearningPath({ modules: same, now: NOW, limit: 3 });
    expect(res).toHaveLength(3);
    expect(res.slice(0, 2).map((r) => r.lab.category).sort()).toEqual(['network', 'security']);
  });

  it('gewichtet begonnene Labs und die Rolle', () => {
    const mods = [lab('easy', 'network', { difficulty: 'Beginner' }), lab('hard', 'security', { difficulty: 'Expert' })];
    expect(recommendLearningPath({ modules: mods, role: 'anfaenger', now: NOW })[0].lab.id).toBe('easy');
    expect(recommendLearningPath({ modules: mods, role: 'pro', now: NOW })[0].lab.id).toBe('hard');
    const equal = [lab('a', 'network'), lab('b', 'security')];
    const started = recommendLearningPath({ modules: equal, progress: { b: { completed: false } }, now: NOW });
    expect(started[0].lab.id).toBe('b');
    expect(started[0].reason).toBe('Du hast es begonnen');
  });

  it('liefert für einen neuen Nutzer ohne Daten eine Standardreihenfolge ohne Fehler', () => {
    const res = recommendLearningPath({ modules: MODULES, now: NOW });
    expect(res).toHaveLength(3);
    expect(res[0].reason).toBe('Passt zu deinem Niveau');
  });
});

describe('Drill-Fehler je Lab', () => {
  it('countMistakesByLab zählt nur zugeordnete Drill-Fragen', () => {
    const map = { d1: 'raid_calculator', d2: 'raid_calculator', d3: 'docker' };
    expect(countMistakesByLab({ d1: {}, d2: {}, d3: {}, 42: {} }, map)).toEqual({ raid_calculator: 2, docker: 1 });
  });

  it('stellt ein Lab mit eigenen Drill-Fehlern voran und nennt den Grund', () => {
    const res = recommendLearningPath({ modules: MODULES, labMistakeCounts: { sec_a: 3 }, now: NOW });
    expect(res[0].lab.id).toBe('sec_a');
    expect(res[0].reason).toBe('3 offene Fehler in den Drill-Fragen dieses Labs');
  });

  it('Lab-Fehler schlagen die Bereichs-Fehler in der Begründung', () => {
    const res = recommendLearningPath({ modules: MODULES, mistakeCounts: { ap2_2: 5 }, labMistakeCounts: { db_a: 1 }, now: NOW });
    expect(res[0].lab.id).toBe('db_a');
    expect(res[0].reason).toMatch(/Drill-Fragen dieses Labs/);
  });
});
