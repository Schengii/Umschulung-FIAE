import { describe, it, expect } from 'vitest';
import { getGeothermalDatacenterStatus } from '../utils/geothermalCloud';

describe('Geothermal & Volcanic Datacenter Cloud Engine', () => {
  it('reads geothermal datacenter status and verifies 100% clean power', () => {
    const geo = getGeothermalDatacenterStatus();
    expect(geo.datacenterRegion).toContain('Reykjanes');
    expect(geo.geothermalEnergySharePercent).toBe(100);
    expect(geo.pueEfficiencyScore).toBeLessThan(1.2);
    expect(geo.isZeroEmissionCertified).toBe(true);
  });
});
