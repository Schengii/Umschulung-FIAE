import { describe, it, expect } from 'vitest';
import { getSimulatedDNAReport } from '../utils/dnaNutrition';

describe('DNA & Biomarker Nutrition Configurator Engine', () => {
  it('generates personalized supplement formula based on biomarkers', () => {
    const report = getSimulatedDNAReport();
    expect(report.reportId).toContain('DNA-');
    expect(report.ingredients.length).toBeGreaterThan(0);
    expect(report.priceEur).toBeGreaterThan(0);
    expect(report.customFormulaTitle).toContain('DNA');
  });
});
