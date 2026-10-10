import type { Holding, AssetCategory, CorrelationAnalysisResult, CorrelationCluster } from '../types';

export const ASSET_CLASS_BASE_CORRELATION: Record<AssetCategory, Record<AssetCategory, number>> = {
  Stock: { Stock: 0.75, ETF: 0.70, Crypto: 0.35, Bond: 0.05, Cash: 0.00, RealEstate: 0.25, P2P: 0.15, PreciousMetal: 0.05 },
  ETF: { Stock: 0.70, ETF: 0.80, Crypto: 0.30, Bond: 0.10, Cash: 0.00, RealEstate: 0.30, P2P: 0.15, PreciousMetal: 0.05 },
  Crypto: { Stock: 0.35, ETF: 0.30, Crypto: 0.85, Bond: -0.05, Cash: 0.00, RealEstate: 0.10, P2P: 0.10, PreciousMetal: 0.15 },
  Bond: { Stock: 0.05, ETF: 0.10, Crypto: -0.05, Bond: 0.70, Cash: 0.05, RealEstate: 0.20, P2P: 0.25, PreciousMetal: 0.20 },
  Cash: { Stock: 0.00, ETF: 0.00, Crypto: 0.00, Bond: 0.05, Cash: 1.00, RealEstate: 0.00, P2P: 0.00, PreciousMetal: -0.10 },
  RealEstate: { Stock: 0.25, ETF: 0.30, Crypto: 0.10, Bond: 0.20, Cash: 0.00, RealEstate: 0.75, P2P: 0.20, PreciousMetal: 0.10 },
  P2P: { Stock: 0.15, ETF: 0.15, Crypto: 0.10, Bond: 0.25, Cash: 0.00, RealEstate: 0.20, P2P: 0.65, PreciousMetal: 0.05 },
  PreciousMetal: { Stock: 0.05, ETF: 0.05, Crypto: 0.15, Bond: 0.20, Cash: -0.10, RealEstate: 0.10, P2P: 0.05, PreciousMetal: 0.85 }
};

export const SECTOR_CORRELATION_BOOST: Record<string, number> = {
  Technology: 0.18,
  Financials: 0.14,
  Healthcare: 0.10,
  Energy: 0.15,
  Consumer: 0.12
};

export function computeHoldingPairCorrelation(hA: Holding, hB: Holding): number {
  if (hA.ticker === hB.ticker) return 1.0;

  const catA = hA.category || 'Stock';
  const catB = hB.category || 'Stock';

  let baseCorr = ASSET_CLASS_BASE_CORRELATION[catA]?.[catB] ?? 0.50;

  // Sector bonus if same sector
  if (hA.sector && hB.sector && hA.sector === hB.sector) {
    const boost = SECTOR_CORRELATION_BOOST[hA.sector] ?? 0.12;
    baseCorr += boost;
  }

  // Region bonus if same region
  if (hA.region && hB.region && hA.region === hB.region) {
    baseCorr += 0.05;
  }

  // Known overlap between World/US ETFs and US Tech Stocks
  const techTickers = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  const broadEtfs = ['EUNL', 'VWCE', 'VGWL', 'SXR8', 'SPY', 'QQQ', 'QDVE'];

  const isTechA = techTickers.includes(hA.ticker.toUpperCase());
  const isTechB = techTickers.includes(hB.ticker.toUpperCase());
  const isBroadA = broadEtfs.includes(hA.ticker.toUpperCase());
  const isBroadB = broadEtfs.includes(hB.ticker.toUpperCase());

  if (isTechA && isTechB) {
    baseCorr = Math.max(baseCorr, 0.82);
  } else if ((isTechA && isBroadB) || (isBroadA && isTechB)) {
    baseCorr = Math.max(baseCorr, 0.78);
  } else if (isBroadA && isBroadB) {
    baseCorr = Math.max(baseCorr, 0.88);
  }

  // Clamp between -1.0 and +1.0
  return Number(Math.max(-0.95, Math.min(0.99, baseCorr)).toFixed(2));
}

export function calculateCorrelationAnalysis(holdings: Holding[]): CorrelationAnalysisResult {
  const activeHoldings = holdings.filter(h => h.currentValue > 0);
  const tickers = activeHoldings.map(h => h.ticker);
  const names: Record<string, string> = {};
  const categories: Record<string, AssetCategory> = {};
  const matrix: Record<string, Record<string, number>> = {};

  activeHoldings.forEach(h => {
    names[h.ticker] = h.name;
    categories[h.ticker] = h.category || 'Stock';
    matrix[h.ticker] = {};
  });

  let sumNonDiag = 0;
  let countNonDiag = 0;

  for (let i = 0; i < activeHoldings.length; i++) {
    const hA = activeHoldings[i];
    for (let j = 0; j < activeHoldings.length; j++) {
      const hB = activeHoldings[j];
      const corr = computeHoldingPairCorrelation(hA, hB);
      matrix[hA.ticker][hB.ticker] = corr;

      if (i !== j) {
        sumNonDiag += corr;
        countNonDiag++;
      }
    }
  }

  const averageCorrelation = countNonDiag > 0 ? Number((sumNonDiag / countNonDiag).toFixed(2)) : 0;

  // Diversification score (0 to 100): Lower average correlation -> Higher diversification
  const diversificationScorePercent = Math.max(0, Math.min(100, Math.round((1 - averageCorrelation) * 100)));

  let diversificationScore: CorrelationAnalysisResult['diversificationScore'] = 'MODERATE';
  if (averageCorrelation <= 0.35) {
    diversificationScore = 'OPTIMAL';
  } else if (averageCorrelation > 0.65) {
    diversificationScore = 'POOR';
  }

  // Detect Clusters
  const clusters: CorrelationCluster[] = [];
  const highCorrPairs: [string, string][] = [];

  for (let i = 0; i < activeHoldings.length; i++) {
    for (let j = i + 1; j < activeHoldings.length; j++) {
      const tA = activeHoldings[i].ticker;
      const tB = activeHoldings[j].ticker;
      if (matrix[tA][tB] >= 0.75) {
        highCorrPairs.push([tA, tB]);
      }
    }
  }

  if (highCorrPairs.length > 0) {
    const clusterTickers = Array.from(new Set(highCorrPairs.flat()));
    clusters.push({
      id: 'cluster-high-corr',
      name: 'Stark korrelierte Positionen (Klumpenrisiko)',
      tickers: clusterTickers,
      averageCorrelation: 0.82,
      riskDescription: `${clusterTickers.length} Positionen weisen eine Korrelation von >= 0.75 auf und bewegen sich in Marktkrisen nahezu synchron.`
    });
  }

  // Recommendations
  const recommendations: string[] = [];
  if (averageCorrelation > 0.60) {
    recommendations.push('Dein Portfolio weist eine hohe durchschnittliche Korrelation auf. Ein Marktabschwung in Aktien/Tech betrifft den Großteil deines Vermögens.');
  }
  if (!activeHoldings.some(h => h.category === 'Bond' || h.category === 'PreciousMetal')) {
    recommendations.push('Füge unkorrelierte Anlageklassen (z. B. Gold/Edelmetalle oder Staatsanleihen) hinzu, um das Gesamtrisiko signifikant zu senken.');
  }
  if (clusters.length > 0) {
    recommendations.push('Prüfe Überschneidungen: Mehrere Einzelaktien überschneiden sich stark mit deinen Kern-ETFs (Pseudo-Diversifikation).');
  }
  if (recommendations.length === 0) {
    recommendations.push('Hervorragende Allokation! Deine Anlageklassen sind breit diversifiziert und bieten soliden Risikoschutz.');
  }

  return {
    tickers,
    names,
    categories,
    matrix,
    averageCorrelation,
    diversificationScore,
    diversificationScorePercent,
    clusters,
    recommendations
  };
}
