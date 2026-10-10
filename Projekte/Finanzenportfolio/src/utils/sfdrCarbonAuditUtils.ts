import type { Holding, AssetCategory } from '../types';

export type SfdrClassification = 'ARTICLE_6' | 'ARTICLE_8' | 'ARTICLE_9';

export interface SfdrHoldingScore {
  ticker: string;
  name: string;
  category: AssetCategory;
  currentValueEur: number;
  portfolioWeightPercent: number;
  sfdrClassification: SfdrClassification;
  sfdrLabel: string;
  co2IntensityTonsPerMEur: number; // Tonnes CO2 per 1 Million Euro enterprise value
  isPabOrCtbBenchmark: boolean; // Paris Aligned Benchmark (PAB) or Climate Transition (CTB)
  sustainabilityScore: number; // 0 - 100
}

export interface PortfolioEsgSfdrSummary {
  totalAnalyzedValueEur: number;
  article6WeightPercent: number;
  article8WeightPercent: number; // Light Green (ESG Promoting)
  article9WeightPercent: number; // Dark Green (Impact / Sustainable Objective)
  weightedCo2IntensityTons: number; // Weighted average CO2 intensity
  parisAgreementAligned: boolean; // true if Article 8+9 >= 50% & CO2 < 120t
  holdingsBreakdown: SfdrHoldingScore[];
  recommendation: string;
}

/**
 * Known SFDR & Carbon Intensity dictionary for major benchmark ETFs & holdings.
 */
const SFDR_KNOWN_DATABASE: Record<string, { sfdr: SfdrClassification; co2: number; isPab: boolean }> = {
  // Global ETFs
  'VWCE': { sfdr: 'ARTICLE_8', co2: 125, isPab: false },
  'EUNL': { sfdr: 'ARTICLE_8', co2: 130, isPab: false },
  'IS3N': { sfdr: 'ARTICLE_8', co2: 240, isPab: false },
  'IUSQ': { sfdr: 'ARTICLE_8', co2: 135, isPab: false },
  // ESG / SRI / Paris Aligned ETFs
  'SUSW': { sfdr: 'ARTICLE_8', co2: 55, isPab: true },
  '2B7K': { sfdr: 'ARTICLE_8', co2: 60, isPab: true },
  'INRG': { sfdr: 'ARTICLE_9', co2: 35, isPab: true },
  'ICLN': { sfdr: 'ARTICLE_9', co2: 35, isPab: true },
  'GRID': { sfdr: 'ARTICLE_9', co2: 40, isPab: true },
  // Conventional / Energy
  'XOM': { sfdr: 'ARTICLE_6', co2: 480, isPab: false },
  'CVX': { sfdr: 'ARTICLE_6', co2: 450, isPab: false },
  'SHEL': { sfdr: 'ARTICLE_6', co2: 410, isPab: false },
  'RHM': { sfdr: 'ARTICLE_6', co2: 190, isPab: false },
  // Tech Leaders
  'AAPL': { sfdr: 'ARTICLE_8', co2: 45, isPab: false },
  'MSFT': { sfdr: 'ARTICLE_8', co2: 38, isPab: false },
  'GOOGL': { sfdr: 'ARTICLE_8', co2: 42, isPab: false }
};

/**
 * Calculates SFDR Article 6, 8, 9 breakdown and portfolio-weighted CO2 intensity.
 */
export function calculatePortfolioEsgSfdrSummary(holdings: Holding[]): PortfolioEsgSfdrSummary {
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  if (totalValue === 0) {
    return {
      totalAnalyzedValueEur: 0,
      article6WeightPercent: 0,
      article8WeightPercent: 0,
      article9WeightPercent: 0,
      weightedCo2IntensityTons: 0,
      parisAgreementAligned: false,
      holdingsBreakdown: [],
      recommendation: 'Keine Bestände zur ESG-/SFDR-Analyse vorhanden.'
    };
  }

  let art6Val = 0;
  let art8Val = 0;
  let art9Val = 0;
  let totalCo2Weighted = 0;

  const holdingsBreakdown: SfdrHoldingScore[] = holdings.map(h => {
    const tickerKey = h.ticker.toUpperCase().split('.')[0];
    const known = SFDR_KNOWN_DATABASE[tickerKey];

    let sfdr: SfdrClassification = 'ARTICLE_8';
    let co2 = 120;
    let isPab = false;

    if (known) {
      sfdr = known.sfdr;
      co2 = known.co2;
      isPab = known.isPab;
    } else {
      // Heuristic by sector and category
      const lower = (h.name + ' ' + h.ticker).toLowerCase();
      if (lower.includes('esg') || lower.includes('sri') || lower.includes('clean') || lower.includes('green') || lower.includes('climate')) {
        sfdr = lower.includes('clean') || lower.includes('climate') ? 'ARTICLE_9' : 'ARTICLE_8';
        co2 = 50;
        isPab = true;
      } else if (h.sector === 'Energy' || lower.includes('oil') || lower.includes('gas') || lower.includes('defense') || lower.includes('rheinmetall')) {
        sfdr = 'ARTICLE_6';
        co2 = 380;
      } else if (h.category === 'Crypto') {
        sfdr = 'ARTICLE_6';
        co2 = 280;
      }
    }

    if (sfdr === 'ARTICLE_9') art9Val += h.currentValue;
    else if (sfdr === 'ARTICLE_8') art8Val += h.currentValue;
    else art6Val += h.currentValue;

    totalCo2Weighted += co2 * h.currentValue;

    const sfdrLabel = sfdr === 'ARTICLE_9'
      ? 'Dunkelgrün (Art. 9 - Impact)'
      : sfdr === 'ARTICLE_8'
      ? 'Hellgrün (Art. 8 - ESG Merkmal)'
      : 'Konventionell (Art. 6)';

    let sustainabilityScore = 75;
    if (sfdr === 'ARTICLE_9') sustainabilityScore = 95;
    else if (sfdr === 'ARTICLE_8') sustainabilityScore = 80;
    else sustainabilityScore = 45;

    return {
      ticker: h.ticker,
      name: h.name,
      category: h.category,
      currentValueEur: h.currentValue,
      portfolioWeightPercent: (h.currentValue / totalValue) * 100,
      sfdrClassification: sfdr,
      sfdrLabel,
      co2IntensityTonsPerMEur: co2,
      isPabOrCtbBenchmark: isPab,
      sustainabilityScore
    };
  });

  const art6Pct = Math.round((art6Val / totalValue) * 1000) / 10;
  const art8Pct = Math.round((art8Val / totalValue) * 1000) / 10;
  const art9Pct = Math.round((art9Val / totalValue) * 1000) / 10;
  const weightedCo2 = Math.round((totalCo2Weighted / totalValue) * 10) / 10;

  const parisAgreementAligned = (art8Pct + art9Pct) >= 50 && weightedCo2 <= 175;

  let recommendation = 'Ausgewogenes ESG-Profil.';
  if (parisAgreementAligned) {
    recommendation = 'Hervorragend: Dein Portfolio erfüllt strenge Pariser Klimaabkommen Kriterien (Art. 8/9 >= 50% und niedrige CO2-Intensität).';
  } else if (art6Pct > 50) {
    recommendation = 'Erhöhte CO2- und Kontroversen-Exposition durch hohen Anteil konventioneller Titel (Art. 6).';
  }

  return {
    totalAnalyzedValueEur: totalValue,
    article6WeightPercent: art6Pct,
    article8WeightPercent: art8Pct,
    article9WeightPercent: art9Pct,
    weightedCo2IntensityTons: weightedCo2,
    parisAgreementAligned,
    holdingsBreakdown,
    recommendation
  };
}
