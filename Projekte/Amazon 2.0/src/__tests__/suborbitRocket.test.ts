import { describe, it, expect } from 'vitest';
import { getRocketFlightTelemetry } from '../utils/suborbitRocket';

describe('Sub-Orbital Cargo Rocket Logistics Engine', () => {
  it('reads hypersonic rocket telemetry and verifies 45-minute global transit', () => {
    const rocket = getRocketFlightTelemetry('STARSHIP-CARGO-MK2');
    expect(rocket.speedMach).toBeGreaterThan(15);
    expect(rocket.flightDurationMinutes).toBeLessThan(60);
    expect(rocket.apogeeAltitudeKm).toBeGreaterThan(100);
    expect(rocket.isMHDShieldActive).toBe(true);
  });
});
