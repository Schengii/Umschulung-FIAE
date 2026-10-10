import { describe, it, expect } from 'vitest';
import { 
  calculateOverallNeed, 
  evaluateBsiCompliance, 
  exportBsiReportMarkdown,
  BSI_MODULES,
  DEFAULT_ASSETS 
} from './bsiGrundschutzEngine';

describe('bsiGrundschutzEngine', () => {
  it('ermittelt den Gesamtschutzbedarf korrekt nach dem Maximum-Prinzip', () => {
    expect(calculateOverallNeed({ confidentiality: 'normal', integrity: 'normal', availability: 'normal' })).toBe('normal');
    expect(calculateOverallNeed({ confidentiality: 'normal', integrity: 'high', availability: 'normal' })).toBe('high');
    expect(calculateOverallNeed({ confidentiality: 'normal', integrity: 'high', availability: 'very_high' })).toBe('very_high');
  });

  it('berechnet Compliance-Scores und prüft Basisanforderungen', () => {
    const result = evaluateBsiCompliance(BSI_MODULES);
    expect(result.totalMeasures).toBeGreaterThan(10);
    expect(result.complianceScore).toBeGreaterThanOrEqual(0);
    expect(result.complianceScore).toBeLessThanOrEqual(100);
    expect(['excellent', 'adequate', 'deficient']).toContain(result.auditStatus);
  });

  it('generiert einen vollständigen IHK-tauglichen Markdown-Bericht', () => {
    const md = exportBsiReportMarkdown({
      assets: DEFAULT_ASSETS,
      modules: BSI_MODULES
    }, 'Testprojekt DMZ');

    expect(md).toContain('# BSI IT-Grundschutz & NIS-2 Sicherheitsbericht');
    expect(md).toContain('Schutzbedarfsfeststellung (CIA-Klassifizierung)');
    expect(md).toContain('OPS.1.1.4');
    expect(md).toContain('Testprojekt DMZ');
  });
});
