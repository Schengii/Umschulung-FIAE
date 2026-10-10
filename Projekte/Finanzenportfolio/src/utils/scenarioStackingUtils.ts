export interface MacroScenarioShockFactor {
  id: string;
  name: string;
  description: string;
  equityDropPercent: number; // e.g. -20%
  cryptoDropPercent: number; // e.g. -40%
  bondYieldChangeBps: number; // e.g. +150 bps (+1.5%) -> leads to bond price drop
  fxShockUsdEurPercent: number; // e.g. -8% (USD drops vs EUR)
  realEstateDropPercent: number; // e.g. -10%
  estimatedInflationShockPercent: number; // e.g. +3%
  category: 'GEOPOLITICAL' | 'MONETARY_RATES' | 'ENERGY_COMMODITY' | 'RECESSION' | 'LIQUIDITY_CRUNCH';
}

export const PRESET_MACRO_SHOCK_FACTORS: MacroScenarioShockFactor[] = [
  {
    id: 'rate-hike-200bps',
    name: 'Zinsschock (+200 bps Leitzinserhöhung)',
    description: 'Schnelle Notenbankstraffung belastet Wachstumswerte, Tech und langlaufende Anleihen.',
    equityDropPercent: -15,
    cryptoDropPercent: -25,
    bondYieldChangeBps: 200,
    fxShockUsdEurPercent: 3,
    realEstateDropPercent: -8,
    estimatedInflationShockPercent: 0,
    category: 'MONETARY_RATES'
  },
  {
    id: 'tech-valuation-reset',
    name: 'Tech-Korrektur (-25% Bewertungsreset)',
    description: 'Gewinnmitnahmen und Multiples-Kompression im Technologiesektor und bei spekulativen Assets.',
    equityDropPercent: -25,
    cryptoDropPercent: -45,
    bondYieldChangeBps: -20,
    fxShockUsdEurPercent: -5,
    realEstateDropPercent: 0,
    estimatedInflationShockPercent: 0,
    category: 'RECESSION'
  },
  {
    id: 'energy-crisis',
    name: 'Energie- & Rohstoffkrise (+50% Ölpreis)',
    description: 'Angebotsverknappung treibt Produktionskosten, Inflation und stagflationäre Risiken.',
    equityDropPercent: -18,
    cryptoDropPercent: -30,
    bondYieldChangeBps: 100,
    fxShockUsdEurPercent: -4,
    realEstateDropPercent: -5,
    estimatedInflationShockPercent: 4.5,
    category: 'ENERGY_COMMODITY'
  },
  {
    id: 'usd-depreciation',
    name: 'Dollar-Schwäche (-10% EUR/USD Rallye)',
    description: 'Abwertung des US-Dollars reduziert Erträge und Kurswerte von US-Titeln für Euro-Anleger.',
    equityDropPercent: -8,
    cryptoDropPercent: -10,
    bondYieldChangeBps: 0,
    fxShockUsdEurPercent: -10,
    realEstateDropPercent: 0,
    estimatedInflationShockPercent: -1,
    category: 'GEOPOLITICAL'
  },
  {
    id: 'credit-liquidity-freeze',
    name: 'Liquiditäts-Klemme & Margin Crunch',
    description: 'Refinanzierungsmärkte trocknen ein, Lombard-Zinsen steigen sprunghaft an.',
    equityDropPercent: -22,
    cryptoDropPercent: -50,
    bondYieldChangeBps: 150,
    fxShockUsdEurPercent: 5,
    realEstateDropPercent: -12,
    estimatedInflationShockPercent: 1.0,
    category: 'LIQUIDITY_CRUNCH'
  }
];

export interface StackedScenarioResult {
  activeFactorIds: string[];
  totalEquityShockPct: number;
  totalCryptoShockPct: number;
  totalBondShockPct: number;
  totalRealEstateShockPct: number;
  netPortfolioDropPct: number;
  portfolioLossEur: number;
  portfolioNewValueEur: number;
  isMarginCallTriggered: boolean;
  estimatedRecoveryMonths: number;
}

/**
 * Calculates compound impact of stacked macroeconomic shocks on a multi-asset portfolio.
 */
export function calculateStackedMacroScenarios(
  activeFactors: MacroScenarioShockFactor[],
  portfolioValueEur: number,
  assetAllocationWeights: {
    equityPct: number;
    cryptoPct: number;
    bondPct: number;
    realEstatePct: number;
    cashPct: number;
  } = { equityPct: 65, cryptoPct: 5, bondPct: 15, realEstatePct: 10, cashPct: 5 }
): StackedScenarioResult {
  if (activeFactors.length === 0) {
    return {
      activeFactorIds: [],
      totalEquityShockPct: 0,
      totalCryptoShockPct: 0,
      totalBondShockPct: 0,
      totalRealEstateShockPct: 0,
      netPortfolioDropPct: 0,
      portfolioLossEur: 0,
      portfolioNewValueEur: portfolioValueEur,
      isMarginCallTriggered: false,
      estimatedRecoveryMonths: 0
    };
  }

  // Combined multiplicative shock retention factor: (1 - d1) * (1 - d2) ...
  let equityRet = 1;
  let cryptoRet = 1;
  let bondRet = 1;
  let reRet = 1;
  let totalMonths = 0;

  activeFactors.forEach(factor => {
    equityRet *= (1 + factor.equityDropPercent / 100);
    cryptoRet *= (1 + factor.cryptoDropPercent / 100);
    // Bond sensitivity: approx duration 6 years * yield bps
    const bondPriceDropPct = -(factor.bondYieldChangeBps / 100) * 5.5;
    bondRet *= (1 + bondPriceDropPct / 100);
    reRet *= (1 + factor.realEstateDropPercent / 100);
    totalMonths += 6; // each crisis stacks approx 6 months recovery
  });

  const totalEquityShockPct = Math.round((equityRet - 1) * 1000) / 10;
  const totalCryptoShockPct = Math.round((cryptoRet - 1) * 1000) / 10;
  const totalBondShockPct = Math.round((bondRet - 1) * 1000) / 10;
  const totalRealEstateShockPct = Math.round((reRet - 1) * 1000) / 10;

  const w = assetAllocationWeights;
  const weightedNewValue = portfolioValueEur * (
    (w.equityPct / 100) * equityRet +
    (w.cryptoPct / 100) * cryptoRet +
    (w.bondPct / 100) * bondRet +
    (w.realEstatePct / 100) * reRet +
    (w.cashPct / 100) * 1.0
  );

  const lossEur = Math.max(0, portfolioValueEur - weightedNewValue);
  const netDropPct = portfolioValueEur > 0 ? (lossEur / portfolioValueEur) * 100 : 0;
  const isMarginCall = netDropPct >= 35; // Drops over 35% trigger typical bank margin calls

  return {
    activeFactorIds: activeFactors.map(f => f.id),
    totalEquityShockPct,
    totalCryptoShockPct,
    totalBondShockPct,
    totalRealEstateShockPct,
    netPortfolioDropPct: Math.round(netDropPct * 10) / 10,
    portfolioLossEur: Math.round(lossEur),
    portfolioNewValueEur: Math.round(weightedNewValue),
    isMarginCallTriggered: isMarginCall,
    estimatedRecoveryMonths: Math.min(60, Math.max(8, totalMonths))
  };
}
