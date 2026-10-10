export interface AssetLiquidationBucket {
  id: string;
  name: string;
  ticker?: string;
  category: 'CASH' | 'LOSS_POSITION' | 'DIVIDEND_INCOME' | 'GAIN_POSITION';
  availableBalanceEur: number;
  unrealizedGainPercent: number; // e.g. -15% or +45%
  estimatedTaxDragPercent: number; // 0% for cash or loss, ~18.5% for equity fund (with 30% Teilfreistellung), 26.375% for stock
  priorityRank: number; // 1 = highest priority to liquidate first
}

export interface TaxWaterfallStepResult {
  bucketId: string;
  bucketName: string;
  category: AssetLiquidationBucket['category'];
  withdrawnGrossEur: number;
  taxPaidEur: number;
  withdrawnNetEur: number;
  remainingBalanceEur: number;
}

export interface TaxWaterfallAnnualResult {
  requestedNetEur: number;
  totalGrossLiquidatedEur: number;
  totalTaxPaidEur: number;
  effectiveTaxRatePercent: number;
  taxSavingsVsNaivePercent: number; // compared to naive proportional selling
  steps: TaxWaterfallStepResult[];
}

/**
 * Optimizes the liquidation sequence of wealth buckets to minimize tax drag during retirement / de-accumulation.
 * 
 * Order of liquidation (Waterfall):
 * 1. Cash / Overnight Money (0% tax drag)
 * 2. Positions with capital losses (0% tax drag, creates tax loss offsets)
 * 3. Incoming dividend & interest cashflow
 * 4. Profitable holdings (tax drag optimized, using Teilfreistellung where applicable)
 */
export function calculateTaxWaterfallLiquidation(
  buckets: AssetLiquidationBucket[],
  targetNetEur: number,
  remainingTaxAllowanceEur: number = 1000
): TaxWaterfallAnnualResult {
  // Sort buckets by priority rank, then by ascending tax drag
  const sorted = [...buckets].sort((a, b) => {
    if (a.priorityRank !== b.priorityRank) return a.priorityRank - b.priorityRank;
    return a.estimatedTaxDragPercent - b.estimatedTaxDragPercent;
  });

  let remainingNetNeeded = targetNetEur;
  let remainingAllowance = Math.max(0, remainingTaxAllowanceEur);
  let totalGross = 0;
  let totalTax = 0;
  const steps: TaxWaterfallStepResult[] = [];

  for (const bucket of sorted) {
    if (remainingNetNeeded <= 0.001) {
      steps.push({
        bucketId: bucket.id,
        bucketName: bucket.name,
        category: bucket.category,
        withdrawnGrossEur: 0,
        taxPaidEur: 0,
        withdrawnNetEur: 0,
        remainingBalanceEur: bucket.availableBalanceEur
      });
      continue;
    }

    if (bucket.availableBalanceEur <= 0) {
      steps.push({
        bucketId: bucket.id,
        bucketName: bucket.name,
        category: bucket.category,
        withdrawnGrossEur: 0,
        taxPaidEur: 0,
        withdrawnNetEur: 0,
        remainingBalanceEur: 0
      });
      continue;
    }

    // Determine tax rate for this bucket
    let taxRate = bucket.estimatedTaxDragPercent / 100;

    // Check if remainingAllowance can offset taxable gain
    // For a gain position, tax is only applied on the gain portion
    let effectiveTaxFraction = 0;
    if (bucket.category === 'GAIN_POSITION' && bucket.unrealizedGainPercent > 0) {
      const gainFraction = bucket.unrealizedGainPercent / (100 + bucket.unrealizedGainPercent);
      effectiveTaxFraction = gainFraction * taxRate;
    } else if (bucket.category === 'DIVIDEND_INCOME') {
      effectiveTaxFraction = taxRate;
    } else {
      effectiveTaxFraction = 0; // Cash or loss position
    }

    // Max net we can get from this bucket
    const maxNetFromBucket = bucket.availableBalanceEur * (1 - effectiveTaxFraction);

    let netFromThisBucket = Math.min(remainingNetNeeded, maxNetFromBucket);
    let grossLiquidated = effectiveTaxFraction < 1 
      ? netFromThisBucket / (1 - effectiveTaxFraction)
      : netFromThisBucket;

    // Apply allowance if applicable
    let taxPaid = grossLiquidated * effectiveTaxFraction;
    if (taxPaid > 0 && remainingAllowance > 0) {
      const offset = Math.min(taxPaid, remainingAllowance);
      taxPaid -= offset;
      remainingAllowance -= offset;
    }

    // Recompute actual net delivered
    const actualNet = grossLiquidated - taxPaid;

    remainingNetNeeded = Math.max(0, remainingNetNeeded - actualNet);
    totalGross += grossLiquidated;
    totalTax += taxPaid;

    steps.push({
      bucketId: bucket.id,
      bucketName: bucket.name,
      category: bucket.category,
      withdrawnGrossEur: Math.round(grossLiquidated * 100) / 100,
      taxPaidEur: Math.round(taxPaid * 100) / 100,
      withdrawnNetEur: Math.round(actualNet * 100) / 100,
      remainingBalanceEur: Math.max(0, Math.round((bucket.availableBalanceEur - grossLiquidated) * 100) / 100)
    });
  }

  const effectiveTaxRate = totalGross > 0 ? (totalTax / totalGross) * 100 : 0;
  // Naive selling flat 26.375% on standard gains
  const naiveTax = targetNetEur * 0.18; // approx 18% average drag
  const taxSavingsVsNaive = Math.max(0, naiveTax - totalTax);

  return {
    requestedNetEur: targetNetEur,
    totalGrossLiquidatedEur: Math.round(totalGross * 100) / 100,
    totalTaxPaidEur: Math.round(totalTax * 100) / 100,
    effectiveTaxRatePercent: Math.round(effectiveTaxRate * 100) / 100,
    taxSavingsVsNaivePercent: Math.round(taxSavingsVsNaive * 100) / 100,
    steps
  };
}

/**
 * Builds standard liquidation buckets from portfolio holdings and transactions.
 */
export function buildWaterfallBucketsFromPortfolio(
  holdings: Array<{ ticker: string; name: string; category: string; currentValue: number; totalGain: number; totalCost: number; teilfreistellungRate?: number }>,
  cashBalanceEur: number = 0
): AssetLiquidationBucket[] {
  const buckets: AssetLiquidationBucket[] = [];

  // 1. Cash bucket
  if (cashBalanceEur > 0) {
    buckets.push({
      id: 'bucket-cash',
      name: 'Cash / Tagesgeld Liquidität',
      category: 'CASH',
      availableBalanceEur: Math.round(cashBalanceEur * 100) / 100,
      unrealizedGainPercent: 0,
      estimatedTaxDragPercent: 0,
      priorityRank: 1
    });
  }

  // 2. Loss positions
  holdings
    .filter(h => h.totalGain < 0)
    .forEach((h, idx) => {
      buckets.push({
        id: `bucket-loss-${idx}`,
        name: `${h.name} (${h.ticker}) - Verlustposition`,
        ticker: h.ticker,
        category: 'LOSS_POSITION',
        availableBalanceEur: Math.max(0, Math.round(h.currentValue * 100) / 100),
        unrealizedGainPercent: h.totalCost > 0 ? (h.totalGain / h.totalCost) * 100 : 0,
        estimatedTaxDragPercent: 0,
        priorityRank: 2
      });
    });

  // 3. Gain positions with Teilfreistellung (ETFs) or standard equities
  holdings
    .filter(h => h.totalGain >= 0)
    .forEach((h, idx) => {
      const isFund = h.category === 'ETF';
      // If ETF with 30% Teilfreistellung: effective tax is 26.375% * 0.7 = 18.46%
      const effectiveTaxRate = isFund ? 18.46 : 26.375;
      const gainRatio = h.currentValue > 0 ? Math.min(1, Math.max(0, h.totalGain / h.currentValue)) : 0;
      const estimatedTaxDrag = effectiveTaxRate * gainRatio;

      buckets.push({
        id: `bucket-gain-${idx}`,
        name: `${h.name} (${h.ticker}) - Gewinnposition`,
        ticker: h.ticker,
        category: 'GAIN_POSITION',
        availableBalanceEur: Math.max(0, Math.round(h.currentValue * 100) / 100),
        unrealizedGainPercent: h.totalCost > 0 ? (h.totalGain / h.totalCost) * 100 : 0,
        estimatedTaxDragPercent: Math.round(estimatedTaxDrag * 10) / 10,
        priorityRank: 3
      });
    });

  return buckets;
}

