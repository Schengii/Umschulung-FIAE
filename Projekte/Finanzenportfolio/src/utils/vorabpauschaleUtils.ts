export interface VorabpauschaleYearResult {
  ticker: string;
  name: string;
  shares: number;
  startOfYearPrice: number;
  startOfYearValueEur: number;
  endOfYearPrice: number;
  endOfYearValueEur: number;
  annualPerformanceEur: number;
  annualDividendsPaidEur: number;
  basisErtragGrossEur: number;
  basisErtragCapEur: number;
  vorabpauschaleRawEur: number;
  teilfreistellungPct: number;
  vorabpauschaleTaxableEur: number;
  estimatedTaxDueEur: number;
}

export interface VorabpauschaleCalculationSummary {
  taxYear: number;
  basisZins: number; // e.g. 0.0229 for 2023, 0.0255 for 2024, 0.0253 for 2025
  totalStartValueEur: number;
  totalEndValueEur: number;
  totalDividendsPaidEur: number;
  totalTaxableVorabpauschaleEur: number;
  totalEstimatedTaxEur: number; // Abgeltungsteuer 25% + Soli 5.5% = 26.375%
  breakdown: VorabpauschaleYearResult[];
}

export const HISTORICAL_BASISZINS: Record<number, number> = {
  2023: 0.0255,
  2024: 0.0229,
  2025: 0.0253,
  2026: 0.0240
};

/**
 * Ermittelt den gesetzlichen Teilfreistellungs-Satz nach § 20 InvStG:
 * - Aktienfonds (>= 51% Aktienquote): 30% Teilfreistellung
 * - Mischfonds (>= 25% Aktienquote): 15% Teilfreistellung
 * - Immobilienfonds / Sonstige / Rentenfonds: 60-80% bzw. 0%
 */
export function getTeilfreistellungsQuote(category: string, ticker: string, name: string): number {
  if (category !== 'ETF') return 0;
  const lowerName = (name + ' ' + ticker).toLowerCase();
  if (lowerName.includes('bond') || lowerName.includes('gov') || lowerName.includes('treasury') || lowerName.includes('renten')) {
    return 0.0;
  }
  if (lowerName.includes('misch') || lowerName.includes('balanced')) {
    return 0.15;
  }
  // Standard-Aktien-ETFs (MSCI World, S&P 500, All-World, DAX, Emerging Markets etc.)
  return 0.30;
}

/**
 * Berechnet die exakte Vorabpauschale nach § 18 Investmentsteuergesetz (InvStG).
 * Formel:
 * 1. Basisertrag = Wert zu Jahresbeginn * Basiszins * 0,7
 * 2. Begrenzung auf tatsächliche Wertsteigerung: Wenn Wertsteigerung < Basisertrag, gilt die Wertsteigerung. Wenn Wertsteigerung <= 0, Vorabpauschale = 0.
 * 3. Abzug von unterjährigen Ausschüttungen / Dividenden: max(0, min(Basisertrag, Wertsteigerung) - Ausschüttungen)
 * 4. Berücksichtigung der Teilfreistellung (§ 20 InvStG, z.B. 30% bei Aktienfonds)
 * 5. Steueransatz: 26,375% (25% Abgeltungsteuer + 5,5% Solidaritätszuschlag)
 */
export function calculateDetailedVorabpauschale(
  etfHoldings: Array<{
    ticker: string;
    name: string;
    category: string;
    shares: number;
    currentPrice: number;
    totalCost: number;
    teilfreistellungRate?: number;
  }>,
  dividendsByTicker: Record<string, number> = {},
  taxYear: number = 2026,
  customBasiszins?: number
): VorabpauschaleCalculationSummary {
  const basisZins = customBasiszins ?? (HISTORICAL_BASISZINS[taxYear] || 0.0240);
  const breakdown: VorabpauschaleYearResult[] = [];

  let totalStartVal = 0;
  let totalEndVal = 0;
  let totalDivs = 0;
  let totalTaxable = 0;
  let totalTax = 0;

  etfHoldings.forEach(h => {
    if (h.category !== 'ETF' || h.shares <= 0.0001) return;

    // Für realitätsnahe Simulation: Wert zu Jahresbeginn = Kaufkurs oder Schätzung (Jahresstart ca. 95% des aktuellen Werts)
    const endPrice = h.currentPrice > 0 ? h.currentPrice : (h.totalCost / h.shares);
    const startPrice = h.totalCost > 0 ? (h.totalCost / h.shares) : endPrice * 0.95;

    const startVal = startPrice * h.shares;
    const endVal = endPrice * h.shares;
    const performanceEur = endVal - startVal;
    const divsPaid = dividendsByTicker[h.ticker] || 0;

    // Gesetzliche Formel gem. § 18 Abs. 1 & 2 InvStG:
    // Basisertrag = Wert am Jahresanfang * Basiszins * 70%
    const basisErtragGross = startVal * basisZins * 0.70;

    // Tatsächliche Wertsteigerung (inkl. Dividendenanteil für den Vergleich)
    const tatsaechlicherErtrag = Math.max(0, performanceEur + divsPaid);

    // Vorabpauschale ist gedeckelt auf den tatsächlichen Ertrag
    const capErtrag = Math.min(basisErtragGross, tatsaechlicherErtrag);

    // Ausschüttungen mindern die Vorabpauschale direkt (§ 18 Abs. 1 Satz 3 InvStG)
    const vorabpauschaleRaw = Math.max(0, capErtrag - divsPaid);

    // Teilfreistellung
    const tfsQuote = h.teilfreistellungRate ?? getTeilfreistellungsQuote(h.category, h.ticker, h.name);
    const taxableEur = vorabpauschaleRaw * (1 - tfsQuote);
    const taxDue = taxableEur * 0.26375;

    totalStartVal += startVal;
    totalEndVal += endVal;
    totalDivs += divsPaid;
    totalTaxable += taxableEur;
    totalTax += taxDue;

    breakdown.push({
      ticker: h.ticker,
      name: h.name,
      shares: h.shares,
      startOfYearPrice: startPrice,
      startOfYearValueEur: startVal,
      endOfYearPrice: endPrice,
      endOfYearValueEur: endVal,
      annualPerformanceEur: performanceEur,
      annualDividendsPaidEur: divsPaid,
      basisErtragGrossEur: basisErtragGross,
      basisErtragCapEur: capErtrag,
      vorabpauschaleRawEur: vorabpauschaleRaw,
      teilfreistellungPct: tfsQuote * 100,
      vorabpauschaleTaxableEur: taxableEur,
      estimatedTaxDueEur: taxDue
    });
  });

  return {
    taxYear,
    basisZins,
    totalStartValueEur: totalStartVal,
    totalEndValueEur: totalEndVal,
    totalDividendsPaidEur: totalDivs,
    totalTaxableVorabpauschaleEur: totalTaxable,
    totalEstimatedTaxEur: totalTax,
    breakdown
  };
}
