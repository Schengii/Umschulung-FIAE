import React, { useState, useMemo } from 'react';
import { runMonteCarloSimulation, runStressTestScenarios } from './performanceUtils';
import { X, Activity, ShieldAlert, Sparkles, Sliders } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPortfolioValue: number;
  monthlySavings: number;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const StressTestModal: React.FC<StressTestModalProps> = ({
  isOpen,
  onClose,
  currentPortfolioValue,
  monthlySavings,
  baseCurrency
}) => {
  const [activeTab, setActiveTab] = useState<'montecarlo' | 'stresstest'>('montecarlo');
  const [years, setYears] = useState<number>(20);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [volatility, setVolatility] = useState<number>(15);
  const [savingsRate, setSavingsRate] = useState<number>(monthlySavings || 200);

  const monteCarlo = useMemo(() => {
    return runMonteCarloSimulation(currentPortfolioValue, savingsRate, years, expectedReturn, volatility, 1000);
  }, [currentPortfolioValue, savingsRate, years, expectedReturn, volatility]);

  const stressTests = useMemo(() => {
    return runStressTestScenarios(currentPortfolioValue);
  }, [currentPortfolioValue]);

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
              <h3 className="text-lg font-bold">Monte Carlo Simulation & Stress-Testing</h3>
              <p className="text-xs text-slate-400">1.000 statistische Pfadberechnungen & Historische Krisen-Simulierung</p>
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
                  <Sparkles className="w-4 h-4 text-amber-400" /> Vermögensentwicklung im Fächer-Chart (1.000 Pfade)
                </h4>
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${Math.round(val / 1000)}k €`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(val: any) => [`${Number(val).toLocaleString('de-DE')} €`, '']}
                      />
                      <Area type="monotone" dataKey="Optimistisch" stroke="#10b981" fillOpacity={1} fill="url(#colorHigh)" />
                      <Area type="monotone" dataKey="Median" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMed)" />
                      <Area type="monotone" dataKey="Pessimistisch" stroke="#f59e0b" strokeDasharray="3 3" fill="none" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sliders */}
              <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-4 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-300">
                  <Sliders className="w-4 h-4 text-amber-400" /> Simulations-Parameter anpassen
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Zeithorizont:</span>
                      <span className="font-bold text-slate-200">{years} Jahre</span>
                    </div>
                    <input type="range" min={5} max={40} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-amber-500" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Monatliche Sparrate:</span>
                      <span className="font-bold text-slate-200">{savingsRate} € / Monat</span>
                    </div>
                    <input type="range" min={0} max={2000} step={50} value={savingsRate} onChange={(e) => setSavingsRate(Number(e.target.value))} className="w-full accent-amber-500" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Erwartete Rendite (p.a.):</span>
                      <span className="font-bold text-emerald-400">{expectedReturn}%</span>
                    </div>
                    <input type="range" min={1} max={15} step={0.5} value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full accent-amber-500" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400">Volatilität / Schwankung:</span>
                      <span className="font-bold text-amber-400">{volatility}%</span>
                    </div>
                    <input type="range" min={5} max={40} step={1} value={volatility} onChange={(e) => setVolatility(Number(e.target.value))} className="w-full accent-amber-500" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'stresstest' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-200 leading-relaxed">
                  <strong>Historische Krisen-Simulation:</strong> Wie würde sich dein aktueller Depotwert von <strong>{currentPortfolioValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</strong> verhalten, wenn sich historische Markt-Crashs heute wiederholen würden?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stressTests.map((st) => (
                  <div key={st.scenarioName} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-100">{st.scenarioName}</h4>
                      <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-mono font-bold">
                        -{st.dropPercent.toFixed(1)}%
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Simulierter Verlust:</span>
                        <span className="font-bold text-red-400">-{st.portfolioLossEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tiefststand Depotwert:</span>
                        <span className="font-bold text-slate-200">{st.portfolioNewValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Erholungsdauer (geschätzt):</span>
                        <span className="font-semibold text-amber-400">ca. {st.recoveryMonthsEstimate} Monate</span>
                      </div>
                    </div>
                  </div>
                ))}
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
