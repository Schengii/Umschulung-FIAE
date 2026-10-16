// ============================================================
// Amazon 2.0 – Marketplace Dynamic Pricing ML Engine
// ============================================================
import type { Product } from '../types';

export type PricingStrategy = 'buybox' | 'margin' | 'balanced';

export interface PricingSimResult {
  strategy: PricingStrategy;
  currentPrice: number;
  competitorPrice: number;
  costBasis: number;
  suggestedPrice: number;
  profitMarginPercent: number;
  projectedMonthlySalesUnits: number;
  projectedMonthlyProfitEur: number;
  projectedMonthlyRevenueEur: number;
  buyBoxWinProbabilityPercent: number;
  priceElasticityScore: number;
}

export function simulateDynamicPricing(
  product: Product,
  strategy: PricingStrategy = 'balanced',
  competitorPriceOffset: number = 0
): PricingSimResult {
  const currentPrice = product.price;
  const costBasis = +(currentPrice * 0.58).toFixed(2); // ~42% margin baseline
  const competitorPrice = +(currentPrice * (1 + competitorPriceOffset)).toFixed(2);

  let suggestedPrice = currentPrice;
  let buyBoxWinProbabilityPercent = 50;

  if (strategy === 'buybox') {
    // Undercut competitor by 1 cent
    suggestedPrice = Math.max(costBasis * 1.1, +(competitorPrice - 0.01).toFixed(2));
    buyBoxWinProbabilityPercent = 94;
  } else if (strategy === 'margin') {
    // Maximize margin (+25% above competitor)
    suggestedPrice = +(costBasis * 1.85).toFixed(2);
    buyBoxWinProbabilityPercent = 38;
  } else {
    // Balanced
    suggestedPrice = +(costBasis * 1.42).toFixed(2);
    buyBoxWinProbabilityPercent = 78;
  }

  const profitPerUnit = suggestedPrice - costBasis;
  const profitMarginPercent = +((profitPerUnit / suggestedPrice) * 100).toFixed(1);

  // Elasticity calculation
  const priceElasticityScore = 1.65;
  const baseUnits = Math.round(180 * (product.rating / 5));
  const priceRatio = suggestedPrice / currentPrice;
  const projectedMonthlySalesUnits = Math.max(10, Math.round(baseUnits * Math.pow(priceRatio, -priceElasticityScore)));

  const projectedMonthlyRevenueEur = +(projectedMonthlySalesUnits * suggestedPrice).toFixed(2);
  const projectedMonthlyProfitEur = +(projectedMonthlySalesUnits * profitPerUnit).toFixed(2);

  return {
    strategy,
    currentPrice,
    competitorPrice,
    costBasis,
    suggestedPrice,
    profitMarginPercent,
    projectedMonthlySalesUnits,
    projectedMonthlyProfitEur,
    projectedMonthlyRevenueEur,
    buyBoxWinProbabilityPercent,
    priceElasticityScore,
  };
}
