import { describe, it, expect } from 'vitest';
import { evaluateBasicDguv } from './basic-dguv-check';

describe('evaluateBasicDguv', () => {
  it('meldet fehlende Eingaben ohne Fehler', () => {
    expect(evaluateBasicDguv({ rPe: '', rIso: ' ', iLeak: '' })).toEqual({
      passed: true,
      message: 'Keine Messdaten eingetragen',
      details: [],
    });
  });

  it('besteht bei Werten innerhalb der Grenzen (Komma als Dezimaltrenner)', () => {
    const res = evaluateBasicDguv({ rPe: '0,2', rIso: '2.5', iLeak: '1' });
    expect(res.passed).toBe(true);
    expect(res.message).toBe('BESTANDEN');
    expect(res.details).toEqual([
      'R_PE: 0.2 Ω (≤ 0.3 Ω) ✅',
      'R_ISO: 2.5 MΩ (≥ 1.0 MΩ) ✅',
      'Ableitstrom: 1 mA (≤ 3.5 mA) ✅',
    ]);
  });

  it('besteht an den Grenzwerten selbst', () => {
    expect(evaluateBasicDguv({ rPe: '0.3', rIso: '1.0', iLeak: '3.5' }).passed).toBe(true);
  });

  it('fällt bei Grenzwertverletzung durch', () => {
    const res = evaluateBasicDguv({ rPe: '0.45', rIso: '0.5', iLeak: '4' });
    expect(res.passed).toBe(false);
    expect(res.message).toBe('NICHT BESTANDEN');
    expect(res.details).toEqual([
      'R_PE: 0.45 Ω (> 0.3 Ω Grenzwert) ❌',
      'R_ISO: 0.5 MΩ (< 1.0 MΩ Grenzwert) ❌',
      'Ableitstrom: 4 mA (> 3.5 mA Grenzwert) ❌',
    ]);
  });

  it('behandelt ungültige Zahlen als nicht bestanden', () => {
    const res = evaluateBasicDguv({ rPe: 'abc', rIso: '', iLeak: 'x' });
    expect(res.passed).toBe(false);
    expect(res.details).toEqual(['R_PE: Ungültiger Wert', 'I_leak: Ungültiger Wert']);
  });
});
