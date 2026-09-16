import { describe, it, expect } from 'vitest';
import { INITIAL_CLOUD_TOPOLOGY, calculateSystemSla, auditSpofRisks } from './cloudArchitectureEngine';

describe('cloudArchitectureEngine', () => {
  it('calculates compound SLA and downtime correctly', () => {
    const slaMetrics = calculateSystemSla(INITIAL_CLOUD_TOPOLOGY);
    expect(slaMetrics.overallSla).toBeGreaterThan(0.99);
    expect(slaMetrics.annualDowntimeMinutes).toBeGreaterThan(0);
    expect(slaMetrics.totalBaseCostMonthly).toBeGreaterThan(0);
  });

  it('detects SPOF risks in unsafe topology', () => {
    const unsafeTopology = [
      { id: '1', type: 'APP', name: 'Single EC2', sla: 0.99, cost: 20, isRedundant: false, tier: 1 },
      { id: '2', type: 'DB', name: 'Single RDS', sla: 0.99, cost: 30, isRedundant: false, tier: 2 }
    ];

    const warnings = auditSpofRisks(unsafeTopology);
    expect(warnings.length).toBeGreaterThanOrEqual(2);
    expect(warnings.some(w => w.severity === 'CRITICAL')).toBe(true);
  });
});
