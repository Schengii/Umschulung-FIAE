import { describe, it, expect } from 'vitest';
import { calculateLandedCost, CUSTOMS_DESTINATIONS } from '../utils/crossBorderCustoms';
import { state } from '../store';

describe('Cross-Border Customs & Global Tariffs Engine', () => {
  it('calculates DDP landed costs and customs tariffs across destinations', () => {
    const product = state.products[0];
    const usLanded = calculateLandedCost(product, 'US');

    expect(usLanded.destination.code).toBe('US');
    expect(usLanded.totalLandedCostEur).toBeGreaterThan(product.price);
    expect(usLanded.isDdpGuaranteed).toBe(true);
    expect(usLanded.hsCode).toContain('HS-');

    const chLanded = calculateLandedCost(product, 'CH');
    expect(chLanded.destination.vatRatePercent).toBe(8.1);
    expect(Object.keys(CUSTOMS_DESTINATIONS).length).toBe(6);
  });
});
