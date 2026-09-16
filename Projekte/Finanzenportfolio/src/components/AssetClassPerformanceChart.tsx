import React, { useMemo } from 'react';
import type { Holding } from '../types';
import { Layers } from 'lucide-react';
import { calculateAssetClassCumulativeReturns } from './performanceUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AssetClassPerformanceChartProps {
  holdings: Holding[];
  baseCurrency?: string;
}

export const AssetClassPerformanceChart: React.FC<AssetClassPerformanceChartProps> = ({ holdings }) => {
  const data = useMemo(() => {
    return calculateAssetClassCumulativeReturns(holdings);
  }, [holdings]);

  if (holdings.length === 0) return null;

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers className="text-purple-400" size={18} /> Historischer Performance-Vergleich nach Assetklassen
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Kumulierter Rendite-Vergleich (%) von Aktien, ETFs, Kryptowährungen und Rohstoffen.
          </p>
        </div>
      </div>

      <div style={{ height: '260px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="dateLabel" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
              formatter={(value) => `${Number(value).toFixed(1)}%`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" name="Aktien" dataKey="Aktien" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" name="ETFs" dataKey="ETFs" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" name="Krypto" dataKey="Krypto" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" name="Rohstoffe" dataKey="Rohstoffe" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
