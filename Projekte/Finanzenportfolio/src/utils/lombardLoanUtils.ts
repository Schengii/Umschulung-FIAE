import type { Holding, AssetCategory } from '../types';

export interface HoldingLombardDetail {
  ticker: string;
  name: string;
  category: AssetCategory;
  currentValueEur: number;
  loanToValuePct: number; // e.g. 70% for ETF, 50% for Stock, 0% for Crypto
  collateralValueEur: number; // currentValueEur * (loanToValuePct / 100)
}

export interface LombardCreditCalculation {
  totalPortfolioValueEur: number;
  totalCollateralValueEur: number; // Max. Beleihungswert
  maxLoanAmountEur: number;
  requestedLoanEur: number;
  loanInterestRatePct: number;
  annualInterestCostEur: number;
  currentLeveragedValueEur: number; // portfolioValue + requestedLoanEur
  currentLeverageFactor: number; // currentLeveragedValueEur / portfolioValue
  currentLtvRatioPct: number; // (requestedLoanEur / totalCollateralValueEur) * 100
  bufferUntilMarginCallEur: number; // collateralValue - requestedLoan
  portfolioDropUntilMarginCallPct: number; // Drop % that triggers margin call
  isMarginCallRisk: boolean;
  isOverleveraged: boolean;
  holdingsBreakdown: HoldingLombardDetail[];
  recommendation: string;
}

/**
 * Standard banking collateral guidelines (Beleihungsgrenzen) for German/Swiss brokerages:
 * - Broad index ETFs (MSCI World, S&P 500): 70% - 80%
 * - Large Cap Equities / Bluechips: 50% - 60%
 * - Mid/Small Caps: 30% - 40%
 * - Crypto / Derivatives / High-Risk: 0% (not marginable)
 * - Fixed Income / Bonds: 75% - 85%
 * - Cash: 100%
 */
export function getAssetLtvPercent(holding: Holding): number {
  switch (holding.category) {
    case 'Cash':
      return 100;
    case 'Bond':
      return 80;
    case 'ETF':
      return 70;
    case 'Stock':
      return 50;
    case 'RealEstate':
      return 60;
    case 'P2P':
      return 20;
    case 'Crypto':
        default:
      return 0;
  }
}

export interface LombardCalculatorOptions {
  holdings: Holding[];
  requestedLoanEur: number;
  interestRatePct?: number; // e.g. 5.5% p.a.
}

/**
 * Computes Lombard credit capacity, leverage ratios and margin call boundaries.
 */
export function calculateLombardCreditMetrics({
  holdings,
  requestedLoanEur,
  interestRatePct = 5.5
}: LombardCalculatorOptions): LombardCreditCalculation {
  const totalPortfolioValueEur = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);

  const holdingsBreakdown: HoldingLombardDetail[] = holdings.map(h => {
    const ltv = getAssetLtvPercent(h);
    const collateral = (h.currentValue || 0) * (ltv / 100);
    return {
      ticker: h.ticker,
      name: h.name,
      category: h.category,
      currentValueEur: h.currentValue || 0,
      loanToValuePct: ltv,
      collateralValueEur: Math.round(collateral * 100) / 100
    };
  });

  const totalCollateralValueEur = holdingsBreakdown.reduce((sum, item) => sum + item.collateralValueEur, 0);
  const maxLoanAmountEur = Math.round(totalCollateralValueEur * 100) / 100;

  const validRequestedLoan = Math.max(0, requestedLoanEur);
  const annualInterestCostEur = Math.round(validRequestedLoan * (interestRatePct / 100) * 100) / 100;

  const currentLeveragedValueEur = totalPortfolioValueEur + validRequestedLoan;
  const currentLeverageFactor = totalPortfolioValueEur > 0
    ? Math.round((currentLeveragedValueEur / totalPortfolioValueEur) * 100) / 100
    : 1;

  const currentLtvRatioPct = totalCollateralValueEur > 0
    ? Math.min(100, Math.round((validRequestedLoan / totalCollateralValueEur) * 1000) / 10)
    : (validRequestedLoan > 0 ? 100 : 0);

  const bufferUntilMarginCallEur = Math.max(0, totalCollateralValueEur - validRequestedLoan);
  
  // Calculate how much the whole portfolio can fall before collateral equals loan
  const portfolioDropUntilMarginCallPct = totalCollateralValueEur > 0 && validRequestedLoan > 0
    ? Math.min(100, Math.max(0, Math.round(((totalCollateralValueEur - validRequestedLoan) / totalCollateralValueEur) * 1000) / 10))
    : 100;

  const isMarginCallRisk = currentLtvRatioPct >= 80;
  const isOverleveraged = validRequestedLoan > totalCollateralValueEur;

  let recommendation = 'Konservativer Hebel: Hoher Sicherheitspuffer gegen Kurseinbrüche vorhanden.';
  if (isOverleveraged) {
    recommendation = 'Kritisch: Der gewünschte Kredit übersteigt den maximal zulässigen Beleihungswert der Depotwerte.';
  } else if (isMarginCallRisk) {
    recommendation = 'Achtung: Erhöhtes Margin-Call-Risiko bei normaler Marktvolatilität (Puffer unter 20%).';
  } else if (validRequestedLoan === 0) {
    recommendation = 'Kein Wertpapierkredit in Anspruch genommen. Ungehebeltes Portfolio.';
  }

  return {
    totalPortfolioValueEur,
    totalCollateralValueEur: Math.round(totalCollateralValueEur * 100) / 100,
    maxLoanAmountEur,
    requestedLoanEur: validRequestedLoan,
    loanInterestRatePct: interestRatePct,
    annualInterestCostEur,
    currentLeveragedValueEur,
    currentLeverageFactor,
    currentLtvRatioPct,
    bufferUntilMarginCallEur: Math.round(bufferUntilMarginCallEur * 100) / 100,
    portfolioDropUntilMarginCallPct,
    isMarginCallRisk,
    isOverleveraged,
    holdingsBreakdown,
    recommendation
  };
}
