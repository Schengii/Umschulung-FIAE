import { describe, it, expect } from 'vitest';
import { buildStudyPlan, phaseForDaysLeft, disciplineForCareer, DISCIPLINE_TO_CAREER } from './studyPlanEngine';

const NOW = new Date(2026, 5, 10); // 10.06.2026
const CATS = ['network', 'security', 'cloud', 'devops', 'hardware', 'databases', 'algorithms', 'ai', 'wiso', 'linux'];
const MODULES = [
  ...CATS.map((c, i) => ({ id: `lab_${i}`, category: c, tags: [], difficulty: 'Intermediate' })),
  { id: 'ihk_a', category: 'ihk', tags: ['#IHK'], difficulty: 'Intermediate', badge: 'IHK Neu', examDomain: 'ap2_1' },
  { id: 'ihk_b', category: 'ihk', tags: ['#IHK'], difficulty: 'Intermediate', badge: 'IHK Neu', examDomain: 'ap2_1' },
  { id: 'ihk_c', category: 'ihk', tags: ['#AP2'], difficulty: 'Intermediate', examDomain: 'ap2_1' },
  // Werkzeug ohne Prüfungsbereich: darf nie im Plan landen
  { id: 'tool_x', category: 'ihk', tags: ['#IHK'], difficulty: 'Beginner', badge: 'IHK Neu' }
];
const plan = (over) => buildStudyPlan({ modules: MODULES, now: NOW, ...over });

describe('Phasen', () => {
  it('ordnet Restzeit den Phasen zu', () => {
    expect(phaseForDaysLeft(60)).toBe('learn');
    expect(phaseForDaysLeft(29)).toBe('learn');
    expect(phaseForDaysLeft(28)).toBe('deepen');
    expect(phaseForDaysLeft(15)).toBe('deepen');
    expect(phaseForDaysLeft(14)).toBe('consolidate');
    expect(phaseForDaysLeft(0)).toBe('consolidate');
  });

  it('bildet Fachrichtung und Berufsfilter ineinander ab', () => {
    expect(DISCIPLINE_TO_CAREER).toMatchObject({ fiae: 'fiae', fisi: 'fisi', itse: 'itse', itsm: 'wiso' });
    expect(disciplineForCareer('wiso')).toBe('itsm');
    expect(disciplineForCareer('all')).toBe('fiae');
  });
});

describe('buildStudyPlan – Zustände', () => {
  it('liefert ohne gültigen Termin „none“ und nach der Prüfung „expired“', () => {
    expect(plan({ examDate: null }).status).toBe('none');
    expect(plan({ examDate: 'bald' }).status).toBe('none');
    expect(plan({ examDate: '2026-06-01' }).status).toBe('expired');
  });
});

describe('buildStudyPlan – Golden-Fälle', () => {
  it('81 Tage: 4 Lernwochen mit Einstufungstest-Wiederholung in der letzten Woche', () => {
    const p = plan({ examDate: '2026-08-30' });
    expect(p.status).toBe('active');
    expect(p.weeks).toHaveLength(4);
    expect(p.weeks.map((w) => w.phase)).toEqual(['learn', 'learn', 'learn', 'learn']);
    expect(p.weeks.map((w) => w.retest)).toEqual([false, false, false, true]);
    expect(p.weeks[0].startDate).toBe('2026-06-10');
    expect(p.weeks[1].startDate).toBe('2026-06-17');
    expect(p.weeks[0].labs).toHaveLength(3); // 6 Stunden / 2 Stunden je Lab
  });

  it('20 Tage: Vertiefen mit nur IHK-Labs, danach zwei Festigungswochen ohne neue Labs', () => {
    const p = plan({ examDate: '2026-06-30' });
    expect(p.weeks.map((w) => w.phase)).toEqual(['deepen', 'consolidate', 'consolidate']);
    expect(p.weeks[0].labs.every((x) => x.lab.id.startsWith('ihk_'))).toBe(true);
    expect(p.weeks[0].tasks.join(' ')).toMatch(/Prüfungssimulation/);
    expect(p.weeks[1].labs).toHaveLength(0);
    expect(p.weeks[1].targets.labs).toBe(0);
    expect(p.weeks[2].tasks.join(' ')).toMatch(/Prüfung gehen/);
  });

  it('10 Tage: nur Festigen, Prüfungswoche zuletzt', () => {
    const p = plan({ examDate: '2026-06-20' });
    expect(p.weeks).toHaveLength(2);
    expect(p.weeks.every((w) => w.phase === 'consolidate')).toBe(true);
    expect(p.weeks[0].tasks.join(' ')).toMatch(/Prüfungssimulation/);
  });

  it('am Prüfungstag selbst gibt es genau eine Festigungswoche', () => {
    const p = plan({ examDate: '2026-06-10' });
    expect(p.weeks).toHaveLength(1);
    expect(p.weeks[0].phase).toBe('consolidate');
  });
});

describe('buildStudyPlan – Labs und Stunden', () => {
  it('plant kein Lab doppelt und passt die Anzahl an die Wochenstunden an', () => {
    const p = plan({ examDate: '2026-08-30', hoursPerWeek: 10 });
    const ids = p.weeks.flatMap((w) => w.labs.map((x) => x.lab.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(p.weeks[0].labs).toHaveLength(5);
    expect(plan({ examDate: '2026-08-30', hoursPerWeek: 2 }).weeks[0].labs).toHaveLength(1);
    expect(plan({ examDate: '2026-08-30', hoursPerWeek: 1 }).weeks[0].labs).toHaveLength(1);
  });

  it('lässt abgeschlossene Labs im Plan weg', () => {
    const base = plan({ examDate: '2026-08-30' });
    const first = base.weeks[0].labs[0].lab.id;
    const done = plan({ examDate: '2026-08-30', progress: { [first]: { completed: true, completedOn: '2026-06-09' } } });
    expect(done.weeks.flatMap((w) => w.labs.map((x) => x.lab.id))).not.toContain(first);
  });

  it('übernimmt Schwächen aus dem Einstufungstest in die erste Woche', () => {
    const placement = { domains: { ap1: { correct: 3, total: 3 }, ap2_1: { correct: 3, total: 3 }, ap2_2: { correct: 3, total: 3 }, wiso: { correct: 0, total: 3 } } };
    const p = plan({ examDate: '2026-08-30', placement });
    expect(p.weeks[0].labs[0].lab.id).toBe('lab_8'); // Kategorie wiso
  });
});

describe('buildStudyPlan – Werkzeuge', () => {
  it('nimmt Labs ohne Prüfungsbereich nie in den Plan auf', () => {
    for (const examDate of ['2026-08-30', '2026-06-30']) {
      const ids = plan({ examDate, hoursPerWeek: 20 }).weeks.flatMap((w) => w.labs.map((x) => x.lab.id));
      expect(ids).not.toContain('tool_x');
    }
  });
});

describe('buildStudyPlan – Fortschritt und Planstart', () => {
  it('zählt Labs und Lernmix-Tage der Woche aus echten Daten', () => {
    const p = plan({
      examDate: '2026-08-30',
      planStart: '2026-06-08',
      progress: { a: { completed: true, completedOn: '2026-06-09' }, b: { completed: true, completedOn: '2026-06-20' }, c: { completed: false } },
      mixDays: ['2026-06-08', '2026-06-09', '2026-06-10', '2026-06-20']
    });
    expect(p.planStart).toBe('2026-06-08');
    expect(p.weeks[0].isCurrent).toBe(true);
    expect(p.weeks[0].done).toEqual({ labs: 1, mixDays: 3 });
    expect(p.weeks[1].done).toEqual({ labs: 1, mixDays: 1 }); // 15.–21.06. enthält den 20.06.
    expect(p.weeks[1].isCurrent).toBe(false);
  });

  it('rollt weiter: ein abgelaufener oder ungültiger Planstart wird durch heute ersetzt', () => {
    expect(plan({ examDate: '2026-08-30', planStart: '2026-05-01' }).planStart).toBe('2026-06-10');
    expect(plan({ examDate: '2026-08-30', planStart: '' }).planStart).toBe('2026-06-10');
    expect(plan({ examDate: '2026-08-30', planStart: '2026-07-01' }).planStart).toBe('2026-06-10');
  });
});
