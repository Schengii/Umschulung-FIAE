import { describe, it, expect } from 'vitest';
import { getStratosphereBalloonTelemetry } from '../utils/stratosphereBalloon';

describe('Stratosphere Balloon IoT Mesh Relay Engine', () => {
  it('reads balloon altitude and coverage radius in 20km stratosphere', () => {
    const balloon = getStratosphereBalloonTelemetry('HAPS-AMZ-STRATO-#03');
    expect(balloon.altitudeMeters).toBeGreaterThan(20000);
    expect(balloon.coverageRadiusKm).toBeGreaterThan(400);
    expect(balloon.solarPowerWatts).toBeGreaterThan(500);
    expect(balloon.isMeshRelayActive).toBe(true);
  });
});
