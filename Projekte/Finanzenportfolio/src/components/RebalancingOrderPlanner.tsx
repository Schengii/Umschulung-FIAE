import React, { useState } from 'react';
import { calculateToleranceBandRebalancing } from './performanceUtils';
import type { Holding } from '../types';
import { Sliders, ShoppingCart, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

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
  const [lumpSum, setLumpSum] = useState<number>(2000);
  const [toleranceBandPct, setToleranceBandPct] = useState<number>(2.0);
  const [rebalanceMode, setRebalanceMode] = useState<'BUY_ONLY' | 'FULL_REBALANCE'>('FULL_REBALANCE');

  const {
    items,
    totalBuyEur,
    totalSellEur,
    inBalanceCount,
    rebalanceNeededCount,
    estimatedTotalFeesEur
  } = calculateToleranceBandRebalancing(
    holdings,
    { Stock: 50, ETF: 40, Crypto: 10 },
    { toleranceBandPct, availableCashEur: lumpSum, mode: rebalanceMode }
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Rebalancing-Engine mit Drift-Toleranzbändern</h3>
            <p className="text-xs text-slate-400">
              Orders werden nur ausgelöst, wenn Positionen das Toleranzband verlassen – spart Gebühren & Steuern
            </p>
          </div>
        </div>

        {/* Controls: Mode, Tolerance & Lump Sum */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs">
          
          {/* Mode Switch */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setRebalanceMode('FULL_REBALANCE')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${rebalanceMode === 'FULL_REBALANCE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Kauf & Verkauf
            </button>
            <button
              onClick={() => setRebalanceMode('BUY_ONLY')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${rebalanceMode === 'BUY_ONLY' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Nur Zukauf (Cash)
            </button>
          </div>

          {/* Tolerance Band Input */}
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-slate-400 font-semibold">Toleranz:</span>
            <select
              value={toleranceBandPct}
              onChange={(e) => setToleranceBandPct(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 font-bold text-slate-100 focus:outline-none"
            >
              <option value={1.0}>± 1.0% (Strikt)</option>
              <option value={2.0}>± 2.0% (Standard)</option>
              <option value={3.0}>± 3.0% (Moderat)</option>
              <option value={5.0}>± 5.0% (Flexibel)</option>
            </select>
          </div>

          {/* Lump Sum */}
          <div className="flex items-center gap-1.5 px-2 border-l border-slate-800">
            <span className="text-slate-400 font-semibold">Cash-Zufluss:</span>
            <input
              type="number"
              min={0}
              step={100}
              value={lumpSum}
              onChange={(e) => setLumpSum(Math.max(0, Number(e.target.value)))}
              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-bold text-slate-100 text-right focus:outline-none"
            />
            <span className="font-bold text-slate-200">€</span>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span className="text-slate-400 block mb-1">Im Toleranzband</span>
          <span className="text-base font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> {inBalanceCount} Positionen
          </span>
        </div>
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span className="text-slate-400 block mb-1">Handlungsbedarf</span>
          <span className="text-base font-bold text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> {rebalanceNeededCount} Positionen
          </span>
        </div>
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span className="text-slate-400 block mb-1">Kaufvolumen gesamt</span>
          <span className="text-base font-bold text-blue-400">
            +{totalBuyEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <span className="text-slate-400 block mb-1">Verkaufsvolumen</span>
          <span className="text-base font-bold text-rose-400">
            {totalSellEur > 0 ? `-${totalSellEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}` : '0,00 €'}
          </span>
        </div>
      </div>

      {/* Order Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th className="p-3">Asset</th>
              <th className="p-3">Ist-Gewicht</th>
              <th className="p-3">Ziel-Gewicht</th>
              <th className="p-3">Drift</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Aktion & Betrag</th>
              <th className="p-3 text-right">Stückzahl</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-medium">
            {items.map(o => (
              <tr key={o.ticker} className="hover:bg-slate-900/50">
                <td className="p-3 font-bold text-slate-100">
                  {o.name} <span className="text-slate-500 font-mono text-[10px] uppercase">({o.ticker})</span>
                </td>
                <td className="p-3 text-slate-300">
                  {o.currentWeight.toFixed(1)}%
                </td>
                <td className="p-3 text-slate-300">
                  {o.targetWeight.toFixed(1)}%
                </td>
                <td className="p-3">
                  <span className={`font-semibold ${o.driftPercent > 0 ? 'text-amber-400' : o.driftPercent < 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                    {o.driftPercent > 0 ? `+${o.driftPercent.toFixed(1)}%` : `${o.driftPercent.toFixed(1)}%`}
                  </span>
                </td>
                <td className="p-3">
                  {o.isWithinBand ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" /> In Band (±{toleranceBandPct}%)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" /> Außerhalb Band
                    </span>
                  )}
                </td>
                <td className="p-3 text-right font-bold">
                  {o.action === 'BUY' && (
                    <span className="text-emerald-400 flex items-center justify-end gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +{o.deltaEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </span>
                  )}
                  {o.action === 'SELL' && (
                    <span className="text-rose-400 flex items-center justify-end gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5" /> -{o.deltaEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </span>
                  )}
                  {o.action === 'HOLD' && (
                    <span className="text-slate-500 flex items-center justify-end gap-1">
                      <Minus className="w-3.5 h-3.5" /> Halten (0 €)
                    </span>
                  )}
                </td>
                <td className="p-3 text-right font-mono font-bold text-slate-300">
                  {o.suggestedShares > 0 ? `~${o.suggestedShares.toFixed(2)} Stk.` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs pt-2">
        <span className="text-slate-400">
          Geschätzte Ausführungsgebühren für {rebalanceNeededCount} Orders: <strong className="text-slate-200">{estimatedTotalFeesEur.toFixed(2)} €</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const activeOrders = items.filter(o => o.action !== 'HOLD');
              const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(
                "Ticker;Name;Aktion;Betrag;Stueckzahl\n" +
                activeOrders.map(o => `${o.ticker};"${o.name}";${o.action};${o.deltaEur.toFixed(2)};${o.suggestedShares.toFixed(4)}`).join('\n')
              );
              const link = document.createElement("a");
              link.setAttribute("href", csvContent);
              link.setAttribute("download", `rebalancing_orders_tolerance_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all font-semibold"
          >
            📥 Order-CSV Export ({items.filter(o => o.action !== 'HOLD').length})
          </button>

          {onExecuteRebalancingBuys && (
            <button
              onClick={() => onExecuteRebalancingBuys(items.filter(o => o.action === 'BUY').map(o => ({
                ticker: o.ticker,
                name: o.name,
                category: o.category,
                amount: o.deltaEur,
                price: holdings.find(h => h.ticker === o.ticker)?.currentPrice || 100
              })))}
              className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Rebalancing-Käufe buchen
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

