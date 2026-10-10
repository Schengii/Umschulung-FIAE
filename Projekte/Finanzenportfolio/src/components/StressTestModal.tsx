import React, { useState, useMemo } from 'react';
import { runMonteCarloSimulation, runStressTestScenarios } from './performanceUtils';
import { X, Activity, Sparkles, Sliders, Landmark, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateLombardCreditMetrics } from '../utils/lombardLoanUtils';
import {
  PRESET_MACRO_SHOCK_FACTORS,
  calculateStackedMacroScenarios
} from '../utils/scenarioStackingUtils';
import type { Holding } from '../types';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPortfolioValue: number;
  monthlySavings: number;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  holdings?: Holding[];
}

export const StressTestModal: React.FC<StressTestModalProps> = ({
  isOpen,
  onClose,
  currentPortfolioValue,
  monthlySavings,
  baseCurrency,
  holdings = []
}) => {
  const [activeTab, setActiveTab] = useState<'montecarlo' | 'stresstest' | 'custom' | 'lombard' | 'stacking'>('montecarlo');
  const [years, setYears] = useState<number>(20);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [volatility, setVolatility] = useState<number>(15);
  const [savingsRate, setSavingsRate] = useState<number>(monthlySavings || 200);

  // Custom Macro Scenario State
  const [customName, setCustomName] = useState('Geopolitischer Schock & Zinswende');
  const [customStockShock, setCustomStockShock] = useState<number>(-25);
  const [customCryptoShock, setCustomCryptoShock] = useState<number>(-45);

  // Lombard Credit State
  const [requestedLoan, setRequestedLoan] = useState<number>(Math.round(currentPortfolioValue * 0.25));
  const [loanInterestPct, setLoanInterestPct] = useState<number>(5.5);

  const monteCarlo = useMemo(() => {
    return runMonteCarloSimulation(currentPortfolioValue, savingsRate, years, expectedReturn, volatility, 1000);
  }, [currentPortfolioValue, savingsRate, years, expectedReturn, volatility]);

  const stressTests = useMemo(() => {
    return runStressTestScenarios(currentPortfolioValue);
  }, [currentPortfolioValue]);

  const lombardMetrics = useMemo(() => {
    return calculateLombardCreditMetrics({
      holdings,
      requestedLoanEur: requestedLoan,
      interestRatePct: loanInterestPct
    });
  }, [holdings, requestedLoan, loanInterestPct]);

  const customImpact = useMemo(() => {
    const loss = currentPortfolioValue * (Math.abs(customStockShock) / 100);
    const newValue = Math.max(0, currentPortfolioValue - loss);
    return {
      loss,
      newValue,
      dropPct: Math.abs(customStockShock)
    };
  }, [currentPortfolioValue, customStockShock]);

  // Scenario Stacking State
  const [selectedFactorIds, setSelectedFactorIds] = useState<string[]>([
    'rate-hike-200bps',
    'tech-valuation-reset'
  ]);

  const activeFactors = useMemo(() => {
    return PRESET_MACRO_SHOCK_FACTORS.filter(f => selectedFactorIds.includes(f.id));
  }, [selectedFactorIds]);

  const stackedResult = useMemo(() => {
    return calculateStackedMacroScenarios(activeFactors, currentPortfolioValue);
  }, [activeFactors, currentPortfolioValue]);

  const chartData = useMemo(() => {
    return monteCarlo.years.map(y => ({
      year: `Jahr ${y}`,
      Optimistisch: Math.round(monteCarlo.percentile90[y]),
      Median: Math.round(monteCarlo.percentile50[y]),
      Pessimistisch: Math.round(monteCarlo.percentile10[y])
    }));
  }, [monteCarlo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Monte Carlo, Stresstests & Lombard-Kredit</h3>
              <p className="text-xs text-slate-400">1.000 statistische Pfadberechnungen, Historische Krisen & Hebel-Rechner</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button 
                onClick={() => setActiveTab('montecarlo')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'montecarlo' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Monte Carlo
              </button>
              <button 
                onClick={() => setActiveTab('stresstest')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'stresstest' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Stress-Tests
              </button>
              <button 
                onClick={() => setActiveTab('lombard')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'lombard' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Lombard-Kredit & Hebel
              </button>
              <button 
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'custom' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Eigener Stresstest
              </button>
              <button 
                onClick={() => setActiveTab('stacking')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'stacking' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Scenario Stacking
              </button>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">

          {activeTab === 'montecarlo' && (
            <div className="space-y-6">
              
              {/* Top Result Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block font-medium">Pessimistisch (10. Perzentil)</span>
                  <span className="text-xl font-black text-amber-400 mt-1 block">
                    {monteCarlo.finalLow.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">90% Wahrscheinlichkeit höher</span>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <span className="text-xs text-blue-400 block font-semibold">Erwarteter Median (50. Perzentil)</span>
                  <span className="text-xl font-black text-blue-300 mt-1 block">
                    {monteCarlo.finalMedian.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                  </span>
                  <span className="text-[10px] text-blue-400/70 mt-1 block">Statistischer Mittelwert nach {years} Jahren</span>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-xs text-emerald-400 block font-semibold">Optimistisch (90. Perzentil)</span>
                  <span className="text-xl font-black text-emerald-300 mt-1 block">
                    {monteCarlo.finalHigh.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                  </span>
                  <span className="text-[10px] text-emerald-400/70 mt-1 block">Bei anhaltendem Bullenmarkt</span>
                </div>
              </div>

              {/* Fan Chart */}
              <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Statistischer Vermögenskorridor (1.000 Pfade)
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                        formatter={(value: any) => [Number(value).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency }), '']}
                      />
                      <Area type="monotone" dataKey="Optimistisch" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorHigh)" />
                      <Area type="monotone" dataKey="Median" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMedian)" />
                      <Area type="monotone" dataKey="Pessimistisch" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Zeithorizont: <strong className="text-slate-200">{years} Jahre</strong></label>
                  <input 
                    type="range" 
                    min={5} 
                    max={40} 
                    step={1} 
                    value={years} 
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Erwartete Rendite p.a.: <strong className="text-slate-200">{expectedReturn}%</strong></label>
                  <input 
                    type="range" 
                    min={2} 
                    max={15} 
                    step={0.5} 
                    value={expectedReturn} 
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Volatilität (Schwankung): <strong className="text-slate-200">{volatility}%</strong></label>
                  <input 
                    type="range" 
                    min={5} 
                    max={35} 
                    step={1} 
                    value={volatility} 
                    onChange={(e) => setVolatility(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Monatliche Sparrate: <strong className="text-slate-200">{savingsRate} €</strong></label>
                  <input 
                    type="range" 
                    min={0} 
                    max={2500} 
                    step={50} 
                    value={savingsRate} 
                    onChange={(e) => setSavingsRate(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'stresstest' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Aktueller Portfolio-Ausgangswert</span>
                  <p className="text-[10px] text-slate-400">Verlustberechnungen basieren auf deinem echten Portfoliowert</p>
                </div>
                <span className="text-base font-black font-mono text-emerald-400">
                  {currentPortfolioValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {stressTests.map((scenario) => (
                  <div key={scenario.scenarioName} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">{scenario.scenarioName}</span>
                        <span className="text-[10px] text-slate-500 block">Erholung ca. {scenario.recoveryMonthsEstimate} Monate</span>
                      </div>
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[11px] font-mono font-bold">
                        -{scenario.dropPercent.toFixed(1)}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Historische Krisensimulation bezogen auf den aktuellen Portfoliowert.
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Simulierter Verlust:</span>
                        <span className="font-mono font-bold text-rose-400">
                          -{scenario.portfolioLossEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Restwert im Depot:</span>
                        <span className="font-mono font-bold text-slate-200">
                          {scenario.portfolioNewValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'lombard' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3">
                <Landmark className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-amber-300 text-sm">Wertpapierkredit- & Beleihungswert-Rechner (Lombard)</div>
                  <p className="text-slate-300 leading-relaxed">
                    Simuliere die Beleihungsgrenzen deines Depots (ETFs ~70%, Aktien ~50%, Anleihen ~80%, Krypto 0%).
                    Erkenne sofort Hebelquoten, laufende Zinskosten und kritische Margin-Call-Schwellen bei Marktkorrekturen.
                  </p>
                </div>
              </div>

              {/* Slider Controls */}
              <div className="grid grid-cols-2 gap-4 p-5 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-slate-300 font-semibold">Gewünschter Kreditbetrag:</label>
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {requestedLoan.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(10000, Math.round(lombardMetrics.maxLoanAmountEur * 1.3))}
                    step={250}
                    value={requestedLoan}
                    onChange={(e) => setRequestedLoan(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0 €</span>
                    <span>Max. Beleihungswert: {lombardMetrics.maxLoanAmountEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-slate-300 font-semibold">Sollzinssatz p.a.:</label>
                    <span className="font-mono text-sm font-bold text-blue-400">{loanInterestPct.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={2.0}
                    max={12.0}
                    step={0.25}
                    value={loanInterestPct}
                    onChange={(e) => setLoanInterestPct(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>2.0%</span>
                    <span>Typisch Neobroker / Bank: 5.5% - 7.5%</span>
                  </div>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Max. Beleihungswert</span>
                  <span className="text-base font-black text-slate-100 mt-1 block">
                    {lombardMetrics.totalCollateralValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Summe aller Sicherheiten</span>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Beleihungsquote (LTV)</span>
                  <span className={`text-base font-black mt-1 block ${lombardMetrics.currentLtvRatioPct >= 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {lombardMetrics.currentLtvRatioPct.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Hebel: {lombardMetrics.currentLeverageFactor.toFixed(2)}x</span>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Laufende Zinskosten</span>
                  <span className="text-base font-black text-blue-400 mt-1 block">
                    {lombardMetrics.annualInterestCostEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">~{(lombardMetrics.annualInterestCostEur / 12).toFixed(0)} € / Monat</span>
                </div>

                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Puffer bis Margin Call</span>
                  <span className={`text-base font-black mt-1 block ${lombardMetrics.portfolioDropUntilMarginCallPct <= 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {lombardMetrics.portfolioDropUntilMarginCallPct.toFixed(1)}% Fallhöhe
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Puffer: {lombardMetrics.bufferUntilMarginCallEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</span>
                </div>
              </div>

              {/* Status & Recommendation Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
                lombardMetrics.isOverleveraged
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : lombardMetrics.isMarginCallRisk
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  {lombardMetrics.isMarginCallRisk || lombardMetrics.isOverleveraged ? (
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                  )}
                  <span><strong>Einschätzung:</strong> {lombardMetrics.recommendation}</span>
                </div>
                {lombardMetrics.isOverleveraged && (
                  <span className="px-2.5 py-1 bg-rose-500/20 rounded font-bold text-[11px] shrink-0">
                    Kredit zu hoch!
                  </span>
                )}
              </div>

              {/* Collateral Breakdown Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <div className="p-3 bg-slate-950 font-bold border-b border-slate-800 flex justify-between items-center text-slate-300">
                  <span>Beleihungswerte je Position</span>
                  <span className="text-[11px] text-slate-500 font-normal">{lombardMetrics.holdingsBreakdown.length} Positionen analysiert</span>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60">
                  {lombardMetrics.holdingsBreakdown.map((item) => (
                    <div key={item.ticker} className="p-2.5 flex items-center justify-between hover:bg-slate-800/30">
                      <div>
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.ticker} • {item.category} • Beleihbar: {item.loanToValuePct}%</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-300">
                          {item.collateralValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          aus {item.currentValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} Marktwert
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Sliders className="w-4 h-4 text-amber-400" /> Eigenes Makro-Krisenszenario definieren
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Name des Szenarios:</label>
                  <input 
                    type="text" 
                    value={customName} 
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Kursverlust auf Aktien & ETFs:</span>
                    <strong className="text-red-400">{customStockShock}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min={-90} 
                    max={0} 
                    step={5} 
                    value={customStockShock} 
                    onChange={(e) => setCustomStockShock(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Kursverlust auf Kryptowährungen:</span>
                    <strong className="text-red-400">{customCryptoShock}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min={-95} 
                    max={0} 
                    step={5} 
                    value={customCryptoShock} 
                    onChange={(e) => setCustomCryptoShock(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
              </div>

              {/* Impact Card */}
              <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-100">{customName}</h4>
                  <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-mono font-bold">
                    -{customImpact.dropPct}% Portfoliodrop
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Simulierter Verlust:</span>
                    <span className="text-lg font-black text-red-400 mt-1 block">
                      -{customImpact.loss.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Neuer Depotwert im Stresstest:</span>
                    <span className="text-lg font-black text-slate-200 mt-1 block">
                      {customImpact.newValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stacking' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-4 bg-purple-500/10 border border-purple-500/25 rounded-2xl flex items-start gap-3">
                <Layers className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-purple-300 text-sm">Interactive Scenario Stacking (Kombinierte Makro-Schocks)</div>
                  <p className="text-slate-300 leading-relaxed">
                    Kombiniere mehrere gleichzeitige Schocks (Zinsanstieg, Tech-Einbruch, Dollar-Abwertung, Liquiditäts-Krise), um fat-tail Crash-Szenarien und Margin-Call-Risiken auf das Gesamtdepot realistisch abzubilden.
                  </p>
                </div>
              </div>

              {/* Factors Selection Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Wähle Schock-Faktoren zur Kumulierung aus:</div>
                <div className="grid grid-cols-1 gap-2.5">
                  {PRESET_MACRO_SHOCK_FACTORS.map(factor => {
                    const isChecked = selectedFactorIds.includes(factor.id);
                    return (
                      <div
                        key={factor.id}
                        onClick={() => {
                          setSelectedFactorIds(prev => 
                            isChecked ? prev.filter(id => id !== factor.id) : [...prev, factor.id]
                          );
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isChecked 
                            ? 'bg-purple-950/40 border-purple-500/40 shadow-sm' 
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="accent-purple-500 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <div className="font-semibold text-xs text-slate-100">{factor.name}</div>
                            <div className="text-[11px] text-slate-400">{factor.description}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded">
                            Aktien: {factor.equityDropPercent}%
                          </span>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                            Krypto: {factor.cryptoDropPercent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stacked Result Card */}
              <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      Kumuliertes Stresstest-Ergebnis ({activeFactors.length} Schocks aktiv)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Erholungsdauer geschätzt: ca. {stackedResult.estimatedRecoveryMonths} Monate
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black ${
                    stackedResult.isMarginCallTriggered
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    -{stackedResult.netPortfolioDropPct}% Gesamtabfall
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Kumulierter Depotverlust:</span>
                    <span className="text-lg font-black text-red-400 mt-1 block">
                      -{stackedResult.portfolioLossEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Verbleibender Depotwert:</span>
                    <span className="text-lg font-black text-slate-200 mt-1 block">
                      {stackedResult.portfolioNewValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Margin-Call / Hebelrisiko:</span>
                    <span className={`text-base font-black mt-1 block ${
                      stackedResult.isMarginCallTriggered ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {stackedResult.isMarginCallTriggered ? '⚠️ HOHE GEFAHR' : '✅ Gesichert (>35% Puffer)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors">
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
