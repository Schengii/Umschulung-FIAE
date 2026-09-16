import React, { useState, useMemo } from 'react';
import type { Holding, Transaction } from '../types';
import { Sparkles } from 'lucide-react';
import { calculateDripComparison } from './performanceUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DripAnalysisWidgetProps {
  holdings: Holding[];
  transactions: Transaction[];
  baseCurrency?: string;
}

export const DripAnalysisWidget: React.FC<DripAnalysisWidgetProps> = ({
  holdings,
  transactions,
  baseCurrency = 'EUR'
}) => {
  const [years, setYears] = useState(15);
  const [divYield, setDivYield] = useState(3.5);
  const [stockGrowth, setStockGrowth] = useState(6.0);

  const comparison = useMemo(() => {
    return calculateDripComparison(transactions, holdings, years, divYield, stockGrowth);
  }, [transactions, holdings, years, divYield, stockGrowth]);

  const chartData = useMemo(() => {
    return comparison.years.map((yr, idx) => ({
      year: yr,
      'Mit Reinvestition (DRIP)': comparison.withDripValue[idx],
      'Ohne Reinvestition (Cash)': comparison.withoutDripValue[idx]
    }));
  }, [comparison]);

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles className="text-amber-400" size={18} /> DRIP Dividenden-Zinseszins-Simulation
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Vergleiche das exponentielle Portfoliowachstum durch automatische Dividendenwiederanlage (DRIP) gegenüber Barauszahlung.
          </p>
        </div>
      </div>

      {/* Control Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Zeithorizont</span>
            <span style={{ fontWeight: 'bold' }}>{years} Jahre</span>
          </div>
          <input
            type="range"
            min="3"
            max="30"
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ø Dividendenrendite</span>
            <span style={{ fontWeight: 'bold' }}>{divYield.toFixed(1)}% p.a.</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="8.0"
            step="0.1"
            value={divYield}
            onChange={e => setDivYield(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ø Kurssteigerung</span>
            <span style={{ fontWeight: 'bold' }}>{stockGrowth.toFixed(1)}% p.a.</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="12.0"
            step="0.5"
            value={stockGrowth}
            onChange={e => setStockGrowth(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Results banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Zusätzliches Vermögen durch DRIP</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>
            +{comparison.dripOutperformanceEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            +{comparison.dripOutperformancePercent.toFixed(1)}% Mehrertrag
          </div>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Reinvestierte Dividenden kumuliert</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.2rem' }}>
            {comparison.totalDividendsReinvested.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Arbeiten dauerhaft im Zinseszins
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '240px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: any) => [Number(value).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })]}
              contentStyle={{ background: '#1e293b', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
            <Legend />
            <Line type="monotone" dataKey="Mit Reinvestition (DRIP)" stroke="#10b981" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="Ohne Reinvestition (Cash)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
