import { describe, it, expect } from 'vitest';
import { ServiceMeshSimulator } from './serviceMeshEngine';

describe('Service Mesh mTLS & Envoy Engine', () => {
  it('routes requests with mTLS validation and SPIFFE identities', () => {
    const mesh = new ServiceMeshSimulator();
    mesh.mtlsMode = 'STRICT';

    const res = mesh.routeRequest(1);
    expect(res.mtlsStatus).toBe('ESTABLISHED');
    expect(res.clientSpiffe).toContain('frontend-service');
    expect(res.targetSpiffe).toContain('order-service');
  });

  it('adjusts canary traffic weights and generates valid Istio VirtualService YAML', () => {
    const mesh = new ServiceMeshSimulator();
    mesh.setCanaryWeights(80);

    expect(mesh.canaryWeightV1).toBe(80);
    expect(mesh.canaryWeightV2).toBe(20);

    const yaml = mesh.generateVirtualServiceYaml();
    expect(yaml).toContain('weight: 80');
    expect(yaml).toContain('weight: 20');
    expect(yaml).toContain('mode: STRICT');
  });
});
