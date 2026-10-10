import type { Holding, AssetCategory, TargetAllocation } from '../types';
import { calculateRebalanceOrders } from './rebalanceUtils';

export interface DynamicSavingsPlanAllocationItem {
  category: AssetCategory;
  targetWeightPercent: number;
  currentWeightPercent: number;
  underweightPercent: number; // e.g. 5% means it is 5% below target
  allocatedSavingsEur: number;
  allocatedPercentOfMonthly: number;
  topCandidate?: {
    ticker: string;
    name: string;
    suggestedAmountEur: number;
    sharesEstimate: number;
    price: number;
  };
}

export interface DynamicSavingsPlanDistributionResult {
  monthlySavingsBudgetEur: number;
  isPortfolioBalanced: boolean;
  allocations: DynamicSavingsPlanAllocationItem[];
  summaryNote: string;
}

/**
 * Calculates a dynamic monthly savings plan distribution based on portfolio underweighting.
 *
 * Rather than investing a fixed euro amount into static holdings every month,
 * this engine automatically directs fresh savings capital proportionally into
 * the most underweight asset classes and holdings, gradually rebalancing the portfolio
 * without triggering taxable sales.
 */
export function calculateDynamicSavingsAllocation(
  holdings: Holding[],
  targetsInput: Record<AssetCategory, number> | TargetAllocation[],
  monthlySavingsBudgetEur: number
): DynamicSavingsPlanDistributionResult {
  const budget = Math.max(0, monthlySavingsBudgetEur);

  if (budget === 0) {
    return {
      monthlySavingsBudgetEur: 0,
      isPortfolioBalanced: true,
      allocations: [],
      summaryNote: 'Kein monatliches Sparbudget angegeben.'
    };
  }

  // 1. Calculate current rebalance needs using CASHFLOW_ONLY mode with the monthly budget
  const rebalance = calculateRebalanceOrders(holdings, targetsInput, {
    mode: 'CASHFLOW_ONLY',
    freshCapitalEur: budget,
    toleranceBandPercent: 0.2 // subtle tolerance
  });

  const hasUnderweight = rebalance.categoryOrders.some(co => co.driftPercent < -0.2);

  // If already balanced or no underweight found, distribute by target weights
  if (!hasUnderweight) {
    const defaultAllocations: DynamicSavingsPlanAllocationItem[] = rebalance.categoryOrders.map(co => {
      const share = (co.targetWeightPercent / 100) * budget;
      return {
        category: co.category,
        targetWeightPercent: co.targetWeightPercent,
        currentWeightPercent: co.currentWeightPercent,
        underweightPercent: 0,
        allocatedSavingsEur: Math.round(share * 100) / 100,
        allocatedPercentOfMonthly: co.targetWeightPercent
      };
    }).filter(a => a.allocatedSavingsEur > 0);

    return {
      monthlySavingsBudgetEur: budget,
      isPortfolioBalanced: true,
      allocations: defaultAllocations,
      summaryNote: 'Portfolio ist optimal im Zielbereich. Sparrate wird gemäß Zielgewichtung aufgeteilt.'
    };
  }

  const underweightCategories = rebalance.categoryOrders.filter(co => co.driftPercent < -0.2 && co.orderValueEur > 0);

  // 2. Distribute budget proportionally to the shortfall of underweight categories
  const totalShortfallEur = underweightCategories.reduce((acc, c) => acc + c.orderValueEur, 0);

  const allocations: DynamicSavingsPlanAllocationItem[] = underweightCategories.map(cat => {
    // If total shortfall is less than budget or equal, allocate proportionally
    const weightFactor = totalShortfallEur > 0 ? cat.orderValueEur / totalShortfallEur : 1 / underweightCategories.length;
    const allocatedEur = Math.round(budget * weightFactor * 100) / 100;
    const allocatedPct = budget > 0 ? Math.round((allocatedEur / budget) * 1000) / 10 : 0;

    // Find best candidate holding in this category (lowest weight or biggest loss/lag)
    const catHoldings = holdings.filter(h => h.category === cat.category && h.shares > 0);
    let topCandidate: DynamicSavingsPlanAllocationItem['topCandidate'] = undefined;

    if (catHoldings.length > 0) {
      // Pick holding with lowest portfolio weight in this category
      const sortedHoldings = [...catHoldings].sort((a, b) => a.portfolioWeight - b.portfolioWeight);
      const chosen = sortedHoldings[0];
      const price = chosen.currentPrice > 0 ? chosen.currentPrice : chosen.averageBuyPrice || 50;
      topCandidate = {
        ticker: chosen.ticker,
        name: chosen.name,
        suggestedAmountEur: allocatedEur,
        sharesEstimate: price > 0 ? Math.round((allocatedEur / price) * 1000) / 1000 : 0,
        price
      };
    }

    return {
      category: cat.category,
      targetWeightPercent: cat.targetWeightPercent,
      currentWeightPercent: cat.currentWeightPercent,
      underweightPercent: Math.max(0, Math.round((cat.targetWeightPercent - cat.currentWeightPercent) * 10) / 10),
      allocatedSavingsEur: allocatedEur,
      allocatedPercentOfMonthly: allocatedPct,
      topCandidate
    };
  });

  return {
    monthlySavingsBudgetEur: budget,
    isPortfolioBalanced: false,
    allocations,
    summaryNote: `${underweightCategories.length} untergewichtete Anlageklassen identifiziert. Sparrate gleicht Fehlallokationen ohne Verkäufe aus.`
  };
}
