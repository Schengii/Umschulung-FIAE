import { describe, it, expect } from 'vitest';
import { getExoskeletonProfile } from '../utils/exoskeletonErgo';

describe('Bionic Exoskeleton Ergonomics Power Assist Engine', () => {
  it('reads bionic suit ergonomics profile and verifies lift support', () => {
    const exo = getExoskeletonProfile();
    expect(exo.maxLiftAssistKg).toBe(35);
    expect(exo.spineCompressionReliefPercent).toBeGreaterThan(50);
    expect(exo.batteryLifeHours).toBeGreaterThan(5);
    expect(exo.smartIoTHapticFeedback).toBe(true);
  });
});
