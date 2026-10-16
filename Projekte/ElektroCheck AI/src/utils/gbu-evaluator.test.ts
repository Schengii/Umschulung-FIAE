import { describe, it, expect } from 'vitest';
import { evaluateGbu, getRiskLevel, DEFAULT_5_SAFETY_RULES } from './gbu-evaluator';

describe('gbu-evaluator', () => {
  it('Test 1: High initial risk reduced by 5 safety rules', () => {
    const res1 = evaluateGbu({
      activityName: 'Schaltschrankarbeiten 400V',
      initialSeverity: 4,      // Schwere Verletzung / Lichtbogen
      initialProbability: 4,   // Ohne Schutzmaßnahmen hoch
      rules5SafetyApplied: DEFAULT_5_SAFETY_RULES,
      personalProtectionEquipment: ['PSA 2 Isolierhandschuhe', 'Gesichtsschutz'],
    });

    expect(res1.initialRiskScore === 16, 'Test 1 failed: Initial score 4x4 = 16 expected').toBe(true);
    expect(res1.initialRiskLevel === 'HOCH', 'Test 1 failed: Initial risk level HOCH expected').toBe(true);
    expect(res1.residualRiskScore < res1.initialRiskScore, 'Test 1 failed: Residual risk should be significantly lower').toBe(true);
    expect(res1.isAcceptable === true, 'Test 1 failed: Residual risk with full safety rules should be acceptable').toBe(true);
  });

  it('Test 2: Risk levels helper', () => {
    expect(getRiskLevel(2).level === 'GERING', 'Test 2 failed: score 2 is GERING').toBe(true);
    expect(getRiskLevel(20).level === 'KRITISCH', 'Test 2 failed: score 20 is KRITISCH').toBe(true);
  });

});
