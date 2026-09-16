import React, { useMemo } from 'react';
import type { Holding } from '../types';
import { Layers, Activity, Award } from 'lucide-react';
import { calculateFamaFrench5Factors } from './performanceUtils';

interface FactorExposureWidgetProps {
  holdings: Holding[];
  baseCurrency?: string;
}

export const FactorExposureWidget: React.FC<FactorExposureWidgetProps> = ({
  holdings
}) => {
  const factors = useMemo(() => {
    return calculateFamaFrench5Factors(holdings);
  }, [holdings]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-md shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Fama-French 5-Faktor Risiko-Zerlegung</h3>
            <p className="text-xs text-slate-400">
              Quantitatives Multi-Faktor Screening (Market, Size, Value, Profitability, Investment)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 font-semibold">Multi-Faktor Score:</span>
          <span className="font-extrabold text-emerald-400">{factors.qualityScore}/100</span>
        </div>
      </div>

      {/* Factor Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Markt-Beta (MKT)</span>
          <span className="text-base font-bold text-blue-400">β {factors.marketBeta.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {factors.marketBeta > 1.1 ? 'Aggressiv / Hohe Vola' : factors.marketBeta < 0.9 ? 'Defensiv' : 'Markt-neutral'}
          </span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Size-Faktor (SMB)</span>
          <span className="text-base font-bold text-purple-400">{factors.sizeSmb >= 0 ? '+' : ''}{factors.sizeSmb.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {factors.sizeSmb > 0.1 ? 'Small-Cap Prämie' : 'Mega/Large-Cap Bias'}
          </span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Value vs. Growth (HML)</span>
          <span className="text-base font-bold text-amber-400">{factors.valueHml >= 0 ? '+' : ''}{factors.valueHml.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {factors.valueHml > 0.2 ? 'Value-Übergewichtung' : factors.valueHml < -0.2 ? 'Growth-Fokus' : 'Ausgewogen'}
          </span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Profitabilität (RMW)</span>
          <span className="text-base font-bold text-emerald-400">+{factors.profitabilityRmw.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {factors.profitabilityRmw > 0.3 ? 'Hohe Cashflow-Güte' : 'Moderate Margen'}
          </span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Investment (CMA)</span>
          <span className="text-base font-bold text-indigo-400">+{factors.investmentCma.toFixed(2)}</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {factors.investmentCma > 0.2 ? 'Konservative Reinvestition' : 'Aggressive Expansion'}
          </span>
        </div>
      </div>

      {/* Factor Health Footnote */}
      <div className="flex items-center gap-2 p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs text-slate-400">
        <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Dein Portfolio weist einen <strong>{factors.valueHml < -0.2 ? 'Growth' : 'Quality-Value'}</strong>-Charakter mit 
          hoher Ertragskraft (RMW +{factors.profitabilityRmw.toFixed(2)}) auf. Der 
          Diversifikations-Qualitätsscore liegt bei <strong>{factors.qualityScore}%</strong>.
        </span>
      </div>
    </div>
  );
};
