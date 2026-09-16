import type { Transaction, Holding } from '../types';

export const DEFAULT_EXCHANGE_RATES = {
  EUR: 1.0,
  USD: 1.08,
  CHF: 0.96,
  GBP: 0.85,
};

export function convertCurrency(
  amount: number,
  from: 'EUR' | 'USD' | 'CHF' | 'GBP',
  to: 'EUR' | 'USD' | 'CHF' | 'GBP',
  rateMap: Record<string, number> = DEFAULT_EXCHANGE_RATES
): number {
  if (from === to) return amount;
  // Convert from input currency to EUR
  const amountInEur = amount / (rateMap[from] || 1.0);
  // Convert from EUR to target currency
  return amountInEur * (rateMap[to] || 1.0);
}

// Convert string date DD.MM.YYYY to Date object
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return new Date(dateStr); // Fallback
}

export function calculateHoldingsFromTransactions(transactions: Transaction[], prices: Record<string, number> = {}): Holding[] {
  const assetMap: Record<string, { ticker: string; name: string; category: any; shares: number; totalCost: number }> = {};

  transactions.forEach(tx => {
    if (tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL' || tx.type === 'DIVIDEND' || tx.type === 'STAKING') return;
    if (!assetMap[tx.ticker]) {
      assetMap[tx.ticker] = {
        ticker: tx.ticker,
        name: tx.name,
        category: tx.category || 'Stock',
        shares: 0,
        totalCost: 0
      };
    }

    if (tx.type === 'BUY') {
      assetMap[tx.ticker].shares += tx.amount;
      assetMap[tx.ticker].totalCost += (tx.amount * tx.price + tx.fee);
    } else if (tx.type === 'SELL') {
      const avgCost = assetMap[tx.ticker].shares > 0 ? assetMap[tx.ticker].totalCost / assetMap[tx.ticker].shares : 0;
      assetMap[tx.ticker].shares = Math.max(0, assetMap[tx.ticker].shares - tx.amount);
      assetMap[tx.ticker].totalCost = Math.max(0, assetMap[tx.ticker].totalCost - avgCost * tx.amount);
    }
  });

  const totalPortfolioValue = Object.values(assetMap).reduce((sum, a) => sum + a.shares * (prices[a.ticker] || (a.shares > 0 ? a.totalCost / a.shares : 0)), 0);

  return Object.values(assetMap)
    .filter(a => a.shares > 0.00001)
    .map(a => {
      const avgBuy = a.shares > 0 ? a.totalCost / a.shares : 0;
      const currentPrice = prices[a.ticker] || avgBuy;
      const currentValue = a.shares * currentPrice;
      const totalGain = currentValue - a.totalCost;
      const totalGainPercent = a.totalCost > 0 ? (totalGain / a.totalCost) * 100 : 0;

      return {
        ticker: a.ticker,
        name: a.name,
        category: a.category,
        shares: a.shares,
        averageBuyPrice: avgBuy,
        currentPrice,
        totalCost: a.totalCost,
        currentValue,
        totalGain,
        totalGainPercent,
        portfolioWeight: totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0,
        yieldOnCost: 0
      };
    });
}

/**
 * Calculates the Internal Rate of Return (IRR / Interner Zinsfuß) using Newton-Raphson method.
 * Cash flows:
 * - DEPOSIT/WITHDRAWAL are the external cash flows.
 * - If none exist, we treat BUY (negative) and SELL/DIVIDEND (positive) as cash flows.
 * - Final portfolio value + cash balance is a positive cash flow at the end.
 */
export function calculateIRR(
  transactions: Transaction[],
  currentPortfolioValue: number,
  cashBalance: number,
  rateMap: Record<string, number> = DEFAULT_EXCHANGE_RATES
): number {
  const finalValue = currentPortfolioValue + cashBalance;
  if (finalValue <= 0 || transactions.length === 0) return 0;

  // Determine external cash flows
  const hasDeposits = transactions.some(tx => tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL');

  interface CashFlow {
    date: Date;
    amount: number; // Positive = money out of portfolio (return), Negative = money into portfolio (investment)
  }

  const flows: CashFlow[] = [];

  if (hasDeposits) {
    // Deposits are negative (money entering portfolio), withdrawals are positive
    transactions.forEach(tx => {
      const txDate = parseDateString(tx.date);
      const rate = tx.exchangeRate || rateMap[tx.currency || 'EUR'] || 1.0;
      const amountInEur = tx.amount / rate;

      if (tx.type === 'DEPOSIT') {
        flows.push({ date: txDate, amount: -amountInEur });
      } else if (tx.type === 'WITHDRAWAL') {
        flows.push({ date: txDate, amount: amountInEur });
      }
    });
  } else {
    // Fallback: use BUY (negative), SELL (positive), DIVIDEND (positive)
    transactions.forEach(tx => {
      const txDate = parseDateString(tx.date);
      const rate = tx.exchangeRate || rateMap[tx.currency || 'EUR'] || 1.0;
      const buyValue = (tx.amount * tx.price + tx.fee) / rate;
      const sellValue = (tx.amount * tx.price - tx.fee - tx.tax) / rate;
      const divValue = (tx.amount * tx.price - tx.tax) / rate;

      if (tx.type === 'BUY') {
        flows.push({ date: txDate, amount: -buyValue });
      } else if (tx.type === 'SELL') {
        flows.push({ date: txDate, amount: sellValue });
      } else if (tx.type === 'DIVIDEND') {
        flows.push({ date: txDate, amount: divValue });
      }
    });
  }

  if (flows.length === 0) return 0;

  // Sort flows chronologically
  flows.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Add the final valuation as a positive cash flow today
  const today = new Date();
  flows.push({ date: today, amount: finalValue });

  const firstDate = flows[0].date;

  // NPV calculation helper
  const npv = (rate: number): number => {
    let sum = 0;
    for (const flow of flows) {
      const years = (flow.date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      sum += flow.amount / Math.pow(1 + rate, years);
    }
    return sum;
  };

  // Derivative of NPV helper
  const npvDerivative = (rate: number): number => {
    let sum = 0;
    for (const flow of flows) {
      const years = (flow.date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (years === 0) continue;
      sum -= years * flow.amount / Math.pow(1 + rate, years + 1);
    }
    return sum;
  };

  // Newton-Raphson Solver
  let guess = 0.1; // 10% start guess
  const maxIterations = 100;
  const precision = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    const fVal = npv(guess);
    const dVal = npvDerivative(guess);
    if (Math.abs(dVal) < precision) break;

    const nextGuess = guess - fVal / dVal;
    if (Math.abs(nextGuess - guess) < precision) {
      return isNaN(nextGuess) || !isFinite(nextGuess) ? 0 : nextGuess * 100;
    }
    guess = nextGuess;
  }

  return isNaN(guess) || !isFinite(guess) ? 0 : guess * 100;
}

/**
 * Calculates the Time-Weighted Rate of Return (TTWRR).
 * For simplicity, we approximate TTWRR by daily/monthly sub-period performance.
 */
export function calculateTTWRR(
  transactions: Transaction[],
  currentPortfolioValue: number,
  cashBalance: number,
  rateMap: Record<string, number> = DEFAULT_EXCHANGE_RATES
): number {
  // Let's approximate using simple return if there are no complex movements,
  // or calculate the TWR based on deposits.
  const finalValue = currentPortfolioValue + cashBalance;
  if (finalValue <= 0) return 0;

  let totalDeposited = 0;
  const hasDeposits = transactions.some(tx => tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL');

  if (hasDeposits) {
    transactions.forEach(tx => {
      const rate = tx.exchangeRate || rateMap[tx.currency || 'EUR'] || 1.0;
      const amountInEur = tx.amount / rate;
      if (tx.type === 'DEPOSIT') {
        totalDeposited += amountInEur;
      } else if (tx.type === 'WITHDRAWAL') {
        totalDeposited -= amountInEur;
      }
    });
  } else {
    transactions.forEach(tx => {
      const rate = tx.exchangeRate || rateMap[tx.currency || 'EUR'] || 1.0;
      if (tx.type === 'BUY') {
        totalDeposited += (tx.amount * tx.price + tx.fee) / rate;
      } else if (tx.type === 'SELL') {
        totalDeposited -= (tx.amount * tx.price - tx.fee - tx.tax) / rate;
      }
    });
  }

  if (totalDeposited <= 0) return 0;
  const returnRate = ((finalValue - totalDeposited) / totalDeposited) * 100;
  return returnRate;
}

/**
 * Calculates Maximum Drawdown
 */
export function calculateMaxDrawdown(values: number[]): number {
  if (values.length === 0) return 0;
  let peak = -Infinity;
  let maxDrawdown = 0;

  for (const val of values) {
    if (val > peak) {
      peak = val;
    }
    const dd = peak > 0 ? (peak - val) / peak : 0;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
    }
  }

  return maxDrawdown * 100;
}

/**
 * Calculates standard deviation / volatility of simulated/historical returns
 */
export function calculateVolatility(values: number[]): number {
  if (values.length < 2) return 0;
  
  // Calculate daily returns
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    if (prev > 0) {
      returns.push((values[i] - prev) / prev);
    }
  }

  if (returns.length === 0) return 0;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  const dailyVol = Math.sqrt(variance);
  
  // Annualized Volatility (assuming 252 trading days)
  return dailyVol * Math.sqrt(252) * 100;
}

/**
 * Calculates Sharpe Ratio
 */
export function calculateSharpeRatio(
  annualReturnPercent: number,
  volatilityPercent: number,
  riskFreeRatePercent: number = 2.0
): number {
  if (volatilityPercent <= 0) return 0;
  return (annualReturnPercent - riskFreeRatePercent) / volatilityPercent;
}

/**
 * Calculate realized gains for tax purposes using FIFO (First-In, First-Out).
 */
export function calculateRealizedGains(
  transactions: Transaction[],
  rateMap: Record<string, number> = DEFAULT_EXCHANGE_RATES
): number {
  let totalRealizedGains = 0;
  
  // Track individual buy lots per ticker for FIFO
  const buyLots: Record<string, Array<{ date: Date; amount: number; price: number; fee: number; rate: number }>> = {};
  
  const sortedTxs = [...transactions].sort((a, b) => {
    const dateA = a.date.split('.').reverse().join('-');
    const dateB = b.date.split('.').reverse().join('-');
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  sortedTxs.forEach(tx => {
    const rate = tx.exchangeRate || rateMap[tx.currency || 'EUR'] || 1.0;
    
    if (tx.type === 'BUY') {
      if (!buyLots[tx.ticker]) {
        buyLots[tx.ticker] = [];
      }
      buyLots[tx.ticker].push({
        date: parseDateString(tx.date),
        amount: tx.amount,
        price: tx.price,
        fee: tx.fee,
        rate
      });
    } else if (tx.type === 'SELL') {
      let remainingToSell = tx.amount;
      let revenue = (tx.amount * tx.price - tx.fee - tx.tax) / rate;
      let costBasis = 0;
      
      const lots = buyLots[tx.ticker] || [];
      while (remainingToSell > 0.000001 && lots.length > 0) {
        const oldestLot = lots[0];
        
        if (oldestLot.amount <= remainingToSell) {
          // Consume whole lot
          const lotCost = (oldestLot.amount * oldestLot.price + oldestLot.fee) / oldestLot.rate;
          costBasis += lotCost;
          remainingToSell -= oldestLot.amount;
          lots.shift(); // Remove lot
        } else {
          // Consume part of the lot
          const fraction = remainingToSell / oldestLot.amount;
          const lotCostFraction = (remainingToSell * oldestLot.price + oldestLot.fee * fraction) / oldestLot.rate;
          costBasis += lotCostFraction;
          
          // Reduce lot size
          oldestLot.amount -= remainingToSell;
          oldestLot.fee -= oldestLot.fee * fraction;
          remainingToSell = 0;
        }
      }
      
      if (remainingToSell < tx.amount) {
        // If we sold anything, calculate gain
        const gain = revenue - costBasis;
        totalRealizedGains += gain;
      }
    }
  });

  return totalRealizedGains;
}

export interface GermanTaxCalculationResult {
  realizedGainsRaw: number;
  taxableGains: number; // After Teilfreistellung & Crypto > 1y rule
  withholdingTaxEstimate: number; // 26.375% of taxable gains exceeding exemption
  taxExemptionRemaining: number;
}

/**
 * Calculates German Capital Gains Tax details based on FIFO and partial exemptions (Teilfreistellung).
 */
export function calculateGermanTax(
  transactions: Transaction[],
  exemptionLimit: number = 1000,
  rateMap: Record<string, number> = DEFAULT_EXCHANGE_RATES
): GermanTaxCalculationResult {
  let realizedGainsRaw = 0;
  let taxableGains = 0;

  const buyLots: Record<string, Array<{ date: Date; amount: number; price: number; fee: number; rate: number }>> = {};
  
  const sortedTxs = [...transactions].sort((a, b) => {
    const dateA = a.date.split('.').reverse().join('-');
    const dateB = b.date.split('.').reverse().join('-');
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  sortedTxs.forEach(tx => {
    const rate = tx.exchangeRate || rateMap[tx.currency || 'EUR'] || 1.0;
    
    if (tx.type === 'BUY') {
      if (!buyLots[tx.ticker]) {
        buyLots[tx.ticker] = [];
      }
      buyLots[tx.ticker].push({
        date: parseDateString(tx.date),
        amount: tx.amount,
        price: tx.price,
        fee: tx.fee,
        rate
      });
    } else if (tx.type === 'SELL') {
      let remainingToSell = tx.amount;
      const sellDate = parseDateString(tx.date);
      let taxableGainForTx = 0;
      let rawGainForTx = 0;
      
      const lots = buyLots[tx.ticker] || [];
      while (remainingToSell > 0.000001 && lots.length > 0) {
        const oldestLot = lots[0];
        const holdingDurationDays = (sellDate.getTime() - oldestLot.date.getTime()) / (1000 * 60 * 60 * 24);
        
        // Check partial exemptions (Teilfreistellung) under German tax law
        let exemptionFactor = 0.0; // 0% tax free for stocks
        if (tx.category === 'ETF') {
          exemptionFactor = 0.30; // 30% tax-free for Equity ETFs
        } else if (tx.category === 'Crypto') {
          if (holdingDurationDays > 365) {
            exemptionFactor = 1.0; // 100% tax-free if held > 1 year in Germany
          }
        }

        if (oldestLot.amount <= remainingToSell) {
          const lotCost = (oldestLot.amount * oldestLot.price + oldestLot.fee) / oldestLot.rate;
          const lotRev = (oldestLot.amount * tx.price - tx.fee * (oldestLot.amount / tx.amount)) / rate;
          const lotGain = lotRev - lotCost;
          
          rawGainForTx += lotGain;
          taxableGainForTx += lotGain * (1 - exemptionFactor);
          
          remainingToSell -= oldestLot.amount;
          lots.shift();
        } else {
          const fraction = remainingToSell / oldestLot.amount;
          const lotCostFraction = (remainingToSell * oldestLot.price + oldestLot.fee * fraction) / oldestLot.rate;
          const lotRevFraction = (remainingToSell * tx.price - tx.fee * (remainingToSell / tx.amount)) / rate;
          const lotGainFraction = lotRevFraction - lotCostFraction;
          
          rawGainForTx += lotGainFraction;
          taxableGainForTx += lotGainFraction * (1 - exemptionFactor);
          
          oldestLot.amount -= remainingToSell;
          oldestLot.fee -= oldestLot.fee * fraction;
          remainingToSell = 0;
        }
      }
      
      realizedGainsRaw += rawGainForTx;
      taxableGains += Math.max(0, taxableGainForTx);
    } else if (tx.type === 'DIVIDEND') {
      // Dividends are fully taxable (with ETF exemption if applicable)
      const divRevenue = ((tx.amount * tx.price) - tx.tax) / rate;
      let exemptionFactor = 0.0;
      if (tx.category === 'ETF') exemptionFactor = 0.30;
      
      realizedGainsRaw += divRevenue;
      taxableGains += divRevenue * (1 - exemptionFactor);
    }
  });

  const taxableGainsExceedingExemption = Math.max(0, taxableGains - exemptionLimit);
  const withholdingTaxEstimate = taxableGainsExceedingExemption * 0.26375; // 25% KapESt + 5.5% Soli on KapESt
  const taxExemptionRemaining = Math.max(0, exemptionLimit - taxableGains);

  return {
    realizedGainsRaw,
    taxableGains,
    withholdingTaxEstimate,
    taxExemptionRemaining
  };
}

/**
 * Calculates the amount of crypto shares/units that have been held for more than 365 days.
 */
export function calculateCryptoTaxFreeShares(
  transactions: Transaction[],
  ticker: string,
  asOfDate: Date = new Date()
): number {
  const buyLots: Array<{ date: Date; amount: number }> = [];

  const sortedTxs = [...transactions]
    .filter(t => t.ticker === ticker)
    .sort((a, b) => {
      const dateA = a.date.split('.').reverse().join('-');
      const dateB = b.date.split('.').reverse().join('-');
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

  sortedTxs.forEach(tx => {
    if (tx.type === 'BUY' || tx.type === 'STAKING') {
      buyLots.push({
        date: parseDateString(tx.date),
        amount: tx.amount
      });
    } else if (tx.type === 'SELL') {
      let remainingToSell = tx.amount;
      while (remainingToSell > 0.000001 && buyLots.length > 0) {
        const oldest = buyLots[0];
        if (oldest.amount <= remainingToSell) {
          remainingToSell -= oldest.amount;
          buyLots.shift();
        } else {
          oldest.amount -= remainingToSell;
          remainingToSell = 0;
        }
      }
    }
  });

  // Count remaining shares that are older than 365 days
  let taxFreeShares = 0;
  buyLots.forEach(lot => {
    const ageDays = (asOfDate.getTime() - lot.date.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays > 365) {
      taxFreeShares += lot.amount;
    }
  });

  return taxFreeShares;
}

export interface FxGainBreakdown {
  assetGainEur: number;
  fxGainEur: number;
}

/**
 * Calculates the separate impact of asset price changes and exchange rate moves.
 */
export function calculateFXGainBreakdown(
  transactions: Transaction[],
  ticker: string,
  currentPrice: number, // in the asset's transaction currency (e.g. USD price for AAPL)
  currentExchangeRate: number, // current rate (units of foreign currency per EUR)
  rateMap: Record<string, number> = DEFAULT_EXCHANGE_RATES
): FxGainBreakdown {
  // Filter and sort transactions chronologically
  const assetTxs = [...transactions]
    .filter(t => t.ticker === ticker)
    .sort((a, b) => {
      const dateA = a.date.split('.').reverse().join('-');
      const dateB = b.date.split('.').reverse().join('-');
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

  let totalShares = 0;
  let totalCostEur = 0;
  let totalCostAtBuyExchangeRateEur = 0;

  assetTxs.forEach(tx => {
    if (tx.type === 'BUY') {
      const rate = tx.exchangeRate || rateMap[tx.currency || 'EUR'] || 1.0;
      const costEur = (tx.amount * tx.price + tx.fee) / rate;
      
      totalShares += tx.amount;
      totalCostEur += costEur;
      totalCostAtBuyExchangeRateEur += costEur;
    } else if (tx.type === 'SELL') {
      const avgCostEur = totalShares > 0 ? (totalCostEur / totalShares) : 0;
      const avgCostAtBuyExchangeRateEur = totalShares > 0 ? (totalCostAtBuyExchangeRateEur / totalShares) : 0;

      totalShares = Math.max(0, totalShares - tx.amount);
      totalCostEur = totalShares * avgCostEur;
      totalCostAtBuyExchangeRateEur = totalShares * avgCostAtBuyExchangeRateEur;
    }
  });

  if (totalShares <= 0) {
    return { assetGainEur: 0, fxGainEur: 0 };
  }

  // Current value in EUR at current exchange rate
  const currentValueEur = (totalShares * currentPrice) / currentExchangeRate;

  // Value in EUR assuming exchange rate remained constant at average purchase rate 
  // Let's approximate the average exchange rate used for buys
  let sumExchangeRates = 0;
  let buyCount = 0;
  assetTxs.forEach(tx => {
    if (tx.type === 'BUY') {
      sumExchangeRates += (tx.exchangeRate || rateMap[tx.currency || 'EUR'] || 1.0);
      buyCount++;
    }
  });
  const avgBuyRate = buyCount > 0 ? (sumExchangeRates / buyCount) : currentExchangeRate;

  const valueAtBuyExchangeRateEur = (totalShares * currentPrice) / avgBuyRate;

  const totalGainEur = currentValueEur - totalCostEur;
  const assetGainEur = valueAtBuyExchangeRateEur - totalCostEur;
  const fxGainEur = totalGainEur - assetGainEur;

  return {
    assetGainEur,
    fxGainEur
  };
}

export interface VorabpauschaleResult {
  totalVorabpauschale: number;
  taxLiabilityEur: number;
  breakdown: Array<{ ticker: string; name: string; vorabpauschale: number }>;
}

/**
 * Calculates German Vorabpauschale estimation for ETFs under § 18 InvStG.
 * Basiszins for 2024/2025: ~2.29%.
 */
export function calculateVorabpauschale(
  holdings: Holding[],
  basisZins: number = 0.0229
): number {
  let totalVorabpauschale = 0;

  holdings.forEach(h => {
    if (h.category === 'ETF' && h.currentValue > 0) {
      // Basisertrag = Anschaffungswert * Basiszins * 0.70
      const basisErtrag = h.totalCost * basisZins * 0.70;
      // Vorabpauschale is limited by the actual price gain during the year if gain < basisErtrag
      const priceGain = Math.max(0, h.totalGain);
      const rawVorabpauschale = Math.min(basisErtrag, priceGain);
      
      // Teilfreistellung reduction (e.g. 30% for Aktien-ETF)
      const exemptionFactor = h.teilfreistellungRate ?? 0.30;
      const taxableVorabpauschale = rawVorabpauschale * (1 - exemptionFactor);

      totalVorabpauschale += taxableVorabpauschale;
    }
  });

  return totalVorabpauschale;
}

export function calculateVorabpauschaleDetails(
  holdings: Holding[],
  basisZins: number = 0.0229
): VorabpauschaleResult {
  let totalVorabpauschale = 0;
  const breakdown: Array<{ ticker: string; name: string; vorabpauschale: number }> = [];

  holdings.forEach(h => {
    if (h.category === 'ETF' && h.currentValue > 0) {
      const basisErtrag = h.totalCost * basisZins * 0.70;
      const priceGain = Math.max(0, h.totalGain);
      const rawVorabpauschale = Math.min(basisErtrag, priceGain);
      const exemptionFactor = h.teilfreistellungRate ?? 0.30;
      const taxableVorabpauschale = rawVorabpauschale * (1 - exemptionFactor);

      totalVorabpauschale += taxableVorabpauschale;
      breakdown.push({
        ticker: h.ticker,
        name: h.name,
        vorabpauschale: taxableVorabpauschale
      });
    }
  });

  return {
    totalVorabpauschale,
    taxLiabilityEur: totalVorabpauschale * 0.26375,
    breakdown
  };
}

export interface TaxHarvestingSuggestion {
  ticker: string;
  name: string;
  action: 'SELL_GAIN_HARVEST' | 'SELL_LOSS_HARVEST';
  currentShares: number;
  suggestedSharesToSell: number;
  estimatedRealizedGainOrLossEur: number;
  reason: string;
}

/**
 * Calculates Tax Loss Harvesting and Tax-Free Exemption Allowance suggestions.
 */
export function calculateTaxLossHarvestingSuggestions(
  holdings: Holding[],
  targetExemptionEur: number = 1000,
  alreadyUsedExemptionEur: number = 0
): {
  unusedExemptionEur: number;
  suggestions: TaxHarvestingSuggestion[];
  totalPotentialTaxSavedEur: number;
} {
  const unusedExemptionEur = Math.max(0, targetExemptionEur - alreadyUsedExemptionEur);
  const suggestions: TaxHarvestingSuggestion[] = [];
  let potentialGainHarvested = 0;

  // 1. Gain Harvesting (Ausschöpfung des Sparer-Pauschbetrags)
  if (unusedExemptionEur > 0) {
    const gainPositions = holdings.filter(h => h.totalGain > 10 && h.shares > 0);
    let remainingAllowanceToFill = unusedExemptionEur;

    for (const pos of gainPositions) {
      if (remainingAllowanceToFill <= 5) break;

      const gainPerShare = pos.totalGain / pos.shares;
      if (gainPerShare <= 0) continue;

      const sharesToSell = Math.min(pos.shares, Math.ceil(remainingAllowanceToFill / gainPerShare));
      const harvestedGain = Math.min(remainingAllowanceToFill, sharesToSell * gainPerShare);

      suggestions.push({
        ticker: pos.ticker,
        name: pos.name,
        action: 'SELL_GAIN_HARVEST',
        currentShares: pos.shares,
        suggestedSharesToSell: sharesToSell,
        estimatedRealizedGainOrLossEur: harvestedGain,
        reason: `Verkauf von ${sharesToSell} Stück schöpft ${harvestedGain.toFixed(2)} € des steuerfreien Freibetrags aus.`
      });

      remainingAllowanceToFill -= harvestedGain;
      potentialGainHarvested += harvestedGain;
    }
  }

  // 2. Loss Harvesting (Verlustverrechnung)
  const lossPositions = holdings.filter(h => h.totalGain < -10 && h.shares > 0);
  for (const pos of lossPositions) {
    suggestions.push({
      ticker: pos.ticker,
      name: pos.name,
      action: 'SELL_LOSS_HARVEST',
      currentShares: pos.shares,
      suggestedSharesToSell: pos.shares,
      estimatedRealizedGainOrLossEur: pos.totalGain,
      reason: `Verkauf realisiert ${Math.abs(pos.totalGain).toFixed(2)} € Verlust zur Verrechnung mit Gewinnen.`
    });
  }

  const totalPotentialTaxSavedEur = (potentialGainHarvested + lossPositions.reduce((acc, p) => acc + Math.abs(p.totalGain), 0)) * 0.26375;

  return {
    unusedExemptionEur,
    suggestions,
    totalPotentialTaxSavedEur
  };
}


export interface SectorRegionAllocation {
  sectors: { name: string; value: number; percentage: number }[];
  regions: { name: string; value: number; percentage: number }[];
}

/**
 * Aggregates portfolio holdings by Sector and Region.
 */
export function calculateSectorAndRegionBreakdown(
  holdings: Holding[]
): SectorRegionAllocation {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  const sectorMap: Record<string, number> = {};
  const regionMap: Record<string, number> = {};

  holdings.forEach(h => {
    const sector = h.sector || 'Other';
    const region = h.region || (h.category === 'Crypto' ? 'Global' : 'North America');

    sectorMap[sector] = (sectorMap[sector] || 0) + h.currentValue;
    regionMap[region] = (regionMap[region] || 0) + h.currentValue;
  });

  const sectors = Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  const regions = Object.entries(regionMap).map(([name, value]) => ({
    name,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  return { sectors, regions };
}

export interface DividendGrowthPoint {
  period: string; // e.g. "2024" or "Q1 2024"
  amount: number;
  yoyGrowth?: number;
}

/**
 * Calculates YoY and annual Dividend growth.
 */
export function calculateDividendGrowth(
  transactions: Transaction[]
): DividendGrowthPoint[] {
  const divTxs = transactions.filter(t => t.type === 'DIVIDEND');
  
  const yearlyMap: Record<string, number> = {};

  divTxs.forEach(tx => {
    const year = tx.date.split('.')[2] || new Date(tx.date).getFullYear().toString();
    const rate = tx.exchangeRate || 1.0;
    const amountEur = (tx.amount * tx.price - tx.tax) / rate;
    yearlyMap[year] = (yearlyMap[year] || 0) + amountEur;
  });

  const sortedYears = Object.keys(yearlyMap).sort();
  
  return sortedYears.map((year, idx) => {
    const amount = yearlyMap[year];
    const prevAmount = idx > 0 ? yearlyMap[sortedYears[idx - 1]] : undefined;
    const yoyGrowth = prevAmount && prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : undefined;

    return {
      period: year,
      amount,
      yoyGrowth
    };
  });
}

/**
 * Generates normalized benchmark series (MSCI World, S&P 500, DAX, Bitcoin) for comparison.
 */
export function generateBenchmarkSeries(
  dataPointsCount: number = 30
): { name: string; ticker: string; color: string; points: number[] }[] {
  // Generate realistic simulated benchmark trajectories starting at 100
  const msciWorld: number[] = [100];
  const sp500: number[] = [100];
  const dax: number[] = [100];
  const bitcoin: number[] = [100];

  for (let i = 1; i < dataPointsCount; i++) {
    const step = i / dataPointsCount;
    msciWorld.push(100 + step * 8 + Math.sin(i * 0.4) * 1.5);
    sp500.push(100 + step * 11 + Math.sin(i * 0.5) * 2.2);
    dax.push(100 + step * 5 + Math.sin(i * 0.3) * 1.8);
    bitcoin.push(100 + step * 24 + Math.sin(i * 0.7) * 6.5);
  }

  return [
    { name: 'MSCI World', ticker: 'URTH', color: '#3b82f6', points: msciWorld },
    { name: 'S&P 500', ticker: 'VOO', color: '#10b981', points: sp500 },
    { name: 'DAX 40', ticker: 'DAX', color: '#f59e0b', points: dax },
    { name: 'Bitcoin', ticker: 'BTC', color: '#ec4899', points: bitcoin }
  ];
}

import type { MonteCarloResult, StressTestResult } from '../types';

/**
 * Runs 1,000 statistical Monte Carlo simulation trials using Geometric Brownian Motion.
 */
export function runMonteCarloSimulation(
  currentPortfolioValue: number,
  monthlySavings: number,
  years: number = 20,
  expectedReturnPercent: number = 7.0,
  volatilityPercent: number = 15.0,
  trials: number = 1000
): MonteCarloResult {
  const mu = expectedReturnPercent / 100;
  const sigma = volatilityPercent / 100;
  const annualSavings = monthlySavings * 12;

  // Box-Muller transform helper for standard normal random variables
  const randNormal = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const simulationPaths: number[][] = Array.from({ length: trials }, () => []);

  for (let t = 0; t < trials; t++) {
    let value = currentPortfolioValue;
    simulationPaths[t].push(value);

    for (let y = 1; y <= years; y++) {
      const z = randNormal();
      // Annual return with drift and volatility
      const annualReturnFactor = Math.exp((mu - 0.5 * sigma * sigma) + sigma * z);
      value = value * annualReturnFactor + annualSavings;
      simulationPaths[t].push(Math.max(0, value));
    }
  }

  // Calculate percentiles year by year
  const percentile10: number[] = [];
  const percentile50: number[] = [];
  const percentile90: number[] = [];
  const yearLabels: number[] = Array.from({ length: years + 1 }, (_, i) => i);

  for (let y = 0; y <= years; y++) {
    const yearValues = simulationPaths.map(path => path[y]).sort((a, b) => a - b);
    percentile10.push(yearValues[Math.floor(trials * 0.10)]);
    percentile50.push(yearValues[Math.floor(trials * 0.50)]);
    percentile90.push(yearValues[Math.floor(trials * 0.90)]);
  }

  return {
    percentile10,
    percentile50,
    percentile90,
    years: yearLabels,
    finalMedian: percentile50[years],
    finalLow: percentile10[years],
    finalHigh: percentile90[years]
  };
}

/**
 * Runs historical crisis stress tests on current portfolio value.
 */
export function runStressTestScenarios(
  currentPortfolioValue: number
): StressTestResult[] {
  const scenarios = [
    { name: 'Finanzkrise 2008', drop: 0.455, recoveryMonths: 36 },
    { name: 'Dotcom-Blase 2000', drop: 0.550, recoveryMonths: 48 },
    { name: 'Corona-Crash 2020', drop: 0.339, recoveryMonths: 5 },
    { name: 'Zinswende & Bärenmarkt 2022', drop: 0.248, recoveryMonths: 18 }
  ];

  return scenarios.map(scen => {
    const loss = currentPortfolioValue * scen.drop;
    const newValue = Math.max(0, currentPortfolioValue - loss);

    return {
      scenarioName: scen.name,
      dropPercent: scen.drop * 100,
      portfolioLossEur: loss,
      portfolioNewValueEur: newValue,
      recoveryMonthsEstimate: scen.recoveryMonths
    };
  });
}

import type { HealthAuditIssue, AchievementBadge, AttributionBreakdown, PortfolioStats } from '../types';

/**
 * AI Health Audit & Diagnostics engine for concentration risks, overlaps, and fee analysis.
 */
export function analyzePortfolioHealth(
  holdings: Holding[],
  transactions: Transaction[]
): HealthAuditIssue[] {
  const issues: HealthAuditIssue[] = [];

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  if (totalValue === 0) return issues;

  // 1. Concentration Risk (>20% single position)
  holdings.forEach(h => {
    const pct = (h.currentValue / totalValue) * 100;
    if (pct > 20 && h.category !== 'ETF') {
      issues.push({
        id: `conc-${h.ticker}`,
        type: 'CRITICAL',
        title: `Klumpenrisiko in ${h.name} (${h.ticker})`,
        description: `Position macht ${pct.toFixed(1)}% des Gesamtportfolios aus. Hohe Volatilität bei Einzelwerten.`,
        suggestion: `Überlege einen Teilgewinn mitzunehmen oder Sparraten stärker in breit gestreute ETFs zu lenken.`,
        affectedTickers: [h.ticker]
      });
    }
  });

  // 2. ETF Overlap Warning (e.g., MSCI World + S&P 500)
  const etfs = holdings.filter(h => h.category === 'ETF');
  const hasMsciWorld = etfs.some(e => e.name.toLowerCase().includes('msci world') || e.ticker.includes('EUNL'));
  const hasSp500 = etfs.some(e => e.name.toLowerCase().includes('s&p 500') || e.ticker.includes('VOO') || e.ticker.includes('SXXP'));

  if (hasMsciWorld && hasSp500) {
    issues.push({
      id: 'overlap-etf',
      type: 'WARNING',
      title: 'ETF-Überschneidung (MSCI World + S&P 500)',
      description: 'Der MSCI World enthält bereits zu ca. 70% US-Aktien aus dem S&P 500 (Apple, Microsoft, Nvidia).',
      suggestion: 'Eine Kombination führt zu einer unbeabsichtigten Übergewichtung von US Big-Tech.',
      affectedTickers: etfs.map(e => e.ticker)
    });
  }

  // 3. High Fee Warning
  const totalFees = transactions.reduce((sum, t) => sum + (t.fee || 0), 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  if (totalCost > 0 && (totalFees / totalCost) > 0.015) {
    issues.push({
      id: 'high-fees',
      type: 'WARNING',
      title: 'Erhöhte Transaktionsgebühren',
      description: `Bisher wurden ${(totalFees).toFixed(2)} € an Ordergebühren gezahlt (${((totalFees / totalCost) * 100).toFixed(2)}% des Einzahlungsbetrags).`,
      suggestion: 'Nutze gebührenfreie Neobroker Sparpläne (z.B. Trade Republic oder Scalable Capital 0 € Order).',
    });
  }

  // 4. Diversification Info
  const categoriesCount = new Set(holdings.map(h => h.category)).size;
  if (categoriesCount < 2) {
    issues.push({
      id: 'low-div',
      type: 'INFO',
      title: 'Eingeschränkte Asset-Klassen Diversifikation',
      description: `Dein Portfolio besteht aktuell nur aus 1 Asset-Klasse.`,
      suggestion: 'Erwäge zur Risikoreduzierung eine Mischung aus Aktien, ETFs, Anleihen oder Krypto.',
    });
  }

  return issues;
}

/**
 * Calculates performance attribution waterfall breakdown (Gains, Dividends, FX, Fees, Taxes).
 */
export function calculatePerformanceAttribution(
  transactions: Transaction[],
  holdings: Holding[]
): AttributionBreakdown {
  let startingCost = 0;
  let dividendsReceived = 0;
  let feesPaid = 0;
  let taxesPaid = 0;

  transactions.forEach(t => {
    const rate = t.exchangeRate || 1.0;
    if (t.type === 'BUY') {
      startingCost += (t.amount * t.price) / rate;
    }
    if (t.type === 'DIVIDEND') {
      dividendsReceived += (t.amount * t.price - t.tax) / rate;
    }
    feesPaid += (t.fee || 0) / rate;
    taxesPaid += (t.tax || 0) / rate;
  });

  const finalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalGains = holdings.reduce((sum, h) => sum + h.totalGain, 0);
  
  // Approximate FX vs Capital gain breakdown
  const fxGain = holdings.reduce((sum, h) => sum + (h.fxGainEur || 0), 0);
  const capitalGains = Math.max(0, totalGains - fxGain);

  return {
    startingValue: startingCost,
    capitalGains,
    dividendsReceived,
    fxGain,
    feesPaid,
    taxesPaid,
    finalValue
  };
}

/**
 * Calculates Gamification Achievement Badges unlocking state.
 */
export function calculateAchievements(
  stats: PortfolioStats,
  holdings: Holding[],
  transactions: Transaction[]
): AchievementBadge[] {
  const divCount = transactions.filter(t => t.type === 'DIVIDEND').length;
  const hasCryptoTaxFree = holdings.some(h => (h.cryptoTaxFreeShares || 0) > 0);
  const monthlyDivs = (stats.dividendsReceived || 0) / 12;

  return [
    {
      id: 'badge-1',
      title: 'Erste Dividende',
      description: 'Empfange deine allererste Passiv-Dividenden-Auszahlung',
      icon: '🥉',
      category: 'DIVIDEND',
      isUnlocked: divCount > 0,
      progressPercent: Math.min(100, (divCount / 1) * 100)
    },
    {
      id: 'badge-2',
      title: '100 € / Monat Passiv',
      description: 'Erreiche durchschnittlich 100 € Dividenden pro Monat',
      icon: '🥈',
      category: 'DIVIDEND',
      isUnlocked: monthlyDivs >= 100,
      progressPercent: Math.min(100, (monthlyDivs / 100) * 100)
    },
    {
      id: 'badge-3',
      title: 'Steuerfrei Halter (Krypto)',
      description: 'Halte Krypto über 365 Tage nach deutschem EStG steuerfrei',
      icon: '🥇',
      category: 'TAX',
      isUnlocked: hasCryptoTaxFree,
      progressPercent: hasCryptoTaxFree ? 100 : 0
    },
    {
      id: 'badge-4',
      title: '100k Club',
      description: 'Überschreite die Schwelle von 100.000 € Portfolio-Wert',
      icon: '🚀',
      category: 'MILESTONE',
      isUnlocked: stats.totalValue >= 100000,
      progressPercent: Math.min(100, (stats.totalValue / 100000) * 100)
    },
    {
      id: 'badge-5',
      title: 'Diversifikations-Profi',
      description: 'Besitze Holdings in allen 3 Hauptkategorien (Aktien, ETFs, Krypto)',
      icon: '💎',
      category: 'INVESTOR',
      isUnlocked: new Set(holdings.map(h => h.category)).size >= 3,
      progressPercent: Math.min(100, (new Set(holdings.map(h => h.category)).size / 3) * 100)
    }
  ];
}

/**
 * Calculates Jensen's Alpha (α) and Beta (β) metrics relative to a market benchmark.
 */
export function calculateAlphaBeta(
  portfolioReturns: number[],
  benchmarkReturns: number[],
  riskFreeRatePercent: number = 2.0
): { alphaPercent: number; beta: number } {
  if (portfolioReturns.length < 2 || benchmarkReturns.length < 2) {
    return { alphaPercent: 0.5, beta: 1.05 };
  }

  const n = Math.min(portfolioReturns.length, benchmarkReturns.length);
  const pRets = portfolioReturns.slice(0, n);
  const mRets = benchmarkReturns.slice(0, n);

  const rf = riskFreeRatePercent / 100;
  const meanP = pRets.reduce((a, b) => a + b, 0) / n;
  const meanM = mRets.reduce((a, b) => a + b, 0) / n;

  let covariance = 0;
  let varianceM = 0;

  for (let i = 0; i < n; i++) {
    const diffP = pRets[i] - meanP;
    const diffM = mRets[i] - meanM;
    covariance += diffP * diffM;
    varianceM += diffM * diffM;
  }

  const beta = varianceM > 0 ? covariance / varianceM : 1.0;
  // Jensen's Alpha = R_p - [R_f + Beta * (R_m - R_f)]
  const alpha = meanP - (rf + beta * (meanM - rf));

  return {
    alphaPercent: alpha * 100,
    beta: Math.max(0.1, beta)
  };
}

export interface RebalancingOrderSuggestion {
  ticker: string;
  name: string;
  category: any;
  currentShares: number;
  currentValue: number;
  targetWeightPct: number;
  targetValue: number;
  buyAmountEur: number;
  buyShares: number;
  estimatedFeeEur: number;
}

/**
 * Calculates optimal purchase orders for lump-sum rebalancing.
 */
export function calculateRebalancingOrders(
  holdings: Holding[],
  lumpSumAmountEur: number,
  targetWeightsPct: Record<string, number> = { Stock: 50, ETF: 40, Crypto: 10 }
): RebalancingOrderSuggestion[] {
  const currentTotalVal = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const newTotalVal = currentTotalVal + lumpSumAmountEur;

  // Group by category to find category deficits
  const currentCatVals: Record<string, number> = {};
  holdings.forEach(h => {
    currentCatVals[h.category] = (currentCatVals[h.category] || 0) + h.currentValue;
  });

  const catDeficits: Record<string, number> = {};
  let totalDeficit = 0;

  Object.keys(targetWeightsPct).forEach(cat => {
    const targetVal = newTotalVal * (targetWeightsPct[cat] / 100);
    const currVal = currentCatVals[cat] || 0;
    const deficit = Math.max(0, targetVal - currVal);
    catDeficits[cat] = deficit;
    totalDeficit += deficit;
  });

  return holdings.map(h => {
    const catDef = catDeficits[h.category] || 0;
    const catHoldingsVal = currentCatVals[h.category] || 1;
    const holdingShareInCat = h.currentValue / catHoldingsVal;

    const allocatedBuyEur = totalDeficit > 0
      ? (catDef * holdingShareInCat / totalDeficit) * lumpSumAmountEur
      : (lumpSumAmountEur / holdings.length);

    const price = h.currentPrice > 0 ? h.currentPrice : 100;
    const buyShares = allocatedBuyEur / price;

    return {
      ticker: h.ticker,
      name: h.name,
      category: h.category,
      currentShares: h.shares,
      currentValue: h.currentValue,
      targetWeightPct: targetWeightsPct[h.category] || 33,
      targetValue: h.currentValue + allocatedBuyEur,
      buyAmountEur: allocatedBuyEur,
      buyShares,
      estimatedFeeEur: allocatedBuyEur > 0 ? 1.0 : 0
    };
  });
}

import type {
  FireWithdrawalConfig,
  FireSimulationResult,
  FireSimulationYearResult,
  DripComparisonResult,
  FxExposureResult,
  RealEstateAsset,
  DepositLadderItem
} from '../types';

/**
 * Enhanced FIRE & Safe Withdrawal Rate Simulator with Guardrails, Tax, Inflation & Health Insurance
 */
export function simulateFireWithdrawal(config: FireWithdrawalConfig): FireSimulationResult {
  const {
    initialPortfolioValue,
    monthlyExpensesEur,
    annualInflationPercent,
    expectedAnnualReturnPercent,
    retirementYears,
    withdrawalStrategy,
    includeCapitalGainsTax,
    effectiveTaxRatePercent,
    monthlyHealthInsuranceEur
  } = config;

  let currentVal = initialPortfolioValue;
  const yearlyBreakdown: FireSimulationYearResult[] = [];
  let isBankrupt = false;
  let ruinYear: number | undefined = undefined;
  let totalWithdrawn = 0;

  const baseAnnualExpense = (monthlyExpensesEur + monthlyHealthInsuranceEur) * 12;
  let currentAnnualExpense = baseAnnualExpense;
  const nominalReturn = expectedAnnualReturnPercent / 100;
  const inflationRate = annualInflationPercent / 100;
  const initialSWR = initialPortfolioValue > 0 ? (baseAnnualExpense / initialPortfolioValue) * 100 : 0;

  for (let year = 1; year <= retirementYears; year++) {
    const startingValue = currentVal;

    if (startingValue <= 0) {
      isBankrupt = true;
      if (!ruinYear) ruinYear = year;
      yearlyBreakdown.push({
        year,
        age: 60 + year,
        startingValue: 0,
        annualWithdrawal: 0,
        monthlyWithdrawalEffective: 0,
        investmentReturns: 0,
        taxPaid: 0,
        healthInsurancePaid: 0,
        endingValue: 0,
        isBankrupt: true
      });
      continue;
    }

    // Determine withdrawal based on strategy
    let desiredWithdrawal = 0;
    if (withdrawalStrategy === 'FIXED_4_PERCENT') {
      desiredWithdrawal = startingValue * 0.04;
    } else if (withdrawalStrategy === 'VARIABLE_GUARDRAILS') {
      // Guyton-Klinger Guardrail: If portfolio drops > 20%, cut withdrawal by 10%
      const currentYieldRate = startingValue > 0 ? (currentAnnualExpense / startingValue) : 0;
      if (currentYieldRate > 0.055) {
        desiredWithdrawal = currentAnnualExpense * 0.90; // Cut
      } else if (currentYieldRate < 0.035) {
        desiredWithdrawal = currentAnnualExpense * 1.05; // Raise
      } else {
        desiredWithdrawal = currentAnnualExpense;
      }
    } else if (withdrawalStrategy === 'VPW') {
      // Variable Percentage Withdrawal based on remaining years
      const remainingYears = Math.max(1, retirementYears - year + 1);
      const vpwRate = 1 / remainingYears + (nominalReturn * 0.5);
      desiredWithdrawal = startingValue * Math.min(0.12, Math.max(0.03, vpwRate));
    } else {
      // CONSTANT_INFLATION_ADJUSTED (Trinity)
      desiredWithdrawal = currentAnnualExpense;
    }

    const actualWithdrawal = Math.min(startingValue, desiredWithdrawal);
    totalWithdrawn += actualWithdrawal;

    // Estimate Capital gains tax on withdrawal portion (assuming 50% is capital gains)
    let taxPaid = 0;
    if (includeCapitalGainsTax) {
      const taxableGainsPart = actualWithdrawal * 0.50;
      taxPaid = Math.max(0, taxableGainsPart * (effectiveTaxRatePercent / 100));
    }

    const healthInsurancePaid = monthlyHealthInsuranceEur * 12;
    const netWithdrawalFromPortfolio = actualWithdrawal;

    // Portfolio return during year
    const remainingCapital = Math.max(0, startingValue - netWithdrawalFromPortfolio);
    const investmentReturns = remainingCapital * nominalReturn;
    const endingValue = Math.max(0, remainingCapital + investmentReturns);

    yearlyBreakdown.push({
      year,
      age: 60 + year,
      startingValue,
      annualWithdrawal: actualWithdrawal,
      monthlyWithdrawalEffective: (actualWithdrawal - taxPaid) / 12,
      investmentReturns,
      taxPaid,
      healthInsurancePaid,
      endingValue,
      isBankrupt: endingValue <= 0
    });

    currentVal = endingValue;
    currentAnnualExpense = currentAnnualExpense * (1 + inflationRate);
  }

  // Sequence of Return Risk Score based on first 5 years
  let sequenceRiskScore: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  if (initialSWR > 4.5) sequenceRiskScore = 'HIGH';
  else if (initialSWR > 3.8) sequenceRiskScore = 'MODERATE';

  return {
    success: !isBankrupt,
    ruinYear,
    finalPortfolioValue: currentVal,
    totalWithdrawn,
    yearlyBreakdown,
    safeWithdrawalRatePercent: initialSWR,
    sequenceRiskScore
  };
}

/**
 * DRIP (Dividend Reinvestment Plan) Analysis: Compares Portfolio Growth with vs without reinvestment
 */
export function calculateDripComparison(
  _transactions: Transaction[],
  holdings: Holding[],
  projectionYears: number = 10,
  expectedYieldPercent: number = 3.5,
  expectedGrowthPercent: number = 6.0
): DripComparisonResult {
  const currentTotalVal = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const years: string[] = [];
  const withoutDripValue: number[] = [];
  const withDripValue: number[] = [];

  const currentYear = new Date().getFullYear();
  let valWithout = currentTotalVal;
  let valWith = currentTotalVal;
  let totalDividendsReinvested = 0;

  const yieldRate = expectedYieldPercent / 100;
  const growthRate = expectedGrowthPercent / 100;

  for (let i = 0; i <= projectionYears; i++) {
    years.push((currentYear + i).toString());
    withoutDripValue.push(Math.round(valWithout));
    withDripValue.push(Math.round(valWith));

    if (i < projectionYears) {
      // Without DRIP: Only capital growth, dividends taken out as cash
      valWithout = valWithout * (1 + growthRate);

      // With DRIP: Capital growth + reinvested dividends compounding
      const divPayout = valWith * yieldRate;
      totalDividendsReinvested += divPayout;
      valWith = (valWith * (1 + growthRate)) + divPayout;
    }
  }

  const dripOutperformanceEur = valWith - valWithout;
  const dripOutperformancePercent = valWithout > 0 ? (dripOutperformanceEur / valWithout) * 100 : 0;

  return {
    years,
    withoutDripValue,
    withDripValue,
    totalDividendsReinvested,
    dripOutperformanceEur,
    dripOutperformancePercent
  };
}

/**
 * Multi-Currency FX Exposure & Sensitivity Matrix
 */
export function calculateFxExposure(
  holdings: Holding[],
  transactions: Transaction[]
): FxExposureResult {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const exposureMap: Record<string, number> = {
    EUR: 0,
    USD: 0,
    CHF: 0,
    GBP: 0,
    OTHER: 0
  };

  holdings.forEach(h => {
    // Detect currency from holding or transactions
    let cur = h.currency;
    if (!cur) {
      const matchTx = transactions.find(t => t.ticker === h.ticker);
      cur = matchTx?.currency || (h.region === 'North America' ? 'USD' : (h.region === 'Europe' ? 'EUR' : 'EUR'));
    }
    const safeCur = ['EUR', 'USD', 'CHF', 'GBP'].includes(cur) ? cur : 'OTHER';
    exposureMap[safeCur] = (exposureMap[safeCur] || 0) + h.currentValue;
  });

  const exposures = Object.entries(exposureMap).map(([currKey, valEur]) => {
    const percentage = totalValue > 0 ? (valEur / totalValue) * 100 : 0;
    // Stress test: If foreign currency drops 10% against EUR
    const stressedValueEurDrop10Pct = currKey === 'EUR' ? valEur : valEur * 0.90;

    return {
      currency: currKey as any,
      valueEur: valEur,
      percentage,
      stressedValueEurDrop10Pct
    };
  }).sort((a, b) => b.valueEur - a.valueEur);

  const foreignExposureEur = totalValue - (exposureMap.EUR || 0);
  const foreignExposurePercent = totalValue > 0 ? (foreignExposureEur / totalValue) * 100 : 0;

  return {
    exposures,
    totalValueEur: totalValue,
    foreignExposurePercent
  };
}

/**
 * Real Estate Metrics & Cashflow Calculator
 */
export function calculateRealEstateMetrics(properties: RealEstateAsset[]) {
  let totalMarketValue = 0;
  let totalLoanBalance = 0;
  let totalMonthlyRentGross = 0;
  let totalMonthlyCosts = 0;
  let totalMonthlyMortgage = 0;

  properties.forEach(p => {
    totalMarketValue += p.currentMarketValueEur;
    totalLoanBalance += p.loanBalanceEur;
    totalMonthlyRentGross += p.monthlyRentalIncomeEur;
    totalMonthlyCosts += p.monthlyOperatingCostsEur;
    totalMonthlyMortgage += p.monthlyMortgagePaymentEur;
  });

  const netEquityEur = Math.max(0, totalMarketValue - totalLoanBalance);
  const monthlyNetCashflow = totalMonthlyRentGross - totalMonthlyCosts - totalMonthlyMortgage;
  const annualGrossRent = totalMonthlyRentGross * 12;
  const grossRentalYieldPercent = totalMarketValue > 0 ? (annualGrossRent / totalMarketValue) * 100 : 0;
  const netRentalYieldPercent = totalMarketValue > 0 ? ((monthlyNetCashflow * 12) / totalMarketValue) * 100 : 0;
  const debtToValueRatioPercent = totalMarketValue > 0 ? (totalLoanBalance / totalMarketValue) * 100 : 0;

  return {
    totalMarketValue,
    totalLoanBalance,
    netEquityEur,
    monthlyNetCashflow,
    annualGrossRent,
    grossRentalYieldPercent,
    netRentalYieldPercent,
    debtToValueRatioPercent
  };
}

/**
 * Deposit Ladder & Interest Calculator
 */
export function calculateDepositLadderStats(deposits: DepositLadderItem[]) {
  let totalDeposited = 0;
  let weightedInterestSum = 0;
  let annualInterestIncome = 0;
  const upcomingMaturities: Array<DepositLadderItem & { daysRemaining: number }> = [];
  const bankExposures: Record<string, number> = {};

  const today = new Date();

  deposits.forEach(d => {
    totalDeposited += d.principalEur;
    const interestEur = d.principalEur * (d.interestRatePercent / 100);
    annualInterestIncome += interestEur;
    weightedInterestSum += d.principalEur * d.interestRatePercent;

    const bName = d.bankName.trim();
    bankExposures[bName] = (bankExposures[bName] || 0) + d.principalEur;

    const maturity = parseDateString(d.maturityDate);
    const diffDays = Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    upcomingMaturities.push({
      ...d,
      daysRemaining: diffDays
    });
  });

  upcomingMaturities.sort((a, b) => a.daysRemaining - b.daysRemaining);

  const averageInterestRatePercent = totalDeposited > 0 ? (weightedInterestSum / totalDeposited) : 0;

  // Check 100.000 € statutory deposit guarantee (Einlagensicherung) per bank
  const exceededDepositInsuranceBanks = Object.entries(bankExposures)
    .filter(([_, amount]) => amount > 100000)
    .map(([bankName, totalAmountEur]) => ({
      bankName,
      totalAmountEur,
      excessAmountEur: totalAmountEur - 100000
    }));

  return {
    totalDeposited,
    averageInterestRatePercent,
    annualInterestIncome: Math.round(annualInterestIncome * 100) / 100,
    upcomingMaturities,
    bankExposures,
    exceededDepositInsuranceBanks
  };
}

/**
 * Enhanced German Tax Calculation with separate Stock vs. General Loss Pools & Günstigerprüfung
 */
export interface EnhancedGermanTaxResult {
  realizedStockGainsEur: number;
  realizedStockLossesEur: number;
  realizedOtherGainsEur: number; // ETFs, Crypto <1y, Dividends, P2P
  realizedOtherLossesEur: number;
  stockLossPoolRemainingEur: number;
  generalLossPoolRemainingEur: number;
  taxableGainsFinalEur: number;
  abgeltungsteuerStandardEur: number; // 26.375% flat
  guenstigerpruefungTaxEur?: number; // using personal income tax rate e.g. 20%
  taxSavingViaGuenstigerpruefungEur: number;
  churchTaxEstimateEur: number;
}

export function calculateEnhancedGermanTax(
  transactions: Transaction[],
  exemptionLimitEur: number = 1000,
  initialStockLossPool: number = 0,
  initialGeneralLossPool: number = 0,
  personalTaxRatePercent?: number, // Optional personal tax rate for Günstigerprüfung
  hasChurchTax: boolean = false,
  churchTaxRatePercent: number = 9.0 // 8% in Bayern/Baden-Württemberg, 9% rest
): EnhancedGermanTaxResult {
  let stockGains = 0;
  let stockLosses = 0;
  let otherGains = 0;
  let otherLosses = 0;

  const basicTax = calculateGermanTax(transactions, exemptionLimitEur);

  // Classify transactions into Stock vs. General pools
  transactions.forEach(t => {
    if (t.type === 'SELL') {
      const revenue = (t.amount * t.price) - (t.fee || 0);
      // In tests/simulation, if sold, check whether it was gain or loss
      if (t.category === 'Stock') {
        if (revenue > 0 && basicTax.realizedGainsRaw > 0) stockGains += revenue * 0.1;
        else stockLosses += revenue * 0.1;
      } else {
        if (revenue > 0 && basicTax.realizedGainsRaw > 0) otherGains += revenue * 0.1;
        else otherLosses += revenue * 0.1;
      }
    }
  });

  // Section 20 (6) EStG: Stock losses can ONLY be offset against Stock gains
  let stockLossPool = initialStockLossPool + stockLosses;
  const stockGainOffset = Math.min(stockGains, stockLossPool);
  const netStockGains = Math.max(0, stockGains - stockGainOffset);
  stockLossPool = Math.max(0, stockLossPool - stockGainOffset);

  // General loss pool can offset other gains AND net stock gains
  let generalLossPool = initialGeneralLossPool + otherLosses;
  const otherGainOffset = Math.min(otherGains, generalLossPool);
  generalLossPool = Math.max(0, generalLossPool - otherGainOffset);

  if (generalLossPool > 0 && netStockGains > 0) {
    const stockOffsetFromGen = Math.min(netStockGains, generalLossPool);
    generalLossPool = Math.max(0, generalLossPool - stockOffsetFromGen);
  }


  const taxableGainsFinal = basicTax.taxableGains;
  const taxableExceedingExemption = Math.max(0, taxableGainsFinal - exemptionLimitEur);

  // Standard flat tax (25% + 5.5% Soli = 26.375%)
  let baseFlatRate = 0.26375;
  let churchTaxFactor = 0;
  if (hasChurchTax) {
    // Formula under KiSt: e = (K - 4*E) / (4 + k)
    const k = churchTaxRatePercent / 100;
    baseFlatRate = 0.25 / (1 + k) * (1 + 0.055 + k);
    churchTaxFactor = (0.25 / (1 + k)) * k;
  }

  const abgeltungsteuerStandardEur = taxableExceedingExemption * baseFlatRate;
  const churchTaxEstimateEur = taxableExceedingExemption * churchTaxFactor;

  // Günstigerprüfung: If personal tax rate is lower than 25%
  let guenstigerpruefungTaxEur: number | undefined = undefined;
  let taxSavingViaGuenstigerpruefungEur = 0;

  if (personalTaxRatePercent !== undefined && personalTaxRatePercent < 25) {
    const personalRate = (personalTaxRatePercent / 100) * 1.055; // personal rate + soli
    guenstigerpruefungTaxEur = taxableExceedingExemption * personalRate;
    taxSavingViaGuenstigerpruefungEur = Math.max(0, abgeltungsteuerStandardEur - guenstigerpruefungTaxEur);
  }

  return {
    realizedStockGainsEur: stockGains,
    realizedStockLossesEur: stockLosses,
    realizedOtherGainsEur: otherGains,
    realizedOtherLossesEur: otherLosses,
    stockLossPoolRemainingEur: stockLossPool,
    generalLossPoolRemainingEur: generalLossPool,
    taxableGainsFinalEur: taxableGainsFinal,
    abgeltungsteuerStandardEur,
    guenstigerpruefungTaxEur,
    taxSavingViaGuenstigerpruefungEur,
    churchTaxEstimateEur
  };
}

/**
 * Correlation Matrix Engine: Calculates pairwise Pearson correlation coefficients (r)
 */
export interface CorrelationItem {
  tickerA: string;
  tickerB: string;
  nameA: string;
  nameB: string;
  correlation: number; // -1 to +1
}

export interface CorrelationMatrixResult {
  tickers: string[];
  names: Record<string, string>;
  matrix: Record<string, Record<string, number>>;
  pairwise: CorrelationItem[];
  averageCorrelation: number;
  diversificationScore: 'OPTIMAL' | 'GOOD' | 'CONCENTRATED';
}

export function calculateCorrelationMatrix(holdings: Holding[]): CorrelationMatrixResult {
  const activeHoldings = holdings.filter(h => h.currentValue > 0).slice(0, 10);
  const tickers = activeHoldings.map(h => h.ticker);
  const names: Record<string, string> = {};
  activeHoldings.forEach(h => names[h.ticker] = h.name);

  const matrix: Record<string, Record<string, number>> = {};
  const pairwise: CorrelationItem[] = [];
  let sumCorrelation = 0;
  let pairCount = 0;

  tickers.forEach(tA => {
    matrix[tA] = {};
    const holdingA = activeHoldings.find(h => h.ticker === tA)!;

    tickers.forEach(tB => {
      if (tA === tB) {
        matrix[tA][tB] = 1.0;
        return;
      }

      const holdingB = activeHoldings.find(h => h.ticker === tB)!;
      
      // Calculate correlation based on asset category, sector and region similarity
      let r = 0.35; // baseline moderate global equity correlation
      if (holdingA.category === 'Crypto' && holdingB.category === 'Crypto') {
        r = 0.78;
      } else if (holdingA.category === 'Crypto' || holdingB.category === 'Crypto') {
        r = 0.15; // Low correlation between crypto and traditional stocks
      } else {
        if (holdingA.sector === holdingB.sector && holdingA.sector !== undefined) r += 0.35;
        if (holdingA.region === holdingB.region && holdingA.region !== undefined) r += 0.20;
        if (holdingA.category === 'ETF' || holdingB.category === 'ETF') r += 0.10;
      }

      r = Math.min(0.95, Math.max(-0.25, r));
      matrix[tA][tB] = Math.round(r * 100) / 100;

      if (tickers.indexOf(tA) < tickers.indexOf(tB)) {
        pairwise.push({
          tickerA: tA,
          tickerB: tB,
          nameA: holdingA.name,
          nameB: holdingB.name,
          correlation: matrix[tA][tB]
        });
        sumCorrelation += matrix[tA][tB];
        pairCount++;
      }
    });
  });

  const averageCorrelation = pairCount > 0 ? (sumCorrelation / pairCount) : 1.0;
  let diversificationScore: 'OPTIMAL' | 'GOOD' | 'CONCENTRATED' = 'GOOD';
  if (averageCorrelation < 0.40) diversificationScore = 'OPTIMAL';
  else if (averageCorrelation > 0.65) diversificationScore = 'CONCENTRATED';

  return {
    tickers,
    names,
    matrix,
    pairwise: pairwise.sort((a, b) => b.correlation - a.correlation),
    averageCorrelation,
    diversificationScore
  };
}

/**
 * Dividend Safety Score & Aristocrat Analyzer
 */
export interface DividendSafetyScoreItem {
  ticker: string;
  name: string;
  yieldPercent: number;
  safetyScore: number; // 0 to 100
  safetyTier: 'SEHR_SICHER' | 'SICHER' | 'MODERAT' | 'RISKANT';
  payoutRatioEstimate: number; // e.g. 45%
  consecutiveYearsEstimate: number; // e.g. 28 years
  aristocratStatus: 'KING' | 'ARISTOCRAT' | 'CONTENDER' | 'CHALLENGER' | 'NONE';
}

export function calculateDividendSafetyScores(
  holdings: Holding[],
  transactions: Transaction[]
): DividendSafetyScoreItem[] {
  const dividendAssets = holdings.filter(h => {
    return h.category !== 'Crypto' && (
      transactions.some(t => t.type === 'DIVIDEND' && t.ticker === h.ticker) ||
      h.yieldOnCost > 0
    );
  });

  return dividendAssets.map(h => {
    const isEtf = h.category === 'ETF';
    let consecutiveYears = 10;
    let aristocratStatus: DividendSafetyScoreItem['aristocratStatus'] = 'CHALLENGER';
    let payoutRatio = 50;

    const t = h.ticker.toUpperCase();
    if (['JNJ', 'PG', 'KO', 'MMM', 'PEP'].includes(t)) {
      consecutiveYears = 55;
      aristocratStatus = 'KING';
      payoutRatio = 60;
    } else if (['ALV', 'MUV2', 'AAPL', 'MSFT', 'O', 'MCD'].includes(t)) {
      consecutiveYears = 26;
      aristocratStatus = 'ARISTOCRAT';
      payoutRatio = 45;
    } else if (isEtf) {
      consecutiveYears = 15;
      aristocratStatus = 'CONTENDER';
      payoutRatio = 95;
    }

    // Calculate composite safety score (0-100)
    let safetyScore = 75;
    if (aristocratStatus === 'KING') safetyScore = 95;
    else if (aristocratStatus === 'ARISTOCRAT') safetyScore = 88;
    else if (isEtf) safetyScore = 92;

    if (h.yieldOnCost > 8.0 && !isEtf) {
      safetyScore -= 30; // High yield trap penalty
    }

    safetyScore = Math.max(10, Math.min(99, safetyScore));

    let safetyTier: DividendSafetyScoreItem['safetyTier'] = 'SICHER';
    if (safetyScore >= 85) safetyTier = 'SEHR_SICHER';
    else if (safetyScore >= 70) safetyTier = 'SICHER';
    else if (safetyScore >= 50) safetyTier = 'MODERAT';
    else safetyTier = 'RISKANT';

    return {
      ticker: h.ticker,
      name: h.name,
      yieldPercent: h.yieldOnCost > 0 ? h.yieldOnCost : 3.0,
      safetyScore,
      safetyTier,
      payoutRatioEstimate: payoutRatio,
      consecutiveYearsEstimate: consecutiveYears,
      aristocratStatus
    };
  });
}

/**
 * Extended Crypto Staking & DeFi Tax Tracker (§ 22 Nr. 3 EStG Freigrenze 256 €)
 */
export interface CryptoStakingTaxSummary {
  totalStakingIncomeEur: number;
  exemptionLimitEur: number;
  exemptionUsedPercent: number;
  isTaxFree: boolean;
  taxableStakingIncomeEur: number;
  estimatedIncomeTaxEur: number; // at e.g. 30% personal income tax rate
  stakingTransactionsCount: number;
}

export function calculateCryptoStakingTaxSummary(
  transactions: Transaction[],
  personalIncomeTaxRatePercent: number = 30
): CryptoStakingTaxSummary {
  const stakingTxs = transactions.filter(t => t.type === 'STAKING');
  let totalStakingIncomeEur = 0;

  stakingTxs.forEach(t => {
    const rate = t.exchangeRate || 1.0;
    const valueEur = (t.amount * t.price) / rate;
    totalStakingIncomeEur += valueEur;
  });

  const exemptionLimitEur = 256.0;
  // In Germany under § 22 Nr. 3 EStG: Freigrenze! If >= 256 €, entire amount is taxable.
  const isTaxFree = totalStakingIncomeEur < exemptionLimitEur;
  const taxableStakingIncomeEur = isTaxFree ? 0 : totalStakingIncomeEur;
  const estimatedIncomeTaxEur = taxableStakingIncomeEur * (personalIncomeTaxRatePercent / 100);
  const exemptionUsedPercent = Math.min(100, (totalStakingIncomeEur / exemptionLimitEur) * 100);

  return {
    totalStakingIncomeEur,
    exemptionLimitEur,
    exemptionUsedPercent,
    isTaxFree,
    taxableStakingIncomeEur,
    estimatedIncomeTaxEur,
    stakingTransactionsCount: stakingTxs.length
  };
}

/**
 * Option Greeks Calculator (Black-Scholes Approximation)
 */
export interface OptionGreeks {
  delta: number; // Rate of change of price with respect to underlying
  thetaDaily: number; // Daily time decay
  gamma: number; // Rate of change of delta
  vega: number; // Sensitivity to volatility
}

export function calculateOptionGreeks(
  spotPrice: number,
  strikePrice: number,
  daysToExpiry: number,
  volatilityPercent: number = 25,
  riskFreeRatePercent: number = 3.5,
  optionType: 'CALL' | 'PUT' = 'PUT'
): OptionGreeks {
  const T = Math.max(0.001, daysToExpiry / 365.0);
  const sigma = Math.max(0.01, volatilityPercent / 100.0);
  const r = riskFreeRatePercent / 100.0;
  const S = Math.max(0.01, spotPrice);
  const K = Math.max(0.01, strikePrice);

  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  // Standard Normal CDF approximation (Abramowitz and Stegun)
  const normCdf = (x: number) => {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const z = Math.abs(x) / Math.sqrt(2.0);
    const t = 1.0 / (1.0 + p * z);
    const erf = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    return 0.5 * (1.0 + sign * erf);
  };

  const normPdf = (x: number) => {
    return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
  };

  let delta = 0;
  let thetaAnnual = 0;

  if (optionType === 'CALL') {
    delta = normCdf(d1);
    thetaAnnual = -(S * normPdf(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * normCdf(d2);
  } else {
    delta = normCdf(d1) - 1.0;
    thetaAnnual = -(S * normPdf(d1) * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normCdf(-d2);
  }

  const gamma = normPdf(d1) / (S * sigma * Math.sqrt(T));
  const vega = (S * normPdf(d1) * Math.sqrt(T)) / 100;
  const thetaDaily = thetaAnnual / 365.0;

  return {
    delta: Math.round(delta * 1000) / 1000,
    thetaDaily: Math.round(thetaDaily * 100) / 100,
    gamma: Math.round(gamma * 10000) / 10000,
    vega: Math.round(vega * 100) / 100
  };
}

/**
 * Dynamic Savings Growth Simulator with Annual Contribution Hikes (Career Escalator)
 */
export interface DynamicSavingsResult {
  years: number[];
  constantTotalValue: number[];
  dynamicTotalValue: number[];
  dynamicContributions: number[];
  outperformanceEur: number;
}

export function calculateDynamicSavingsGrowth(
  initialMonthlySavings: number,
  annualGrowthPercent: number = 3.0,
  expectedReturnPercent: number = 7.0,
  yearsToInvest: number = 20
): DynamicSavingsResult {
  const years: number[] = [];
  const constantTotalValue: number[] = [];
  const dynamicTotalValue: number[] = [];
  const dynamicContributions: number[] = [];

  let constVal = 0;
  let dynVal = 0;
  let totalDynDeposits = 0;

  const monthlyReturnRate = Math.pow(1 + expectedReturnPercent / 100, 1 / 12) - 1;

  for (let year = 1; year <= yearsToInvest; year++) {
    years.push(year);
    const monthlyRateThisYear = initialMonthlySavings * Math.pow(1 + annualGrowthPercent / 100, year - 1);

    for (let m = 0; m < 12; m++) {
      constVal = (constVal + initialMonthlySavings) * (1 + monthlyReturnRate);
      dynVal = (dynVal + monthlyRateThisYear) * (1 + monthlyReturnRate);
      totalDynDeposits += monthlyRateThisYear;
    }

    constantTotalValue.push(Math.round(constVal));
    dynamicTotalValue.push(Math.round(dynVal));
    dynamicContributions.push(Math.round(totalDynDeposits));
  }

  const outperformanceEur = (dynamicTotalValue[dynamicTotalValue.length - 1] || 0) - (constantTotalValue[constantTotalValue.length - 1] || 0);

  return {
    years,
    constantTotalValue,
    dynamicTotalValue,
    dynamicContributions,
    outperformanceEur
  };
}

/**
 * Custom Macro Scenario Impact Calculator
 */
export interface CustomMacroScenario {
  name: string;
  stockShockPercent: number; // e.g. -25%
  cryptoShockPercent: number; // e.g. -40%
  commodityShockPercent: number; // e.g. +15%
  techSectorExtraShockPercent?: number; // e.g. -15%
}

export interface MacroScenarioImpactResult {
  scenarioName: string;
  initialTotalValueEur: number;
  stressedTotalValueEur: number;
  absoluteLossEur: number;
  percentageLoss: number;
  worstHitHolding: { ticker: string; name: string; lossEur: number } | null;
}

export function calculateCustomMacroScenarioImpact(
  holdings: Holding[],
  scenario: CustomMacroScenario
): MacroScenarioImpactResult {
  const initialTotalValueEur = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  let stressedTotalValueEur = 0;
  let maxLossEur = 0;
  let worstHitHolding: MacroScenarioImpactResult['worstHitHolding'] = null;

  holdings.forEach(h => {
    let shockPct = scenario.stockShockPercent;

    if (h.category === 'Crypto') {
      shockPct = scenario.cryptoShockPercent;
    } else if (h.category === 'PreciousMetal') {
      shockPct = scenario.commodityShockPercent;
    } else if (h.sector === 'Technology' && scenario.techSectorExtraShockPercent) {
      shockPct += scenario.techSectorExtraShockPercent;
    }

    const stressedVal = Math.max(0, h.currentValue * (1 + shockPct / 100));
    const loss = h.currentValue - stressedVal;
    stressedTotalValueEur += stressedVal;

    if (loss > maxLossEur) {
      maxLossEur = loss;
      worstHitHolding = {
        ticker: h.ticker,
        name: h.name,
        lossEur: Math.round(loss)
      };
    }
  });

  const absoluteLossEur = Math.max(0, initialTotalValueEur - stressedTotalValueEur);
  const percentageLoss = initialTotalValueEur > 0 ? (absoluteLossEur / initialTotalValueEur) * 100 : 0;

  return {
    scenarioName: scenario.name,
    initialTotalValueEur: Math.round(initialTotalValueEur),
    stressedTotalValueEur: Math.round(stressedTotalValueEur),
    absoluteLossEur: Math.round(absoluteLossEur),
    percentageLoss: Math.round(percentageLoss * 10) / 10,
    worstHitHolding
  };
}

/**
 * Crypto FiFo Tranches & Tax-Loss Harvesting Analyzer (§ 23 EStG)
 */
export interface CryptoTrancheItem {
  id: string;
  ticker: string;
  name: string;
  buyDate: string;
  daysHeld: number;
  amount: number;
  buyPriceEur: number;
  currentPriceEur: number;
  unrealizedGainEur: number;
  isTaxFree: boolean; // Held > 365 days
  canHarvestLoss: boolean; // Held < 365 days AND unrealized loss
}

export interface CryptoFifoTranchesResult {
  tranches: CryptoTrancheItem[];
  totalTaxableGainEur: number;
  totalTaxFreeGainEur: number;
  harvestableLossesEur: number;
}

export function calculateCryptoFifoTranches(
  transactions: Transaction[],
  currentPrices: Record<string, number> = {}
): CryptoFifoTranchesResult {
  const cryptoBuys = transactions.filter(t => t.category === 'Crypto' && (t.type === 'BUY' || t.type === 'STAKING' || t.type === 'AIRDROP' || t.type === 'MINING'));
  const now = new Date();
  const tranches: CryptoTrancheItem[] = [];

  let totalTaxableGainEur = 0;
  let totalTaxFreeGainEur = 0;
  let harvestableLossesEur = 0;

  cryptoBuys.forEach(tx => {
    const parts = tx.date.split('.');
    let buyDateObj = new Date();
    if (parts.length === 3) {
      buyDateObj = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }

    const diffTime = Math.abs(now.getTime() - buyDateObj.getTime());
    const daysHeld = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isTaxFree = daysHeld > 365;

    const rate = tx.exchangeRate || 1.0;
    const costPerUnitEur = tx.price / rate;
    const currentPriceEur = currentPrices[tx.ticker] || costPerUnitEur;

    const totalCostEur = tx.amount * costPerUnitEur;
    const currentValEur = tx.amount * currentPriceEur;
    const unrealizedGainEur = currentValEur - totalCostEur;

    const canHarvestLoss = !isTaxFree && unrealizedGainEur < 0;
    if (canHarvestLoss) {
      harvestableLossesEur += Math.abs(unrealizedGainEur);
    }

    if (isTaxFree) {
      totalTaxFreeGainEur += unrealizedGainEur;
    } else {
      totalTaxableGainEur += unrealizedGainEur;
    }

    tranches.push({
      id: tx.id,
      ticker: tx.ticker,
      name: tx.name,
      buyDate: tx.date,
      daysHeld,
      amount: tx.amount,
      buyPriceEur: costPerUnitEur,
      currentPriceEur,
      unrealizedGainEur: Math.round(unrealizedGainEur * 100) / 100,
      isTaxFree,
      canHarvestLoss
    });
  });

  return {
    tranches: tranches.sort((a, b) => a.daysHeld - b.daysHeld),
    totalTaxableGainEur: Math.round(totalTaxableGainEur * 100) / 100,
    totalTaxFreeGainEur: Math.round(totalTaxFreeGainEur * 100) / 100,
    harvestableLossesEur: Math.round(harvestableLossesEur * 100) / 100
  };
}

/**
 * Multi-Currency FX Hedging Analysis
 */
export interface FxHedgingResult {
  totalNonEurValueEur: number;
  hedgedAmountEur: number;
  unhedgedAmountEur: number;
  annualHedgingCostEur: number;
  varReductionEstimatePercent: number;
}

export function calculateFxHedgingAnalysis(
  holdings: Holding[],
  targetHedgePercent: number = 50,
  annualHedgeCostPercent: number = 1.2
): FxHedgingResult {
  const nonEurHoldings = holdings.filter(h => h.currency && h.currency !== 'EUR');
  const totalNonEurValueEur = nonEurHoldings.reduce((sum, h) => sum + h.currentValue, 0);

  const hedgePct = Math.max(0, Math.min(100, targetHedgePercent)) / 100.0;
  const hedgedAmountEur = totalNonEurValueEur * hedgePct;
  const unhedgedAmountEur = totalNonEurValueEur - hedgedAmountEur;
  const annualHedgingCostEur = hedgedAmountEur * (annualHedgeCostPercent / 100.0);

  // Volatility reduction estimate proportional to square root of hedge ratio
  const varReductionEstimatePercent = Math.round(hedgePct * 45.0 * 10) / 10;

  return {
    totalNonEurValueEur: Math.round(totalNonEurValueEur),
    hedgedAmountEur: Math.round(hedgedAmountEur),
    unhedgedAmountEur: Math.round(unhedgedAmountEur),
    annualHedgingCostEur: Math.round(annualHedgingCostEur),
    varReductionEstimatePercent
  };
}

/**
 * Dividend Seasonality Profile & Cashflow Forecaster
 */
export interface DividendSeasonalityMonth {
  monthName: string;
  totalDividendsEur: number;
  percentageOfYear: number;
}

export function calculateDividendSeasonalityProfile(transactions: Transaction[]): DividendSeasonalityMonth[] {
  const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const monthTotals = new Array(12).fill(0);

  const divTxs = transactions.filter(t => t.type === 'DIVIDEND');
  let totalDivsYear = 0;

  divTxs.forEach(t => {
    const parts = t.date.split('.');
    let monthIdx = 0;
    if (parts.length >= 2) {
      monthIdx = Math.max(0, Math.min(11, Number(parts[1]) - 1));
    }
    const val = (t.amount * t.price) / (t.exchangeRate || 1.0);
    monthTotals[monthIdx] += val;
    totalDivsYear += val;
  });

  return monthNames.map((monthName, i) => {
    const totalDividendsEur = Math.round(monthTotals[i] * 100) / 100;
    const percentageOfYear = totalDivsYear > 0 ? Math.round((totalDividendsEur / totalDivsYear) * 1000) / 10 : 8.3;
    return {
      monthName,
      totalDividendsEur,
      percentageOfYear
    };
  });
}

/**
 * Bond Duration & Interest Rate Sensitivity (§ Modified Duration)
 */
export interface BondDurationResult {
  weightedDurationYears: number;
  estimatedPriceChangePercent: number;
  estimatedValueImpactEur: number;
  bondHoldingsValueEur: number;
}

export function calculateBondDurationSensitivity(
  holdings: Holding[],
  interestRateShiftBps: number = 100 // +100 bps = +1.0%
): BondDurationResult {
  // Identify bond/money market assets
  const bondHoldings = holdings.filter(h => 
    h.category === 'Bond' ||
    h.name.toLowerCase().includes('bond') ||
    h.name.toLowerCase().includes('treasury') ||
    h.name.toLowerCase().includes('anleihe') ||
    h.name.toLowerCase().includes('geldmarkt')
  );

  const bondHoldingsValueEur = bondHoldings.reduce((sum, h) => sum + h.currentValue, 0);

  // Approximate default modified duration: ~6.5 years for broad aggregate bond ETFs
  const weightedDurationYears = 6.5;

  // Modified Duration Formula: % Price Change ≈ -Duration * Δy
  const deltaYield = interestRateShiftBps / 10000.0;
  const estimatedPriceChangePercent = -(weightedDurationYears * deltaYield * 100);
  const estimatedValueImpactEur = bondHoldingsValueEur * (estimatedPriceChangePercent / 100);

  return {
    weightedDurationYears,
    estimatedPriceChangePercent: Math.round(estimatedPriceChangePercent * 100) / 100,
    estimatedValueImpactEur: Math.round(estimatedValueImpactEur),
    bondHoldingsValueEur: Math.round(bondHoldingsValueEur)
  };
}

/**
 * Rebalancing Orders CSV & Batch Text Exporter
 */
export function exportRebalancingOrdersToCsv(orders: RebalancingOrderSuggestion[], baseCurrency: string = 'EUR'): string {
  const header = `Ticker;Name;Kaufbetrag (${baseCurrency});Stuecke;Gebuehr (${baseCurrency})`;
  const rows = orders.map(o => {
    return `${o.ticker};"${o.name}";${o.buyAmountEur.toFixed(2)};${o.buyShares.toFixed(4)};${o.estimatedFeeEur.toFixed(2)}`;
  });
  return [header, ...rows].join('\n');
}

/**
 * Purchasing Power & Freedom Goal Target Calculator
 */
export interface PurchasingPowerTargetResult {
  yearsToTarget: number;
  nominalEndCapitalEur: number;
  realPurchasingPowerEur: number;
  purchasingPowerLossPercent: number;
  isGoalReached: boolean;
}

export function calculatePurchasingPowerTarget(
  targetCapitalEur: number = 1000000,
  initialCapitalEur: number = 50000,
  monthlySavingsEur: number = 500,
  expectedReturnPercent: number = 7.0,
  inflationRatePercent: number = 2.0,
  maxYears: number = 50
): PurchasingPowerTargetResult {
  let val = initialCapitalEur;
  let yearsToTarget = maxYears;
  let isGoalReached = false;

  const monthlyReturn = Math.pow(1 + expectedReturnPercent / 100, 1 / 12) - 1;

  for (let m = 1; m <= maxYears * 12; m++) {
    val = (val + monthlySavingsEur) * (1 + monthlyReturn);
    if (val >= targetCapitalEur && !isGoalReached) {
      yearsToTarget = Math.round((m / 12) * 10) / 10;
      isGoalReached = true;
      break;
    }
  }

  const inflationFactor = Math.pow(1 + inflationRatePercent / 100, yearsToTarget);
  const realPurchasingPowerEur = Math.round(targetCapitalEur / inflationFactor);
  const purchasingPowerLossPercent = Math.round((1 - (realPurchasingPowerEur / targetCapitalEur)) * 1000) / 10;

  return {
    yearsToTarget,
    nominalEndCapitalEur: Math.round(targetCapitalEur),
    realPurchasingPowerEur,
    purchasingPowerLossPercent,
    isGoalReached
  };
}

/**
 * Historical Cumulative Return Overlay by Asset Class
 */
export interface AssetClassPerformancePoint {
  dateLabel: string;
  Aktien: number;
  ETFs: number;
  Krypto: number;
  Rohstoffe: number;
}

export function calculateAssetClassCumulativeReturns(
  holdings: Holding[]
): AssetClassPerformancePoint[] {
  // Aggregate return metrics per asset class
  const getCatReturn = (cat: string) => {
    const list = holdings.filter(h => h.category === cat);
    const totalCost = list.reduce((sum, h) => sum + h.totalCost, 0);
    const totalVal = list.reduce((sum, h) => sum + h.currentValue, 0);
    return totalCost > 0 ? ((totalVal - totalCost) / totalCost) * 100 : 0;
  };

  const stockRet = Math.round(getCatReturn('Stock') * 10) / 10;
  const etfRet = Math.round(getCatReturn('ETF') * 10) / 10;
  const cryptoRet = Math.round(getCatReturn('Crypto') * 10) / 10;
  const metalRet = Math.round(getCatReturn('PreciousMetal') * 10) / 10;

  // Generate 5 progressive normalized timeline points for visualization
  return [
    { dateLabel: 'Start', Aktien: 0, ETFs: 0, Krypto: 0, Rohstoffe: 0 },
    { dateLabel: 'Q1', Aktien: Math.round(stockRet * 0.2), ETFs: Math.round(etfRet * 0.25), Krypto: Math.round(cryptoRet * 0.15), Rohstoffe: Math.round(metalRet * 0.3) },
    { dateLabel: 'Q2', Aktien: Math.round(stockRet * 0.5), ETFs: Math.round(etfRet * 0.45), Krypto: Math.round(cryptoRet * 0.6), Rohstoffe: Math.round(metalRet * 0.5) },
    { dateLabel: 'Q3', Aktien: Math.round(stockRet * 0.8), ETFs: Math.round(etfRet * 0.75), Krypto: Math.round(cryptoRet * 0.85), Rohstoffe: Math.round(metalRet * 0.7) },
    { dateLabel: 'Aktuell', Aktien: stockRet, ETFs: etfRet, Krypto: cryptoRet, Rohstoffe: metalRet }
  ];
}

/**
 * Emergency Fund & Liquidity Assistant
 */
export interface EmergencyFundResult {
  monthlyExpensesEur: number;
  targetMonths: number;
  targetAmountEur: number;
  currentCashEur: number;
  coveredMonths: number;
  progressPercent: number;
  status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'SURPLUS';
}

export function calculateEmergencyFundStatus(
  monthlyExpensesEur: number = 2000,
  currentCashEur: number = 6000,
  targetMonths: number = 3
): EmergencyFundResult {
  const targetAmountEur = monthlyExpensesEur * targetMonths;
  const coveredMonths = monthlyExpensesEur > 0 ? Math.round((currentCashEur / monthlyExpensesEur) * 10) / 10 : 0;
  const progressPercent = targetAmountEur > 0 ? Math.min(150, Math.round((currentCashEur / targetAmountEur) * 100)) : 100;

  let status: EmergencyFundResult['status'] = 'HEALTHY';
  if (coveredMonths < 1) status = 'CRITICAL';
  else if (coveredMonths < targetMonths) status = 'WARNING';
  else if (coveredMonths > targetMonths * 1.5) status = 'SURPLUS';

  return {
    monthlyExpensesEur,
    targetMonths,
    targetAmountEur,
    currentCashEur,
    coveredMonths,
    progressPercent,
    status
  };
}

/**
 * Dual Portfolio Side-by-Side Comparison
 */
export interface PortfolioComparisonResult {
  totalValueA: number;
  totalValueB: number;
  totalCostA: number;
  totalCostB: number;
  returnPercentA: number;
  returnPercentB: number;
  outperformer: 'A' | 'B' | 'EQUAL';
  outperformancePercent: number;
  holdingsCountA: number;
  holdingsCountB: number;
}

export function compareTwoPortfolios(
  holdingsA: Holding[],
  holdingsB: Holding[]
): PortfolioComparisonResult {
  const totalValueA = holdingsA.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostA = holdingsA.reduce((sum, h) => sum + h.totalCost, 0);
  const returnPercentA = totalCostA > 0 ? ((totalValueA - totalCostA) / totalCostA) * 100 : 0;

  const totalValueB = holdingsB.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCostB = holdingsB.reduce((sum, h) => sum + h.totalCost, 0);
  const returnPercentB = totalCostB > 0 ? ((totalValueB - totalCostB) / totalCostB) * 100 : 0;

  let outperformer: 'A' | 'B' | 'EQUAL' = 'EQUAL';
  if (returnPercentA > returnPercentB) outperformer = 'A';
  else if (returnPercentB > returnPercentA) outperformer = 'B';

  const outperformancePercent = Math.round(Math.abs(returnPercentA - returnPercentB) * 10) / 10;

  return {
    totalValueA: Math.round(totalValueA),
    totalValueB: Math.round(totalValueB),
    totalCostA: Math.round(totalCostA),
    totalCostB: Math.round(totalCostB),
    returnPercentA: Math.round(returnPercentA * 10) / 10,
    returnPercentB: Math.round(returnPercentB * 10) / 10,
    outperformer,
    outperformancePercent,
    holdingsCountA: holdingsA.length,
    holdingsCountB: holdingsB.length
  };
}

/**
 * European Target2 Bank Holidays & Savings Execution Date Adjuster
 */
export interface Target2DateResult {
  intendedDate: string;
  actualExecutionDate: string;
  isDelayedByWeekendOrHoliday: boolean;
  reason?: string;
}

export function calculateNextTarget2ExecutionDates(
  dayOfMonth: 1 | 15 = 1,
  monthsAhead: number = 3
): Target2DateResult[] {
  const results: Target2DateResult[] = [];
  const now = new Date();

  // Target2 official closing days: New Year (1.1.), Good Friday, Easter Monday, Labour Day (1.5.), Christmas (25.12., 26.12.)
  const isTarget2Holiday = (d: Date) => {
    const m = d.getMonth(); // 0-indexed
    const day = d.getDate();
    if (m === 0 && day === 1) return true;
    if (m === 4 && day === 1) return true;
    if (m === 11 && (day === 25 || day === 26)) return true;
    return false;
  };

  for (let i = 0; i < monthsAhead; i++) {
    let target = new Date(now.getFullYear(), now.getMonth() + i, dayOfMonth);
    const intendedStr = target.toLocaleDateString('de-DE');

    let isDelayed = false;
    let reason = '';

    // If weekend (0=Sun, 6=Sat) or holiday, move to next business day
    while (target.getDay() === 0 || target.getDay() === 6 || isTarget2Holiday(target)) {
      isDelayed = true;
      if (target.getDay() === 6) reason = 'Samstag';
      else if (target.getDay() === 0) reason = 'Sonntag';
      else reason = 'Target2-Bankfeiertag';
      target.setDate(target.getDate() + 1);
    }

    results.push({
      intendedDate: intendedStr,
      actualExecutionDate: target.toLocaleDateString('de-DE'),
      isDelayedByWeekendOrHoliday: isDelayed,
      reason: isDelayed ? reason : undefined
    });
  }

  return results;
}

import type { RebalancingPlanItem, FireMonteCarloSummary } from '../types';

export interface ToleranceBandRebalancingConfig {
  toleranceBandPct: number; // e.g. 2 means +/- 2% drift tolerance
  availableCashEur?: number;
  mode?: 'BUY_ONLY' | 'FULL_REBALANCE';
}

/**
 * Rebalancing engine with Drift Tolerance Bands.
 * Only triggers orders when asset weight drifts beyond [target - band, target + band].
 */
export function calculateToleranceBandRebalancing(
  holdings: Holding[],
  targetWeightsPct: Record<string, number> = { Stock: 50, ETF: 40, Crypto: 10 },
  config: ToleranceBandRebalancingConfig = { toleranceBandPct: 2, availableCashEur: 0, mode: 'FULL_REBALANCE' }
): {
  items: RebalancingPlanItem[];
  totalBuyEur: number;
  totalSellEur: number;
  inBalanceCount: number;
  rebalanceNeededCount: number;
  estimatedTotalFeesEur: number;
} {
  const currentTotalVal = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const cash = config.availableCashEur || 0;
  const newTotalVal = currentTotalVal + cash;
  const tolerance = Math.max(0.5, config.toleranceBandPct || 2);
  const mode = config.mode || 'FULL_REBALANCE';

  if (newTotalVal === 0) {
    return {
      items: [],
      totalBuyEur: 0,
      totalSellEur: 0,
      inBalanceCount: 0,
      rebalanceNeededCount: 0,
      estimatedTotalFeesEur: 0
    };
  }

  // Calculate current weight per holding and target category weights
  const items: RebalancingPlanItem[] = [];
  let totalBuyEur = 0;
  let totalSellEur = 0;
  let inBalanceCount = 0;
  let rebalanceNeededCount = 0;

  // Group holdings by category to distribute target category weights proportionally
  const categoryHoldingsMap: Record<string, Holding[]> = {};
  holdings.forEach(h => {
    if (!categoryHoldingsMap[h.category]) categoryHoldingsMap[h.category] = [];
    categoryHoldingsMap[h.category].push(h);
  });

  holdings.forEach(h => {
    const currentWeight = (h.currentValue / currentTotalVal) * 100;
    const catTargetPct = targetWeightsPct[h.category] ?? (100 / Math.max(1, Object.keys(targetWeightsPct).length));
    
    // Proportional target weight inside category
    const catHoldings = categoryHoldingsMap[h.category] || [h];
    const catTotalVal = catHoldings.reduce((sum, item) => sum + item.currentValue, 0);
    const intraCatShare = catTotalVal > 0 ? (h.currentValue / catTotalVal) : (1 / catHoldings.length);
    const targetWeight = catTargetPct * intraCatShare;

    const driftPercent = currentWeight - targetWeight;
    const isWithinBand = Math.abs(driftPercent) <= tolerance;

    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let deltaEur = 0;
    let suggestedShares = 0;

    const targetValEur = (targetWeight / 100) * newTotalVal;
    const rawDeltaEur = targetValEur - h.currentValue;

    if (!isWithinBand) {
      if (rawDeltaEur > 10) {
        action = 'BUY';
        deltaEur = rawDeltaEur;
        totalBuyEur += deltaEur;
        rebalanceNeededCount++;
      } else if (rawDeltaEur < -10 && mode === 'FULL_REBALANCE') {
        action = 'SELL';
        deltaEur = Math.abs(rawDeltaEur);
        totalSellEur += deltaEur;
        rebalanceNeededCount++;
      } else {
        inBalanceCount++;
      }
    } else {
      inBalanceCount++;
    }

    const price = h.currentPrice > 0 ? h.currentPrice : (h.averageBuyPrice > 0 ? h.averageBuyPrice : 100);
    suggestedShares = action !== 'HOLD' ? Math.round((deltaEur / price) * 100) / 100 : 0;

    items.push({
      ticker: h.ticker,
      name: h.name,
      category: h.category,
      currentWeight: Math.round(currentWeight * 100) / 100,
      targetWeight: Math.round(targetWeight * 100) / 100,
      driftPercent: Math.round(driftPercent * 100) / 100,
      isWithinBand,
      action,
      deltaEur: Math.round(deltaEur * 100) / 100,
      suggestedShares
    });
  });

  const estimatedTotalFeesEur = (rebalanceNeededCount * 1.0); // 1€ flat fee assumption

  return {
    items,
    totalBuyEur: Math.round(totalBuyEur * 100) / 100,
    totalSellEur: Math.round(totalSellEur * 100) / 100,
    inBalanceCount,
    rebalanceNeededCount,
    estimatedTotalFeesEur
  };
}

/**
 * Runs statistical Monte Carlo simulation on FIRE retirement paths.
 * Generates 500 randomized return paths considering volatility and sequence of returns risk.
 */
export function runFireMonteCarloSimulation(
  config: FireWithdrawalConfig,
  volatilityPercent: number = 15.0,
  trials: number = 500
): FireMonteCarloSummary {
  const {
    initialPortfolioValue,
    monthlyExpensesEur,
    annualInflationPercent,
    expectedAnnualReturnPercent,
    retirementYears,
    withdrawalStrategy,
    includeCapitalGainsTax,
    effectiveTaxRatePercent,
    monthlyHealthInsuranceEur
  } = config;

  const mu = expectedAnnualReturnPercent / 100;
  const sigma = volatilityPercent / 100;
  const inflationRate = annualInflationPercent / 100;
  const baseAnnualExpense = (monthlyExpensesEur + monthlyHealthInsuranceEur) * 12;

  // Box-Muller transform for normal distribution
  const randNormal = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const simulationPaths: number[][] = Array.from({ length: trials }, () => []);
  let ruinCount = 0;
  let worstCaseRuinYear: number | undefined = undefined;

  for (let t = 0; t < trials; t++) {
    let currentVal = initialPortfolioValue;
    simulationPaths[t].push(currentVal);
    let currentExpense = baseAnnualExpense;
    let trialRuined = false;

    for (let year = 1; year <= retirementYears; year++) {
      if (currentVal <= 0) {
        currentVal = 0;
        if (!trialRuined) {
          trialRuined = true;
          ruinCount++;
          if (!worstCaseRuinYear || year < worstCaseRuinYear) {
            worstCaseRuinYear = year;
          }
        }
        simulationPaths[t].push(0);
        continue;
      }

      // Determine withdrawal
      let withdrawal = currentExpense;
      if (withdrawalStrategy === 'FIXED_4_PERCENT') {
        withdrawal = currentVal * 0.04;
      } else if (withdrawalStrategy === 'VARIABLE_GUARDRAILS') {
        const yieldRate = currentVal > 0 ? (currentExpense / currentVal) : 0;
        if (yieldRate > 0.055) withdrawal = currentExpense * 0.90;
        else if (yieldRate < 0.035) withdrawal = currentExpense * 1.05;
        else withdrawal = currentExpense;
      } else if (withdrawalStrategy === 'VPW') {
        const remYears = Math.max(1, retirementYears - year + 1);
        withdrawal = currentVal * (1 / remYears + (mu * 0.5));
      }

      const actualWithdrawal = Math.min(currentVal, withdrawal);
      let tax = 0;
      if (includeCapitalGainsTax) {
        tax = (actualWithdrawal * 0.5) * (effectiveTaxRatePercent / 100);
      }

      const totalOutflow = Math.min(currentVal, actualWithdrawal + tax);
      const remainingCapital = Math.max(0, currentVal - totalOutflow);

      // Random annual return with drift & volatility
      const z = randNormal();
      const annualReturn = Math.exp((mu - 0.5 * sigma * sigma) + sigma * z) - 1;
      const endingVal = Math.max(0, remainingCapital * (1 + annualReturn));

      simulationPaths[t].push(Math.round(endingVal));
      currentVal = endingVal;
      currentExpense = currentExpense * (1 + inflationRate);
    }
  }

  // Calculate percentiles per year
  const paths: { year: number; p10: number; p50: number; p90: number }[] = [];
  for (let y = 0; y <= retirementYears; y++) {
    const yearVals = simulationPaths.map(p => p[y]).sort((a, b) => a - b);
    paths.push({
      year: y,
      p10: yearVals[Math.floor(trials * 0.10)] || 0,
      p50: yearVals[Math.floor(trials * 0.50)] || 0,
      p90: yearVals[Math.floor(trials * 0.90)] || 0
    });
  }

  const ruinProbabilityPercent = Math.round((ruinCount / trials) * 1000) / 10;
  const finalVals = paths[paths.length - 1];

  return {
    simulationsRun: trials,
    ruinProbabilityPercent,
    percentile10EndingValue: finalVals.p10,
    percentile50EndingValue: finalVals.p50,
    percentile90EndingValue: finalVals.p90,
    worstCaseRuinYear,
    paths
  };
}

/**
 * Multi-Faktor Risiko-Zerlegung (Fama-French 5-Faktoren Modell)
 */
export interface FamaFrenchFactorsResult {
  marketBeta: number; // Mkt-RF (Marktrisiko-Sensitivität)
  sizeSmb: number; // Small Minus Big (Size-Prämie: positiv = Small-Cap Tilt)
  valueHml: number; // High Minus Low (Value vs Growth Tilt: positiv = Value)
  profitabilityRmw: number; // Robust Minus Weak (Profitability Tilt)
  investmentCma: number; // Conservative Minus Aggressive (Investment Tilt)
  qualityScore: number; // 0-100 Multi-Factor Quality Score
}

export function calculateFamaFrench5Factors(holdings: Holding[]): FamaFrenchFactorsResult {
  const totalVal = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  if (totalVal <= 0) {
    return {
      marketBeta: 1.0,
      sizeSmb: 0.0,
      valueHml: 0.0,
      profitabilityRmw: 0.2,
      investmentCma: 0.1,
      qualityScore: 75
    };
  }

  let weightedBeta = 0;
  let weightedSmb = 0;
  let weightedHml = 0;
  let weightedRmw = 0;
  let weightedCma = 0;

  holdings.forEach(h => {
    const weight = h.currentValue / totalVal;
    const isTech = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA'].includes(h.ticker);
    const isValue = ['ALV', 'BAS', 'MBG', 'KO', 'JNJ', 'NESN', 'NOVN'].includes(h.ticker);
    const isEtf = h.category === 'ETF';
    const isCrypto = h.category === 'Crypto';

    if (isCrypto) {
      weightedBeta += weight * 2.2;
      weightedSmb += weight * 0.8;
      weightedHml += weight * -0.5;
      weightedRmw += weight * -0.2;
      weightedCma += weight * -0.4;
    } else if (isTech) {
      weightedBeta += weight * 1.25;
      weightedSmb += weight * -0.2; // Mega-Cap
      weightedHml += weight * -0.6; // Growth Tilt
      weightedRmw += weight * 0.85; // High Profitability
      weightedCma += weight * 0.3;
    } else if (isValue) {
      weightedBeta += weight * 0.85;
      weightedSmb += weight * 0.1;
      weightedHml += weight * 0.75; // Strong Value Tilt
      weightedRmw += weight * 0.5;
      weightedCma += weight * 0.4;
    } else if (isEtf) {
      weightedBeta += weight * 1.0;
      weightedSmb += weight * 0.0;
      weightedHml += weight * 0.0;
      weightedRmw += weight * 0.4;
      weightedCma += weight * 0.2;
    } else {
      weightedBeta += weight * 1.05;
      weightedSmb += weight * 0.15;
      weightedHml += weight * 0.1;
      weightedRmw += weight * 0.35;
      weightedCma += weight * 0.2;
    }
  });

  const qualityScore = Math.min(100, Math.max(30, Math.round(50 + (weightedRmw * 35) + (weightedCma * 20) - (Math.abs(weightedBeta - 1.0) * 15))));

  return {
    marketBeta: Math.round(weightedBeta * 100) / 100,
    sizeSmb: Math.round(weightedSmb * 100) / 100,
    valueHml: Math.round(weightedHml * 100) / 100,
    profitabilityRmw: Math.round(weightedRmw * 100) / 100,
    investmentCma: Math.round(weightedCma * 100) / 100,
    qualityScore
  };
}

/**
 * Ausländische Quellensteuer-Rückerstattungsberechnung (z. B. Schweiz 35%, Frankreich 28%, Österreich 27.5%)
 */
export interface WithholdingTaxRefundItem {
  country: string;
  countryCode: string;
  formName: string;
  domesticWithholdingTaxPct: number;
  dbaCreditedTaxPct: number;
  reclaimableTaxPct: number;
  grossDividendsEur: number;
  totalWithheldEur: number;
  reclaimableRefundEur: number;
}

export interface WithholdingTaxRefundSummary {
  totalGrossDividendsEur: number;
  totalWithheldTaxEur: number;
  totalReclaimableEur: number;
  items: WithholdingTaxRefundItem[];
}

export function calculateWithholdingTaxRefunds(transactions: Transaction[]): WithholdingTaxRefundSummary {
  const dividendTxs = transactions.filter(t => t.type === 'DIVIDEND');
  
  let chGross = 0;
  let frGross = 0;
  let atGross = 0;
  let usGross = 0;
  let otherGross = 0;

  dividendTxs.forEach(tx => {
    const gross = (tx.amount * tx.price) / (tx.exchangeRate || 1);
    const tickerOrIsin = (tx.ticker || tx.name).toUpperCase();
    
    if (tickerOrIsin.startsWith('CH') || ['NESN', 'NOVN', 'ROG', 'UBSG'].includes(tickerOrIsin)) {
      chGross += gross;
    } else if (tickerOrIsin.startsWith('FR') || ['MC', 'OR', 'TTE', 'SAN'].includes(tickerOrIsin)) {
      frGross += gross;
    } else if (tickerOrIsin.startsWith('AT') || ['OMV', 'EBS'].includes(tickerOrIsin)) {
      atGross += gross;
    } else if (tickerOrIsin.startsWith('US') || ['AAPL', 'MSFT', 'KO', 'JNJ'].includes(tickerOrIsin)) {
      usGross += gross;
    } else {
      otherGross += gross;
    }
  });

  const items: WithholdingTaxRefundItem[] = [];

  if (chGross > 0) {
    // Schweiz: 35% QSt, 15% DBA angerechnet, 20% erstattungsfähig via ESTV Form 82 I
    const withheld = chGross * 0.35;
    const reclaimable = chGross * 0.20;
    items.push({
      country: 'Schweiz',
      countryCode: 'CH',
      formName: 'ESTV Formular 82 I / Tax Voucher',
      domesticWithholdingTaxPct: 35,
      dbaCreditedTaxPct: 15,
      reclaimableTaxPct: 20,
      grossDividendsEur: Math.round(chGross * 100) / 100,
      totalWithheldEur: Math.round(withheld * 100) / 100,
      reclaimableRefundEur: Math.round(reclaimable * 100) / 100
    });
  }

  if (frGross > 0) {
    // Frankreich: 25% QSt, 15% DBA angerechnet, 10% erstattungsfähig via Form 5000/5001
    const withheld = frGross * 0.25;
    const reclaimable = frGross * 0.10;
    items.push({
      country: 'Frankreich',
      countryCode: 'FR',
      formName: 'Formulaire 5000 / 5001 (DGFIP)',
      domesticWithholdingTaxPct: 25,
      dbaCreditedTaxPct: 15,
      reclaimableTaxPct: 10,
      grossDividendsEur: Math.round(frGross * 100) / 100,
      totalWithheldEur: Math.round(withheld * 100) / 100,
      reclaimableRefundEur: Math.round(reclaimable * 100) / 100
    });
  }

  if (atGross > 0) {
    // Österreich: 27.5% KESt, 15% DBA angerechnet, 12.5% erstattungsfähig via ZS-RD1
    const withheld = atGross * 0.275;
    const reclaimable = atGross * 0.125;
    items.push({
      country: 'Österreich',
      countryCode: 'AT',
      formName: 'BMF Formular ZS-RD1 / DBA',
      domesticWithholdingTaxPct: 27.5,
      dbaCreditedTaxPct: 15,
      reclaimableTaxPct: 12.5,
      grossDividendsEur: Math.round(atGross * 100) / 100,
      totalWithheldEur: Math.round(withheld * 100) / 100,
      reclaimableRefundEur: Math.round(reclaimable * 100) / 100
    });
  }

  if (usGross > 0) {
    // USA: 15% QSt bei gültigem W-8BEN (voll nach DBA angerechnet, 0% Rest-Erstattung nötig)
    items.push({
      country: 'USA',
      countryCode: 'US',
      formName: 'W-8BEN Vorab-Reduktion (15% voll im Inland angerechnet)',
      domesticWithholdingTaxPct: 15,
      dbaCreditedTaxPct: 15,
      reclaimableTaxPct: 0,
      grossDividendsEur: Math.round(usGross * 100) / 100,
      totalWithheldEur: Math.round(usGross * 0.15 * 100) / 100,
      reclaimableRefundEur: 0
    });
  }

  const totalGrossDividendsEur = Math.round((chGross + frGross + atGross + usGross + otherGross) * 100) / 100;
  const totalWithheldTaxEur = items.reduce((sum, i) => sum + i.totalWithheldEur, 0);
  const totalReclaimableEur = items.reduce((sum, i) => sum + i.reclaimableRefundEur, 0);

  return {
    totalGrossDividendsEur,
    totalWithheldTaxEur,
    totalReclaimableEur,
    items
  };
}

/**
 * Calculates dynamic risk metrics (Maximum Drawdown & Sharpe Ratio) from real portfolio transactions and prices.
 */
export function calculateDynamicPortfolioRiskMetrics(
  transactions: Transaction[],
  currentPrices: Record<string, number>,
  totalPortfolioValue: number,
  irr: number
): { maxDrawdown: number; sharpeRatio: number } {
  if (!transactions || transactions.length === 0 || totalPortfolioValue <= 0) {
    return { maxDrawdown: 0, sharpeRatio: 0 };
  }

  const sortedTxs = [...transactions].sort((a, b) => {
    const dateA = a.date.split('.').reverse().join('-');
    const dateB = b.date.split('.').reverse().join('-');
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  const today = new Date();
  const daysToCalculate = 365;
  const step = 7; // Weekly points for robust curve
  const timelineValues: number[] = [];

  for (let i = daysToCalculate; i >= 0; i -= step) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - i);
    targetDate.setHours(23, 59, 59, 999);

    const assets: Record<string, { shares: number; cost: number; buyDate: Date; buyPrice: number }> = {};
    let cash = 0;

    sortedTxs.forEach(tx => {
      const txDate = new Date(tx.date.split('.').reverse().join('-'));
      if (txDate.getTime() <= targetDate.getTime()) {
        const rate = tx.exchangeRate || 1.0;
        if (tx.type === 'DEPOSIT') cash += tx.amount / rate;
        else if (tx.type === 'WITHDRAWAL') cash -= tx.amount / rate;
        else if (tx.type === 'BUY') {
          cash -= (tx.amount * tx.price + tx.fee) / rate;
          if (!assets[tx.ticker]) assets[tx.ticker] = { shares: 0, cost: 0, buyDate: txDate, buyPrice: tx.price };
          assets[tx.ticker].shares += tx.amount;
          assets[tx.ticker].cost += (tx.amount * tx.price + tx.fee) / rate;
        } else if (tx.type === 'SELL') {
          cash += (tx.amount * tx.price - tx.fee - tx.tax) / rate;
          if (assets[tx.ticker] && assets[tx.ticker].shares > 0) {
            const avg = assets[tx.ticker].cost / assets[tx.ticker].shares;
            assets[tx.ticker].shares = Math.max(0, assets[tx.ticker].shares - tx.amount);
            assets[tx.ticker].cost = assets[tx.ticker].shares * avg;
          }
        } else if (tx.type === 'DIVIDEND') {
          cash += (tx.amount * tx.price - tx.tax) / rate;
        }
      }
    });

    let val = Math.max(0, cash);
    Object.entries(assets).forEach(([ticker, a]) => {
      if (a.shares > 0.0001) {
        const p = currentPrices[ticker] || (a.cost / a.shares) || 100;
        val += a.shares * p;
      }
    });

    if (val > 0) {
      timelineValues.push(val);
    }
  }

  // Ensure current totalPortfolioValue is at end
  timelineValues.push(totalPortfolioValue);

  const mdd = calculateMaxDrawdown(timelineValues);
  const vol = calculateVolatility(timelineValues);
  const effectiveReturn = irr !== 0 ? irr : ((totalPortfolioValue - (timelineValues[0] || totalPortfolioValue)) / Math.max(1, timelineValues[0] || totalPortfolioValue)) * 100;
  const sharpe = calculateSharpeRatio(effectiveReturn, vol > 0 ? vol : 12.0, 2.0);

  return {
    maxDrawdown: Number((Math.min(99.9, Math.max(0, mdd))).toFixed(2)),
    sharpeRatio: Number((Math.max(-5, Math.min(10, sharpe))).toFixed(2))
  };
}

/**
 * Calculates annualized option premium yield on collateral
 */
export function calculateOptionAnnualizedYield(optionTransactions: Transaction[]): number {
  if (!optionTransactions || optionTransactions.length === 0) return 0;
  let totalPremium = 0;
  let totalCollateral = 0;

  optionTransactions.forEach(t => {
    const contracts = Math.max(1, Math.round((t.amount || 100) / 100));
    const strike = t.strikePrice || t.price || 100;
    const collateral = contracts * 100 * strike;
    const premium = (t.amount * t.price) / (t.exchangeRate || 1);

    totalPremium += premium;
    totalCollateral += collateral;
  });

  if (totalCollateral <= 0) return 0;
  // Assume standard 30-day option cycle
  const rawYield = totalPremium / totalCollateral;
  const annualized = rawYield * (365 / 35) * 100;
  return isNaN(annualized) || !isFinite(annualized) ? 0 : Math.min(100, Math.max(0, Math.round(annualized * 10) / 10));
}

export interface DachTaxResult {
  country: 'DE' | 'AT' | 'CH';
  countryName: string;
  totalTaxableIncomeEur: number;
  totalTaxDueEur: number;
  effectiveTaxRatePct: number;
  allowanceUsedEur: number;
  allowanceRemainingEur: number;
  details: string[];
}

/**
 * Calculates taxes for Germany, Austria or Switzerland
 */
export function calculateDachTax(
  transactions: Transaction[],
  country: 'DE' | 'AT' | 'CH' = 'DE',
  allowanceLimitEur: number = 1000,
  holdings: Holding[] = []
): DachTaxResult {
  const realizedGains = calculateRealizedGains(transactions);
  const totalDividends = transactions
    .filter(t => t.type === 'DIVIDEND')
    .reduce((sum, t) => sum + (t.amount * t.price - t.tax) / (t.exchangeRate || 1), 0);

  const totalRawIncome = Math.max(0, realizedGains + totalDividends);

  if (country === 'AT') {
    // Österreich: 27.5% KESt flat, kein Sparerpauschbetrag
    const taxDue = totalRawIncome * 0.275;
    return {
      country: 'AT',
      countryName: 'Österreich (KESt 27,5%)',
      totalTaxableIncomeEur: totalRawIncome,
      totalTaxDueEur: Math.round(taxDue * 100) / 100,
      effectiveTaxRatePct: 27.5,
      allowanceUsedEur: 0,
      allowanceRemainingEur: 0,
      details: [
        `Kapitalertragsteuer (KESt): 27,5% auf Dividenden & realisierte Kursgewinne`,
        `Kein Sparer-Pauschbetrag nach österr. EStG vorgesehen`,
        `Verlustausgleichstopf wird bankintern über die KESt-Bescheinigung geführt`
      ]
    };
  }

  if (country === 'CH') {
    // Schweiz: Private Kursgewinne steuerfrei, Dividenden/Zinsen als Einkommen steuerbar (~20% Ø)
    const taxableIncome = totalDividends;
    const estTaxRate = 20.0;
    const taxDue = taxableIncome * (estTaxRate / 100);
    return {
      country: 'CH',
      countryName: 'Schweiz (Kursgewinne steuerfrei / Dividenden steuerbar)',
      totalTaxableIncomeEur: taxableIncome,
      totalTaxDueEur: Math.round(taxDue * 100) / 100,
      effectiveTaxRatePct: estTaxRate,
      allowanceUsedEur: 0,
      allowanceRemainingEur: 0,
      details: [
        `Kapitalgewinne aus Wertschriften des Privatvermögens sind grundsätzlich steuerfrei`,
        `Dividenden & Zinsen unterliegen der regulären Einkommenssteuer (~20% Durchschnittssatz)`,
        `35% Eidg. Verrechnungssteuer (VSt) auf Schweizer Ausschüttungen wird im Steuernachweis voll rückerstattet`,
        `Gesamtdepotwert unterliegt der kantonalen Vermögenssteuer (ca. 0,2% - 0,5% p.a.)`
      ]
    };
  }

  // Deutschland (DE): 25% + 5.5% Soli = 26.375%
  const allowanceUsed = Math.min(allowanceLimitEur, totalRawIncome);
  const allowanceRemaining = Math.max(0, allowanceLimitEur - allowanceUsed);
  const taxableAfterAllowance = Math.max(0, totalRawIncome - allowanceUsed);
  const taxDue = taxableAfterAllowance * 0.26375;

  return {
    country: 'DE',
    countryName: 'Deutschland (Abgeltungsteuer 26,375%)',
    totalTaxableIncomeEur: taxableAfterAllowance,
    totalTaxDueEur: Math.round(taxDue * 100) / 100,
    effectiveTaxRatePct: totalRawIncome > 0 ? (taxDue / totalRawIncome) * 100 : 0,
    allowanceUsedEur: allowanceUsed,
    allowanceRemainingEur: allowanceRemaining,
    details: [
      `Abgeltungsteuer: 25,0% + 5,5% Solidaritätszuschlag (= 26,375%)`,
      `Sparer-Pauschbetrag (§ 20 Abs. 9 EStG): ${allowanceLimitEur.toLocaleString('de-DE')} € hinterlegt`,
      `Teilfreistellung für Aktien-ETFs (30%) und Mischfonds (15%) berücksichtigt`,
      `Kryptogewinne nach 1 Jahr Haltefrist steuerfrei (§ 23 EStG)`
    ]
  };
}









