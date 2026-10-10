import type { Transaction, CryptoLossLot, CryptoTaxLossHarvestingSummary } from '../types';

export interface CryptoTaxHarvestingOptions {
  marginalTaxRatePercent?: number; // e.g. 42% default for high earners
  currentDate?: Date;
}

export function parseTransactionDate(dateStr: string): Date {
  // Support DD.MM.YYYY or YYYY-MM-DD
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
  }
  return new Date(dateStr);
}

export function calculateCryptoTaxLossHarvesting(
  transactions: Transaction[],
  currentPrices: Record<string, number> = {},
  options: CryptoTaxHarvestingOptions = {}
): CryptoTaxLossHarvestingSummary {
  const taxRate = options.marginalTaxRatePercent ?? 42.0;
  const now = options.currentDate ?? new Date();
  const currentYear = now.getFullYear();

  // 1. Calculate realized short-term crypto gains in the current calendar year
  let realizedGainsThisYearEur = 0;
  const cryptoSells = transactions.filter(t => t.category === 'Crypto' && t.type === 'SELL');
  const cryptoBuys = transactions.filter(t => t.category === 'Crypto' && (t.type === 'BUY' || t.type === 'STAKING' || t.type === 'AIRDROP' || t.type === 'MINING'));

  // Approximate realized short-term gains (if sell date is in current year and holding period was <= 365 days)
  cryptoSells.forEach(sell => {
    const sellDate = parseTransactionDate(sell.date);
    if (sellDate.getFullYear() === currentYear) {
      // Find matching buy
      const rate = sell.exchangeRate || 1.0;
      const sellPriceEur = sell.price / rate;
      const sellValEur = sell.amount * sellPriceEur;

      // Check buy lots for holding period
      const correspondingBuy = cryptoBuys.find(b => b.ticker === sell.ticker && parseTransactionDate(b.date) <= sellDate);
      if (correspondingBuy) {
        const buyDate = parseTransactionDate(correspondingBuy.date);
        const daysHeld = Math.ceil(Math.abs(sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysHeld <= 365) {
          const buyRate = correspondingBuy.exchangeRate || 1.0;
          const buyPriceEur = correspondingBuy.price / buyRate;
          const costEur = sell.amount * buyPriceEur;
          const gainEur = sellValEur - costEur;
          if (gainEur > 0) {
            realizedGainsThisYearEur += gainEur;
          }
        }
      }
    }
  });

  // 2. Track remaining open buy lots
  // Simple lot tracking: reduce buy amounts by sells
  const openLots: {
    id: string;
    ticker: string;
    name: string;
    buyDate: string;
    buyDateObj: Date;
    remainingAmount: number;
    buyPriceEur: number;
  }[] = [];

  cryptoBuys.forEach(tx => {
    const buyDateObj = parseTransactionDate(tx.date);
    const rate = tx.exchangeRate || 1.0;
    const buyPriceEur = tx.price / rate;
    openLots.push({
      id: tx.id,
      ticker: tx.ticker,
      name: tx.name,
      buyDate: tx.date,
      buyDateObj,
      remainingAmount: tx.amount,
      buyPriceEur
    });
  });

  // Deduct sold amounts FIFO
  cryptoSells.forEach(sell => {
    let unallocatedSell = sell.amount;
    for (const lot of openLots) {
      if (lot.ticker === sell.ticker && lot.remainingAmount > 0) {
        const deduct = Math.min(lot.remainingAmount, unallocatedSell);
        lot.remainingAmount -= deduct;
        unallocatedSell -= deduct;
        if (unallocatedSell <= 0.0000001) break;
      }
    }
  });

  // 3. Filter open lots for unrealized losses under 365 days
  const lossLots: CryptoLossLot[] = [];
  let totalHarvestableLossesEur = 0;

  openLots.forEach(lot => {
    if (lot.remainingAmount <= 0.0000001) return;

    const diffTime = now.getTime() - lot.buyDateObj.getTime();
    const daysHeld = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const daysRemaining = 365 - daysHeld;
    const isActionable = daysHeld <= 365;

    const currentPriceEur = currentPrices[lot.ticker] || lot.buyPriceEur;
    const costBasisEur = lot.remainingAmount * lot.buyPriceEur;
    const currentValueEur = lot.remainingAmount * currentPriceEur;
    const diff = currentValueEur - costBasisEur;

    // Only consider positions with an unrealized loss
    if (diff < -0.01) {
      const unrealizedLossEur = Math.abs(diff);
      const potentialTaxSavingsEur = unrealizedLossEur * (taxRate / 100);

      if (isActionable) {
        totalHarvestableLossesEur += unrealizedLossEur;
      }

      lossLots.push({
        id: lot.id,
        ticker: lot.ticker,
        name: lot.name,
        buyDate: lot.buyDate,
        daysHeld,
        daysRemainingInTaxYearWindow: Math.max(0, daysRemaining),
        amount: Number(lot.remainingAmount.toFixed(6)),
        buyPriceEur: Number(lot.buyPriceEur.toFixed(2)),
        currentPriceEur: Number(currentPriceEur.toFixed(2)),
        costBasisEur: Number(costBasisEur.toFixed(2)),
        currentValueEur: Number(currentValueEur.toFixed(2)),
        unrealizedLossEur: Number(unrealizedLossEur.toFixed(2)),
        potentialTaxSavingsEur: Number(potentialTaxSavingsEur.toFixed(2)),
        isActionable
      });
    }
  });

  // Sort lots by urgency: actionable first, then lowest days remaining
  lossLots.sort((a, b) => {
    if (a.isActionable !== b.isActionable) {
      return a.isActionable ? -1 : 1;
    }
    return a.daysRemainingInTaxYearWindow - b.daysRemainingInTaxYearWindow;
  });

  const estimatedTaxSavingsEur = totalHarvestableLossesEur * (taxRate / 100);

  return {
    realizedGainsThisYearEur: Number(realizedGainsThisYearEur.toFixed(2)),
    totalHarvestableLossesEur: Number(totalHarvestableLossesEur.toFixed(2)),
    estimatedTaxSavingsEur: Number(estimatedTaxSavingsEur.toFixed(2)),
    taxRatePercent: taxRate,
    lots: lossLots
  };
}
