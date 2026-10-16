import { describe, it, expect } from 'vitest';
import { simulateDynamicPricing } from '../utils/dynamicPricing';
import { state } from '../store';

describe('Marketplace Dynamic Pricing ML Simulator', () => {
  it('calculates price elasticity, profit margins and buy-box probabilities', () => {
    const product = state.products[0];
    const buyboxSim = simulateDynamicPricing(product, 'buybox');
    expect(buyboxSim.strategy).toBe('buybox');
    expect(buyboxSim.buyBoxWinProbabilityPercent).toBeGreaterThan(90);
    expect(buyboxSim.suggestedPrice).toBeLessThanOrEqual(buyboxSim.competitorPrice);

    const marginSim = simulateDynamicPricing(product, 'margin');
    expect(marginSim.strategy).toBe('margin');
    expect(marginSim.profitMarginPercent).toBeGreaterThan(buyboxSim.profitMarginPercent);
  });
});
