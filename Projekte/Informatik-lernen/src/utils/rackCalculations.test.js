import { describe, it, expect } from 'vitest';
import { RACK_PRESET_DEVICES, calculateRackMetrics } from './rackCalculations';

describe('rackCalculations', () => {
  it('calculates rack U utilization correctly', () => {
    const installed = [
      RACK_PRESET_DEVICES[0], // 1U server (250W)
      RACK_PRESET_DEVICES[1], // 2U GPU server (650W)
      RACK_PRESET_DEVICES[2], // 1U switch (120W)
      RACK_PRESET_DEVICES[6]  // 3U UPS (60W, 1440Wh)
    ];

    const metrics = calculateRackMetrics(installed, 42);
    expect(metrics.usedU).toBe(7);
    expect(metrics.freeU).toBe(35);
    expect(metrics.totalWatts).toBe(1080);
    expect(metrics.btuPerHour).toBeGreaterThan(3000);
    expect(metrics.upsRuntimeMinutes).toBeGreaterThan(0);
  });
});
