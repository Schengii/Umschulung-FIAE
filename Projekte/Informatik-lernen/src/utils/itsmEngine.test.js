import { describe, it, expect } from 'vitest';
import { ITSM_INITIAL_TICKETS, calculatePriorityMatrix, evaluateCabRiskScore } from './itsmEngine';

describe('itsmEngine', () => {
  it('calculates ITIL priority correctly from impact and urgency', () => {
    expect(calculatePriorityMatrix('High', 'High')).toBe('P1 (Kritisch)');
    expect(calculatePriorityMatrix('High', 'Low')).toBe('P2 (Hoch)');
    expect(calculatePriorityMatrix('Medium', 'Medium')).toBe('P3 (Mittel)');
    expect(calculatePriorityMatrix('Low', 'Low')).toBe('P4 (Niedrig)');
  });

  it('evaluates CAB risk score correctly', () => {
    const highRisk = evaluateCabRiskScore({ technicalComplexity: 5, rollbackFeasibility: 1, businessImpact: 5 });
    expect(highRisk.score).toBeGreaterThan(4.0);
    expect(highRisk.riskTier).toContain('Kritisches Risiko');

    const lowRisk = evaluateCabRiskScore({ technicalComplexity: 1, rollbackFeasibility: 5, businessImpact: 1 });
    expect(lowRisk.score).toBeLessThan(2.0);
    expect(lowRisk.riskTier).toContain('Niedriges Risiko');
  });

  it('has valid initial tickets', () => {
    expect(ITSM_INITIAL_TICKETS.length).toBe(4);
    expect(ITSM_INITIAL_TICKETS[0].id).toBe('INC-1042');
  });
});
