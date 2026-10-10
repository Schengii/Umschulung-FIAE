import type { Holding, Transaction, BrokerStats } from '../types';

/**
 * Calculates comprehensive multi-broker statistics from holdings and transactions
 */
export function calculateBrokerBreakdown(
  holdings: Holding[],
  transactions: Transaction[]
): BrokerStats[] {
  const brokerMap = new Map<string, {
    holdingsCount: number;
    totalMarketValueEur: number;
    totalInvestedEur: number;
    totalDividendsEur: number;
    totalFeesEur: number;
    transactionsCount: number;
  }>();

  // Helper to ensure broker entry exists
  const getOrCreate = (rawBroker?: string) => {
    const brokerName = (rawBroker && rawBroker.trim()) ? rawBroker.trim() : 'Standard / Nicht zugeordnet';
    if (!brokerMap.has(brokerName)) {
      brokerMap.set(brokerName, {
        holdingsCount: 0,
        totalMarketValueEur: 0,
        totalInvestedEur: 0,
        totalDividendsEur: 0,
        totalFeesEur: 0,
        transactionsCount: 0
      });
    }
    return { entry: brokerMap.get(brokerName)!, brokerName };
  };

  // 1. Process holdings
  holdings.forEach(h => {
    const { entry } = getOrCreate(h.broker);
    entry.holdingsCount += 1;
    entry.totalMarketValueEur += h.currentValue || 0;
    entry.totalInvestedEur += h.totalCost || 0;
  });

  // 2. Process transactions
  transactions.forEach(t => {
    const { entry } = getOrCreate(t.broker);
    entry.transactionsCount += 1;
    if (t.fee) {
      entry.totalFeesEur += t.fee;
    }
    if (t.type === 'DIVIDEND') {
      const gross = (t.amount * t.price) / (t.exchangeRate || 1.0);
      entry.totalDividendsEur += gross;
    }
  });

  const totalAllMarketValue = Array.from(brokerMap.values()).reduce((sum, b) => sum + b.totalMarketValueEur, 0);

  const result: BrokerStats[] = Array.from(brokerMap.entries()).map(([brokerName, data]) => {
    const totalGainEur = data.totalMarketValueEur - data.totalInvestedEur;
    const totalGainPercent = data.totalInvestedEur > 0 ? (totalGainEur / data.totalInvestedEur) * 100 : 0;
    const shareOfPortfolioPercent = totalAllMarketValue > 0 ? (data.totalMarketValueEur / totalAllMarketValue) * 100 : 0;

    return {
      brokerName,
      holdingsCount: data.holdingsCount,
      totalMarketValueEur: Math.round(data.totalMarketValueEur * 100) / 100,
      totalInvestedEur: Math.round(data.totalInvestedEur * 100) / 100,
      totalGainEur: Math.round(totalGainEur * 100) / 100,
      totalGainPercent: Math.round(totalGainPercent * 100) / 100,
      totalDividendsEur: Math.round(data.totalDividendsEur * 100) / 100,
      totalFeesEur: Math.round(data.totalFeesEur * 100) / 100,
      transactionsCount: data.transactionsCount,
      shareOfPortfolioPercent: Math.round(shareOfPortfolioPercent * 10) / 10
    };
  });

  // Sort descending by market value
  return result.sort((a, b) => b.totalMarketValueEur - a.totalMarketValueEur);
}
