import { describe, it, expect } from 'vitest';
import {
  DEFAULT_DPIA_RISKS,
  IHK_DPIA_SCENARIOS,
  evaluateDpiaThreshold,
  calculateRiskScores,
  generateDpiaMarkdownDoc
} from './ihkDpiaEngine';

describe('ihkDpiaEngine (Art. 35 DSGVO)', () => {
  it('erkennt korrekt, wann eine DSFA zwingend erforderlich ist (>= 2 Kriterien)', () => {
    // 0 Kriterien
    const res0 = evaluateDpiaThreshold([]);
    expect(res0.isDpiaRequired).toBe(false);
    expect(res0.selectedCount).toBe(0);
    expect(res0.thresholdSummary).toContain('Keine DSFA erforderlich');

    // 1 Kriterium (Grenzfall)
    const res1 = evaluateDpiaThreshold(['crit_eval_scoring']);
    expect(res1.isDpiaRequired).toBe(false);
    expect(res1.selectedCount).toBe(1);
    expect(res1.thresholdSummary).toContain('Grenzfall');

    // 2 Kriterien (Pflicht)
    const res2 = evaluateDpiaThreshold(['crit_eval_scoring', 'crit_special_categories']);
    expect(res2.isDpiaRequired).toBe(true);
    expect(res2.selectedCount).toBe(2);
    expect(res2.score).toBe(4);
    expect(res2.thresholdSummary).toContain('zwingend erforderlich');
  });

  it('berechnet Risikowerte und Reduktionsprozente vor und nach Abhilfemaßnahmen', () => {
    const scores = calculateRiskScores(DEFAULT_DPIA_RISKS);
    expect(scores.length).toBe(DEFAULT_DPIA_RISKS.length);

    scores.forEach(s => {
      expect(s.rawScore).toBe(s.impact * s.likelihood);
      expect(s.residualScore).toBe(s.residualImpact * s.residualLikelihood);
      expect(s.residualScore).toBeLessThan(s.rawScore);
      expect(s.reductionPercent).toBeGreaterThan(0);
    });
  });

  it('erzeugt ein vollständiges, formatiertes IHK-Markdown-Dokument', () => {
    const md = generateDpiaMarkdownDoc('CI/CD Pipeline mit Passkey Authentifizierung', [
      'crit_eval_scoring',
      'crit_special_categories'
    ]);

    expect(md).toContain('# Datenschutz-Folgenabschätzung (DSFA / DPIA) nach Art. 35 DSGVO');
    expect(md).toContain('CI/CD Pipeline mit Passkey Authentifizierung');
    expect(md).toContain('Schwellenwertanalyse');
    expect(md).toContain('DSFA verpflichtend durchgeführt');
    expect(md).toContain('| Kategorie / Risiko |');
    expect(md).toContain('Art. 36 DSGVO');
  });

  it('validiert die IHK-Prüfungsszenarien und deren Kriterien & Risiken', () => {
    expect(IHK_DPIA_SCENARIOS.length).toBeGreaterThanOrEqual(3);

    IHK_DPIA_SCENARIOS.forEach(sc => {
      expect(sc.id).toBeDefined();
      expect(sc.title).toBeDefined();
      expect(sc.criteria.length).toBeGreaterThan(0);
      expect(sc.risks.length).toBeGreaterThan(0);

      const thresh = evaluateDpiaThreshold(sc.criteria);
      expect(thresh.isDpiaRequired).toBe(true);

      const calculated = calculateRiskScores(sc.risks);
      calculated.forEach(r => {
        expect(r.rawScore).toBeGreaterThan(0);
        expect(r.residualScore).toBeLessThanOrEqual(r.rawScore);
      });
    });
  });
});
