import { describe, it, expect } from 'vitest';
import {
  routeRequest,
  simulateTrafficDistribution,
  generateGatewayApiYaml
} from './k8sGatewayApiEngine';

describe('k8sGatewayApiEngine', () => {
  const sampleConfig = {
    name: 'order-route',
    gatewayName: 'main-edge-gateway',
    hostnames: ['api.store.de'],
    rules: [
      {
        matchesPath: ['/api/v1/orders'],
        backendRefs: [
          { name: 'order-service-v1', port: 8080, weight: 80 },
          { name: 'order-service-v2-canary', port: 8080, weight: 20 }
        ]
      }
    ]
  };

  it('routes to stable and canary backend deterministically by weight threshold', () => {
    // With 80/20 weight, randomSeed = 0.5 (< 0.8) maps to v1
    const stableRes = routeRequest({ path: '/api/v1/orders', headers: {} }, sampleConfig, 0.5);
    expect(stableRes.selectedBackend).toBe('order-service-v1');
    expect(stableRes.isCanary).toBe(false);

    // randomSeed = 0.95 (> 0.8) maps to v2-canary
    const canaryRes = routeRequest({ path: '/api/v1/orders', headers: {} }, sampleConfig, 0.95);
    expect(canaryRes.selectedBackend).toBe('order-service-v2-canary');
    expect(canaryRes.isCanary).toBe(true);
  });

  it('simulates statistically accurate batch traffic splitting', () => {
    const distribution = simulateTrafficDistribution(1000, { path: '/api/v1/orders', headers: {} }, sampleConfig);

    expect(distribution['order-service-v1'].percent).toBeGreaterThan(70);
    expect(distribution['order-service-v1'].percent).toBeLessThan(90);
    expect(distribution['order-service-v2-canary'].percent).toBeGreaterThan(10);
    expect(distribution['order-service-v2-canary'].percent).toBeLessThan(30);
  });

  it('matches headers with priority over regular fallback rules', () => {
    const configWithHeader = {
      name: 'beta-route',
      gatewayName: 'main-edge-gateway',
      hostnames: ['api.store.de'],
      rules: [
        {
          matchesHeaders: [{ name: 'X-Beta-Tester', type: 'Exact', value: 'true' }],
          backendRefs: [{ name: 'order-service-v2-beta', port: 8080, weight: 100 }]
        },
        {
          backendRefs: [{ name: 'order-service-v1', port: 8080, weight: 100 }]
        }
      ]
    };

    const betaRes = routeRequest({ path: '/', headers: { 'X-Beta-Tester': 'true' } }, configWithHeader, 0.5);
    expect(betaRes.selectedBackend).toBe('order-service-v2-beta');

    const normalRes = routeRequest({ path: '/', headers: {} }, configWithHeader, 0.5);
    expect(normalRes.selectedBackend).toBe('order-service-v1');
  });

  it('generates valid Kubernetes Gateway API YAML manifest', () => {
    const yaml = generateGatewayApiYaml(sampleConfig);
    expect(yaml).toContain('kind: Gateway');
    expect(yaml).toContain('kind: HTTPRoute');
    expect(yaml).toContain('order-service-v2-canary');
    expect(yaml).toContain('gateway.networking.k8s.io/v1');
  });
});
