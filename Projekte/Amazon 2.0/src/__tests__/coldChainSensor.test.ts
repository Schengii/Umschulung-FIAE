import { describe, it, expect } from 'vitest';
import { getColdChainTelemetry } from '../utils/coldChainSensor';

describe('Cold-Chain & IoT Sensor Telemetry Engine', () => {
  it('reads sensor metrics and validates unbroken temperature logging', () => {
    const telemetry = getColdChainTelemetry('TEST-COLD-01');
    expect(telemetry.shipmentId).toBe('TEST-COLD-01');
    expect(telemetry.isColdChainUnbroken).toBe(true);
    expect(telemetry.tamperSealIntact).toBe(true);
    expect(telemetry.tempHistory.length).toBeGreaterThan(0);
    expect(telemetry.currentTempCelsius).toBeLessThan(6.0);
  });
});
