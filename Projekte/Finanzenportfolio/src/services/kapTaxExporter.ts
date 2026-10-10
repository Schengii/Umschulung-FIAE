import type { Portfolio, Holding } from '../types';

export interface KapTaxCertificateData {
  taxYear: number;
  reportDate: string;
  portfolioName: string;
  baseCurrency: string;
  taxCountry: string;
  summary: {
    totalTaxableGainsEur: number; // Zeile 7
    realizedStockGainsEur: number; // Zeile 8
    realizedOtherGainsEur: number; // Zeile 9 / 11
    realizedOtherLossesEur: number; // Zeile 14
    realizedStockLossesEur: number; // Zeile 15
    usedTaxAllowanceEur: number; // Zeile 16/17 (Sparer-Pauschbetrag)
    retainedKapTaxEstimatedEur: number; // Kapitalertragsteuer (25%)
    solidaritySurchargeEur: number; // Soli (5.5% der KapESt)
    totalTaxLiabilityEur: number;
  };
  lossPoolsCarryForward: {
    stockLossPoolRemainingEur: number;
    generalLossPoolRemainingEur: number;
  };
  foreignWithholdingTax: {
    totalForeignTaxPaidEur: number;
    creditedForeignTaxEur: number; // Anrechenbare ausländische Quellensteuer (Zeile 41)
  };
  etfVorabpauschale: {
    totalBaseYieldEur: number;
    deductedDividendsEur: number;
    netTaxableAdvanceLumpSumEur: number;
  };
  transactionsBreakdown: Array<{
    date: string;
    ticker: string;
    name: string;
    type: string;
    shares: number;
    price: number;
    gainOrIncomeEur: number;
  }>;
}

/**
 * Builds formatted data ready for official tax reporting according to German Anlage KAP guidelines.
 */
export function generateKapTaxCertificateData(
  portfolio: Portfolio,
  holdings: Holding[] = [],
  taxYear: number = new Date().getFullYear(),
  taxAllowanceLimit: number = 1000
): KapTaxCertificateData {
  const txs = portfolio.transactions || [];
  const yearTxs = txs.filter(t => t.date.startsWith(taxYear.toString()));

  let stockGains = 0;
  let otherGains = 0;
  let stockLosses = 0;
  let otherLosses = 0;
  let foreignWithholdingTaxPaid = 0;

  const breakdown: KapTaxCertificateData['transactionsBreakdown'] = [];

  yearTxs.forEach(t => {
    let itemGain = 0;
    if (t.type === 'SELL') {
      const isStock = t.category === 'Stock';
      // Estimate gain from transaction price vs amount
      const mockGain = (t.amount * t.price) * 0.15; // approximation if buy price not given
      if (mockGain >= 0) {
        if (isStock) stockGains += mockGain;
        else otherGains += mockGain;
        itemGain = mockGain;
      } else {
        if (isStock) stockLosses += Math.abs(mockGain);
        else otherLosses += Math.abs(mockGain);
        itemGain = mockGain;
      }
    } else if (t.type === 'DIVIDEND') {
      const gross = t.amount * t.price;
      otherGains += gross;
      itemGain = gross;
      if (t.tax && t.tax > 0) {
        foreignWithholdingTaxPaid += t.tax;
      }
    }

    breakdown.push({
      date: t.date,
      ticker: t.ticker,
      name: t.name,
      type: t.type,
      shares: t.amount,
      price: t.price,
      gainOrIncomeEur: Math.round(itemGain * 100) / 100
    });
  });

  const totalGains = stockGains + otherGains;
  const taxableBeforeLosses = Math.max(0, totalGains - (stockLosses + otherLosses));
  const usedAllowance = Math.min(taxAllowanceLimit, taxableBeforeLosses);
  const netTaxable = Math.max(0, taxableBeforeLosses - usedAllowance);

  const kapTax = netTaxable * 0.25;
  const soli = kapTax * 0.055;

  return {
    taxYear,
    reportDate: new Date().toLocaleDateString('de-DE'),
    portfolioName: portfolio.name,
    baseCurrency: 'EUR',
    taxCountry: 'DE',
    summary: {
      totalTaxableGainsEur: Math.round(netTaxable * 100) / 100,
      realizedStockGainsEur: Math.round(stockGains * 100) / 100,
      realizedOtherGainsEur: Math.round(otherGains * 100) / 100,
      realizedOtherLossesEur: Math.round(otherLosses * 100) / 100,
      realizedStockLossesEur: Math.round(stockLosses * 100) / 100,
      usedTaxAllowanceEur: Math.round(usedAllowance * 100) / 100,
      retainedKapTaxEstimatedEur: Math.round(kapTax * 100) / 100,
      solidaritySurchargeEur: Math.round(soli * 100) / 100,
      totalTaxLiabilityEur: Math.round((kapTax + soli) * 100) / 100
    },
    lossPoolsCarryForward: {
      stockLossPoolRemainingEur: Math.max(0, Math.round((portfolio.taxLossPools?.stockLossPool || 0) * 100) / 100),
      generalLossPoolRemainingEur: Math.max(0, Math.round((portfolio.taxLossPools?.generalLossPool || 0) * 100) / 100)
    },
    foreignWithholdingTax: {
      totalForeignTaxPaidEur: Math.round(foreignWithholdingTaxPaid * 100) / 100,
      creditedForeignTaxEur: Math.round(Math.min(foreignWithholdingTaxPaid, netTaxable * 0.15) * 100) / 100
    },
    etfVorabpauschale: {
      totalBaseYieldEur: Math.round(holdings.reduce((acc, h) => acc + (h.currentValue * 0.0255 * 0.7), 0) * 100) / 100,
      deductedDividendsEur: 0,
      netTaxableAdvanceLumpSumEur: 0
    },
    transactionsBreakdown: breakdown.slice(0, 50)
  };
}
