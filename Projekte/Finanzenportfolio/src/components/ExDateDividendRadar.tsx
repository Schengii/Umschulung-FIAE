import React, { useState } from 'react';
import type { Holding, Transaction } from '../types';
import { Calendar, Bell, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface ExDateDividendRadarProps {
  holdings: Holding[];
  transactions: Transaction[];
  baseCurrency?: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const ExDateDividendRadar: React.FC<ExDateDividendRadarProps> = ({
  holdings,
  transactions
}) => {
  const [dgrRate, setDgrRate] = useState<number>(6.5); // 6.5% annual DGR

  const currentAnnualDivs = transactions
    .filter(t => t.type === 'DIVIDEND')
    .reduce((sum, t) => sum + (t.amount * t.price - t.tax), 0) || 450;

  // Forecast for 3 years
  const forecastData = [
    { year: 'Aktuell (2026)', amount: Math.round(currentAnnualDivs) },
    { year: '2027 (+1 J.)', amount: Math.round(currentAnnualDivs * (1 + dgrRate / 100)) },
    { year: '2028 (+2 J.)', amount: Math.round(currentAnnualDivs * Math.pow(1 + dgrRate / 100, 2)) },
    { year: '2029 (+3 J.)', amount: Math.round(currentAnnualDivs * Math.pow(1 + dgrRate / 100, 3)) }
  ];

  // Simulated upcoming Ex-Dates for holdings
  const upcomingExDates = holdings.slice(0, 4).map((h, idx) => {
    const daysFromNow = (idx + 1) * 7;
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);

    return {
      ticker: h.ticker,
      name: h.name,
      exDate: date.toLocaleDateString('de-DE'),
      estimatedPayout: (h.shares * 1.5).toFixed(2),
      daysLeft: daysFromNow
    };
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Ex-Tag Radar & 3-Jahre Dividenden-Prognose</h3>
            <p className="text-xs text-slate-400">Anstehende Ex-Dividenden-Tage & Wachstumsprognose (DGR)</p>
          </div>
        </div>
      </div>

      {/* Upcoming Ex-Dates List */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" /> Anstehende Ex-Dividenden-Tage (nächste 30 Tage)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {upcomingExDates.map((item) => (
            <div key={item.ticker} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold block text-slate-200">{item.name} <span className="text-slate-500 font-mono text-[10px]">({item.ticker})</span></span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-cyan-400" /> Ex-Tag: {item.exDate} (in {item.daysLeft} Tagen)
                </span>
              </div>
              <span className="font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                ~{item.estimatedPayout} €
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Year Forward Dividend Growth Forecast */}
      <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-200">3-Jahre Dividenden-Wachstumsprognose</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">DGR Rate: {dgrRate}% p.a.</span>
            <input type="range" min={1} max={15} step={0.5} value={dgrRate} onChange={(e) => setDgrRate(Number(e.target.value))} className="w-24 accent-cyan-500" />
          </div>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData}>
              <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="amount" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
