import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const { countErrorsPerFile, compare } = createRequire(import.meta.url)('./check_strict_types.js');

describe('check_strict_types', () => {
    it('zählt tsc-Fehler je Datei und normalisiert Backslashes', () => {
        const output = [
            "assets/js/a.js(3,5): error TS7006: Parameter 'x' implicitly has an 'any' type.",
            "assets/js/a.js(9,1): error TS7006: Parameter 'y' implicitly has an 'any' type.",
            "assets\\js\\b.js(1,1): error TS7034: Variable 'z' implicitly has type 'any'.",
            'Found 3 errors.',
        ].join('\n');
        expect(countErrorsPerFile(output)).toEqual({ 'assets/js/a.js': 2, 'assets/js/b.js': 1 });
    });

    it('meldet mehr Fehler als erlaubt, auch in Dateien ohne Baseline-Eintrag', () => {
        const { worse, better } = compare({ 'a.js': 3, 'neu.js': 1 }, { 'a.js': 2 });
        expect(worse).toHaveLength(2);
        expect(better).toEqual([]);
    });

    it('meldet Verbesserungen, damit die Baseline nachgezogen wird', () => {
        const { worse, better } = compare({ 'a.js': 1 }, { 'a.js': 2, 'b.js': 4 });
        expect(worse).toEqual([]);
        expect(better).toHaveLength(2);
    });

    it('akzeptiert eine unveränderte Lage', () => {
        expect(compare({ 'a.js': 2 }, { 'a.js': 2 })).toEqual({ worse: [], better: [] });
    });
});
