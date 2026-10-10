import { describe, it, expect } from 'vitest';
import {
  calculateStackedMacroScenarios,
  PRESET_MACRO_SHOCK_FACTORS
} from '../scenarioStackingUtils';

describe('scenarioStackingUtils', () => {
  it('returns unchanged portfolio when no factors are active', () => {
    const res = calculateStackedMacroScenarios([], 100000);
    expect(res.netPortfolioDropPct).toBe(0);
    expect(res.portfolioLossEur).toBe(0);
    expect(res.portfolioNewValueEur).toBe(100000);
    expect(res.isMarginCallTriggered).toBe(false);
  });

  it('correctly stacks rate hike and tech correction', () => {
    const rateHike = PRESET_MACRO_SHOCK_FACTORS.find(f => f.id === 'rate-hike-200bps')!;
    const techDrop = PRESET_MACRO_SHOCK_FACTORS.find(f => f.id === 'tech-valuation-reset')!;

    const res = calculateStackedMacroScenarios([rateHike, techDrop], 100000);

    expect(res.activeFactorIds).toHaveLength(2);
    // Combined equity shock is more severe than a single shock
    expect(res.totalEquityShockPct).toBeLessThan(-30);
    expect(res.portfolioLossEur).toBeGreaterThan(15000);
    expect(res.estimatedRecoveryMonths).toBeGreaterThanOrEqual(12);
  });

  it('triggers margin call alert when cumulative shock exceeds 35%', () => {
    // Stacking 3 severe crises
    const rateHike = PRESET_MACRO_SHOCK_FACTORS[0];
    const techDrop = PRESET_MACRO_SHOCK_FACTORS[1];
    const liquidityCrunch = PRESET_MACRO_SHOCK_FACTORS[4];

    const res = calculateStackedMacroScenarios([rateHike, techDrop, liquidityCrunch], 100000, {
      equityPct: 80,
      cryptoPct: 10,
      bondPct: 5,
      realEstatePct: 5,
      cashPct: 0
    });

    expect(res.netPortfolioDropPct).toBeGreaterThan(35);
    expect(res.isMarginCallTriggered).toBe(true);
  });
});
