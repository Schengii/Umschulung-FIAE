import React, { useState } from 'react';
import { Flame, CheckCircle2 } from 'lucide-react';

interface FireFreedomWidgetProps {
  portfolioValue: number;
  annualDividends: number;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const FireFreedomWidget: React.FC<FireFreedomWidgetProps> = ({
  portfolioValue,
  annualDividends,
  baseCurrency
}) => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(2000);
  const withdrawalRate = 4.0; // 4% Rule

  const annualExpenses = monthlyExpenses * 12;
  const targetFireNumber = annualExpenses / (withdrawalRate / 100);
  const fireProgressPct = targetFireNumber > 0 ? Math.min(100, (portfolioValue / targetFireNumber) * 100) : 0;

  const monthlyDividends = annualDividends / 12;
  const dividendCoveragePct = monthlyExpenses > 0 ? Math.min(100, (monthlyDividends / monthlyExpenses) * 100) : 0;

  // Milestone Expenses Breakdown
  const milestones = [
    { name: 'Strom & Internet (~100 €)', cost: 100 },
    { name: 'Wocheneinkauf (~300 €)', cost: 300 },
    { name: 'Kaltmiete (~900 €)', cost: 900 },
    { name: 'Gesamte Lebenshaltung', cost: monthlyExpenses }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">FIRE & Dividenden-Freiheitsrechner</h3>
            <p className="text-xs text-slate-400">Financial Independence, Retire Early (4%-Regel)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <span className="text-slate-400">Monatl. Ausgaben:</span>
          <input
            type="number"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Math.max(1, Number(e.target.value)))}
            className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-right font-bold text-slate-100 focus:outline-none"
          />
          <span className="text-slate-400">€</span>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* FIRE Progress */}
        <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Ziel-Vermögen (FIRE Number)</span>
              <span className="text-2xl font-black text-orange-400 mt-1 block">
                {targetFireNumber.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
            </div>
            <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg text-xs font-bold">
              {fireProgressPct.toFixed(1)}% erreicht
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Aktuelles Depot: {portfolioValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</span>
              <span>Entnahmerate: {withdrawalRate}% p.a.</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${fireProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dividend Expense Coverage */}
        <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Monatliche Passiv-Abdeckung</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                {monthlyDividends.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} / Mo.
              </span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold">
              {dividendCoveragePct.toFixed(1)}% bedeckt
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Jährliche Dividenden: {annualDividends.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${dividendCoveragePct}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Milestones Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Passiv-Dividenden Meilensteine</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((m) => {
            const isCovered = monthlyDividends >= m.cost;
            const pct = Math.min(100, (monthlyDividends / m.cost) * 100);

            return (
              <div key={m.name} className="p-3.5 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isCovered ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block text-slate-200">{m.name}</span>
                    <span className="text-[10px] text-slate-400">{pct.toFixed(0)}% gedeckt durch Dividenden</span>
                  </div>
                </div>
                <span className={`text-xs font-bold ${isCovered ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isCovered ? 'Freigeschaltet 🎉' : `${(m.cost - monthlyDividends).toFixed(0)} € / Mo fehlen`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
