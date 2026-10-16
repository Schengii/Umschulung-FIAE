import { describe, it, expect } from 'vitest';
import { getEyeTrackingConfig, saveEyeTrackingConfig, simulateGazeCalibration } from '../utils/eyeTracking';

describe('Neuro-Adaptive Eye-Tracking Engine', () => {
  it('manages gaze configuration and completes 9-point calibration', async () => {
    const cfg = getEyeTrackingConfig();
    expect(cfg.dwellTimeMs).toBeGreaterThan(500);

    cfg.dwellTimeMs = 1400;
    saveEyeTrackingConfig(cfg);
    expect(getEyeTrackingConfig().dwellTimeMs).toBe(1400);

    const accuracy = await simulateGazeCalibration();
    expect(accuracy).toBeGreaterThan(90);
    expect(getEyeTrackingConfig().isEnabled).toBe(true);
  });
});
