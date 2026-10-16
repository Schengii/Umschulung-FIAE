import { describe, it, expect } from 'vitest';
import { calculateFitRecommendation } from '../components/smartFitting';

describe('Smart-Fitting & Computer Vision Größen-KI', () => {
  it('returns valid recommendations for wrist, headset, and room categories', () => {
    const wristRec = calculateFitRecommendation('wrist');
    expect(wristRec.category).toBe('wrist');
    expect(wristRec.matchAccuracyPercent).toBeGreaterThan(95);
    expect(wristRec.recommendedSize).toContain('mm');

    const headsetRec = calculateFitRecommendation('headset');
    expect(headsetRec.category).toBe('headset');
    expect(headsetRec.recommendedSize).toContain('Größe');

    const roomRec = calculateFitRecommendation('room');
    expect(roomRec.category).toBe('room');
    expect(roomRec.recommendedSize).toContain('Monitor');
  });
});
