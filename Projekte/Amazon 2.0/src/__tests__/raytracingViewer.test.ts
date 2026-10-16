import { describe, it, expect } from 'vitest';
import type { RaytraceSettings } from '../components/raytracingViewer';

describe('WebGPU 3D-Shader Raytracing Studio', () => {
  it('validates raytrace configuration settings and bounds', () => {
    const settings: RaytraceSettings = {
      environment: 'neon',
      metallic: 0.9,
      roughness: 0.15,
      rayBounces: 8,
      ambientOcclusion: true,
      bloom: true,
      lightAngle: 120,
    };

    expect(settings.environment).toBe('neon');
    expect(settings.metallic).toBeGreaterThanOrEqual(0);
    expect(settings.metallic).toBeLessThanOrEqual(1);
    expect(settings.roughness).toBeGreaterThanOrEqual(0);
    expect(settings.rayBounces).toBe(8);
  });
});
