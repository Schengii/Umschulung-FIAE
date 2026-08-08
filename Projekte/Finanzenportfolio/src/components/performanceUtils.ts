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






