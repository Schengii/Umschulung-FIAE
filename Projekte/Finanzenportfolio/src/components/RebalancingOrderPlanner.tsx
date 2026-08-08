import React, { useState } from 'react';
import { calculateRebalancingOrders } from './performanceUtils';
import type { Holding } from '../types';
import { Sliders, ShoppingCart } from 'lucide-react';

interface RebalancingOrderPlannerProps {
  holdings: Holding[];
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  onExecuteRebalancingBuys?: (buys: any[]) => void;
}

export const RebalancingOrderPlanner: React.FC<RebalancingOrderPlannerProps> = ({
  holdings,
  baseCurrency,
  onExecuteRebalancingBuys
}) => {
  const [lumpSum, setLumpSum] = useState<number>(2500);

  const orderSuggestions = calculateRebalancingOrders(holdings, lumpSum);

  const totalFeeEstimate = orderSuggestions.reduce((sum, o) => sum + o.estimatedFeeEur, 0);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Rebalancing-Auftragsplaner (Einmalkauf)</h3>
            <p className="text-xs text-slate-400">Errechnet die optimalen Kauf-Stückzahlen für deinen Einmalkauf</p>
          </div>
        </div>

        {/* Investment Lump Sum Input */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs">
          <span className="text-slate-400 font-semibold">Einmalkauf-Summe:</span>
          <input
            type="number"
            min={50}
            step={50}
            value={lumpSum}
            onChange={(e) => setLumpSum(Math.max(0, Number(e.target.value)))}
            className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-bold text-slate-100 text-right focus:outline-none"
          />
          <span className="font-bold text-slate-200">€</span>
        </div>
      </div>

      {/* Order Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th className="p-3">Asset</th>
              <th className="p-3">Kategorie</th>
              <th className="p-3">Ist-Wert</th>
              <th className="p-3 text-emerald-400">Kauf-Betrag</th>
              <th className="p-3 text-emerald-400">Stückzahl</th>
              <th className="p-3 text-right">Geschätzte Gebühr</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-medium">
            {orderSuggestions.map(o => (
              <tr key={o.ticker} className="hover:bg-slate-900/50">
                <td className="p-3 font-bold text-slate-100">
                  {o.name} <span className="text-slate-500 font-mono text-[10px] uppercase">({o.ticker})</span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                    {o.category}
                  </span>
                </td>
                <td className="p-3 text-slate-400">
                  {o.currentValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                </td>
                <td className="p-3 font-extrabold text-emerald-400">
                  +{o.buyAmountEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                </td>
                <td className="p-3 font-bold font-mono text-emerald-300">
                  +{o.buyShares.toFixed(4)} Stk.
                </td>
                <td className="p-3 text-right text-slate-400">
                  {o.estimatedFeeEur.toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center text-xs pt-2">
        <span className="text-slate-400">
          Gesamte geschätzte Ordergebühren: <strong className="text-slate-200">{totalFeeEstimate.toFixed(2)} €</strong>
        </span>

        {onExecuteRebalancingBuys && (
          <button
            onClick={() => onExecuteRebalancingBuys(orderSuggestions)}
            className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" /> Käufe im Depot ausführen
          </button>
        )}
      </div>

    </div>
  );
};
