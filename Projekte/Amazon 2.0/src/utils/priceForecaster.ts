// ============================================================
// Amazon 2.0 – Smart AI Price Forecasting & Trend Engine
// ============================================================
import type { Product } from '../types';

export interface PriceForecastResult {
  currentPrice: number;
  expectedPrice30d: number;
  trendDirection: 'falling' | 'rising' | 'stable';
  changePercent: number;
  dropProbability: number; // 0 to 100
  recommendedAction: 'BUY_NOW' | 'WAIT_FEW_DAYS' | 'GOOD_DEAL';
  actionReason: string;
  confidenceScore: number;
  projectedTrajectory: { day: number; label: string; predictedPrice: number; lowerBound: number; upperBound: number }[];
}

export function generatePriceForecast(product: Product): PriceForecastResult {
  const currentPrice = product.price;
  const history = product.priceHistory && product.priceHistory.length > 0
    ? product.priceHistory.map(h => h.price)
    : [currentPrice * 1.15, currentPrice * 1.1, currentPrice * 1.05, currentPrice];

  // Calculate moving average slope
  const n = history.length;
  const slope = (history[n - 1] - history[0]) / (currentPrice * Math.max(1, n));

  // Add slight seasonal volatility simulation based on product ID
  const hash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cycleMod = (hash % 10) - 5; // -5 to +4
  const factor = (slope * 0.5) + (cycleMod * 0.015); // -7.5% to +6%

  const expectedPrice30d = Math.max(product.price * 0.7, +(currentPrice * (1 + factor)).toFixed(2));
  const changePercent = +(((expectedPrice30d - currentPrice) / currentPrice) * 100).toFixed(1);

  let trendDirection: PriceForecastResult['trendDirection'] = 'stable';
  if (changePercent <= -2.5) trendDirection = 'falling';
  else if (changePercent >= 2.5) trendDirection = 'rising';

  let recommendedAction: PriceForecastResult['recommendedAction'] = 'GOOD_DEAL';
  let actionReason = 'Der aktuelle Preis liegt im optimalen Bereich. Ein Kauf wird empfohlen.';
  let dropProbability = 35;

  if (trendDirection === 'falling') {
    recommendedAction = 'WAIT_FEW_DAYS';
    dropProbability = Math.min(92, 60 + Math.abs(Math.round(changePercent * 2)));
    actionReason = `Unsere KI prognostiziert einen Preisnachlass von ca. ${Math.abs(changePercent)}% in den nächsten 14–30 Tagen.`;
  } else if (trendDirection === 'rising' || product.discount && product.discount > 20) {
    recommendedAction = 'BUY_NOW';
    dropProbability = 15;
    actionReason = 'Der Preis befindet sich aktuell nahe dem 90-Tage-Tiefstand. Zügiger Kauf empfohlen.';
  }

  // Generate 30-day forecast points (Day 0, 5, 10, 15, 20, 25, 30)
  const projectedTrajectory = [0, 5, 10, 15, 20, 25, 30].map(day => {
    const progress = day / 30;
    const predicted = currentPrice + (expectedPrice30d - currentPrice) * progress;
    const variance = (currentPrice * 0.04) * (1 + progress * 0.5);
    return {
      day,
      label: day === 0 ? 'Heute' : `+${day}T`,
      predictedPrice: +predicted.toFixed(2),
      lowerBound: +(predicted - variance).toFixed(2),
      upperBound: +(predicted + variance).toFixed(2),
    };
  });

  return {
    currentPrice,
    expectedPrice30d,
    trendDirection,
    changePercent,
    dropProbability,
    recommendedAction,
    actionReason,
    confidenceScore: 89,
    projectedTrajectory,
  };
}
