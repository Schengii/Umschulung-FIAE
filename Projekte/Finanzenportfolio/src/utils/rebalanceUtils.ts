import type { AssetCategory, Holding, TargetAllocation, RebalanceCategoryOrder, RebalanceCalculationResult } from '../types';

export const ALL_ASSET_CATEGORIES: AssetCategory[] = [
  'Stock',
  'ETF',
  'Crypto',
  'Bond',
  'Cash',
  'RealEstate',
  'P2P',
  'PreciousMetal'
];

export interface RebalanceOptions {
  mode?: 'FULL' | 'CASHFLOW_ONLY';
  freshCapitalEur?: number;
  toleranceBandPercent?: number; // e.g. 0.5% drift before triggering order
}

export function calculateRebalanceOrders(
  holdings: Holding[],
  targetsInput: Record<AssetCategory, number> | TargetAllocation[],
  options: RebalanceOptions = {}
): RebalanceCalculationResult {
  const mode = options.mode ?? 'FULL';
  const freshCapitalEur = Math.max(0, options.freshCapitalEur ?? 0);
  const toleranceBandPercent = options.toleranceBandPercent ?? 0.5;

  // 1. Current category values
  const currentCategoryValues: Record<AssetCategory, number> = {
    Stock: 0,
    ETF: 0,
    Crypto: 0,
    Bond: 0,
    Cash: 0,
    RealEstate: 0,
    P2P: 0,
    PreciousMetal: 0
  };

  const holdingsByCategory: Record<AssetCategory, Holding[]> = {
    Stock: [],
    ETF: [],
    Crypto: [],
    Bond: [],
    Cash: [],
    RealEstate: [],
    P2P: [],
    PreciousMetal: []
  };

  holdings.forEach(h => {
    const cat = h.category || 'Stock';
    if (cat in currentCategoryValues) {
      currentCategoryValues[cat] += h.currentValue;
      holdingsByCategory[cat].push(h);
    }
  });

  const totalPortfolioValueEur = Object.values(currentCategoryValues).reduce((a, b) => a + b, 0);
  const postRebalanceValueEur = totalPortfolioValueEur + freshCapitalEur;

  // 2. Normalize target weights
  const targetWeights: Record<AssetCategory, number> = {
    Stock: 0,
    ETF: 0,
    Crypto: 0,
    Bond: 0,
    Cash: 0,
    RealEstate: 0,
    P2P: 0,
    PreciousMetal: 0
  };

  if (Array.isArray(targetsInput)) {
    targetsInput.forEach(t => {
      if (t.category in targetWeights) {
        targetWeights[t.category] = Number(t.weight) || 0;
      }
    });
  } else if (targetsInput && typeof targetsInput === 'object') {
    ALL_ASSET_CATEGORIES.forEach(cat => {
      targetWeights[cat] = Number(targetsInput[cat]) || 0;
    });
  }

  const sumWeights = Object.values(targetWeights).reduce((a, b) => a + b, 0);
  const normalizedTargets: Record<AssetCategory, number> = { ...targetWeights };
  if (sumWeights > 0 && Math.abs(sumWeights - 100) > 0.01) {
    // Normalize to 100% if sum is non-zero
    ALL_ASSET_CATEGORIES.forEach(cat => {
      normalizedTargets[cat] = (targetWeights[cat] / sumWeights) * 100;
    });
  }

  const categoryOrders: RebalanceCategoryOrder[] = [];
  let totalBuyVolumeEur = 0;
  let totalSellVolumeEur = 0;

  if (mode === 'FULL') {
    ALL_ASSET_CATEGORIES.forEach(cat => {
      const currentVal = currentCategoryValues[cat];
      const currentWeight = totalPortfolioValueEur > 0 ? (currentVal / totalPortfolioValueEur) * 100 : 0;
      const targetWeight = normalizedTargets[cat];
      const targetValueEur = (targetWeight / 100) * postRebalanceValueEur;
      const delta = targetValueEur - currentVal;
      const driftPercent = currentWeight - targetWeight;

      let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let orderValueEur = 0;

      if (Math.abs(driftPercent) >= toleranceBandPercent || (totalPortfolioValueEur === 0 && targetWeight > 0)) {
        if (delta > 1) {
          action = 'BUY';
          orderValueEur = delta;
          totalBuyVolumeEur += orderValueEur;
        } else if (delta < -1) {
          action = 'SELL';
          orderValueEur = Math.abs(delta);
          totalSellVolumeEur += orderValueEur;
        }
      }

      const suggestedAssets = generateAssetSuggestions(holdingsByCategory[cat], action, orderValueEur);

      categoryOrders.push({
        category: cat,
        currentValueEur: currentVal,
        currentWeightPercent: currentWeight,
        targetWeightPercent: targetWeight,
        targetValueEur,
        driftPercent,
        action,
        orderValueEur,
        suggestedAssets
      });
    });
  } else {
    // CASHFLOW_ONLY: No sells, allocate freshCapital to underweight categories
    const deficits: Record<AssetCategory, number> = {
      Stock: 0,
      ETF: 0,
      Crypto: 0,
      Bond: 0,
      Cash: 0,
      RealEstate: 0,
      P2P: 0,
      PreciousMetal: 0
    };

    let totalDeficit = 0;

    ALL_ASSET_CATEGORIES.forEach(cat => {
      const currentVal = currentCategoryValues[cat];
      const targetWeight = normalizedTargets[cat];
      const idealTargetValue = (targetWeight / 100) * postRebalanceValueEur;
      const def = Math.max(0, idealTargetValue - currentVal);
      deficits[cat] = def;
      totalDeficit += def;
    });

    ALL_ASSET_CATEGORIES.forEach(cat => {
      const currentVal = currentCategoryValues[cat];
      const currentWeight = totalPortfolioValueEur > 0 ? (currentVal / totalPortfolioValueEur) * 100 : 0;
      const targetWeight = normalizedTargets[cat];
      const targetValueEur = (targetWeight / 100) * postRebalanceValueEur;
      const driftPercent = currentWeight - targetWeight;

      let orderValueEur = 0;
      let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';

      if (freshCapitalEur > 0) {
        if (totalDeficit > 0) {
          // Allocate fresh capital proportionally to deficits
          orderValueEur = freshCapitalEur * (deficits[cat] / totalDeficit);
        } else {
          // If already perfectly balanced, allocate proportionally to target weights
          orderValueEur = freshCapitalEur * (targetWeight / 100);
        }

        if (orderValueEur > 0.5) {
          action = 'BUY';
          totalBuyVolumeEur += orderValueEur;
        }
      } else {
        // Zero fresh capital in cashflow mode: indicate what would be needed without selling
        if (deficits[cat] > 1) {
          orderValueEur = deficits[cat];
          action = 'BUY';
        }
      }

      const suggestedAssets = generateAssetSuggestions(holdingsByCategory[cat], action, orderValueEur);

      categoryOrders.push({
        category: cat,
        currentValueEur: currentVal,
        currentWeightPercent: currentWeight,
        targetWeightPercent: targetWeight,
        targetValueEur,
        driftPercent,
        action,
        orderValueEur,
        suggestedAssets
      });
    });
  }

  return {
    mode,
    freshCapitalEur,
    totalPortfolioValueEur,
    postRebalanceValueEur,
    categoryOrders,
    totalBuyVolumeEur,
    totalSellVolumeEur
  };
}

function generateAssetSuggestions(
  catHoldings: Holding[],
  action: 'BUY' | 'SELL' | 'HOLD',
  orderValueEur: number
): RebalanceCategoryOrder['suggestedAssets'] {
  if (action === 'HOLD' || orderValueEur <= 0 || catHoldings.length === 0) {
    return [];
  }

  const catTotalVal = catHoldings.reduce((sum, h) => sum + h.currentValue, 0);

  return catHoldings.map(h => {
    // Distribute proportionally to holding size (or equal split if 0 value)
    const proportion = catTotalVal > 0 ? h.currentValue / catTotalVal : 1 / catHoldings.length;
    const suggestedAmountEur = orderValueEur * proportion;
    const suggestedShares = h.currentPrice > 0 ? Number((suggestedAmountEur / h.currentPrice).toFixed(4)) : 0;

    return {
      ticker: h.ticker,
      name: h.name,
      currentPrice: h.currentPrice,
      suggestedShares,
      suggestedAmountEur
    };
  });
}

export function formatRebalancingOrdersForClipboard(
  result: RebalanceCalculationResult,
  currency = 'EUR'
): string {
  const lines: string[] = [];
  lines.push(`=== PORTFOLIO REBALANCING ORDERLISTE (${result.mode === 'FULL' ? 'VOLL-REBALANCE' : 'CASHFLOW-ZUKAUF'}) ===`);
  lines.push(`Depotwert: ${result.totalPortfolioValueEur.toLocaleString('de-DE', { style: 'currency', currency })}`);
  if (result.freshCapitalEur > 0) {
    lines.push(`Frisches Kapital: +${result.freshCapitalEur.toLocaleString('de-DE', { style: 'currency', currency })}`);
    lines.push(`Zielwert nach Rebalancing: ${result.postRebalanceValueEur.toLocaleString('de-DE', { style: 'currency', currency })}`);
  }
  lines.push(`Kaufvolumen: ${result.totalBuyVolumeEur.toLocaleString('de-DE', { style: 'currency', currency })}`);
  if (result.mode === 'FULL') {
    lines.push(`Verkaufsvolumen: ${result.totalSellVolumeEur.toLocaleString('de-DE', { style: 'currency', currency })}`);
  }
  lines.push('----------------------------------------------------');

  const activeOrders = result.categoryOrders.filter(o => o.action !== 'HOLD');
  if (activeOrders.length === 0) {
    lines.push('Keine Transaktionen notwendig – Portfolio liegt innerhalb der Toleranzbänder.');
    return lines.join('\n');
  }

  activeOrders.forEach(o => {
    const actionLabel = o.action === 'BUY' ? '🟢 KAUF' : '🔴 VERKAUF';
    lines.push(`${actionLabel} [${o.category}]: ${o.orderValueEur.toLocaleString('de-DE', { style: 'currency', currency })} (Ist: ${o.currentWeightPercent.toFixed(1)}% -> Soll: ${o.targetWeightPercent.toFixed(1)}%)`);
    if (o.suggestedAssets.length > 0) {
      o.suggestedAssets.forEach(a => {
        lines.push(`   - ${a.ticker} (${a.name}): ~${a.suggestedShares} Stk. @ ${a.currentPrice.toFixed(2)} € = ${a.suggestedAmountEur.toLocaleString('de-DE', { style: 'currency', currency })}`);
      });
    }
  });

  lines.push('----------------------------------------------------');
  lines.push('Generiert mit Finanzenportfolio App');
  return lines.join('\n');
}
