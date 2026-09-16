import { describe, it, expect } from 'vitest';
import { calculateNwa, normalizeWeights, generateNwaMarkdownReport, DEFAULT_NWA_CRITERIA, DEFAULT_NWA_OPTIONS } from './nwaEngine';

describe('nwaEngine (IHK Nutzwertanalyse)', () => {
  it('normalisiert Kriteriengewichte korrekt auf 100%', () => {
    const unnormalized = [
      { id: 'c1', weight: 30 },
      { id: 'c2', weight: 30 }
    ];
    const normalized = normalizeWeights(unnormalized);
    expect(normalized[0].normalizedWeight).toBe(50);
    expect(normalized[1].normalizedWeight).toBe(50);
  });

  it('berechnet Nutzwert und erkennt K.O.-Kriterien', () => {
    const result = calculateNwa({
      criteria: DEFAULT_NWA_CRITERIA,
      options: DEFAULT_NWA_OPTIONS
    });

    expect(result.isWeightValid).toBe(true);
    expect(result.results.length).toBe(3);

    // Option C hat Security Score 3 bei minScore 6 (K.O.)
    const optionC = result.results.find(o => o.id === 'opt_legacy_upgrade');
    expect(optionC.isDisqualified).toBe(true);
    expect(optionC.koViolations.length).toBeGreaterThan(0);

    // Beste Option sollte Option A oder B sein, niemals C
    expect(result.bestOption).not.toBeNull();
    expect(result.bestOption.id).not.toBe('opt_legacy_upgrade');
    expect(result.bestOption.finalScore).toBeGreaterThan(7.0);
  });

  it('generiert formellen Markdown-Projektbericht', () => {
    const analysis = calculateNwa({
      criteria: DEFAULT_NWA_CRITERIA,
      options: DEFAULT_NWA_OPTIONS
    });
    const report = generateNwaMarkdownReport(analysis);
    expect(report).toContain('### IHK Entscheidungsmatrix: Nutzwertanalyse (NWA)');
    expect(report).toContain('🏆 Empfehlung (Rang 1)');
    expect(report).toContain('❌ Disqualifiziert (K.O.)');
  });
});
