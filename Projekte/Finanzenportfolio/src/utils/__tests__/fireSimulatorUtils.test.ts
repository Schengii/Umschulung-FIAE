import { describe, it, expect } from 'vitest';
import { simulateFireWithdrawalExtended } from '../fireSimulatorUtils';
import type { FireWithdrawalSimulationParams } from '../../types';

describe('fireSimulatorUtils - simulateFireWithdrawalExtended', () => {
  const baseParams: FireWithdrawalSimulationParams = {
    currentAge: 45,
    retirementAge: 50,
    targetAge: 85,
    currentPortfolioValue: 800000,
    annualReturnPercent: 6.5,
    annualInflationPercent: 2.0,
    monthlyBaseExpensesEur: 2500,
    monthlyHealthInsuranceEur: 400,
    monthlyStatePensionEur: 1200,
    statePensionStartAge: 67,
    monthlyCompanyPensionEur: 300,
    companyPensionStartAge: 65,
    withdrawalStrategy: 'GUYTON_KLINGER',
    initialWithdrawalRatePercent: 3.5,
    bequestGoalEur: 100000
  };

  it('simulates longevity with Guyton-Klinger guardrails and pension integration', () => {
    const result = simulateFireWithdrawalExtended(baseParams);

    expect(result.yearlyDetails.length).toBe(40); // 85 - 45 = 40 years
    expect(result.totalWithdrawnEur).toBeGreaterThan(0);
    expect(result.totalPensionReceivedEur).toBeGreaterThan(0);

    // State pension should kick in at age 67
    const yearAt67 = result.yearlyDetails.find(y => y.age === 67);
    expect(yearAt67).toBeDefined();
    expect(yearAt67!.statePensionReceived).toBeGreaterThan(0);

    expect(result.finalPortfolioValueEur).toBeGreaterThan(0);
    expect(result.isSuccess).toBe(true);
  });

  it('detects portfolio depletion when withdrawal is unsustainable', () => {
    const riskyParams: FireWithdrawalSimulationParams = {
      ...baseParams,
      currentPortfolioValue: 150000, // Too small for 2.9k/mo expenses
      monthlyBaseExpensesEur: 4000,
      monthlyStatePensionEur: 0,
      initialWithdrawalRatePercent: 8.0
    };

    const result = simulateFireWithdrawalExtended(riskyParams);
    expect(result.isSuccess).toBe(false);
    expect(result.depletionAge).toBeDefined();
    expect(result.depletionAge!).toBeLessThanOrEqual(65);
    expect(result.recommendation).toContain('Achtung');
  });
});
