import { describe, it, expect } from 'vitest';
import { getGroundRoverTelemetry } from '../utils/groundRoverSwarm';

describe('Autonomous Ground Rover Swarm Fleet Engine', () => {
  it('reads rover telemetry and validates curbside delivery safety', () => {
    const rover = getGroundRoverTelemetry('SCOUT-ROVER-#07');
    expect(rover.roverId).toBe('SCOUT-ROVER-#07');
    expect(rover.isLidarSafe).toBe(true);
    expect(rover.speedKmh).toBeLessThan(10);
    expect(rover.compartmentPin).toBeDefined();
    expect(rover.batteryPercent).toBeGreaterThan(50);
  });
});
