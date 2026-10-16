import { describe, it, expect } from 'vitest';
import { getHyperloopPodTelemetry } from '../utils/hyperloopLogistics';

describe('Hyperloop Express Tube Logistics Engine', () => {
  it('reads pod telemetry and verifies vacuum speed and low pressure', () => {
    const pod = getHyperloopPodTelemetry('HYPER-POD-#104');
    expect(pod.speedKmh).toBeGreaterThan(900);
    expect(pod.vacuumPressureAtm).toBeLessThan(0.01);
    expect(pod.transitDurationMinutes).toBeLessThan(20);
    expect(pod.isVacuumSealed).toBe(true);
  });
});
