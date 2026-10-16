import { describe, it, expect } from 'vitest';
import { getRegionalSolarGridStatus } from '../utils/solarGridLogistics';

describe('AI Smart Energy Grid & Solar Logistics Engine', () => {
  it('reads regional solar peak surplus and computes eco-savings', () => {
    const status = getRegionalSolarGridStatus();
    expect(status.greenEnergySharePercent).toBeGreaterThan(80);
    expect(status.solarSurplusMegawatts).toBeGreaterThan(0);
    expect(status.ecoDiscountPercent).toBeGreaterThan(0);
    expect(status.co2SavingsKg).toBeGreaterThan(0);
    expect(status.bestEcoDeliverySlot).toContain('Solar');
  });
});
