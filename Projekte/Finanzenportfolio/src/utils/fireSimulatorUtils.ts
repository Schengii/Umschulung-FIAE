import type { FireWithdrawalSimulationParams, FireWithdrawalSimulationResult, FireYearlyDetail } from '../types';

export function simulateFireWithdrawalExtended(
  params: FireWithdrawalSimulationParams
): FireWithdrawalSimulationResult {
  const {
    currentAge,
    retirementAge,
    targetAge,
    currentPortfolioValue,
    annualReturnPercent,
    annualInflationPercent,
    monthlyBaseExpensesEur,
    monthlyHealthInsuranceEur,
    monthlyStatePensionEur,
    statePensionStartAge,
    monthlyCompanyPensionEur,
    companyPensionStartAge,
    withdrawalStrategy,
    initialWithdrawalRatePercent,
    bequestGoalEur
  } = params;

  const inflationRate = annualInflationPercent / 100;
  const returnRate = annualReturnPercent / 100;

  const totalYears = Math.max(1, targetAge - currentAge);

  let currentPot = currentPortfolioValue;
  let minPortfolioValueEur = currentPot;
  let isDepleted = false;
  let depletionAge: number | undefined;

  let totalWithdrawnEur = 0;
  let totalPensionReceivedEur = 0;

  const yearlyDetails: FireYearlyDetail[] = [];

  // Initial base withdrawal at retirement
  let baseAnnualWithdrawal = currentPot * (initialWithdrawalRatePercent / 100);
  if (baseAnnualWithdrawal <= 0) {
    baseAnnualWithdrawal = (monthlyBaseExpensesEur + monthlyHealthInsuranceEur) * 12;
  }

  for (let y = 1; y <= totalYears; y++) {
    const age = currentAge + y;
    const isRetired = age >= retirementAge;
    const startVal = currentPot;

    // Inflation adjustment factor
    const cumInflation = Math.pow(1 + inflationRate, y);

    // Pensions kicking in
    let annualStatePension = 0;
    if (age >= statePensionStartAge) {
      annualStatePension = monthlyStatePensionEur * 12 * cumInflation;
      totalPensionReceivedEur += annualStatePension;
    }

    let annualCompanyPension = 0;
    if (age >= companyPensionStartAge) {
      annualCompanyPension = monthlyCompanyPensionEur * 12 * cumInflation;
      totalPensionReceivedEur += annualCompanyPension;
    }

    const totalPensionIncome = annualStatePension + annualCompanyPension;

    // Gross expenses needed
    const annualLivingExpenses = monthlyBaseExpensesEur * 12 * cumInflation;
    const annualHealthInsurance = monthlyHealthInsuranceEur * 12 * cumInflation;
    const totalExpensesNeeded = annualLivingExpenses + annualHealthInsurance;

    let withdrawalNeeded = 0;

    if (isRetired && !isDepleted) {
      // Net shortfall after pensions
      const shortfall = Math.max(0, totalExpensesNeeded - totalPensionIncome);

      switch (withdrawalStrategy) {
        case 'CONSTANT_INFLATION_ADJUSTED': {
          // Classic Bengen 4% adjusted for inflation
          withdrawalNeeded = Math.max(shortfall, baseAnnualWithdrawal * cumInflation - totalPensionIncome);
          break;
        }
        case 'GUYTON_KLINGER': {
          // Dynamic Guardrails: cut withdrawal by 10% if portfolio drops significantly, boost if it grows
          let targetWithdrawal = baseAnnualWithdrawal * cumInflation - totalPensionIncome;
          const currentWithdrawalRate = startVal > 0 ? (targetWithdrawal / startVal) * 100 : 100;

          if (currentWithdrawalRate > initialWithdrawalRatePercent * 1.2) {
            // Capital preservation rule: reduce withdrawal by 10%
            targetWithdrawal *= 0.90;
          } else if (currentWithdrawalRate < initialWithdrawalRatePercent * 0.8) {
            // Prosperity rule: raise withdrawal by 10%
            targetWithdrawal *= 1.10;
          }
          withdrawalNeeded = Math.max(shortfall, targetWithdrawal);
          break;
        }
        case 'VPW': {
          // Variable Percentage Withdrawal based on remaining years
          const remainingYears = Math.max(1, targetAge - age + 1);
          const vpwRate = Math.min(0.20, (1 / remainingYears) + 0.02);
          withdrawalNeeded = Math.max(shortfall, startVal * vpwRate);
          break;
        }
        case 'FIXED_PERCENTAGE': {
          withdrawalNeeded = Math.max(shortfall, startVal * (initialWithdrawalRatePercent / 100));
          break;
        }
      }

      withdrawalNeeded = Math.max(0, withdrawalNeeded);
      totalWithdrawnEur += withdrawalNeeded;
    }

    // Capital growth on remaining pot
    const growth = isDepleted ? 0 : Math.max(0, (startVal - withdrawalNeeded * 0.5) * returnRate);

    // Tax estimation on capital gains portion (approx 20% taxable portion * 26.375% Abgeltungsteuer)
    const taxesPaid = isRetired && !isDepleted ? Math.max(0, withdrawalNeeded * 0.25 * 0.20) : 0;

    let endVal = startVal + growth - withdrawalNeeded - taxesPaid;

    if (endVal <= 0) {
      endVal = 0;
      isDepleted = true;
      if (!depletionAge) {
        depletionAge = age;
      }
    }

    currentPot = endVal;
    if (currentPot < minPortfolioValueEur) {
      minPortfolioValueEur = currentPot;
    }

    yearlyDetails.push({
      year: y,
      age,
      startingValue: Math.round(startVal),
      portfolioGrowth: Math.round(growth),
      statePensionReceived: Math.round(annualStatePension),
      companyPensionReceived: Math.round(annualCompanyPension),
      grossExpensesNeeded: Math.round(totalExpensesNeeded),
      withdrawalAmount: Math.round(withdrawalNeeded),
      healthInsurancePaid: Math.round(annualHealthInsurance),
      taxesPaid: Math.round(taxesPaid),
      endingValue: Math.round(endVal),
      isDepleted
    });
  }

  const finalPortfolioValueEur = Math.round(currentPot);
  const isSuccess = !isDepleted && finalPortfolioValueEur >= bequestGoalEur;

  let recommendation = '';
  if (isSuccess) {
    recommendation = `Optimaler Ruhestandspfad: Dein Portfolio reicht bis Alter ${targetAge} und hinterlässt ein Restvermögen von ca. ${finalPortfolioValueEur.toLocaleString('de-DE')} €.`;
  } else if (depletionAge) {
    recommendation = `Achtung: Kapitalverzehr tritt mit Alter ${depletionAge} ein. Reduziere die anfängliche Entnahmerate um ca. 0.5% - 1.0% oder erhöhe die Sparrate vor Rentenbeginn.`;
  } else {
    recommendation = `Kapital reicht aus, das gewünschte Erbeziel von ${bequestGoalEur.toLocaleString('de-DE')} € wird jedoch leicht unterschritten.`;
  }

  return {
    isSuccess,
    depletionAge,
    finalPortfolioValueEur,
    totalWithdrawnEur: Math.round(totalWithdrawnEur),
    totalPensionReceivedEur: Math.round(totalPensionReceivedEur),
    minPortfolioValueEur: Math.round(minPortfolioValueEur),
    yearlyDetails,
    recommendation
  };
}
