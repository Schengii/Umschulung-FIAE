import { describe, it, expect } from 'vitest';
import { 
  calculateRiskItem, 
  analyzeProjectRisks, 
  exportRiskAnalysisMarkdown, 
  DEFAULT_IHK_RISKS 
} from './ihkRiskAnalysisEngine';

describe('ihkRiskAnalysisEngine', () => {
  it('berechnet die Risikoprioritätszahl (RPZ) und Stufe korrekt', () => {
    const lowRisk = calculateRiskItem({ probability: 2, impact: 2 });
    expect(lowRisk.rpz).toBe(4);
    expect(lowRisk.levelKey).toBe('LOW');

    const medRisk = calculateRiskItem({ probability: 3, impact: 4 });
    expect(medRisk.rpz).toBe(12);
    expect(medRisk.levelKey).toBe('MEDIUM');

    const highRisk = calculateRiskItem({ probability: 4, impact: 5 });
    expect(highRisk.rpz).toBe(20);
    expect(highRisk.levelKey).toBe('HIGH');
  });

  it('analysiert Standard-IHK-Projektrisiken auf IHK-Konformität', () => {
    const analysis = analyzeProjectRisks(DEFAULT_IHK_RISKS);
    expect(analysis.totalCount).toBe(4);
    expect(analysis.averageRpz).toBeGreaterThan(0);
    expect(analysis.maxRpz).toBeGreaterThanOrEqual(12);
    expect(analysis.ihkCompliance.isCompliant).toBe(true);
    expect(analysis.ihkCompliance.feedback).toContain('IHK-konform');
  });

  it('erkennt unvollständige Risikoanalysen', () => {
    const incompleteRisks = [
      { id: '1', title: 'Test Risk', probability: 2, impact: 2, preventiveMeasure: '', contingencyPlan: '' }
    ];
    const analysis = analyzeProjectRisks(incompleteRisks);
    expect(analysis.ihkCompliance.isCompliant).toBe(false);
    expect(analysis.ihkCompliance.feedback).toContain('Warnung');
  });

  it('exportiert formatiertes Markdown für den IHK-Abschlussbericht', () => {
    const analysis = analyzeProjectRisks(DEFAULT_IHK_RISKS);
    const md = exportRiskAnalysisMarkdown(analysis, 'E-Commerce Microservices');
    expect(md).toContain('# Risikoanalyse & Risikomanagement');
    expect(md).toContain('E-Commerce Microservices');
    expect(md).toContain('DIN EN 31010');
    expect(md).toContain('| R1 |');
    expect(md).toContain('| R4 |');
  });
});
