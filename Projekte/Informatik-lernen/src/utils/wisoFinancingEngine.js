// @ts-check
/**
 * WISO Investitionsfinanzierung: Kauf vs. Kredit vs. Leasing Engine
 * Gemäß IHK Prüfungsanforderungen für AP2 WISO & Kostenrechnung
 * 
 * Vergleicht:
 * 1. Sofortkauf mit Skontoabzug
 * 2. Bankkredit (Ratentilgung / Annuitätendarlehen)
 * 3. Operating / Finance Leasing
 * Inklusive linearer steuerlicher Abschreibung (AfA nach § 7 Abs. 1 EStG)
 */

/**
 * @typedef {object} FinancingOptionResult
 * @property {string} id
 * @property {string} title
 * @property {number} initialOutflow
 * @property {number} totalCashOutflow
 * @property {number} totalInterestOrLeasingCost
 * @property {number} taxShieldSavings
 * @property {number} netEffectiveCost
 * @property {string} pros
 * @property {string} cons
 */

/**
 * Berechnet und vergleicht Kauf, Kredit und Leasing für IT-Investitionen
 * @param {object} params
 * @param {number} params.investmentAmount Netto-Anschaffungskosten in €
 * @param {number} [params.usefulLifeYears] Nutzungsdauer in Jahren nach AfA-Tabelle (typisch 3 Jahre für PCs/Server)
 * @param {number} [params.skontoPercent] Skontosatz bei Sofortzahlung in % (z.B. 2.0%)
 * @param {number} [params.creditInterestRatePercent] Kreditzinssatz p.a. in % (z.B. 6.0%)
 * @param {number} [params.monthlyLeasingRate] Monatliche Leasingrate in € (z.B. 320 €)
 * @param {number} [params.leasingSpecialPayment] Einmalige Leasingsonderzahlung zu Beginn in € (z.B. 0 €)
 * @param {number} [params.corporateTaxRatePercent] Ertragssteuersatz in % für Steuerersparnis (z.B. 30.0%)
 * @returns {{ options: FinancingOptionResult[], recommendation: string }}
 */
export function calculateFinancingComparison({
  investmentAmount = 10000,
  usefulLifeYears = 3,
  skontoPercent = 2.0,
  creditInterestRatePercent = 6.0,
  monthlyLeasingRate = 320,
  leasingSpecialPayment = 0,
  corporateTaxRatePercent = 30.0
}) {
  const taxFactor = corporateTaxRatePercent / 100;
  const years = Math.max(1, usefulLifeYears);

  // 1. Sofortkauf mit Skonto
  const skontoAmount = (investmentAmount * (skontoPercent / 100));
  const purchasePriceAfterSkonto = investmentAmount - skontoAmount;
  // Steuerersparnis durch lineare AfA auf den Anschaffungswert
  const purchaseTaxShield = purchasePriceAfterSkonto * taxFactor;
  const purchaseNetCost = purchasePriceAfterSkonto - purchaseTaxShield;

  // 2. Bankkredit (Lineare Ratentilgung)
  // Jährliche Tilgung = Kredit / Jahre. Zinsen sinken jährlich.
  let totalCreditInterest = 0;
  let remainingCredit = investmentAmount;
  const annualRepayment = investmentAmount / years;
  for (let y = 1; y <= years; y++) {
    totalCreditInterest += remainingCredit * (creditInterestRatePercent / 100);
    remainingCredit -= annualRepayment;
  }
  const totalCreditOutflow = investmentAmount + totalCreditInterest;
  // Steuerersparnis = (AfA auf Investition + Zinsaufwand) * Steuerfaktor
  const creditTaxShield = (investmentAmount + totalCreditInterest) * taxFactor;
  const creditNetCost = totalCreditOutflow - creditTaxShield;

  // 3. Leasing (Vollamortisation / Operating)
  const totalLeasingMonths = years * 12;
  const totalLeasingOutflow = (monthlyLeasingRate * totalLeasingMonths) + leasingSpecialPayment;
  // Leasingraten sind direkt zu 100 % als Betriebsausgaben steuermindernd
  const leasingTaxShield = totalLeasingOutflow * taxFactor;
  const leasingNetCost = totalLeasingOutflow - leasingTaxShield;

  /** @type {FinancingOptionResult[]} */
  const options = [
    {
      id: 'cash_purchase',
      title: 'Sofortkauf (Barzahlung mit Skonto)',
      initialOutflow: purchasePriceAfterSkonto,
      totalCashOutflow: parseFloat(purchasePriceAfterSkonto.toFixed(2)),
      totalInterestOrLeasingCost: 0,
      taxShieldSavings: parseFloat(purchaseTaxShield.toFixed(2)),
      netEffectiveCost: parseFloat(purchaseNetCost.toFixed(2)),
      pros: 'Eigentum ab Tag 1, keine Zinskosten, 2% Sofort-Skonto, bilanzierbares Anlagevermögen.',
      cons: 'Hoher sofortiger Liquiditätsabfluss, bindet Betriebskapital (Working Capital).'
    },
    {
      id: 'bank_loan',
      title: 'Bankkredit (Ratendarlehen)',
      initialOutflow: 0,
      totalCashOutflow: parseFloat(totalCreditOutflow.toFixed(2)),
      totalInterestOrLeasingCost: parseFloat(totalCreditInterest.toFixed(2)),
      taxShieldSavings: parseFloat(creditTaxShield.toFixed(2)),
      netEffectiveCost: parseFloat(creditNetCost.toFixed(2)),
      pros: 'Schont die sofortige Barliquidität, Zinsaufwand ist steuerlich voll abzugsfähig.',
      cons: 'Verschlechtert die Eigenkapitalquote (höhere Verschuldung), Zinsbelastung.'
    },
    {
      id: 'leasing',
      title: 'IT-Leasing (Pay-as-you-earn)',
      initialOutflow: leasingSpecialPayment,
      totalCashOutflow: parseFloat(totalLeasingOutflow.toFixed(2)),
      totalInterestOrLeasingCost: parseFloat(Math.max(0, totalLeasingOutflow - investmentAmount).toFixed(2)),
      taxShieldSavings: parseFloat(leasingTaxShield.toFixed(2)),
      netEffectiveCost: parseFloat(leasingNetCost.toFixed(2)),
      pros: 'Off-Balance (keine Bilanzverlängerung), planbare monatliche Raten, Raten 100% sofortige Betriebsausgabe.',
      cons: 'Kein Eigentumserwerb, Gesamtkosten über die Laufzeit oft höher als Kauf.'
    }
  ];

  // Empfehlung nach geringsten Netto-Effektivkosten
  const sorted = [...options].sort((a, b) => a.netEffectiveCost - b.netEffectiveCost);
  const best = sorted[0];

  const recommendation = `Unter rein kaufmännischen Netto-Kostenkriterien ist "${best.title}" mit ${best.netEffectiveCost.toLocaleString('de-DE')} € am vorteilhaftesten. Bei knapper Liquidität ist Leasing trotz höherer Gesamtkosten vorzuziehen.`;

  return {
    options,
    recommendation
  };
}
