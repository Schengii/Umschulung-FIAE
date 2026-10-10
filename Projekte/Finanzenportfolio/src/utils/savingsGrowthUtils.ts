import type { SavingsGrowthComparisonResult, SavingsGrowthYearPoint, SavingsMilestone } from '../types';

export interface SavingsGrowthOptions {
  initialCapitalEur: number;
  monthlyContributionEur: number;
  annualReturnPercent?: number; // default 7.0%
  annualDynamizationPercent?: number; // default 2.5%
  stepUpMonthlyEur?: number; // default 50€ extra
  horizonYears?: number; // default 35 years
  currentAge?: number; // default 30
}

export function calculateSavingsGrowthComparison(
  options: SavingsGrowthOptions
): SavingsGrowthComparisonResult {
  const {
    initialCapitalEur,
    monthlyContributionEur,
    annualReturnPercent = 7.0,
    annualDynamizationPercent = 2.5,
    stepUpMonthlyEur = 50,
    horizonYears = 35,
    currentAge = 30
  } = options;

  const monthlyReturnRate = Math.pow(1 + annualReturnPercent / 100, 1 / 12) - 1;
  const dynamizationFactor = 1 + annualDynamizationPercent / 100;

  const totalMonths = horizonYears * 12;

  let fixedPot = initialCapitalEur;
  let fixedContr = initialCapitalEur;

  let dynPot = initialCapitalEur;
  let dynContr = initialCapitalEur;

  let stepPot = initialCapitalEur;
  let stepContr = initialCapitalEur;

  let curDynMonthly = monthlyContributionEur;
  let curStepMonthly = monthlyContributionEur + stepUpMonthlyEur;

  // Milestone targets
  const milestoneTargets = [50000, 100000, 250000, 500000, 1000000];
  const milestoneFixedReached: Record<number, number> = {};
  const milestoneDynReached: Record<number, number> = {};

  const yearlyTrajectory: SavingsGrowthYearPoint[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    // Annual dynamization step every 12 months
    if (m > 1 && m % 12 === 1) {
      curDynMonthly *= dynamizationFactor;
      curStepMonthly *= dynamizationFactor;
    }

    // 1. Fixed
    fixedPot = (fixedPot + monthlyContributionEur) * (1 + monthlyReturnRate);
    fixedContr += monthlyContributionEur;

    // 2. Dynamized
    dynPot = (dynPot + curDynMonthly) * (1 + monthlyReturnRate);
    dynContr += curDynMonthly;

    // 3. Step Up
    stepPot = (stepPot + curStepMonthly) * (1 + monthlyReturnRate);
    stepContr += curStepMonthly;

    // Check milestones
    milestoneTargets.forEach(target => {
      if (fixedPot >= target && !milestoneFixedReached[target]) {
        milestoneFixedReached[target] = m;
      }
      if (dynPot >= target && !milestoneDynReached[target]) {
        milestoneDynReached[target] = m;
      }
    });

    // Capture at end of each year
    if (m % 12 === 0) {
      const year = m / 12;
      yearlyTrajectory.push({
        year,
        age: currentAge + year,
        fixedTotalEur: Math.round(fixedPot),
        fixedContributionsEur: Math.round(fixedContr),
        dynamizedTotalEur: Math.round(dynPot),
        dynamizedContributionsEur: Math.round(dynContr),
        stepUpTotalEur: Math.round(stepPot),
        stepUpContributionsEur: Math.round(stepContr)
      });
    }
  }

  const milestones: SavingsMilestone[] = milestoneTargets.map(target => {
    const fixedM = milestoneFixedReached[target] || 0;
    const dynM = milestoneDynReached[target] || 0;
    const monthsSaved = fixedM > 0 && dynM > 0 ? fixedM - dynM : 0;
    const label = target >= 1000000 ? `${(target / 1000000).toFixed(1)} Mio. €` : `${target / 1000}k €`;

    return {
      targetAmountEur: target,
      label,
      fixedScenarioMonth: fixedM,
      dynamizedScenarioMonth: dynM,
      monthsSaved: Math.max(0, monthsSaved)
    };
  });

  const getYearPoint = (yr: number) => yearlyTrajectory[yr - 1] ?? yearlyTrajectory[yearlyTrajectory.length - 1];

  const y10 = getYearPoint(10);
  const y20 = getYearPoint(20);
  const y30 = getYearPoint(30);

  const extraWealthFromDynamization30Y = Math.max(0, (y30?.dynamizedTotalEur ?? 0) - (y30?.fixedTotalEur ?? 0));

  return {
    initialCapitalEur,
    monthlyContributionEur,
    annualReturnPercent,
    annualDynamizationPercent,
    stepUpMonthlyEur,
    horizonYears,
    tenYearValueFixed: y10?.fixedTotalEur ?? 0,
    twentyYearValueFixed: y20?.fixedTotalEur ?? 0,
    thirtyYearValueFixed: y30?.fixedTotalEur ?? 0,
    tenYearValueDynamized: y10?.dynamizedTotalEur ?? 0,
    twentyYearValueDynamized: y20?.dynamizedTotalEur ?? 0,
    thirtyYearValueDynamized: y30?.dynamizedTotalEur ?? 0,
    extraWealthFromDynamization30Y,
    milestones,
    yearlyTrajectory
  };
}
