export type SwissCanton =
  | 'ZH' | 'BE' | 'LU' | 'UR' | 'SZ' | 'OW' | 'NW' | 'GL' | 'ZG'
  | 'FR' | 'SO' | 'BS' | 'BL' | 'SH' | 'AR' | 'AI' | 'SG' | 'GR'
  | 'AG' | 'TG' | 'TI' | 'VD' | 'VS' | 'NE' | 'GE' | 'JU';

export interface CantonWealthTaxConfig {
  code: SwissCanton;
  cantonName: string;
  taxFreeAllowanceChfSingle: number;
  taxFreeAllowanceChfMarried: number;
  averageTaxRatePromille: number; // e.g. 1.8 ‰ (0.18%)
  maxTaxRatePromille: number;
}

/**
 * Indicative wealth tax parameters by Swiss Canton (Vermögenssteuer nach Kanton).
 * Sourced from Swiss Federal Tax Administration (ESTV).
 */
export const SWISS_CANTON_WEALTH_TAX_DATA: Record<SwissCanton, CantonWealthTaxConfig> = {
  'ZG': { code: 'ZG', cantonName: 'Zug', taxFreeAllowanceChfSingle: 175000, taxFreeAllowanceChfMarried: 350000, averageTaxRatePromille: 1.5, maxTaxRatePromille: 2.3 },
  'SZ': { code: 'SZ', cantonName: 'Schwyz', taxFreeAllowanceChfSingle: 100000, taxFreeAllowanceChfMarried: 200000, averageTaxRatePromille: 1.2, maxTaxRatePromille: 1.9 },
  'NW': { code: 'NW', cantonName: 'Nidwalden', taxFreeAllowanceChfSingle: 70000, taxFreeAllowanceChfMarried: 140000, averageTaxRatePromille: 1.4, maxTaxRatePromille: 2.1 },
  'OW': { code: 'OW', cantonName: 'Obwalden', taxFreeAllowanceChfSingle: 60000, taxFreeAllowanceChfMarried: 120000, averageTaxRatePromille: 1.6, maxTaxRatePromille: 2.4 },
  'LU': { code: 'LU', cantonName: 'Luzern', taxFreeAllowanceChfSingle: 100000, taxFreeAllowanceChfMarried: 200000, averageTaxRatePromille: 2.4, maxTaxRatePromille: 3.2 },
  'ZH': { code: 'ZH', cantonName: 'Zürich', taxFreeAllowanceChfSingle: 77000, taxFreeAllowanceChfMarried: 154000, averageTaxRatePromille: 2.8, maxTaxRatePromille: 4.8 },
  'AG': { code: 'AG', cantonName: 'Aargau', taxFreeAllowanceChfSingle: 100000, taxFreeAllowanceChfMarried: 200000, averageTaxRatePromille: 2.5, maxTaxRatePromille: 3.8 },
  'SG': { code: 'SG', cantonName: 'St. Gallen', taxFreeAllowanceChfSingle: 80000, taxFreeAllowanceChfMarried: 160000, averageTaxRatePromille: 2.9, maxTaxRatePromille: 4.5 },
  'TG': { code: 'TG', cantonName: 'Thurgau', taxFreeAllowanceChfSingle: 75000, taxFreeAllowanceChfMarried: 150000, averageTaxRatePromille: 2.7, maxTaxRatePromille: 4.0 },
  'BS': { code: 'BS', cantonName: 'Basel-Stadt', taxFreeAllowanceChfSingle: 75000, taxFreeAllowanceChfMarried: 150000, averageTaxRatePromille: 4.5, maxTaxRatePromille: 8.5 },
  'BL': { code: 'BL', cantonName: 'Basel-Landschaft', taxFreeAllowanceChfSingle: 75000, taxFreeAllowanceChfMarried: 150000, averageTaxRatePromille: 3.5, maxTaxRatePromille: 5.6 },
  'BE': { code: 'BE', cantonName: 'Bern', taxFreeAllowanceChfSingle: 97000, taxFreeAllowanceChfMarried: 194000, averageTaxRatePromille: 4.2, maxTaxRatePromille: 6.8 },
  'VD': { code: 'VD', cantonName: 'Waadt (Vaud)', taxFreeAllowanceChfSingle: 57000, taxFreeAllowanceChfMarried: 114000, averageTaxRatePromille: 3.8, maxTaxRatePromille: 7.2 },
  'GE': { code: 'GE', cantonName: 'Genf (Genève)', taxFreeAllowanceChfSingle: 84000, taxFreeAllowanceChfMarried: 168000, averageTaxRatePromille: 4.1, maxTaxRatePromille: 8.2 },
  'VS': { code: 'VS', cantonName: 'Wallis (Valais)', taxFreeAllowanceChfSingle: 60000, taxFreeAllowanceChfMarried: 120000, averageTaxRatePromille: 3.0, maxTaxRatePromille: 5.0 },
  'TI': { code: 'TI', cantonName: 'Tessin (Ticino)', taxFreeAllowanceChfSingle: 100000, taxFreeAllowanceChfMarried: 200000, averageTaxRatePromille: 3.2, maxTaxRatePromille: 5.4 },
  'FR': { code: 'FR', cantonName: 'Freiburg (Fribourg)', taxFreeAllowanceChfSingle: 50000, taxFreeAllowanceChfMarried: 100000, averageTaxRatePromille: 3.6, maxTaxRatePromille: 5.8 },
  'SO': { code: 'SO', cantonName: 'Solothurn', taxFreeAllowanceChfSingle: 100000, taxFreeAllowanceChfMarried: 200000, averageTaxRatePromille: 3.4, maxTaxRatePromille: 5.2 },
  'SH': { code: 'SH', cantonName: 'Schaffhausen', taxFreeAllowanceChfSingle: 60000, taxFreeAllowanceChfMarried: 120000, averageTaxRatePromille: 3.1, maxTaxRatePromille: 4.9 },
  'AR': { code: 'AR', cantonName: 'Appenzell Ausserrhoden', taxFreeAllowanceChfSingle: 70000, taxFreeAllowanceChfMarried: 140000, averageTaxRatePromille: 2.6, maxTaxRatePromille: 4.1 },
  'AI': { code: 'AI', cantonName: 'Appenzell Innerrhoden', taxFreeAllowanceChfSingle: 60000, taxFreeAllowanceChfMarried: 120000, averageTaxRatePromille: 1.8, maxTaxRatePromille: 2.8 },
  'GR': { code: 'GR', cantonName: 'Graubünden', taxFreeAllowanceChfSingle: 90000, taxFreeAllowanceChfMarried: 180000, averageTaxRatePromille: 2.3, maxTaxRatePromille: 3.9 },
  'UR': { code: 'UR', cantonName: 'Uri', taxFreeAllowanceChfSingle: 100000, taxFreeAllowanceChfMarried: 200000, averageTaxRatePromille: 1.5, maxTaxRatePromille: 2.2 },
  'GL': { code: 'GL', cantonName: 'Glarus', taxFreeAllowanceChfSingle: 75000, taxFreeAllowanceChfMarried: 150000, averageTaxRatePromille: 2.8, maxTaxRatePromille: 4.3 },
  'NE': { code: 'NE', cantonName: 'Neuenburg (Neuchâtel)', taxFreeAllowanceChfSingle: 50000, taxFreeAllowanceChfMarried: 100000, averageTaxRatePromille: 4.0, maxTaxRatePromille: 6.9 },
  'JU': { code: 'JU', cantonName: 'Jura', taxFreeAllowanceChfSingle: 50000, taxFreeAllowanceChfMarried: 100000, averageTaxRatePromille: 4.3, maxTaxRatePromille: 7.1 }
};

export interface SwissWealthTaxCalculationOptions {
  totalAssetsChf: number;
  canton: SwissCanton;
  isMarried?: boolean;
}

export interface SwissWealthTaxResult {
  cantonCode: SwissCanton;
  cantonName: string;
  taxableAssetsChf: number;
  allowanceChf: number;
  effectiveTaxDueChf: number;
  effectiveTaxDueEur: number; // calculated at 1 CHF ~ 1.05 EUR parity
  effectiveTaxRatePromille: number;
  summaryNote: string;
}

export interface GermanyWealthLevySimulationOptions {
  netWorthEur: number;
  thresholdEur?: number; // e.g. 1.000.000 € (Grundfreibetrag)
  annualLevyRatePercent?: number; // e.g. 1.5%
  durationYears?: number; // e.g. 10 or 20 Jahre
}

export interface GermanyWealthLevyResult {
  taxableNetWorthEur: number;
  annualLevyDueEur: number;
  totalLevyDueEur: number;
  isAboveThreshold: boolean;
  effectiveBurdenPercent: number;
  simulationNote: string;
}

/**
 * Calculates Swiss Cantonal Wealth Tax (Kantonale Vermögenssteuer).
 */
export function calculateSwissWealthTax(
  options: SwissWealthTaxCalculationOptions
): SwissWealthTaxResult {
  const cantonConfig = SWISS_CANTON_WEALTH_TAX_DATA[options.canton] || SWISS_CANTON_WEALTH_TAX_DATA['ZH'];
  const allowance = options.isMarried
    ? cantonConfig.taxFreeAllowanceChfMarried
    : cantonConfig.taxFreeAllowanceChfSingle;

  const taxableAssetsChf = Math.max(0, options.totalAssetsChf - allowance);
  const taxRate = cantonConfig.averageTaxRatePromille / 1000;
  const taxDueChf = Math.round(taxableAssetsChf * taxRate * 100) / 100;
  
  // Benchmark conversion to EUR (~ 1 CHF = 1.06 EUR)
  const taxDueEur = Math.round(taxDueChf * 1.06 * 100) / 100;

  return {
    cantonCode: cantonConfig.code,
    cantonName: cantonConfig.cantonName,
    taxableAssetsChf,
    allowanceChf: allowance,
    effectiveTaxDueChf: taxDueChf,
    effectiveTaxDueEur: taxDueEur,
    effectiveTaxRatePromille: cantonConfig.averageTaxRatePromille,
    summaryNote: `Kanton ${cantonConfig.cantonName}: Freibetrag ${allowance.toLocaleString('de-CH')} CHF, Durchschnittstarif ${cantonConfig.averageTaxRatePromille} ‰.`
  };
}

/**
 * Simulates potential wealth levy (Vermögensabgabe / Vermögensteuer) for Germany/Austria.
 */
export function simulateWealthLevy(
  options: GermanyWealthLevySimulationOptions
): GermanyWealthLevyResult {
  const threshold = options.thresholdEur ?? 1000000;
  const rate = options.annualLevyRatePercent ?? 1.5;
  const duration = options.durationYears ?? 10;

  const taxable = Math.max(0, options.netWorthEur - threshold);
  const isAboveThreshold = options.netWorthEur > threshold;
  const annualDue = Math.round(taxable * (rate / 100) * 100) / 100;
  const totalDue = Math.round(annualDue * duration * 100) / 100;
  const effectiveBurden = options.netWorthEur > 0 ? (annualDue / options.netWorthEur) * 100 : 0;

  let simulationNote = 'Vollständig unter dem Freibetrag von 1.000.000 €: Keine Vermögensabgabe fällig.';
  if (isAboveThreshold) {
    simulationNote = `Übersteigendes Vermögen (${taxable.toLocaleString('de-DE')} €) wird mit ${rate}% p.a. über ${duration} Jahre veranlagt.`;
  }

  return {
    taxableNetWorthEur: taxable,
    annualLevyDueEur: annualDue,
    totalLevyDueEur: totalDue,
    isAboveThreshold,
    effectiveBurdenPercent: Math.round(effectiveBurden * 100) / 100,
    simulationNote
  };
}
