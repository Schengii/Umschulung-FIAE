import { describe, it, expect } from 'vitest';
import { 
  REDIS_CACHING_STRATEGIES, 
  CIRCUIT_BREAKER_STATES, 
  OPENTELEMETRY_TRACES, 
  K8S_CNI_PACKET_STEPS 
} from './enterpriseLabsData';

describe('Enterprise Labs: Redis Caching, Circuit Breaker & Kubernetes CNI', () => {
  it('should validate Redis Caching strategies and flow steps', () => {
    expect(REDIS_CACHING_STRATEGIES.length).toBeGreaterThanOrEqual(3);
    REDIS_CACHING_STRATEGIES.forEach(s => {
      expect(s.id).toBeDefined();
      expect(s.flow.length).toBeGreaterThan(0);
      expect(s.hitRatio).toBeDefined();
    });
  });

  it('should validate Circuit Breaker state machine (Closed, Open, Half-Open)', () => {
    expect(CIRCUIT_BREAKER_STATES.length).toBe(3);
    const states = CIRCUIT_BREAKER_STATES.map(s => s.state);
    expect(states).toContain('CLOSED');
    expect(states).toContain('OPEN');
    expect(states).toContain('HALF-OPEN');
  });

  it('should validate OpenTelemetry Distributed Tracing spans', () => {
    expect(OPENTELEMETRY_TRACES.length).toBeGreaterThanOrEqual(1);
    const trace = OPENTELEMETRY_TRACES[0];
    expect(trace.spans.length).toBe(5);
    const sumSpans = trace.spans.reduce((sum, s) => sum + s.durationMs, 0);
    expect(sumSpans).toBeGreaterThan(0);
  });

  it('should validate Kubernetes CNI VXLAN 5-step packet traversal (UDP Port 4789)', () => {
    expect(K8S_CNI_PACKET_STEPS.length).toBe(5);
    expect(K8S_CNI_PACKET_STEPS[1].packet).toContain('4789');
    expect(K8S_CNI_PACKET_STEPS[0].location).toContain('Pod A');
    expect(K8S_CNI_PACKET_STEPS[4].location).toContain('Pod B');
  });
});
