import { describe, it, expect } from 'vitest';
import { readFacialEmotionTelemetry } from '../utils/facialEmotionTracker';

describe('Facial Emotion & Attention Heatmap AI Engine', () => {
  it('reads micro-expressions and verifies local on-device privacy', () => {
    const emo = readFacialEmotionTelemetry();
    expect(emo.isWebcamPrivacyLocal).toBe(true);
    expect(emo.confidencePercent).toBeGreaterThan(80);
    expect(emo.valencePositiveScore).toBeGreaterThan(50);
    expect(emo.smartAdvice).toBeDefined();
  });
});
