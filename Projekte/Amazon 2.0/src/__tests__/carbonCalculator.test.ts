import { describe, it, expect } from 'vitest';
import { calculateProductCarbonFootprint, OFFSET_PROJECTS } from '../utils/carbonCalculator';
import { state } from '../store';

describe('Automated Carbon Footprint & Offset Engine', () => {
  it('calculates lifecycle emissions and project offsets for products', () => {
    const product = state.products[0];
    const c = calculateProductCarbonFootprint(product);

    expect(c.totalKgCO2).toBeGreaterThan(0);
    expect(c.manufacturingKg).toBeGreaterThan(0);
    expect(c.treesEquivalent).toBeGreaterThan(0);
    expect(c.offsetCostEur).toBeGreaterThan(0);
    expect(['A+', 'A', 'B', 'C', 'D']).toContain(c.ecoScoreGrade);
    expect(OFFSET_PROJECTS.length).toBe(3);
  });
});
