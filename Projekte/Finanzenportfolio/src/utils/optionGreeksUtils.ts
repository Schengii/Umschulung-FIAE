import type { Transaction, Holding } from '../types';

export interface OptionPositionGreeks {
  id: string;
  ticker: string;
  name: string;
  optionType: 'CALL' | 'PUT';
  strikePrice: number;
  underlyingPrice: number;
  daysToExpiration: number;
  contracts: number;
  impliedVolatility: number; // e.g. 0.25 (25%)
  delta: number;
  gamma: number;
  theta: number; // daily theta in EUR
  vega: number;
  notionalValueEur: number;
  isCovered: boolean;
}

export interface PortfolioDeltaHedgingSummary {
  totalDeltaShares: number; // e.g. equivalent shares of SPY/World
  portfolioBetaWeightDeltaEur: number;
  dailyThetaIncomeEur: number;
  totalOptionNotionalExposureEur: number;
  hedgingStatus: 'OVER_HEDGED' | 'NEUTRAL' | 'MODERATELY_BULLISH' | 'AGGRESSIVE_BULLISH' | 'SHORT_EXPOSURE';
  protectivePutRecommendation: {
    recommendedContracts: number;
    recommendedStrike: number;
    recommendedDte: number;
    estimatedCostEur: number;
    description: string;
  };
  positions: OptionPositionGreeks[];
}

/**
 * Standard cumulative normal distribution function N(x)
 */
function cumulativeStdNormal(x: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.3989422804014337;

  if (x >= 0.0) {
    const t = 1.0 / (1.0 + p * x);
    return 1.0 - c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * x);
    return c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
}

/**
 * Standard normal probability density function n(x)
 */
function normalPdf(x: number): number {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
}

/**
 * Black-Scholes Greeks calculation for European/American options.
 */
export function calculateBlackScholesGreeks({
  spotPrice,
  strikePrice,
  daysToExpiration,
  volatility = 0.25,
  riskFreeRate = 0.03,
  optionType = 'PUT'
}: {
  spotPrice: number;
  strikePrice: number;
  daysToExpiration: number;
  volatility?: number;
  riskFreeRate?: number;
  optionType?: 'CALL' | 'PUT';
}): { delta: number; gamma: number; theta: number; vega: number } {
  const T = Math.max(1 / 365, daysToExpiration / 365);
  const S = Math.max(0.01, spotPrice);
  const K = Math.max(0.01, strikePrice);
  const sigma = Math.max(0.05, volatility);
  const r = riskFreeRate;

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  let delta: number;
  let theta: number;

  if (optionType === 'CALL') {
    delta = cumulativeStdNormal(d1);
    theta = (- (S * normalPdf(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * cumulativeStdNormal(d2)) / 365;
  } else {
    delta = cumulativeStdNormal(d1) - 1.0;
    theta = (- (S * normalPdf(d1) * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * cumulativeStdNormal(-d2)) / 365;
  }

  const gamma = normalPdf(d1) / (S * sigma * Math.sqrt(T));
  const vega = (S * normalPdf(d1) * Math.sqrt(T)) / 100; // per 1% vol change

  return {
    delta: Math.round(delta * 1000) / 1000,
    gamma: Math.round(gamma * 10000) / 10000,
    theta: Math.round(theta * 100) / 100,
    vega: Math.round(vega * 100) / 100
  };
}

/**
 * Calculates aggregate portfolio Delta-hedging metrics, open Greeks and protective recommendations.
 */
export function calculatePortfolioDeltaHedging(
  transactions: Transaction[],
  holdings: Holding[],
  totalPortfolioValue: number
): PortfolioDeltaHedgingSummary {
  const optionTxs = transactions.filter(t => 
    (t.type === 'OPTION_PREMIUM' || t.type === 'OPTION_EXPIRE' || t.type === 'OPTION_ASSIGN') &&
    t.strikePrice && t.strikePrice > 0
  );

  const holdingMap = new Map<string, Holding>();
  holdings.forEach(h => holdingMap.set(h.ticker.toUpperCase(), h));

  const positions: OptionPositionGreeks[] = optionTxs.map((t, idx) => {
    const underlying = holdingMap.get(t.ticker.toUpperCase());
    const spot = underlying?.currentPrice || t.strikePrice || 100;
    const strike = t.strikePrice || 100;
    const contracts = Math.max(1, Math.round((t.amount || 100) / 100));
    
    // Parse expiration
    let daysToExpiration = 45;
    if (t.expirationDate) {
      const parts = t.expirationDate.split('.');
      if (parts.length === 3) {
        const exp = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        const diffMs = exp.getTime() - Date.now();
        daysToExpiration = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      }
    }

    const greeks = calculateBlackScholesGreeks({
      spotPrice: spot,
      strikePrice: strike,
      daysToExpiration,
      volatility: 0.28,
      riskFreeRate: 0.03,
      optionType: t.optionType || 'PUT'
    });

    const isCovered = Boolean(underlying && underlying.shares >= contracts * 100);

    return {
      id: t.id || `opt-${idx}`,
      ticker: t.ticker,
      name: t.name || t.ticker,
      optionType: t.optionType || 'PUT',
      strikePrice: strike,
      underlyingPrice: spot,
      daysToExpiration,
      contracts,
      impliedVolatility: 28,
      delta: greeks.delta,
      gamma: greeks.gamma,
      theta: greeks.theta * contracts * 100,
      vega: greeks.vega * contracts * 100,
      notionalValueEur: strike * contracts * 100,
      isCovered
    };
  });

  // Calculate total delta from stock holdings (1.0 per share) + options delta
  const stockDeltaDollars = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const optionsDeltaDollars = positions.reduce((sum, p) => sum + (p.delta * p.underlyingPrice * p.contracts * 100), 0);
  const totalDeltaDollars = stockDeltaDollars + optionsDeltaDollars;

  const totalDeltaShares = Math.round(totalDeltaDollars / 100); // 100 € benchmark share
  const dailyThetaIncomeEur = Math.round(positions.reduce((sum, p) => sum + p.theta, 0) * 100) / 100;
  const totalOptionNotionalExposureEur = positions.reduce((sum, p) => sum + p.notionalValueEur, 0);

  const deltaRatio = totalPortfolioValue > 0 ? totalDeltaDollars / totalPortfolioValue : 1.0;

  let hedgingStatus: PortfolioDeltaHedgingSummary['hedgingStatus'] = 'MODERATELY_BULLISH';
  if (deltaRatio <= 0.2) hedgingStatus = 'OVER_HEDGED';
  else if (deltaRatio <= 0.7) hedgingStatus = 'NEUTRAL';
  else if (deltaRatio <= 1.1) hedgingStatus = 'MODERATELY_BULLISH';
  else hedgingStatus = 'AGGRESSIVE_BULLISH';

  // Protective Put recommendation
  const recommendedContracts = Math.max(1, Math.ceil(totalPortfolioValue / 40000));
  const recommendedStrike = Math.round((totalPortfolioValue / (recommendedContracts * 100)) * 0.90);
  const estimatedCostEur = Math.round(recommendedContracts * 100 * (recommendedStrike * 0.025));

  const protectivePutRecommendation = {
    recommendedContracts,
    recommendedStrike,
    recommendedDte: 75,
    estimatedCostEur,
    description: `Kauf von ${recommendedContracts}x Protective Puts (Basispreis ~${recommendedStrike} €, 60-90 Tage Laufzeit) begrenzt Portfolio-Verluste bei schweren Marktkorrekturen auf maximal 10%.`
  };

  return {
    totalDeltaShares,
    portfolioBetaWeightDeltaEur: Math.round(totalDeltaDollars),
    dailyThetaIncomeEur,
    totalOptionNotionalExposureEur,
    hedgingStatus,
    protectivePutRecommendation,
    positions
  };
}
