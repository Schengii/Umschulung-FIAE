import React, { useState, useMemo } from 'react';
import { 
  BarChart2, Award, Check, Shuffle, 
  Layers, ShieldAlert
} from 'lucide-react';
import { 
  DEFAULT_NWA_CRITERIA, 
  DEFAULT_NWA_OPTIONS, 
  calculateNwaScores, 
  runNwaMonteCarloStressTest 
} from '../../utils/nwaSensitivityEngine';
import { useStore } from '../../store/useStore';

export default function NwaSensitivityLab() {
  const { awardXP } = useStore();
  const [xpAwarded, setXpAwarded] = useState(false);

  const [criteria, setCriteria] = useState(DEFAULT_NWA_CRITERIA);
  const [options] = useState(DEFAULT_NWA_OPTIONS);
  const [jitter, setJitter] = useState(20);
  const [monteCarloResult, setMonteCarloResult] = useState(null);

  const baselineScores = useMemo(() => {
    return calculateNwaScores(criteria, options);
  }, [criteria, options]);

  const handleRunStressTest = () => {
    const res = runNwaMonteCarloStressTest(criteria, options, 500, jitter);
    setMonteCarloResult(res);

    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(65, 'nwa_sensitivity_master');
    }
  };

  const handleWeightChange = (critId, newWeight) => {
    setCriteria(prev => prev.map(c => c.id === critId ? { ...c, weight: Number(newWeight) } : c));
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                IHK Entscheidungsmatrix & DIN/VDI 2225
              </span>
              <span className="text-xs text-slate-400">AP2 Dokumentation & Sensitivität</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              IHK Nutzwertanalyse (NWA) Sensitivitäts- & Monte-Carlo Stresstest
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Prüfe die Robustheit deiner IHK-Entscheidung: Simuliere 500 probabilistische Gewichtungs-Schwankungen (Monte-Carlo-Methode) und teste K.O.-Kriterien gegen subjektive Beurteilungsfehler.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {xpAwarded ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Check size={14} /> 65 XP erhalten!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                <Award size={14} /> 65 XP verfügbar
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Criteria Editor & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Criteria & Weighting (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers size={18} className="text-amber-400" />
                IHK Bewertungskriterien & Gewichtung
              </h2>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                totalWeight === 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                Summe: {totalWeight}%
              </span>
            </div>

            <div className="space-y-3">
              {criteria.map((crit) => (
                <div key={crit.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 font-medium flex items-center gap-1.5">
                      {crit.name}
                      {crit.isKo && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          K.O. &ge; {crit.koMinScore} Pkt
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-amber-400 font-semibold">{crit.weight}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={crit.weight}
                    onChange={(e) => handleWeightChange(crit.id, e.target.value)}
                    className="w-full accent-amber-500"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Rauschen (Jitter):</span>
                <select
                  value={jitter}
                  onChange={(e) => setJitter(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                >
                  <option value={10}>&plusmn;10% Unsicherheit</option>
                  <option value={20}>&plusmn;20% Unsicherheit (Empfohlen)</option>
                  <option value={35}>&plusmn;35% Starkes Rauschen</option>
                </select>
              </div>

              <button
                onClick={handleRunStressTest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow"
              >
                <Shuffle size={14} /> 500x Monte-Carlo Stresstest
              </button>
            </div>
          </div>
        </div>

        {/* Results & Stresstest (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Baseline NWA Scores */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <BarChart2 size={16} className="text-cyan-400" />
              Deterministischer IHK Nutzwert (Baseline)
            </h3>

            <div className="space-y-2">
              {baselineScores.map((res, idx) => (
                <div
                  key={res.id}
                  className={`p-3 rounded-xl border flex justify-between items-center ${
                    idx === 0 && !res.koFailed
                      ? 'bg-amber-950/20 border-amber-500/50 text-white'
                      : res.koFailed
                        ? 'bg-rose-950/20 border-rose-800 text-slate-400'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono">#{idx + 1}</span>
                      <span className="text-xs font-medium">{res.name}</span>
                      {idx === 0 && !res.koFailed && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/30 text-amber-200">
                          Sieger
                        </span>
                      )}
                    </div>
                    {res.koFailed && (
                      <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5">
                        <ShieldAlert size={12} /> {res.koReason}
                      </span>
                    )}
                  </div>
                  <span className={`font-mono text-sm font-bold ${
                    res.koFailed ? 'text-rose-400 line-through' : 'text-amber-400'
                  }`}>
                    {res.koFailed ? 'K.O.' : `${res.totalWeightedScore} Pkt`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monte-Carlo Report */}
          {monteCarloResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200">
                  Sensitivitäts-Auswertung ({monteCarloResult.iterations} Durchläufe)
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  monteCarloResult.isDecisionRobust
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {monteCarloResult.isDecisionRobust ? 'Entscheidung Robust (>70%)' : 'Sensitiv / Kippgefährdet'}
                </span>
              </div>

              <div className="space-y-2">
                {monteCarloResult.robustnessPercentages.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">{item.name}</span>
                      <span className="font-mono text-cyan-300 font-bold">{item.winRatePercent}% Siegquote</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.winRatePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                💡 <strong>IHK Prüferhinweis:</strong> Eine Entscheidung gilt im IHK Fachgespräch als methodisch sauber belegt, wenn die gewählte Lösung auch bei &plusmn;20% Schwankung der Kriterien-Gewichte in mindestens 70% der Fälle als Sieger hervorgeht.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
