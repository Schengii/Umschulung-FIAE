import type { Transaction, Holding } from '../../types';
import { parseDateString, DEFAULT_EXCHANGE_RATES } from './currencyUtils';

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
 */
export function calculateIRR(
  transactions: Transaction[],
  currentPortfolioValue: number,
  cashBalance: number,
  rateMap: Record<string, number> = DEFAULT_EXCHANGE_RATES
): number {
  const finalValue = currentPortfolioValue + cashBalance;
  if (finalValue <= 0 || transactions.length === 0) return 0;

  const hasDeposits = transactions.some(tx => tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL');

  interface CashFlow {
    date: Date;
    amount: number;
  }

  const flows: CashFlow[] = [];

  if (hasDeposits) {
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

  flows.sort((a, b) => a.date.getTime() - b.date.getTime());

  const today = new Date();
  flows.push({ date: today, amount: finalValue });

  const firstDate = flows[0].date;

  const npv = (rate: number): number => {
    let sum = 0;
    for (const flow of flows) {
      const years = (flow.date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      sum += flow.amount / Math.pow(1 + rate, years);
    }
    return sum;
  };

  const npvDerivative = (rate: number): number => {
    let sum = 0;
    for (const flow of flows) {
      const years = (flow.date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (years === 0) continue;
      sum -= years * flow.amount / Math.pow(1 + rate, years + 1);
    }
    return sum;
  };

  let guess = 0.1;
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
 */
export function calculateTTWRR(
  transactions: Transaction[],
  currentPortfolioValue: number,
  cashBalance: number,
  rateMap: Record<string, number> = DEFAULT_EXCHANGE_RATES
): number {
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
  return ((finalValue - totalDeposited) / totalDeposited) * 100;
}
