import { describe, it, expect } from 'vitest';
import { PromqlAlertEngine } from './promqlAlertEngine';

describe('Prometheus PromQL Alert Engine', () => {
  it('evaluates threshold conditions and flags firing status accurately', () => {
    const engine = new PromqlAlertEngine();

    // 245ms > 200ms -> FIRING
    const firingAlert = engine.evaluateAlert({
      alertName: 'HighApiLatency',
      metricType: 'LATENCY',
      threshold: 200
    });
    expect(firingAlert.isFiring).toBe(true);
    expect(firingAlert.status).toBe('FIRING');
    expect(firingAlert.promqlExpr).toContain('histogram_quantile');

    // 245ms > 400ms -> INACTIVE
    const healthyAlert = engine.evaluateAlert({
      alertName: 'HighApiLatency',
      metricType: 'LATENCY',
      threshold: 400
    });
    expect(healthyAlert.isFiring).toBe(false);
    expect(healthyAlert.status).toContain('INACTIVE');
  });

  it('generates valid Prometheus Alerting Rule YAML manifest', () => {
    const engine = new PromqlAlertEngine();
    const res = engine.evaluateAlert({
      alertName: 'HighHttp5xxErrors',
      metricType: 'ERROR_RATE',
      threshold: 1.0,
      severity: 'critical'
    });

    expect(res.yamlManifest).toContain('alert: HighHttp5xxErrors');
    expect(res.yamlManifest).toContain('severity: critical');
    expect(res.yamlManifest).toContain('team: sre-platform');
  });
});
