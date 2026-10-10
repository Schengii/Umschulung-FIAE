import React, { useState } from 'react';
import { 
  Building2, CreditCard, Banknote, 
  Calculator, Award, FileSpreadsheet
} from 'lucide-react';
import { calculateFinancingComparison } from '../../utils/wisoFinancingEngine';

export default function WisoFinancingLab({ onAwardXP }) {
  const [investment, setInvestment] = useState(15000);
  const [years, setYears] = useState(3);
  const [skonto, setSkonto] = useState(2.0);
  const [interestRate, setInterestRate] = useState(5.5);
  const [monthlyLease, setMonthlyLease] = useState(480);
  const [taxRate, setTaxRate] = useState(30.0);
  const [hasClaimedXp, setHasClaimedXp] = useState(false);

  const comparison = calculateFinancingComparison({
    investmentAmount: investment,
    usefulLifeYears: years,
    skontoPercent: skonto,
    creditInterestRatePercent: interestRate,
    monthlyLeasingRate: monthlyLease,
    corporateTaxRatePercent: taxRate
  });

  const handleClaimXp = () => {
    if (!hasClaimedXp) {
      setHasClaimedXp(true);
      if (onAwardXP) {
        onAwardXP(60, 'wiso_financing_expert');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <Calculator className="w-4 h-4" />
              <span>IHK WISO & Investitionsentscheidung (AP2)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              WISO Finanzierungsvergleich: Kauf vs. Kredit vs. Leasing
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm">
              Gegenüberstellung von Barzahlung (mit Skonto), Bankdarlehen (Ratentilgung) und Operating Leasing
              unter Einbeziehung des steuerlichen Abzugspotenzials (AfA § 7 EStG / Tax Shield).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-mono">
              AfA-Tabelle IT: 3 Jahre
            </span>
          </div>
        </div>
      </div>

      {/* Input Parameter Formular */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Investitions- & Finanzierungsparameter anpassen:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
            <label className="text-[11px] text-slate-400 block mb-1">Netto-Investition (€):</label>
            <input
              type="number"
              step="500"
              value={investment}
              onChange={e => setInvestment(Math.max(500, parseInt(e.target.value) || 500))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
            />
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
            <label className="text-[11px] text-slate-400 block mb-1">AfA-Dauer (Jahre):</label>
            <input
              type="number"
              min="1"
              max="10"
              value={years}
              onChange={e => setYears(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
            />
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
            <label className="text-[11px] text-slate-400 block mb-1">Skonto-Satz (%):</label>
            <input
              type="number"
              step="0.5"
              value={skonto}
              onChange={e => setSkonto(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
            />
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
            <label className="text-[11px] text-slate-400 block mb-1">Kreditzins p.a. (%):</label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={e => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
            />
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
            <label className="text-[11px] text-slate-400 block mb-1">Leasingrate mtl. (€):</label>
            <input
              type="number"
              step="10"
              value={monthlyLease}
              onChange={e => setMonthlyLease(Math.max(10, parseInt(e.target.value) || 10))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
            />
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60">
            <label className="text-[11px] text-slate-400 block mb-1">Ertragssteuer (%):</label>
            <input
              type="number"
              step="1"
              value={taxRate}
              onChange={e => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white"
            />
          </div>
        </div>
      </div>

      {/* Ergebnisvergleich: 3 Karten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparison.options.map((opt) => (
          <div 
            key={opt.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-base text-white">{opt.title}</span>
                {opt.id === 'cash_purchase' && <Banknote className="w-5 h-5 text-emerald-400" />}
                {opt.id === 'bank_loan' && <CreditCard className="w-5 h-5 text-indigo-400" />}
                {opt.id === 'leasing' && <Building2 className="w-5 h-5 text-amber-400" />}
              </div>

              <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gesamter Geldabfluss:</span>
                  <span className="font-mono text-slate-200">{opt.totalCashOutflow.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Zins-/Mehrkosten:</span>
                  <span className="font-mono text-rose-300">+{opt.totalInterestOrLeasingCost.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Steuerersparnis (AfA):</span>
                  <span className="font-mono text-emerald-400">-{opt.taxShieldSavings.toLocaleString('de-DE')} €</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                  <span className="text-slate-100">Effektive Nettokosten:</span>
                  <span className="font-mono text-emerald-300">{opt.netEffectiveCost.toLocaleString('de-DE')} €</span>
                </div>
              </div>

              <div className="mt-3 text-xs space-y-1.5">
                <div className="text-emerald-300"><strong>Vorteil:</strong> {opt.pros}</div>
                <div className="text-rose-300"><strong>Nachteil:</strong> {opt.cons}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Kaufmännische Handlungsempfehlung */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
            IHK Prüfungs-Handlungsempfehlung:
          </div>
          <div className="text-sm text-slate-200">{comparison.recommendation}</div>
        </div>
        <button
          onClick={handleClaimXp}
          disabled={hasClaimedXp}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition shrink-0 ${
            hasClaimedXp
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{hasClaimedXp ? 'Finanzanalyse gemeistert (+60 XP)' : 'Finanzierungs-XP einlösen (+60 XP)'}</span>
        </button>
      </div>
    </div>
  );
}
