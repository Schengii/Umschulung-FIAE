import { describe, it, expect } from 'vitest';
import stats from './generate_site_stats.js';

const { countCommitsByDay, validateStats } = stats;

const valid = () => ({
    generatedAt: '2026-11-18',
    commits: { total: 3, byDay: { '2026-11-16': 1, '2026-11-17': 2 } },
    pages: 28,
    adrs: 15,
    tests: { unit: 800, files: 70 },
    coverage: { statements: 81, branches: 73, functions: 83, lines: 82 },
});

describe('countCommitsByDay', () => {
    it('zählt je Tag und sortiert aufsteigend', () => {
        const log = '2026-11-17\n2026-11-16\n2026-11-17\n';
        expect(Object.entries(countCommitsByDay(log))).toEqual([
            ['2026-11-16', 1],
            ['2026-11-17', 2],
        ]);
    });

    it('ignoriert leere und ungültige Zeilen', () => {
        expect(countCommitsByDay('\nabc\n2026-11-17\r\n')).toEqual({ '2026-11-17': 1 });
    });
});

describe('validateStats', () => {
    it('akzeptiert eine gültige Datei, auch ohne Test- und Coverage-Werte', () => {
        expect(validateStats(valid())).toEqual([]);
        expect(validateStats({ ...valid(), tests: null, coverage: null })).toEqual([]);
    });

    it('meldet eine falsche Summe', () => {
        const s = valid();
        s.commits.total = 99;
        expect(validateStats(s).join()).toContain('Summe');
    });

    it('meldet ungültige Tage und Prozentwerte', () => {
        const s = valid();
        s.commits.byDay['gestern'] = 1;
        s.coverage.lines = 120;
        const errors = validateStats(s).join();
        expect(errors).toContain('gestern');
        expect(errors).toContain('coverage.lines');
    });

    it('meldet fehlende Pflichtfelder', () => {
        expect(validateStats({}).length).toBeGreaterThan(0);
        expect(validateStats(null)).toEqual(['Datei ist kein Objekt']);
    });
});
