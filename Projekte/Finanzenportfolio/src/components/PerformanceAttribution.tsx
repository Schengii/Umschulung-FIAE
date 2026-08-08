import React, { useState } from 'react';
import { calculatePerformanceAttribution } from './performanceUtils';
import type { Holding, Transaction } from '../types';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PerformanceAttributionProps {
  transactions: Transaction[];
  holdings: Holding[];
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const PerformanceAttribution: React.FC<PerformanceAttributionProps> = ({
  transactions,
  holdings,
  baseCurrency
}) => {
  const [dripYears, setDripYears] = useState<number>(10);
  const annualReturn = 7;

  const attr = calculatePerformanceAttribution(transactions, holdings);

  // Waterfall Chart Data
  const waterfallData = [
    { name: 'Investition', value: Math.round(attr.startingValue), fill: '#3b82f6' },
    { name: 'Kursgewinn', value: Math.round(attr.capitalGains), fill: '#10b981' },
    { name: 'Dividenden', value: Math.round(attr.dividendsReceived), fill: '#06b6d4' },
    { name: 'Währung (FX)', value: Math.round(attr.fxGain), fill: attr.fxGain >= 0 ? '#10b981' : '#f43f5e' },
    { name: 'Gebühren', value: -Math.round(attr.feesPaid), fill: '#f43f5e' },
    { name: 'Steuern', value: -Math.round(attr.taxesPaid), fill: '#e11d48' },
    { name: 'Gesamtwert', value: Math.round(attr.finalValue), fill: '#8b5cf6' }
  ];

  // DRIP Projection Calculation
  const currentVal = attr.finalValue;
  const currentAnnualDivs = attr.dividendsReceived || 500;

  const dripProjection = [];
  let valWithoutDrip = currentVal;
  let valWithDrip = currentVal;

  for (let y = 1; y <= dripYears; y++) {
    valWithoutDrip = valWithoutDrip * (1 + annualReturn / 100);
    valWithDrip = (valWithDrip + currentAnnualDivs) * (1 + annualReturn / 100);

    dripProjection.push({
      year: `Jahr ${y}`,
      OhneDRIP: Math.round(valWithoutDrip),
      MitDRIP: Math.round(valWithDrip)
    });
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Performance-Attribution & DRIP Zinseszins</h3>
            <p className="text-xs text-slate-400">Wasserfall-Zerlegung der Rendite & Reinvestitions-Prognose</p>
          </div>
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Wasserfall Rendite-Zerlegung</h4>
        <div className="h-60 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${Math.round(val / 1000)}k €`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString('de-DE')} €`, '']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DRIP Comparison Cards */}
      <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-200">DRIP Dividenden-Reinvestition Zinseszins Simulation</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Zeithorizont: {dripYears} Jahre</span>
            <input type="range" min={5} max={30} value={dripYears} onChange={(e) => setDripYears(Number(e.target.value))} className="w-24 accent-indigo-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-slate-400 block font-semibold">Ohne Reinvestition</span>
            <span className="text-xl font-extrabold text-slate-300 mt-1 block">
              {dripProjection[dripYears - 1]?.OhneDRIP.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
            </span>
          </div>

          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <span className="text-indigo-400 block font-bold">Mit DRIP (Dividenden-Zinseszins)</span>
            <span className="text-xl font-black text-indigo-300 mt-1 block">
              {dripProjection[dripYears - 1]?.MitDRIP.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 font-semibold block">
              +{(dripProjection[dripYears - 1]?.MitDRIP - dripProjection[dripYears - 1]?.OhneDRIP).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} Mehrgewinn
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
