import { describe, it, expect } from 'vitest';
import { getLightfieldConfig } from '../utils/lightfieldDisplay';

describe('Holographic 3D Lightfield Display Engine', () => {
  it('computes 16 synthetic lightfield viewpoints for glasses-free 3D', () => {
    const lf = getLightfieldConfig();
    expect(lf.viewsCount).toBe(16);
    expect(lf.isGlassesFree3D).toBe(true);
    expect(lf.focalDepthMm).toBeGreaterThan(300);
    expect(lf.depthPlanesCount).toBeGreaterThan(4);
  });
});
