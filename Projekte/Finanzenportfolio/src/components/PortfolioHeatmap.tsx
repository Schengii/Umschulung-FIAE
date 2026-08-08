import React, { useState } from 'react';
import type { Holding } from '../types';
import { LayoutGrid, TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface PortfolioHeatmapProps {
  holdings: Holding[];
  onSelectHolding: (holding: Holding) => void;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const PortfolioHeatmap: React.FC<PortfolioHeatmapProps> = ({
  holdings,
  onSelectHolding,
  baseCurrency
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'Stock' | 'ETF' | 'Crypto'>('ALL');

  const filteredHoldings = holdings.filter(h => filterCategory === 'ALL' || h.category === filterCategory);
  const totalVal = filteredHoldings.reduce((sum, h) => sum + h.currentValue, 0);

  const getHeatmapColor = (gainPercent: number) => {
    if (gainPercent >= 30) return 'from-emerald-600/90 to-teal-700/90 border-emerald-500/50 text-emerald-100';
    if (gainPercent >= 10) return 'from-emerald-500/70 to-emerald-700/70 border-emerald-500/30 text-emerald-200';
    if (gainPercent >= 0) return 'from-emerald-950/60 to-emerald-900/60 border-emerald-800/40 text-emerald-300';
    if (gainPercent >= -15) return 'from-red-950/60 to-red-900/60 border-red-800/40 text-red-300';
    return 'from-rose-700/80 to-red-800/80 border-rose-500/50 text-rose-100';
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Portfolio Heatmap & Treemap</h3>
            <p className="text-xs text-slate-400">Proportionale Gewichtung & Kursgewinne im Überblick</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
          {(['ALL', 'Stock', 'ETF', 'Crypto'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Alle Assets' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Treemap Grid Container */}
      {filteredHoldings.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Keine Positionen für die ausgewählte Kategorie vorhanden.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5 min-h-[320px] w-full p-2 bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden">
          {filteredHoldings.map((h) => {
            const weightPct = totalVal > 0 ? (h.currentValue / totalVal) * 100 : 0;
            // Map weight to flex-grow
            const flexBasis = Math.max(12, Math.min(100, weightPct * 2.2));

            return (
              <div
                key={h.ticker}
                onClick={() => onSelectHolding(h)}
                style={{ flexGrow: weightPct, flexBasis: `${flexBasis}%` }}
                className={`group relative bg-gradient-to-br border p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:z-10 hover:shadow-2xl flex flex-col justify-between overflow-hidden min-h-[110px] ${getHeatmapColor(
                  h.totalGainPercent
                )}`}
              >
                {/* Top Info */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider block opacity-90">
                      {h.ticker}
                    </span>
                    <span className="text-xs font-semibold truncate block max-w-[140px] text-slate-200">
                      {h.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-sm border border-white/10">
                    {weightPct.toFixed(1)}%
                  </span>
                </div>

                {/* Bottom Values */}
                <div className="mt-3 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] opacity-75 block">Wert</span>
                    <span className="text-sm font-extrabold block">
                      {h.currentValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold inline-flex items-center gap-0.5">
                      {h.totalGainPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {h.totalGainPercent >= 0 ? '+' : ''}{h.totalGainPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-semibold text-white">
                  <Eye className="w-4 h-4 text-blue-400" /> Details öffnen
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
        <span>Kachelgröße = Depotgewichtung</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-400 inline-block" />
            <span>Starkes Plus (&gt; 30%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-800 inline-block" />
            <span>Gewinn (0 - 30%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-800 border border-rose-500 inline-block" />
            <span>Verlust</span>
          </div>
        </div>
      </div>

    </div>
  );
};
