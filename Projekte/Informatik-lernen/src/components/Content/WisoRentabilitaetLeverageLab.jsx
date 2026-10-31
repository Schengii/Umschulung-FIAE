import React, { useState, useMemo } from 'react';
import { 
  Calculator, Award, Check, TrendingUp, 
  TrendingDown, Percent
} from 'lucide-react';
import { calculateRentabilitaetAndLeverage } from '../../utils/wisoRentabilitaetLeverageEngine';
import { useStore } from '../../store/useStore';

export default function WisoRentabilitaetLeverageLab() {
  const { awardXP } = useStore();
  const [xpAwarded, setXpAwarded] = useState(false);

  const [params, setParams] = useState({
    eigenkapital: 200000,
    fremdkapital: 300000,
    fremdkapitalZinssatz: 5,
    jahresueberschuss: 40000,
    umsatzerloese: 1000000
  });

  const calculation = useMemo(() => {
    return calculateRentabilitaetAndLeverage(params);
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
      awardXP(60, 'wiso_leverage_master');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IHK Bilanzanalyse & Finanzierung
              </span>
              <span className="text-xs text-slate-400">AP2 WISO Standard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              WISO Rentabilitätskennzahlen & Leverage-Effekt Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Berechne Eigenkapital-, Gesamtkapital- und Umsatzrentabilität und simuliere den finanziellen Leverage-Effekt (Hebelwirkung von Fremdkapital auf die Eigenkapitalrendite).
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow"
              >
                <Award size={14} /> 60 XP sichern
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Inputs & KPI Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calculator size={18} className="text-emerald-400" />
              Unternehmensdaten & Kapitalstruktur
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Eigenkapital (€):</label>
                <input
                  type="number"
                  value={params.eigenkapital}
                  onChange={(e) => handleChange('eigenkapital', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Fremdkapital (€):</label>
                <input
                  type="number"
                  value={params.fremdkapital}
                  onChange={(e) => handleChange('fremdkapital', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Fremdkapital-Zins (% p.a.):</label>
                <input
                  type="number"
                  step="0.5"
                  value={params.fremdkapitalZinssatz}
                  onChange={(e) => handleChange('fremdkapitalZinssatz', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Jahresüberschuss / Reingewinn (€):</label>
                <input
                  type="number"
                  value={params.jahresueberschuss}
                  onChange={(e) => handleChange('jahresueberschuss', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Umsatzerlöse (€):</label>
                <input
                  type="number"
                  value={params.umsatzerloese}
                  onChange={(e) => handleChange('umsatzerloese', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results & Leverage Banner (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Leverage Status Card */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            calculation.isPositiveLeverage
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500 text-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              {calculation.isPositiveLeverage ? (
                <TrendingUp size={32} className="text-emerald-400" />
              ) : (
                <TrendingDown size={32} className="text-rose-400" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  {calculation.isPositiveLeverage ? 'Positiver Leverage-Effekt aktiv' : 'Negativer Leverage-Effekt (Risiko!)'}
                </h3>
                <p className="text-xs opacity-80">
                  {calculation.isPositiveLeverage 
                    ? `Gesamtkapitalrendite (${calculation.gesamtkapitalrentabilitaet}%) > Fremdkapitalzins (${params.fremdkapitalZinssatz}%). Spread: +${calculation.spread}%`
                    : `Fremdkapitalzins (${params.fremdkapitalZinssatz}%) > Gesamtkapitalrendite (${calculation.gesamtkapitalrentabilitaet}%). Schulden schmälern die Eigenkapitalrendite!`}
                </p>
              </div>
            </div>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <span className="block text-slate-400 text-xs font-medium mb-1">Eigenkapitalrendite (r_EK)</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">{calculation.eigenkapitalrentabilitaet}%</span>
              <span className="block text-[10px] text-slate-500 mt-1">Gewinn / EK</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <span className="block text-slate-400 text-xs font-medium mb-1">Gesamtkapitalrendite (r_GK)</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">{calculation.gesamtkapitalrentabilitaet}%</span>
              <span className="block text-[10px] text-slate-500 mt-1">(Gewinn + Zinsen) / GK</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <span className="block text-slate-400 text-xs font-medium mb-1">Umsatzrendite (r_U)</span>
              <span className="text-2xl font-bold font-mono text-amber-400">{calculation.umsatzrentabilitaet}%</span>
              <span className="block text-[10px] text-slate-500 mt-1">Gewinn / Umsatz</span>
            </div>
          </div>

          {/* Leverage Formula Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Percent size={16} className="text-emerald-400" />
              IHK Prüfungsformel: Der Leverage-Effekt
            </h3>
            <div className="font-mono text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-300">
              r_EK = r_GK + (r_GK - i) * (FK / EK)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solange die Gesamtkapitalrentabilität (r_GK) über dem Zinssatz für Fremdkapital (i) liegt, steigt die Eigenkapitalrendite mit jedem zusätzlichen Euro an aufgenommenem Fremdkapital. 
              Verschuldungsgrad (FK/EK): <strong>{calculation.verschuldungsgrad}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
