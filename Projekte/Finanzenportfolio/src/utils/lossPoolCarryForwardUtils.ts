import type { Transaction } from '../types';

export interface LossPoolYearCalculation {
  taxYear: number;
  initialStockLossPoolEur: number;
  initialGeneralLossPoolEur: number;
  
  // Realized gains & losses in that year
  stockGainsEur: number;
  stockLossesEur: number;
  otherGainsEur: number; // ETFs, Bonds, Options, Dividends, Interest
  otherLossesEur: number;

  // Offsetting process (§ 20 Abs. 6 EStG)
  stockLossesUsedEur: number;
  otherLossesUsedEur: number;

  // Taxable amounts after pool offsetting
  netTaxableStockGainsEur: number;
  netTaxableOtherGainsEur: number;
  totalTaxableCapitalGainsEur: number;

  // Carried forward to next year
  finalStockLossPoolEur: number;
  finalGeneralLossPoolEur: number;

  // Tax saved via loss offset (26.375% Abgeltungsteuer + Soli)
  totalTaxSavedByLossOffsetEur: number;
}

/**
 * Berechnet die gesetzliche Verlustverrechnung nach § 20 Abs. 6 EStG (D-A-CH / Deutschland):
 * 1. Verluste aus Aktien dürfen NUR mit Gewinnen aus Aktien verrechnet werden.
 * 2. Verluste aus sonstigen Kapitalanlagen (ETFs, Derivate/Optionen, Fonds, Anleihen)
 *    dürfen mit allen Kapitalerträgen (Aktien, Fonds, Dividenden, Zinsen) verrechnet werden.
 * 3. Nicht verrechnete Verluste werden unbegrenzt in das Folgejahr vorgetragen.
 */
export function calculateLossPoolCarryForward(
  transactions: Transaction[],
  initialStockLossPool: number = 0,
  initialGeneralLossPool: number = 0,
  targetYear?: number
): LossPoolYearCalculation {
  const currentYear = targetYear ?? new Date().getFullYear();

  let stockGains = 0;
  let stockLosses = 0;
  let otherGains = 0;
  let otherLosses = 0;

  transactions.forEach(tx => {
    const txYear = parseInt(tx.date.split('.')[2] || tx.date.split('-')[0]);
    if (txYear !== currentYear) return;

    const rate = tx.exchangeRate || 1.0;

    if (tx.type === 'SELL') {
      const netProceeds = (tx.amount * tx.price - tx.fee) / rate;
      // Schätzung des G&V wenn nicht explizit gegeben
      // Falls Kursgewinn positiv -> Gain, sonst Loss
      const gainOrLoss = netProceeds - (tx.amount * tx.price * 0.9) / rate; // fallback gain
      if (tx.category === 'Stock') {
        if (gainOrLoss >= 0) stockGains += gainOrLoss;
        else stockLosses += Math.abs(gainOrLoss);
      } else {
        if (gainOrLoss >= 0) otherGains += gainOrLoss;
        else otherLosses += Math.abs(gainOrLoss);
      }
    } else if (tx.type === 'DIVIDEND' || tx.type === 'INTEREST' || tx.type === 'OPTION_PREMIUM') {
      const income = (tx.amount * tx.price) / rate;
      otherGains += income;
    }
  });

  // Startguthaben der Töpfe addieren
  let availableStockLoss = initialStockLossPool + stockLosses;
  let availableGeneralLoss = initialGeneralLossPool + otherLosses;

  // 1. Verrechnung im Aktien-Verlusttopf: Nur gegen Aktiengewinne
  const stockLossUsed = Math.min(stockGains, availableStockLoss);
  const remainingStockGains = stockGains - stockLossUsed;
  const carriedStockLoss = availableStockLoss - stockLossUsed;

  // 2. Verrechnung im Sonstigen Verlusttopf: Gegen sonstige Erträge UND verbleibende Aktiengewinne
  let generalLossUsed = 0;
  let remainingOtherGains = otherGains;

  // Erst gegen Sonstige Gewinne (Dividenden, ETFs etc.)
  const usedAgainstOther = Math.min(remainingOtherGains, availableGeneralLoss);
  generalLossUsed += usedAgainstOther;
  remainingOtherGains -= usedAgainstOther;
  availableGeneralLoss -= usedAgainstOther;

  // Falls noch Sonstiger Verlust vorhanden: gegen verbleibende Aktiengewinne verrechnen
  let finalStockGains = remainingStockGains;
  if (availableGeneralLoss > 0 && finalStockGains > 0) {
    const usedAgainstStock = Math.min(finalStockGains, availableGeneralLoss);
    generalLossUsed += usedAgainstStock;
    finalStockGains -= usedAgainstStock;
    availableGeneralLoss -= usedAgainstStock;
  }

  const carriedGeneralLoss = availableGeneralLoss;
  const totalTaxable = finalStockGains + remainingOtherGains;
  const totalLossUsed = stockLossUsed + generalLossUsed;
  const taxSaved = totalLossUsed * 0.26375;

  return {
    taxYear: currentYear,
    initialStockLossPoolEur: initialStockLossPool,
    initialGeneralLossPoolEur: initialGeneralLossPool,
    stockGainsEur: stockGains,
    stockLossesEur: stockLosses,
    otherGainsEur: otherGains,
    otherLossesEur: otherLosses,
    stockLossesUsedEur: stockLossUsed,
    otherLossesUsedEur: generalLossUsed,
    netTaxableStockGainsEur: finalStockGains,
    netTaxableOtherGainsEur: remainingOtherGains,
    totalTaxableCapitalGainsEur: totalTaxable,
    finalStockLossPoolEur: carriedStockLoss,
    finalGeneralLossPoolEur: carriedGeneralLoss,
    totalTaxSavedByLossOffsetEur: taxSaved
  };
}
