import { describe, it, expect } from 'vitest';
import { calculateSavingsGrowthComparison } from '../savingsGrowthUtils';

describe('savingsGrowthUtils - calculateSavingsGrowthComparison', () => {
  it('projects savings growth and demonstrates the power of dynamization', () => {
    const result = calculateSavingsGrowthComparison({
      initialCapitalEur: 10000,
      monthlyContributionEur: 300,
      annualReturnPercent: 7.0,
      annualDynamizationPercent: 3.0,
      stepUpMonthlyEur: 50,
      horizonYears: 30
    });

    expect(result.yearlyTrajectory.length).toBe(30);

    // After 30 years, dynamized should be significantly higher than fixed
    expect(result.thirtyYearValueDynamized).toBeGreaterThan(result.thirtyYearValueFixed);
    expect(result.extraWealthFromDynamization30Y).toBeGreaterThan(50000);

    // Milestones check
    const milestone100k = result.milestones.find(m => m.targetAmountEur === 100000);
    expect(milestone100k).toBeDefined();
    expect(milestone100k!.fixedScenarioMonth).toBeGreaterThan(0);
    expect(milestone100k!.dynamizedScenarioMonth).toBeLessThanOrEqual(milestone100k!.fixedScenarioMonth);
  });
});
