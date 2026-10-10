import type { Holding, FundFeeItem, TerAnalysisResult } from '../types';

export interface TerCalculationOptions {
  defaultEtfTerPercent?: number; // fallback if terPercent is undefined, e.g. 0.22%
  expectedGrossReturnPercent?: number; // annual market return before fees, e.g. 7.0%
  benchmarkActiveFundTerPercent?: number; // comparison benchmark, e.g. 1.80%
  projectionYears?: number; // default 30
}

export const KNOWN_ETF_TER_MAP: Record<string, number> = {
  EUNL: 0.20,
  IS3N: 0.18,
  VWCE: 0.22,
  VGWL: 0.22,
  IUSN: 0.35,
  EXXT: 0.31,
  SXR8: 0.07,
  QDVE: 0.15,
  EMIM: 0.18,
  CSPX: 0.07,
  VUAA: 0.07
};

export function calculateTerAnalysis(
  holdings: Holding[],
  options: TerCalculationOptions = {}
): TerAnalysisResult {
  const defaultEtfTer = options.defaultEtfTerPercent ?? 0.22;
  const grossReturn = (options.expectedGrossReturnPercent ?? 7.0) / 100;
  const activeFundTer = (options.benchmarkActiveFundTerPercent ?? 1.80) / 100;
  const projectionYears = options.projectionYears ?? 30;

  // Filter ETF holdings or any holding with an explicit terPercent
  const fundHoldings = holdings.filter(h => h.category === 'ETF' || (h.terPercent !== undefined && h.terPercent > 0));

  const totalAnalyzedFundValueEur = fundHoldings.reduce((sum, h) => sum + h.currentValue, 0);

  const funds: FundFeeItem[] = fundHoldings.map(h => {
    let ter = h.terPercent;
    if (ter === undefined || ter === null) {
      // Check known ticker map or default
      const upperTicker = h.ticker.toUpperCase();
      ter = KNOWN_ETF_TER_MAP[upperTicker] ?? defaultEtfTer;
    }
    const annualCostEur = h.currentValue * (ter / 100);
    const portfolioSharePercent = totalAnalyzedFundValueEur > 0 ? (h.currentValue / totalAnalyzedFundValueEur) * 100 : 0;

    return {
      ticker: h.ticker,
      name: h.name,
      category: h.category,
      currentValueEur: h.currentValue,
      terPercent: ter,
      annualCostEur,
      portfolioSharePercent
    };
  });

  const totalAnnualFeeEur = funds.reduce((sum, f) => sum + f.annualCostEur, 0);
  const weightedTerPercent = totalAnalyzedFundValueEur > 0
    ? (totalAnnualFeeEur / totalAnalyzedFundValueEur) * 100
    : 0;

  const currentTerDecimal = weightedTerPercent / 100;

  // Simulate compound growth over time:
  // V_gross(t) = V0 * (1 + grossReturn)^t
  // V_net_etf(t) = V0 * (1 + grossReturn - currentTerDecimal)^t
  // V_net_active(t) = V0 * (1 + grossReturn - activeFundTer)^t
  const projection: TerAnalysisResult['projection'] = [];

  for (let year = 1; year <= projectionYears; year++) {
    const withoutFeesEur = totalAnalyzedFundValueEur * Math.pow(1 + grossReturn, year);
    const withCurrentTerEur = totalAnalyzedFundValueEur * Math.pow(Math.max(0, 1 + grossReturn - currentTerDecimal), year);
    const withActiveFundFeeEur = totalAnalyzedFundValueEur * Math.pow(Math.max(0, 1 + grossReturn - activeFundTer), year);
    const cumulativeFeeLossEur = withoutFeesEur - withCurrentTerEur;

    projection.push({
      year,
      withoutFeesEur: Math.round(withoutFeesEur),
      withCurrentTerEur: Math.round(withCurrentTerEur),
      withActiveFundFeeEur: Math.round(withActiveFundFeeEur),
      cumulativeFeeLossEur: Math.round(cumulativeFeeLossEur)
    });
  }

  const tenYearPoint = projection[9] ?? projection[projection.length - 1];
  const twentyYearPoint = projection[19] ?? projection[projection.length - 1];
  const thirtyYearPoint = projection[29] ?? projection[projection.length - 1];

  const tenYearCompoundLossEur = tenYearPoint ? tenYearPoint.cumulativeFeeLossEur : 0;
  const twentyYearCompoundLossEur = twentyYearPoint ? twentyYearPoint.cumulativeFeeLossEur : 0;
  const thirtyYearCompoundLossEur = thirtyYearPoint ? thirtyYearPoint.cumulativeFeeLossEur : 0;

  // Potential savings over 30 years vs 1.8% active fund
  const potentialSavingVsActiveFundEur = thirtyYearPoint
    ? Math.max(0, thirtyYearPoint.withCurrentTerEur - thirtyYearPoint.withActiveFundFeeEur)
    : 0;

  return {
    totalAnalyzedFundValueEur,
    weightedTerPercent: Number(weightedTerPercent.toFixed(2)),
    totalAnnualFeeEur: Number(totalAnnualFeeEur.toFixed(2)),
    tenYearCompoundLossEur,
    twentyYearCompoundLossEur,
    thirtyYearCompoundLossEur,
    potentialSavingVsActiveFundEur,
    funds,
    projection
  };
}
