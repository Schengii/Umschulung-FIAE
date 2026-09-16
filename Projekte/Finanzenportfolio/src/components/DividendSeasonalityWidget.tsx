import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import { Calendar } from 'lucide-react';
import { calculateDividendSeasonalityProfile } from './performanceUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DividendSeasonalityWidgetProps {
  transactions: Transaction[];
  baseCurrency?: string;
}

export const DividendSeasonalityWidget: React.FC<DividendSeasonalityWidgetProps> = ({
  transactions,
  baseCurrency = 'EUR'
}) => {
  const profile = useMemo(() => {
    return calculateDividendSeasonalityProfile(transactions);
  }, [transactions]);

  const hasDividends = profile.some(p => p.totalDividendsEur > 0);
  if (!hasDividends) return null;

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar className="text-emerald-400" size={18} /> Dividenden-Saisonalität & Cashflow-Heatmap
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Historisches Ausschüttungsprofil im Jahresverlauf zur Glättung des monatlichen Cashflows.
          </p>
        </div>
      </div>

      <div style={{ height: '220px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={profile}>
            <XAxis dataKey="monthName" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} €`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
              formatter={(value) => `${Number(value).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}`}
            />
            <Bar dataKey="totalDividendsEur" name="Dividenden" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
