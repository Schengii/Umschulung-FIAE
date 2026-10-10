export interface DividendAssetCagr {
  ticker: string;
  name: string;
  yearlyPayouts: Record<string, number>; // year -> total net/gross EUR
  cagr1Year: number | null;
  cagr3Year: number | null;
  cagr5Year: number | null;
  totalDividendsPaidEur: number;
  yearsCount: number;
}

/**
 * Berechnet die durchschnittliche jährliche Wachstumsrate (Compound Annual Growth Rate - CAGR)
 * Formel: CAGR = (Endwert / Anfangswert) ^ (1 / n) - 1
 */
export function calculateCagr(startValue: number, endValue: number, periods: number): number | null {
  if (periods <= 0 || startValue <= 0 || endValue <= 0) return null;
  return Math.pow(endValue / startValue, 1 / periods) - 1;
}

/**
 * Analysiert historische Dividenden-Transaktionen und berechnet CAGR (1Y, 3Y, 5Y) je Asset.
 */
export function calculateDividendCagrPerAsset(
  transactions: Array<{
    type: string;
    ticker: string;
    name: string;
    date: string;
    amount: number;
    price: number;
    tax?: number;
    exchangeRate?: number;
  }>
): DividendAssetCagr[] {
  const dividendTxs = transactions.filter(t => t.type === 'DIVIDEND' && t.ticker && t.ticker !== 'CASH');

  // Gruppieren nach Ticker und Kalenderjahr
  const map: Record<string, { name: string; yearly: Record<string, number>; total: number }> = {};

  dividendTxs.forEach(tx => {
    const year = tx.date.split('.')[2] || tx.date.split('-')[0];
    const rate = tx.exchangeRate || 1.0;
    const payout = (tx.amount * tx.price - (tx.tax || 0)) / rate;

    if (!map[tx.ticker]) {
      map[tx.ticker] = { name: tx.name, yearly: {}, total: 0 };
    }
    map[tx.ticker].yearly[year] = (map[tx.ticker].yearly[year] || 0) + payout;
    map[tx.ticker].total += payout;
  });

  const results: DividendAssetCagr[] = [];

  Object.entries(map).forEach(([ticker, data]) => {
    const years = Object.keys(data.yearly).sort();
    const yearsCount = years.length;

    let cagr1Year: number | null = null;
    let cagr3Year: number | null = null;
    let cagr5Year: number | null = null;

    if (yearsCount >= 2) {
      const latestYear = years[yearsCount - 1];
      const prevYear = years[yearsCount - 2];
      cagr1Year = calculateCagr(data.yearly[prevYear], data.yearly[latestYear], 1);
    }

    if (yearsCount >= 4) {
      const latestYear = years[yearsCount - 1];
      const threeYearsAgo = years[yearsCount - 4];
      cagr3Year = calculateCagr(data.yearly[threeYearsAgo], data.yearly[latestYear], 3);
    }

    if (yearsCount >= 6) {
      const latestYear = years[yearsCount - 1];
      const fiveYearsAgo = years[yearsCount - 6];
      cagr5Year = calculateCagr(data.yearly[fiveYearsAgo], data.yearly[latestYear], 5);
    }

    results.push({
      ticker,
      name: data.name,
      yearlyPayouts: data.yearly,
      cagr1Year,
      cagr3Year,
      cagr5Year,
      totalDividendsPaidEur: data.total,
      yearsCount
    });
  });

  return results.sort((a, b) => b.totalDividendsPaidEur - a.totalDividendsPaidEur);
}
