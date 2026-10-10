import React, { useState, useMemo } from 'react';
import { 
  Calculator, Award, Check, 
  AlertCircle, ShieldCheck, CheckCircle
} from 'lucide-react';
import { calculateLiquiditaetAndWorkingCapital, LIQUIDITAET_DRILL_QUESTIONS } from '../../utils/wisoLiquiditaetEngine';
import LabDrillSection from '../Shared/LabDrillSection';
import { useStore } from '../../store/useStore';

export default function WisoLiquiditaetLab() {
  const { awardXP } = useStore();
  const [xpAwarded, setXpAwarded] = useState(false);

  const [params, setParams] = useState({
    fluessigeMittel: 50000,
    kurzfristigeForderungen: 120000,
    vorraete: 180000,
    kurzfristigeVerbindlichkeiten: 150000
  });

  const calculation = useMemo(() => {
    return calculateLiquiditaetAndWorkingCapital({
      ...params,
      umlaufvermoegen: params.fluessigeMittel + params.kurzfristigeForderungen + params.vorraete
    });
  }, [params]);

  const handleChange = (field, value) => {
    setParams(prev => ({
      ...prev,
      [field]: Number(value) || 0
    }));
  };

  const handleTestTrigger = () => {
    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(60, 'wiso_liquiditaet_master');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                IHK Bilanzanalyse & Controlling
              </span>
              <span className="text-xs text-slate-400">AP2 WISO Standard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              IHK Liquiditätsgrade & Working Capital Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Berechne Barliquidität (1. Grad / Cash Ratio), einzugsbedingte Liquidität (2. Grad / Quick Ratio), umsatzbedingte Liquidität (3. Grad / Current Ratio) und das Net Working Capital (NWC).
            </p>
          </div>
          <div className="flex items-center gap-2">
            {xpAwarded ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Check size={14} /> 60 XP erhalten!
              </span>
            ) : (
              <button
                onClick={handleTestTrigger}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition shadow"
              >
                <Award size={14} /> 60 XP sichern
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Inputs & KPI Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calculator size={18} className="text-teal-400" />
              Bilanzdaten (Aktiva & Passiva)
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  1. Flüssige Mittel (Kasse, Bankguthaben) (€):
                </label>
                <input
                  type="number"
                  value={params.fluessigeMittel}
                  onChange={(e) => handleChange('fluessigeMittel', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  2. Kurzfristige Forderungen & Wertpapiere (€):
                </label>
                <input
                  type="number"
                  value={params.kurzfristigeForderungen}
                  onChange={(e) => handleChange('kurzfristigeForderungen', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  3. Vorräte (Waren, Rohstoffe, Erzeugnisse) (€):
                </label>
                <input
                  type="number"
                  value={params.vorraete}
                  onChange={(e) => handleChange('vorraete', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-semibold mb-1">
                  Kurzfristige Verbindlichkeiten (LuL, Kontokorrent) (€):
                </label>
                <input
                  type="number"
                  value={params.kurzfristigeVerbindlichkeiten}
                  onChange={(e) => handleChange('kurzfristigeVerbindlichkeiten', e.target.value)}
                  className="w-full bg-slate-950 border border-teal-500/50 rounded-lg px-3 py-2 text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results & Liquiditätsgrade (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Net Working Capital Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-400 block">Net Working Capital (Umlaufvermögen - Verbindlichkeiten)</span>
              <span className="text-3xl font-black font-mono text-white">
                {calculation.netWorkingCapital.toLocaleString('de-DE')} €
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Umlaufvermögen gesamt</span>
              <span className="text-lg font-bold font-mono text-teal-400">
                {calculation.berechnetesUmlaufvermoegen.toLocaleString('de-DE')} €
              </span>
            </div>
          </div>

          {/* 3 Liquidity Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* L1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Liquidität 1. Grades</span>
              <span className="text-2xl font-bold font-mono text-teal-400">{calculation.liquiditaet1}%</span>
              <span className="block text-[10px] text-slate-500">Barliquidität (Ziel: 20-30%)</span>
              <div className="pt-2 flex justify-center">
                {calculation.statusL1 === 'OPTIMAL' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle size={12} /> Optimal
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} /> Zu niedrig
                  </span>
                )}
              </div>
            </div>

            {/* L2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Liquidität 2. Grades</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">{calculation.liquiditaet2}%</span>
              <span className="block text-[10px] text-slate-500">Einzugsbedingt (Ziel: 100-120%)</span>
              <div className="pt-2 flex justify-center">
                {calculation.statusL2 === 'OPTIMAL' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle size={12} /> Optimal
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} /> Unterdeckung
                  </span>
                )}
              </div>
            </div>

            {/* L3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Liquidität 3. Grades</span>
              <span className="text-2xl font-bold font-mono text-indigo-400">{calculation.liquiditaet3}%</span>
              <span className="block text-[10px] text-slate-500">Current Ratio (Ziel: 150-200%)</span>
              <div className="pt-2 flex justify-center">
                {calculation.statusL3 === 'OPTIMAL' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle size={12} /> Optimal
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} /> Mäßig
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* IHK Infobox */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-teal-400" />
              IHK Prüfungswissen: Zahlungsfähigkeit
            </span>
            <p className="leading-relaxed">
              Die Liquidität 2. Grades gilt in der IHK-Abschlussprüfung als kritischster Indikator: Liegt sie unter 100%, reichen die unmittelbar verfügbaren und kurzfristig fälligen Gelder nicht aus, um die kurzfristigen Schulden zu bedienen. In diesem Fall droht bei Zahlungsstockung eine akute Zahlungsunfähigkeit nach InsO § 17.
            </p>
          </div>
        </div>
      </div>

      <LabDrillSection title="IHK Prüfungs-Drill: Liquiditätsgrade" questions={LIQUIDITAET_DRILL_QUESTIONS} accentColor="#14b8a6" />
    </div>
  );
}
