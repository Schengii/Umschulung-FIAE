import React, { useState, useMemo } from 'react';
import type { Holding } from '../types';
import { Lightbulb, Sliders, Activity, Info, Calendar } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface StrategyProps {
  holdings: Holding[];
  totalValue: number;
}

export const Strategy: React.FC<StrategyProps> = ({ holdings, totalValue }) => {
  // Tab control: 'rebalance' | 'backtest'
  const [subTab, setSubTab] = useState<'rebalance' | 'backtest'>('rebalance');

  // 1. Target Allocation State (Percentages)
  const [targetStock, setTargetStock] = useState<number>(40);
  const [targetEtf, setTargetEtf] = useState<number>(50);
  const [targetCrypto, setTargetCrypto] = useState<number>(10);

  // 2. Investment Planner State
  const [extraInvestment, setExtraInvestment] = useState<number>(1000);

  // 3. Sparplan-Optimierer State
  const [monthlyBudget, setMonthlyBudget] = useState<number>(300);
  const [optimizationMonths, setOptimizationMonths] = useState<number>(6);

  // 4. Backtest Sandbox State
  const [backtestCapital, setBacktestCapital] = useState<number>(10000);
  const [backtestStock, setBacktestStock] = useState<number>(30);
  const [backtestEtf, setBacktestEtf] = useState<number>(60);
  const [backtestCrypto, setBacktestCrypto] = useState<number>(10);
  const [backtestScenario, setBacktestScenario] = useState<'default' | 'dotcom' | 'financial' | 'covid' | 'bullrun'>('default');

  // Auto-adjust sliders to sum up to 100%
  const adjustSliders = (changed: 'stock' | 'etf' | 'crypto', val: number, isBacktest = false) => {
    const setStock = isBacktest ? setBacktestStock : setTargetStock;
    const setEtf = isBacktest ? setBacktestEtf : setTargetEtf;
    const setCrypto = isBacktest ? setBacktestCrypto : setTargetCrypto;
    
    if (changed === 'stock') {
      setStock(val);
      const rem = 100 - val;
      setEtf(Math.round(rem * 0.8));
      setCrypto(Math.round(rem * 0.2));
    } else if (changed === 'etf') {
      setEtf(val);
      const rem = 100 - val;
      setStock(Math.round(rem * 0.8));
      setCrypto(Math.round(rem * 0.2));
    } else {
      setCrypto(val);
      const rem = 100 - val;
      setStock(Math.round(rem * 0.45));
      setEtf(Math.round(rem * 0.55));
    }
  };

  // Current allocation calculations
  const currentAllocation = useMemo(() => {
    const alloc: Record<string, number> = { Stock: 0, ETF: 0, Crypto: 0 };
    holdings.forEach(h => {
      if (alloc[h.category] !== undefined) {
        alloc[h.category] += h.currentValue;
      }
    });

    const stockPercent = totalValue > 0 ? (alloc.Stock / totalValue) * 100 : 0;
    const etfPercent = totalValue > 0 ? (alloc.ETF / totalValue) * 100 : 0;
    const cryptoPercent = totalValue > 0 ? (alloc.Crypto / totalValue) * 100 : 0;

    return {
      Stock: { val: alloc.Stock, pct: stockPercent },
      ETF: { val: alloc.ETF, pct: etfPercent },
      Crypto: { val: alloc.Crypto, pct: cryptoPercent }
    };
  }, [holdings, totalValue]);

  // Sparplan-Optimierer Calculation
  const savingsPlanOptimizer = useMemo(() => {
    if (monthlyBudget <= 0) return { Stock: 0, ETF: 0, Crypto: 0 };
    
    const targetStockVal = (totalValue + (monthlyBudget * optimizationMonths)) * (targetStock / 100);
    const targetEtfVal = (totalValue + (monthlyBudget * optimizationMonths)) * (targetEtf / 100);
    const targetCryptoVal = (totalValue + (monthlyBudget * optimizationMonths)) * (targetCrypto / 100);

    const neededStock = Math.max(0, targetStockVal - currentAllocation.Stock.val);
    const neededEtf = Math.max(0, targetEtfVal - currentAllocation.ETF.val);
    const neededCrypto = Math.max(0, targetCryptoVal - currentAllocation.Crypto.val);

    const sumNeeded = neededStock + neededEtf + neededCrypto;
    if (sumNeeded === 0) {
      return {
        Stock: Math.round(monthlyBudget * (targetStock / 100)),
        ETF: Math.round(monthlyBudget * (targetEtf / 100)),
        Crypto: Math.round(monthlyBudget * (targetCrypto / 100))
      };
    }

    // Allocate monthly savings proportional to target shortfall
    return {
      Stock: Math.round(monthlyBudget * (neededStock / sumNeeded)),
      ETF: Math.round(monthlyBudget * (neededEtf / sumNeeded)),
      Crypto: Math.round(monthlyBudget * (neededCrypto / sumNeeded))
    };
  }, [currentAllocation, totalValue, monthlyBudget, optimizationMonths, targetStock, targetEtf, targetCrypto]);

  // AI Insights Generator
  const coachInsights = useMemo(() => {
    const insights = [];

    if (holdings.length === 0) {
      insights.push({
        type: 'warning',
        title: 'Keine Anlagen vorhanden',
        desc: 'Füge dein erstes Investment hinzu, um personalisierte Empfehlungen zu erhalten.'
      });
    } else if (holdings.length < 5) {
      insights.push({
        type: 'warning',
        title: 'Geringe Diversifikation',
        desc: 'Dein Portfolio besteht aus nur wenigen Werten. Überlege, breiter gestreute ETFs aufzunehmen, um das Risiko zu reduzieren.'
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Gute Diversifikation',
        desc: `Mit ${holdings.length} verschiedenen Werten bist du gut aufgestellt.`
      });
    }

    if (currentAllocation.Crypto.pct > 20) {
      insights.push({
        type: 'warning',
        title: 'Hohe Krypto-Gewichtung',
        desc: `Deine Kryptowährungen machen ${currentAllocation.Crypto.pct.toFixed(1)}% deines Portfolios aus. Kryptoanlagen sind sehr volatil. Wir empfehlen maximal 5-10% als Beimischung.`
      });
    }

    const heavyConcentration = holdings.find(h => h.portfolioWeight > 20 && h.category === 'Stock');
    if (heavyConcentration) {
      insights.push({
        type: 'warning',
        title: `Klumpenrisiko: ${heavyConcentration.name}`,
        desc: `Die Position ${heavyConcentration.name} macht mehr als 20% deines Portfolios aus. Kursstürze dieses Einzelwertes beeinflussen dein Gesamtportfolio massiv.`
      });
    }

    return insights;
  }, [holdings, currentAllocation]);

  // Risk and Diversification Analysis Score calculation
  const riskAnalysis = useMemo(() => {
    let score = 100;
    const warnings: string[] = [];
    const positives: string[] = [];

    if (holdings.length === 0) {
      return { score: 0, warnings: ['Keine Anlagen vorhanden.'], positives: [] };
    }

    // Number of holdings
    if (holdings.length < 3) {
      score -= 30;
      warnings.push('Extrem wenige Einzelpositionen. Erhöhte Abhängigkeit von einzelnen Unternehmen.');
    } else if (holdings.length < 5) {
      score -= 15;
      warnings.push('Geringe Anzahl an Positionen. Bessere Streuung z.B. durch Welt-ETFs empfohlen.');
    } else {
      positives.push(`Gute Verteilung auf ${holdings.length} verschiedene Einzelwerte.`);
    }

    // Single asset concentration
    const singleAssetLimit = 25;
    const concentrationRisks = holdings.filter(h => h.portfolioWeight > singleAssetLimit);
    if (concentrationRisks.length > 0) {
      score -= 20;
      concentrationRisks.forEach(r => {
        warnings.push(`Klumpenrisiko: Position "${r.name}" (${r.ticker}) bildet ${r.portfolioWeight.toFixed(1)}% des Portfolios.`);
      });
    } else {
      positives.push('Kein übermäßiges Klumpenrisiko bei Einzelwerten (< 25% pro Position).');
    }

    // Category concentration
    const maxCatPct = Math.max(currentAllocation.Stock.pct, currentAllocation.ETF.pct, currentAllocation.Crypto.pct);
    if (maxCatPct > 80) {
      score -= 15;
      warnings.push('Sehr hohe Konzentration in einer einzelnen Anlageklasse (> 80%).');
    } else {
      positives.push('Ausgewogene Aufteilung über verschiedene Anlageklassen.');
    }

    // Crypto risk
    if (currentAllocation.Crypto.pct > 25) {
      score -= 20;
      warnings.push(`Hoher Krypto-Anteil (${currentAllocation.Crypto.pct.toFixed(1)}%). Diese Anlageklasse gilt als sehr volatil.`);
    } else if (currentAllocation.Crypto.pct > 0 && currentAllocation.Crypto.pct <= 10) {
      positives.push(`Gesunde Krypto-Beimischung (${currentAllocation.Crypto.pct.toFixed(1)}%).`);
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      warnings,
      positives
    };
  }, [holdings, currentAllocation]);

  // Rebalancing Purchase calculator
  const rebalancePlanner = useMemo(() => {
    if (extraInvestment <= 0) return { Stock: 0, ETF: 0, Crypto: 0 };
    
    const newTotal = totalValue + extraInvestment;
    const stockCurrent = currentAllocation.Stock.val;
    const etfCurrent = currentAllocation.ETF.val;
    const cryptoCurrent = currentAllocation.Crypto.val;

    const stockTarget = newTotal * (targetStock / 100);
    const etfTarget = newTotal * (targetEtf / 100);
    const cryptoTarget = newTotal * (targetCrypto / 100);

    const diffStock = Math.max(0, stockTarget - stockCurrent);
    const diffEtf = Math.max(0, etfTarget - etfCurrent);
    const diffCrypto = Math.max(0, cryptoTarget - cryptoCurrent);

    const sumDiffs = diffStock + diffEtf + diffCrypto;

    if (sumDiffs > 0) {
      const factor = extraInvestment / sumDiffs;
      if (factor < 1) {
        return {
          Stock: Math.round(diffStock * factor),
          ETF: Math.round(diffEtf * factor),
          Crypto: Math.round(diffCrypto * factor)
        };
      } else {
        const excess = extraInvestment - sumDiffs;
        return {
          Stock: Math.round(diffStock + excess * (targetStock / 100)),
          ETF: Math.round(diffEtf + excess * (targetEtf / 100)),
          Crypto: Math.round(diffCrypto + excess * (targetCrypto / 100))
        };
      }
    } else {
      return {
        Stock: Math.round(extraInvestment * (targetStock / 100)),
        ETF: Math.round(extraInvestment * (targetEtf / 100)),
        Crypto: Math.round(extraInvestment * (targetCrypto / 100))
      };
    }
  }, [extraInvestment, totalValue, currentAllocation, targetStock, targetEtf, targetCrypto]);

  const detailedRebalanceSuggestions = useMemo(() => {
    const suggestions: Array<{ ticker: string; name: string; category: string; action: 'BUY' | 'SELL'; amount: number; notes: string }> = [];
    const categories = ['Stock', 'ETF', 'Crypto'] as const;

    categories.forEach(cat => {
      const extraAllocated = rebalancePlanner[cat];
      if (extraAllocated <= 5) return;

      const catHoldings = holdings.filter(h => h.category === cat);
      if (catHoldings.length === 0) return;

      const totalCatValue = catHoldings.reduce((acc, h) => acc + h.currentValue, 0);

      catHoldings.forEach(h => {
        const prop = totalCatValue > 0 ? (h.currentValue / totalCatValue) : (1 / catHoldings.length);
        const assetBuyAmount = extraAllocated * prop;

        if (assetBuyAmount >= 10) {
          suggestions.push({
            ticker: h.ticker,
            name: h.name,
            category: cat,
            action: 'BUY',
            amount: Math.round(assetBuyAmount),
            notes: `Kaufe ca. ${Math.round(assetBuyAmount / h.currentPrice * 1000) / 1000} Anteile zu ${h.currentPrice.toLocaleString('de-DE')} EUR.`
          });
        }
      });
    });

    return suggestions;
  }, [rebalancePlanner, holdings]);

  // Simulated Historical Backtesting Sandbox data
  const backtestData = useMemo(() => {
    const data = [];
    
    // Growth factors for each scenario
    const scenarios = {
      default: {
        years: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
        stock: [1.0, 1.15, 1.10, 1.35, 1.50, 1.75, 1.40, 1.70, 1.95, 2.10, 2.30],
        etf: [1.0, 1.08, 1.02, 1.25, 1.32, 1.55, 1.30, 1.52, 1.72, 1.85, 2.02],
        crypto: [1.0, 13.0, 3.5, 6.2, 18.0, 32.0, 10.0, 24.0, 42.0, 38.0, 48.0]
      },
      dotcom: {
        years: ['2000', '2001', '2002', '2003'],
        stock: [1.0, 0.70, 0.50, 0.45],
        etf: [1.0, 0.85, 0.65, 0.60],
        crypto: [1.0, 0.30, 0.10, 0.05]
      },
      financial: {
        years: ['2007', '2008', '2009'],
        stock: [1.0, 0.62, 0.78],
        etf: [1.0, 0.65, 0.80],
        crypto: [1.0, 0.40, 0.55]
      },
      covid: {
        years: ['Feb 20', 'März 20', 'Juni 20', 'Dez 20', 'Juni 21', 'Dez 21'],
        stock: [1.0, 0.68, 0.88, 1.15, 1.30, 1.45],
        etf: [1.0, 0.72, 0.85, 1.10, 1.22, 1.35],
        crypto: [1.0, 0.55, 0.95, 2.80, 3.50, 5.80]
      },
      bullrun: {
        years: ['2023', '2024', '2025', '2026'],
        stock: [1.0, 1.24, 1.48, 1.72],
        etf: [1.0, 1.18, 1.35, 1.52],
        crypto: [1.0, 2.20, 3.80, 4.40]
      }
    };

    const active = scenarios[backtestScenario];
    
    for (let i = 0; i < active.years.length; i++) {
      const stockPart = backtestCapital * (backtestStock / 100) * active.stock[i];
      const etfPart = backtestCapital * (backtestEtf / 100) * active.etf[i];
      const cryptoPart = backtestCapital * (backtestCrypto / 100) * active.crypto[i];
      
      const portfolioVal = Math.round(stockPart + etfPart + cryptoPart);
      const benchmarkVal = Math.round(backtestCapital * active.etf[i]); // 100% ETF Benchmark

      data.push({
        year: active.years[i],
        Portfolio: portfolioVal,
        Benchmark: benchmarkVal
      });
    }

    return data;
  }, [backtestCapital, backtestStock, backtestEtf, backtestCrypto, backtestScenario]);

  const backtestStats = useMemo(() => {
    const finalRow = backtestData[backtestData.length - 1];
    const initialVal = backtestCapital;
    
    const portGain = ((finalRow.Portfolio - initialVal) / initialVal) * 100;
    const benchGain = ((finalRow.Benchmark - initialVal) / initialVal) * 100;
    
    // Volatility approximation based on growths
    const portVol = (backtestStock * 0.16 + backtestEtf * 0.12 + backtestCrypto * 0.65) / 100 * 100;
    const benchVol = 12.0;

    return {
      portGain,
      benchGain,
      portVol,
      benchVol,
      portFinal: finalRow.Portfolio,
      benchFinal: finalRow.Benchmark
    };
  }, [backtestData, backtestCapital, backtestStock, backtestEtf, backtestCrypto]);

  return (
    <div className="fade-in strat-container">
      <div className="sav-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="sav-title-h2">Strategie & Allokation</h2>
          <p className="strat-title-p">Verwalte deine Asset-Allokation, simuliere Vermögenswerte und nutze den Rebalancing-Rechner.</p>
        </div>
        
        {/* Sub-Tab Navigation */}
        <div className="navigation-tabs" style={{ margin: 0 }}>
          <button 
            className={`nav-tab ${subTab === 'rebalance' ? 'active' : ''}`}
            onClick={() => setSubTab('rebalance')}
          >
            <Sliders size={14} /> Soll-Allokation & Sparpläne
          </button>
          <button 
            className={`nav-tab ${subTab === 'backtest' ? 'active' : ''}`}
            onClick={() => setSubTab('backtest')}
          >
            <Activity size={14} /> Backtest Simulator
          </button>
        </div>
      </div>

      {subTab === 'rebalance' ? (
        <div className="sav-main-grid">
          {/* Left Column: Target Allocation & Rebalancing */}
          <div className="sav-col-flex">
            
            <div className="glass-panel">
              <h3 className="tx-manual-title">Soll-Allokation (Zielgewichtung)</h3>
              <p className="tx-dropzone-subtitle">Passe die Schieberegler an. Die Summe wird automatisch auf 100% gehalten.</p>
              
              <div className="strat-target-grid">
                <div className="strat-target-col">
                  <div className="sav-slider-label-row">
                    <label htmlFor="slider-target-stock" className="strat-target-label">Aktien</label>
                    <span className="sav-slider-label-bold">{targetStock}%</span>
                  </div>
                  <input 
                    id="slider-target-stock"
                    type="range" 
                    min="0" 
                    max="100" 
                    value={targetStock} 
                    onChange={(e) => adjustSliders('stock', parseInt(e.target.value))}
                    className="projection-range"
                  />
                </div>
                <div className="strat-target-col">
                  <div className="sav-slider-label-row">
                    <label htmlFor="slider-target-etf" className="strat-target-label">ETFs</label>
                    <span className="sav-slider-label-bold">{targetEtf}%</span>
                  </div>
                  <input 
                    id="slider-target-etf"
                    type="range" 
                    min="0" 
                    max="100" 
                    value={targetEtf} 
                    onChange={(e) => adjustSliders('etf', parseInt(e.target.value))}
                    className="projection-range"
                  />
                </div>
                <div className="strat-target-col">
                  <div className="sav-slider-label-row">
                    <label htmlFor="slider-target-crypto" className="strat-target-label">Kryptos</label>
                    <span className="sav-slider-label-bold">{targetCrypto}%</span>
                  </div>
                  <input 
                    id="slider-target-crypto"
                    type="range" 
                    min="0" 
                    max="100" 
                    value={targetCrypto} 
                    onChange={(e) => adjustSliders('crypto', parseInt(e.target.value))}
                    className="projection-range"
                  />
                </div>
              </div>

              <div className="strat-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Anlageklasse</th>
                      <th>Ist-Anteil</th>
                      <th>Soll-Anteil</th>
                      <th>Differenz (EUR)</th>
                      <th>Empfohlene Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Stock', 'ETF', 'Crypto'].map((cat) => {
                      const current = currentAllocation[cat as keyof typeof currentAllocation];
                      const target = cat === 'Stock' ? targetStock : cat === 'ETF' ? targetEtf : targetCrypto;
                      const diff = (totalValue * (target / 100)) - current.val;
                      const isBuy = diff > 0;
                      
                      return (
                        <tr key={cat}>
                          <td className="sav-item-title-active">{cat === 'Stock' ? 'Aktien' : cat === 'ETF' ? 'ETFs' : 'Kryptowährungen'}</td>
                          <td>{current.pct.toFixed(1)}%</td>
                          <td>{target}%</td>
                          <td style={{ color: Math.abs(diff) < 5 ? 'var(--text-secondary)' : isBuy ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 600 }}>
                            {diff > 0 ? '+' : ''}{diff.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                          </td>
                          <td>
                            {Math.abs(diff) < 20 ? (
                              <span className="sav-list-empty" style={{ margin: 0 }}>Optimal balanciert</span>
                            ) : (
                              <span className={isBuy ? 'rebalance-badge-buy' : 'rebalance-badge-sell'}>
                                {isBuy ? 'Kaufen' : 'Verkaufen'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sparplan-Optimierer */}
              <div className="strat-investment-planner-box" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h4 className="strat-planner-title">
                  <Calendar size={16} className="portfolio-select-icon" style={{ color: 'var(--accent-blue)' }} /> Sparplan-Optimierer
                </h4>
                <p className="strat-planner-desc">
                  Verteile deine monatliche Sparrate dynamisch, um dein Portfolio über die nächsten Monate wieder ins Gleichgewicht zu bringen.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Monatliche Sparrate (€)</label>
                    <input 
                      type="number"
                      className="form-input"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Optimierungszeitraum</label>
                    <select
                      className="form-select"
                      value={optimizationMonths}
                      onChange={(e) => setOptimizationMonths(parseInt(e.target.value))}
                    >
                      <option value={3}>3 Monate</option>
                      <option value={6}>6 Monate</option>
                      <option value={12}>12 Monate</option>
                    </select>
                  </div>
                </div>

                <div className="strat-planner-results">
                  <h5 className="strat-planner-results-title">Empfohlene monatliche Sparraten:</h5>
                  <div className="rebalance-grid">
                    <div className="rebalance-item">
                      <span className="sav-item-subtitle">Aktien Sparrate</span>
                      <span className="sav-item-amount">{savingsPlanOptimizer.Stock.toLocaleString('de-DE')} €</span>
                    </div>
                    <div className="rebalance-item">
                      <span className="sav-item-subtitle">ETF Sparrate</span>
                      <span className="sav-item-amount">{savingsPlanOptimizer.ETF.toLocaleString('de-DE')} €</span>
                    </div>
                    <div className="rebalance-item">
                      <span className="sav-item-subtitle">Krypto Sparrate</span>
                      <span className="sav-item-amount">{savingsPlanOptimizer.Crypto.toLocaleString('de-DE')} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Investment Planner (Smart Rebalancing by Purchase) */}
              <div className="strat-investment-planner-box" style={{ marginTop: '2rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                <h4 className="strat-planner-title">Rebalancing-Investitions-Planer</h4>
                <p className="strat-planner-desc">
                  Gib einen Betrag ein, den du investieren möchtest. Der Rechner verteilt ihn so, dass du deinen Soll-Allokationen am nächsten kommst.
                </p>
                
                <div className="strat-planner-input-row">
                  <div className="strat-planner-input-group">
                    <label htmlFor="planner-extra-capital">Investmentbetrag (€)</label>
                    <input 
                      id="planner-extra-capital"
                      type="number" 
                      className="form-input" 
                      value={extraInvestment} 
                      placeholder="z.B. 1000"
                      onChange={(e) => setExtraInvestment(e.target.value ? Number(e.target.value) : 0)} 
                    />
                  </div>
                </div>

                <div className="strat-planner-results">
                  <h5 className="strat-planner-results-title">Empfohlene Verteilung der Einzahlung:</h5>
                  <div className="rebalance-grid">
                    <div className="rebalance-item">
                      <span className="sav-item-subtitle">Aktien</span>
                      <span className="sav-item-amount">{rebalancePlanner.Stock.toLocaleString('de-DE')} €</span>
                      <span className={rebalancePlanner.Stock > 0 ? 'rebalance-badge-buy' : 'rebalance-badge-ok'}>
                        {rebalancePlanner.Stock > 0 ? 'Kaufen' : 'Halten'}
                      </span>
                    </div>
                    <div className="rebalance-item">
                      <span className="sav-item-subtitle">ETFs</span>
                      <span className="sav-item-amount">{rebalancePlanner.ETF.toLocaleString('de-DE')} €</span>
                      <span className={rebalancePlanner.ETF > 0 ? 'rebalance-badge-buy' : 'rebalance-badge-ok'}>
                        {rebalancePlanner.ETF > 0 ? 'Kaufen' : 'Halten'}
                      </span>
                    </div>
                    <div className="rebalance-item">
                      <span className="sav-item-subtitle">Kryptowährungen</span>
                      <span className="sav-item-amount">{rebalancePlanner.Crypto.toLocaleString('de-DE')} €</span>
                      <span className={rebalancePlanner.Crypto > 0 ? 'rebalance-badge-buy' : 'rebalance-badge-ok'}>
                        {rebalancePlanner.Crypto > 0 ? 'Kaufen' : 'Halten'}
                      </span>
                    </div>
                  </div>
                </div>

                {detailedRebalanceSuggestions.length > 0 && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                    <h5 className="strat-planner-results-title mb-2">Gebührenoptimierte Einzelwert-Empfehlungen:</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {detailedRebalanceSuggestions.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>{s.ticker}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({s.name})</span>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.notes}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="rebalance-badge-buy" style={{ fontSize: '0.75rem' }}>
                              +{s.amount.toLocaleString('de-DE')} €
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: AI Investment Coach Advice */}
          <div className="glass-panel">
            <h2 className="sav-sim-header">
              <Lightbulb size={20} className="portfolio-select-icon" /> Portfolio-Coach
            </h2>
            <p className="tx-dropzone-subtitle">
              Intelligente Analysen und Empfehlungen für deine Investmentstrategie.
            </p>

            {/* Diversification & Risk Scoreboard */}
            {holdings.length > 0 && (
              <div className="glass-panel text-muted-bg p-4 mb-4" style={{ border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <h3 className="sav-panel-title" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-color)' }}>
                  📊 Diversifikations- & Risiko-Score
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
                  <div style={{
                    position: 'relative',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `conic-gradient(${riskAnalysis.score >= 70 ? 'var(--accent-emerald)' : riskAnalysis.score >= 40 ? 'var(--accent-gold)' : 'var(--accent-rose)'} ${riskAnalysis.score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(0, 0, 0, 0.2)'
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'var(--card-background, #1a1b23)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.15rem',
                      color: 'var(--text-color)'
                    }}>
                      {riskAnalysis.score}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-color)' }}>
                      {riskAnalysis.score >= 80 ? 'Sehr gut diversifiziert' : riskAnalysis.score >= 60 ? 'Ausgewogen gestreut' : riskAnalysis.score >= 40 ? 'Erhöhte Risikokonzentration' : 'Kritisches Klumpenrisiko'}
                    </h4>
                    <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Gewichtung und Verteilung.
                    </p>
                  </div>
                </div>

                {/* Progress bar visual indicator */}
                <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: `${riskAnalysis.score}%`,
                    height: '100%',
                    background: riskAnalysis.score >= 70 ? 'var(--accent-emerald)' : riskAnalysis.score >= 40 ? 'var(--accent-gold)' : 'var(--accent-rose)',
                    borderRadius: '3px',
                    transition: 'width 0.8s ease-in-out'
                  }} />
                </div>

                {/* Positives & Warnings Lists */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  {riskAnalysis.positives.map((p, idx) => (
                    <div key={`p-${idx}`} style={{ display: 'flex', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
                      <span>✓</span>
                      <span>{p}</span>
                    </div>
                  ))}
                  {riskAnalysis.warnings.map((w, idx) => (
                    <div key={`w-${idx}`} style={{ display: 'flex', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                      <span>⚠</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sav-list-flex">
              {coachInsights.map((insight, idx) => (
                <div key={idx} className={`recom-card ${insight.type === 'success' ? 'success' : insight.type === 'warning' ? 'warning' : ''}`}>
                  <div className="strat-recom-title-row">
                    <span className="sav-item-title-active">{insight.title}</span>
                  </div>
                  <p className="strat-recom-text">
                    {insight.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Backtesting Sandbox view */
        <div className="sav-main-grid">
          <div className="glass-panel sav-col-flex" style={{ flex: 2 }}>
            <h3 className="tx-manual-title">
              Historische Wertentwicklung ({
                backtestScenario === 'default' ? '2016 - 2026' :
                backtestScenario === 'dotcom' ? '2000 - 2003' :
                backtestScenario === 'financial' ? '2007 - 2009' :
                backtestScenario === 'covid' ? '2020 - 2021' :
                '2023 - 2026'
              })
            </h3>
            <p className="tx-dropzone-subtitle">Vergleicht deine eingestellte Wunsch-Allokation gegen ein reines MSCI World Benchmark-Portfolio.</p>
            
            <div style={{ height: '300px', width: '100%', margin: '1rem 0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backtestData}>
                  <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v.toLocaleString('de-DE')} €`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Portfolio" name="Wunsch-Allokation" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Benchmark" name="MSCI World Benchmark" stroke="var(--accent-purple)" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Backtest Statistics Comparison */}
            <div className="sav-sim-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <span className="sav-sim-stat-label">Endwert Portfolio</span>
                <p className="sav-sim-stat-value fs-md" style={{ color: 'var(--accent-blue)' }}>{backtestStats.portFinal.toLocaleString('de-DE')} €</p>
              </div>
              <div>
                <span className="sav-sim-stat-label">Gesamtrendite</span>
                <p className="sav-sim-stat-value fs-md text-positive">{backtestStats.portGain.toFixed(1)}%</p>
              </div>
              <div>
                <span className="sav-sim-stat-label">Volatilität (Est.)</span>
                <p className="sav-sim-stat-value fs-md text-purple">{backtestStats.portVol.toFixed(1)}%</p>
              </div>
              <div>
                <span className="sav-sim-stat-label">Benchmark Endwert</span>
                <p className="sav-sim-stat-value fs-md text-white">{backtestStats.benchFinal.toLocaleString('de-DE')} € ({backtestStats.benchGain.toFixed(1)}%)</p>
              </div>
            </div>
          </div>

          {/* Backtest control settings panel */}
          <div className="glass-panel" style={{ flex: 1 }}>
            <h3 className="tx-manual-title">Backtest Parameter</h3>
            <p className="tx-dropzone-subtitle">Konfiguriere das Startkapital und die historische Ziel-Allokation.</p>
            
            <div className="form-group mb-4">
              <label className="form-label">Historisches Szenario</label>
              <select
                className="form-select"
                value={backtestScenario}
                onChange={(e) => setBacktestScenario(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-color)', marginBottom: '1rem' }}
              >
                <option value="default">Langzeit-Trend (2016 - 2026)</option>
                <option value="dotcom">Dotcom-Blase Crash (2000 - 2003)</option>
                <option value="financial">Finanzkrise (2007 - 2009)</option>
                <option value="covid">Corona Crash & Rallye (2020 - 2021)</option>
                <option value="bullrun">Tech Bullrun (2023 - 2026)</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Startkapital (€)</label>
              <input 
                type="number"
                className="form-input"
                value={backtestCapital}
                onChange={(e) => setBacktestCapital(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>

            <div className="strat-target-col mb-4">
              <div className="sav-slider-label-row">
                <label className="strat-target-label">Aktien (S&P 500)</label>
                <span className="sav-slider-label-bold">{backtestStock}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={backtestStock} 
                onChange={(e) => adjustSliders('stock', parseInt(e.target.value), true)}
                className="projection-range"
              />
            </div>

            <div className="strat-target-col mb-4">
              <div className="sav-slider-label-row">
                <label className="strat-target-label">ETFs (MSCI World)</label>
                <span className="sav-slider-label-bold">{backtestEtf}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={backtestEtf} 
                onChange={(e) => adjustSliders('etf', parseInt(e.target.value), true)}
                className="projection-range"
              />
            </div>

            <div className="strat-target-col mb-4">
              <div className="sav-slider-label-row">
                <label className="strat-target-label">Krypto (Bitcoin)</label>
                <span className="sav-slider-label-bold">{backtestCrypto}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={backtestCrypto} 
                onChange={(e) => adjustSliders('crypto', parseInt(e.target.value), true)}
                className="projection-range"
              />
            </div>

            <div className="tx-pdf-error-box" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
              <Info size={14} /> <strong>Erklärung:</strong> Dieser Backtest simuliert die Wertentwicklung einer Einmalanlage seit 2016 basierend auf historischen Jahres-Renditen der zugrundeliegenden Anlageklassen.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
