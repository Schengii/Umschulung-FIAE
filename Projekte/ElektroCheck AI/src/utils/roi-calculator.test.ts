import { describe, it, expect } from 'vitest';
import { calculateRoi } from './roi-calculator';

describe('roi-calculator', () => {
  it('Test 1: Highly economical repair (<30%)', () => {
    const res1 = calculateRoi({
      materialCost: 25,
      laborHours: 1.0,
      hourlyRate: 65,
      replacementPrice: 500,
    });
    // Total repair: 25 + 65 = 90 Euro. Ratio: 90 / 500 = 18%
    expect(res1.totalRepairCost === 90, 'Test 1 failed: Total repair cost should be 90 €').toBe(true);
    expect(res1.recommendation === 'DRINGEND_REPARIEREN', 'Test 1 failed: Recommendation should be DRINGEND_REPARIEREN').toBe(true);
  });

  it('Test 2: Borderline repair (60%)', () => {
    const res2 = calculateRoi({
      materialCost: 150,
      laborHours: 2.0,
      hourlyRate: 75,
      replacementPrice: 500,
    });
    // Total repair: 150 + 150 = 300 Euro. Ratio: 300 / 500 = 60%
    expect(res2.recommendation === 'GRENZFALL', 'Test 2 failed: Recommendation should be GRENZFALL').toBe(true);
  });

  it('Test 3: Uneconomical repair (>75%)', () => {
    const res3 = calculateRoi({
      materialCost: 350,
      laborHours: 2.0,
      hourlyRate: 80,
      replacementPrice: 450,
    });
    // Total repair: 350 + 160 = 510 Euro. Ratio: 510 / 450 = 113.3%
    expect(res3.recommendation === 'NEUKAUF_EMPFOHLEN', 'Test 3 failed: Recommendation should be NEUKAUF_EMPFOHLEN').toBe(true);
  });

});
