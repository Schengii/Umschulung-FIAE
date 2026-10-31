import React, { useState } from 'react';
import { 
  Zap, ShieldCheck, ShieldAlert, Activity, 
  BatteryCharging, CheckCircle, Layers, Award
} from 'lucide-react';
import {
  ELECTRICAL_PROTECTION_CLASSES,
  evaluatePeResistance,
  evaluateIsoResistance,
  evaluateRcdProtection,
  calculateUpsBatteryRuntime
} from '../../utils/dguvV3ElektronikEngine';

export default function DguvV3ElektronikLab({ onAwardXP }) {
  const [selectedClass, setSelectedClass] = useState('class_1');
  const [rPeInput, setRPeInput] = useState(0.18);
  const [cableLength, setCableLength] = useState(2);
  const [rIsoInput, setRIsoInput] = useState(3.5);
  
  // RCD Messwerte
  const [rcdCurrent, setRcdCurrent] = useState(24);
  const [rcdTime, setRcdTime] = useState(140);
  const [rcdNetSystem, setRcdNetSystem] = useState('TN');

  // USV Berechnung
  const [batteryAh, setBatteryAh] = useState(50);
  const [batteryVolt, setBatteryVolt] = useState(48);
  const [serverWatt, setServerWatt] = useState(800);

  const [hasClaimedXp, setHasClaimedXp] = useState(false);

  const peResult = evaluatePeResistance(rPeInput, cableLength);
  const isoResult = evaluateIsoResistance(rIsoInput, selectedClass);
  const rcdResult = evaluateRcdProtection(rcdCurrent, rcdTime, 30, rcdNetSystem);
  const upsResult = calculateUpsBatteryRuntime(batteryAh, batteryVolt, serverWatt);

  const isAllPassed = peResult.isPassed && isoResult.isPassed && rcdResult.isPassed;

  const handleClaimXp = () => {
    if (!hasClaimedXp && isAllPassed) {
      setHasClaimedXp(true);
      if (onAwardXP) {
        onAwardXP(60, 'dguv_v3_specialist');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>ITSE / FISI Elektrotechnik & Rechenzentren</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              DGUV Vorschrift 3 & VDE Elektro-Prüfstudio
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm">
              Prüfung elektrischer Betriebsmittel und Schutzmaßnahmen nach DIN VDE 0701-0702,
              DIN VDE 0100-410 (RCD / Personenschutz) und USV-Dimensionierung für Hochverfügbarkeits-IT.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono">
              DIN VDE 0701-0702 & 0100-410
            </span>
          </div>
        </div>
      </div>

      {/* Schutzklassen Auswahl */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-amber-400" />
          1. Elektrische Schutzklasse des Prüflings wählen:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(ELECTRICAL_PROTECTION_CLASSES).map(cls => {
            const isSelected = selectedClass === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-amber-600/20 border-amber-500 text-white shadow-lg shadow-amber-900/20'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-bold font-mono px-2 py-0.5 rounded bg-slate-950/60 border border-slate-700/80">
                    {cls.symbol}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {cls.requiredTests.join(' + ')}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-100 mb-1">{cls.name}</div>
                <div className="text-xs text-slate-400 line-clamp-3">{cls.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Messungen R_PE & R_ISO vs. RCD Prüfung */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: DGUV V3 Prüfprotokoll für Geräte */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            2. Geräteprüfung (DIN VDE 0701-0702)
          </h2>

          {selectedClass === 'class_1' && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Schutzleiterwiderstand (R_PE):</span>
                <span className="font-mono text-amber-300 font-bold">{rPeInput} Ω</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.20"
                step="0.01"
                value={rPeInput}
                onChange={e => setRPeInput(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Leitungslänge: {cableLength} m</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={cableLength}
                  onChange={e => setCableLength(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-center text-xs text-slate-200"
                />
              </div>
              <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                peResult.isPassed ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border border-rose-500/40 text-rose-300'
              }`}>
                {peResult.isPassed ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />}
                <span>{peResult.message}</span>
              </div>
            </div>
          )}

          {/* R_ISO Messung */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Isolationswiderstand (R_ISO):</span>
              <span className="font-mono text-cyan-300 font-bold">{rIsoInput} MΩ</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="20.0"
              step="0.1"
              value={rIsoInput}
              onChange={e => setRIsoInput(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
              isoResult.isPassed ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border border-rose-500/40 text-rose-300'
            }`}>
              {isoResult.isPassed ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />}
              <span>{isoResult.message}</span>
            </div>
          </div>
        </div>

        {/* Box 2: RCD / FI-Schutzschalter Prüfung */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            3. RCD / FI Personenschutz (DIN VDE 0100-410)
          </h2>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Netzform:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setRcdNetSystem('TN')}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                    rcdNetSystem === 'TN' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  TN-System (t_a ≤ 400 ms)
                </button>
                <button
                  onClick={() => setRcdNetSystem('TT')}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                    rcdNetSystem === 'TT' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  TT-System (t_a ≤ 200 ms)
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Auslösestrom I_Δ (Norm: 15–30 mA):</span>
                <span className="font-mono text-emerald-300 font-bold">{rcdCurrent} mA</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={rcdCurrent}
                onChange={e => setRcdCurrent(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Auslösezeit t_a (in ms):</span>
                <span className="font-mono text-emerald-300 font-bold">{rcdTime} ms</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="5"
                value={rcdTime}
                onChange={e => setRcdTime(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className={`p-3 rounded-lg text-xs ${
              rcdResult.isPassed ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border border-rose-500/40 text-rose-300'
            }`}>
              {rcdResult.explanation}
            </div>
          </div>
        </div>
      </div>

      {/* Box 3: RZ-USV Batteriedimensionierung */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <BatteryCharging className="w-5 h-5 text-indigo-400" />
          4. USV-Batteriedimensionierung & Autonomiezeit (Server-Notstrom)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
            <label className="text-xs text-slate-400 block mb-1">Batteriebank-Kapazität (Ah):</label>
            <input
              type="number"
              min="10"
              max="500"
              step="5"
              value={batteryAh}
              onChange={e => setBatteryAh(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono text-white"
            />
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
            <label className="text-xs text-slate-400 block mb-1">Batteriespannung (V DC):</label>
            <input
              type="number"
              min="12"
              max="96"
              step="12"
              value={batteryVolt}
              onChange={e => setBatteryVolt(Math.max(12, parseInt(e.target.value) || 12))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono text-white"
            />
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
            <label className="text-xs text-slate-400 block mb-1">Serverrack-Verbrauch (Watt):</label>
            <input
              type="number"
              min="100"
              max="10000"
              step="50"
              value={serverWatt}
              onChange={e => setServerWatt(Math.max(50, parseInt(e.target.value) || 50))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono text-white"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-indigo-300 font-semibold mb-1">Errechnete Notstrom-Autonomie:</div>
            <div className="text-2xl font-bold font-mono text-white">
              {upsResult.runtimeMinutes} Minuten
              <span className="text-xs text-slate-400 font-normal ml-2">
                (Gespeicherte Energie: {upsResult.storedEnergyWh} Wh)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{upsResult.autonomyEvaluation}</p>
          </div>
          {isAllPassed && (
            <button
              onClick={handleClaimXp}
              disabled={hasClaimedXp}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                hasClaimedXp
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{hasClaimedXp ? 'Prüfsiegel erteilt ✓ (+60 XP)' : 'DGUV V3 Prüfzertifikat ausstellen (+60 XP)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
