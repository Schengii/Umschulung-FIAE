import React, { useState } from 'react';
import { 
  Database, ShieldAlert, ShieldCheck, ArrowRight, RefreshCw, 
  Layers, CheckCircle, Info, Play
} from 'lucide-react';
import { 
  ISOLATION_LEVELS, 
  ANOMALIES, 
  simulateTransactionIsolation 
} from '../../utils/sqlIsolationEngine';

export default function SqlIsolationLab({ onAwardXP }) {
  const [selectedLevel, setSelectedLevel] = useState('read_committed');
  const [selectedAnomaly, setSelectedAnomaly] = useState('dirty_read');
  const [activeStep, setActiveStep] = useState(0);
  const [completedScenarios, setCompletedScenarios] = useState({});

  const currentLevelConfig = ISOLATION_LEVELS[selectedLevel];
  const currentAnomaly = ANOMALIES[selectedAnomaly];
  const simulation = simulateTransactionIsolation(selectedLevel, selectedAnomaly);

  const handleNextStep = () => {
    if (activeStep < currentAnomaly.scenario.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      // Szenario abgeschlossen
      if (!completedScenarios[selectedAnomaly]) {
        const nextCompleted = { ...completedScenarios, [selectedAnomaly]: true };
        setCompletedScenarios(nextCompleted);
        if (onAwardXP) {
          onAwardXP(50, 'sql_isolation_master');
        }
      }
    }
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Datenbank-Sicherheit & ACID Architekturen</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              SQL Transaction Isolation & ACID Studio
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm">
              Erforsche die 4 ANSI-SQL Isolationslevel (Read Uncommitted bis Serializable SSI) und beobachte,
              wie Datenbanksysteme Dirty Reads, Non-Repeatable Reads, Phantom Reads und Write Skew verhindern.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-mono">
              PostgreSQL & ANSI SQL-92
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Level Selection & Anomaly Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Isolationsstufe wählen */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            1. Isolationslevel wählen:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ISOLATION_LEVELS).map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => { setSelectedLevel(lvl.id); handleReset(); }}
                  className={`p-3 rounded-lg text-left border transition-all text-xs ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium shadow-md shadow-indigo-900/20'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{lvl.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">{lvl.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Anomalie wählen */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            2. Transaktions-Anomalie testen:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(ANOMALIES).map((anom) => {
              const isSelected = selectedAnomaly === anom.id;
              const isSolved = completedScenarios[anom.id];
              return (
                <button
                  key={anom.id}
                  onClick={() => { setSelectedAnomaly(anom.id); handleReset(); }}
                  className={`p-3 rounded-lg text-left border transition-all text-xs ${
                    isSelected
                      ? 'bg-amber-600/30 border-amber-500 text-white font-medium shadow-md shadow-amber-900/20'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{anom.title.split(' (')[0]}</span>
                    {isSolved && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2">{anom.summary}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interaktive Transaktions-Timeline Simulation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Play className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{currentAnomaly.title}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-normal">
                  Schritt {activeStep + 1} von {currentAnomaly.scenario.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">{currentAnomaly.summary}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Neustart</span>
          </button>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-4 mb-6">
          {currentAnomaly.scenario.map((step, idx) => {
            const isCurrent = idx === activeStep;
            const isPast = idx < activeStep;
            return (
              <div 
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/40' 
                    : isPast 
                      ? 'bg-slate-800/40 border-slate-700/60 opacity-80' 
                      : 'bg-slate-900/40 border-slate-800/40 opacity-40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isPast ? 'bg-emerald-500 text-slate-950' : isCurrent ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {isPast ? '✓' : idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                        {step.tx}
                      </div>
                      <div className="text-sm font-medium text-slate-200">
                        {step.action}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <code className="text-xs font-mono bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-indigo-300">
                      {step.sql}
                    </code>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Control Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {activeStep === currentAnomaly.scenario.length - 1 ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Szenario vollständig durchlaufen
              </span>
            ) : (
              <span>Klicke auf "Nächster Schritt", um die Transaktionsinteraktion auszuführen.</span>
            )}
          </div>
          <button
            onClick={handleNextStep}
            disabled={activeStep >= currentAnomaly.scenario.length - 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition ${
              activeStep >= currentAnomaly.scenario.length - 1
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            <span>Nächster Schritt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ergebnis & Sicherheitsauswertung unter gewähltem Level */}
      <div className={`p-5 rounded-xl border ${
        simulation.prevented 
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' 
          : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${simulation.prevented ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {simulation.prevented ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-base">
                Verhalten unter {currentLevelConfig.name}:
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                simulation.prevented ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
              }`}>
                {simulation.prevented ? 'Verhindert (Sicher)' : 'Anomalie tritt auf (Gefahr)'}
              </span>
            </div>
            <p className="text-sm opacity-90 mb-2">{simulation.explanation}</p>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono">
              <strong>Technical Detail:</strong> {simulation.technicalDetail}
            </div>
          </div>
        </div>
      </div>

      {/* IHK Prüfungsmatrix (Tabelle) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-indigo-400" />
          IHK Prüfungs-Matrix: ANSI SQL Isolation Levels vs. Anomalien
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-semibold">Isolationsstufe</th>
                <th className="py-2 px-3 font-semibold">Dirty Read</th>
                <th className="py-2 px-3 font-semibold">Non-Repeatable Read</th>
                <th className="py-2 px-3 font-semibold">Phantom Read</th>
                <th className="py-2 px-3 font-semibold">Write Skew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-mono font-medium text-white">Read Uncommitted</td>
                <td className="py-2.5 px-3 text-rose-400 font-medium">Möglich ⚠️</td>
                <td className="py-2.5 px-3 text-rose-400 font-medium">Möglich ⚠️</td>
                <td className="py-2.5 px-3 text-rose-400 font-medium">Möglich ⚠️</td>
                <td className="py-2.5 px-3 text-rose-400 font-medium">Möglich ⚠️</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-medium text-white">Read Committed (Default)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-medium">Verhindert ✓</td>
                <td className="py-2.5 px-3 text-rose-400 font-medium">Möglich ⚠️</td>
                <td className="py-2.5 px-3 text-rose-400 font-medium">Möglich ⚠️</td>
                <td className="py-2.5 px-3 text-rose-400 font-medium">Möglich ⚠️</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-medium text-white">Repeatable Read</td>
                <td className="py-2.5 px-3 text-emerald-400 font-medium">Verhindert ✓</td>
                <td className="py-2.5 px-3 text-emerald-400 font-medium">Verhindert ✓</td>
                <td className="py-2.5 px-3 text-emerald-400 font-medium">Verhindert ✓ (MVCC)</td>
                <td className="py-2.5 px-3 text-rose-400 font-medium">Möglich ⚠️</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-medium text-white">Serializable (SSI)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-medium">Verhindert ✓</td>
                <td className="py-2.5 px-3 text-emerald-400 font-medium">Verhindert ✓</td>
                <td className="py-2.5 px-3 text-emerald-400 font-medium">Verhindert ✓</td>
                <td className="py-2.5 px-3 text-emerald-400 font-medium">Verhindert ✓ (SSI)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
