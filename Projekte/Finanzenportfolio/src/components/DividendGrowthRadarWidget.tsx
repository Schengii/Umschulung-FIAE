import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import type { Holding, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DividendGrowthRadarWidgetProps {
  holdings: Holding[];
  transactions: Transaction[];
  baseCurrency?: string;
}

export const DividendGrowthRadarWidget: React.FC<DividendGrowthRadarWidgetProps> = ({
  holdings,
  transactions,
  baseCurrency = 'EUR'
}) => {
  const [projectedGrowthPct, setProjectedGrowthPct] = useState<number>(7.0);
  const [forecastYears, setForecastYears] = useState<number>(5);

  // Historical Dividends grouped by Year
  const historicalDividends = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'DIVIDEND').forEach(t => {
      const year = t.date.split('.')[2] || new Date(t.date).getFullYear().toString();
      const netEur = (t.amount * t.price - (t.tax || 0)) / (t.exchangeRate || 1);
      map[year] = (map[year] || 0) + netEur;
    });

    const years = Object.keys(map).sort();
    if (years.length === 0) {
      // Default sample historical points if fresh portfolio
      const currYear = new Date().getFullYear();
      return [
        { year: (currYear - 2).toString(), amount: 320, growthYoY: 0 },
        { year: (currYear - 1).toString(), amount: 450, growthYoY: 40.6 },
        { year: currYear.toString(), amount: 580, growthYoY: 28.8 }
      ];
    }

    return years.map((y, idx) => {
      const amount = Math.round(map[y]);
      const prev = idx > 0 ? map[years[idx - 1]] : undefined;
      const growthYoY = prev && prev > 0 ? Math.round(((amount - prev) / prev) * 1000) / 10 : 0;
      return { year: y, amount, growthYoY };
    });
  }, [transactions]);

  // Current annual dividend run-rate
  const currentAnnualDividends = useMemo(() => {
    const lastHist = historicalDividends[historicalDividends.length - 1];
    return lastHist ? lastHist.amount : 600;
  }, [historicalDividends]);

  // 5-Year Forward Projection
  const forecastData = useMemo(() => {
    const list = [];
    const currentYear = new Date().getFullYear();
    let val = currentAnnualDividends;
    const g = projectedGrowthPct / 100;

    for (let i = 0; i <= forecastYears; i++) {
      list.push({
        year: (currentYear + i).toString(),
        Dividendenertrag: Math.round(val),
        Monatlich: Math.round(val / 12)
      });
      val = val * (1 + g);
    }
    return list;
  }, [currentAnnualDividends, projectedGrowthPct, forecastYears]);

  // Top Dividend Holdings with Aristocrat Rating
  const topDividendPositions = useMemo(() => {
    return holdings.map(h => {
      const divTxs = transactions.filter(t => t.type === 'DIVIDEND' && t.ticker === h.ticker);
      const totalDivs = divTxs.reduce((sum, t) => sum + (t.amount * t.price - (t.tax || 0)), 0);
      const yoc = h.totalCost > 0 ? (totalDivs / h.totalCost) * 100 : 0;

      let aristocratRating: '👑 König (50J+)' | '💎 Aristokrat (25J+)' | '⭐ Contender (10J+)' | '🌱 Wachstums-Zahler' = '🌱 Wachstums-Zahler';
      if (['KO', 'PG', 'JNJ', 'MMM', 'DOV'].includes(h.ticker)) aristocratRating = '👑 König (50J+)';
      else if (['AAPL', 'MSFT', 'ALV', 'MCD', 'PEP', 'ABBV', 'IBM'].includes(h.ticker)) aristocratRating = '💎 Aristokrat (25J+)';
      else if (h.category === 'ETF' && h.name.toLowerCase().includes('dividend')) aristocratRating = '⭐ Contender (10J+)';

      return {
        ticker: h.ticker,
        name: h.name,
        totalDivs,
        yieldOnCost: yoc > 0 ? yoc : (h.category === 'ETF' ? 2.8 : 3.2),
        aristocratRating
      };
    }).sort((a, b) => b.totalDivs - a.totalDivs);
  }, [holdings, transactions]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Dividenden-Wachstums-Radar & Aristokraten-Score</h3>
            <p className="text-xs text-slate-400">
              Historische Dividendensteigerung, 5-Jahres Cashflow-Prognose & Yield on Cost
            </p>
          </div>
        </div>

        {/* Controls: Growth Rate Slider & Forecast Horizon */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold">Horizont:</span>
            <select
              value={forecastYears}
              onChange={e => setForecastYears(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 font-bold"
            >
              <option value={3}>3 Jahre</option>
              <option value={5}>5 Jahre</option>
              <option value={10}>10 Jahre</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <span className="text-slate-400 font-semibold">Proj. Wachstum:</span>
            <input
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={projectedGrowthPct}
              onChange={e => setProjectedGrowthPct(Number(e.target.value))}
              className="w-20"
            />
            <span className="font-bold text-emerald-400">{projectedGrowthPct}% p.a.</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-1">Aktueller Jahres-Runrate</span>
          <span className="text-base font-bold text-amber-400">
            {currentAnnualDividends.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-1">Prognose in {forecastYears} Jahren</span>
          <span className="text-base font-bold text-emerald-400">
            {forecastData[forecastData.length - 1].Dividendenertrag.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-1">Monatliches Passiv-Einkommen ({forecastYears}J)</span>
          <span className="text-base font-bold text-blue-400">
            ~{forecastData[forecastData.length - 1].Monatlich.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} / Mo.
          </span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-1">Dividenden-Qualität</span>
          <span className="text-base font-bold text-purple-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Aristokraten-Fokus
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical YoY Bar Chart */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
          <div className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" /> Historische Dividenden pro Jahr
          </div>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalDividends}>
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} €`, 'Dividende netto']}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5-Year Projection Line Chart */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
          <div className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> 5-Jahres Cashflow-Prognose ({projectedGrowthPct}% p.a.)
          </div>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} € / Jahr`, 'Dividendenprognose']}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="Dividendenertrag" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Aristocrats & Yield on Cost Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th className="p-3">Position</th>
              <th className="p-3">Aristokraten-Rating</th>
              <th className="p-3">Erhaltene Dividenden</th>
              <th className="p-3 text-right">Yield on Cost (YoC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-medium">
            {topDividendPositions.slice(0, 5).map(pos => (
              <tr key={pos.ticker} className="hover:bg-slate-900/50">
                <td className="p-3 font-bold text-slate-100">
                  {pos.name} <span className="text-slate-500 font-mono text-[10px] uppercase">({pos.ticker})</span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold">
                    {pos.aristocratRating}
                  </span>
                </td>
                <td className="p-3 text-slate-300">
                  {pos.totalDivs > 0 ? `${pos.totalDivs.toFixed(2)} €` : 'Noch keine Ausschüttung'}
                </td>
                <td className="p-3 text-right font-bold text-emerald-400">
                  {pos.yieldOnCost.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
