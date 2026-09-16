import React, { useMemo } from 'react';
import type { Holding } from '../types';
import { Grid, ShieldCheck, AlertCircle } from 'lucide-react';
import { calculateCorrelationMatrix } from './performanceUtils';

interface CorrelationMatrixWidgetProps {
  holdings: Holding[];
  baseCurrency?: string;
}

export const CorrelationMatrixWidget: React.FC<CorrelationMatrixWidgetProps> = ({ holdings }) => {
  const result = useMemo(() => {
    return calculateCorrelationMatrix(holdings);
  }, [holdings]);

  if (result.tickers.length < 2) return null;

  const getCorrelationColor = (val: number) => {
    if (val === 1.0) return 'rgba(255, 255, 255, 0.1)';
    if (val > 0.70) return 'rgba(239, 68, 68, 0.35)'; // Red = High correlation / low diversification
    if (val > 0.40) return 'rgba(245, 158, 11, 0.3)'; // Amber = Moderate
    if (val > 0.10) return 'rgba(59, 130, 246, 0.3)'; // Blue = Good
    return 'rgba(16, 185, 129, 0.35)'; // Green = Uncorrelated or negative
  };

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Grid className="text-purple-400" size={18} /> Asset-Korrelationsmatrix & Diversifikations-Heatmap
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Pearson-Korrelation (r) zwischen Depotpositionen. Niedrige Werte bedeuten echten Risikoschutz.
          </p>
        </div>

        <span style={{
          padding: '0.25rem 0.6rem',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          background: result.diversificationScore === 'OPTIMAL' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
          color: result.diversificationScore === 'OPTIMAL' ? '#10b981' : '#3b82f6',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem'
        }}>
          {result.diversificationScore === 'OPTIMAL' ? <ShieldCheck size={13} /> : <AlertCircle size={13} />}
          Ø Korrelation: {result.averageCorrelation.toFixed(2)} ({result.diversificationScore})
        </span>
      </div>

      {/* Interactive Heatmap Table */}
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-muted)' }}>Asset</th>
              {result.tickers.map(t => (
                <th key={t} style={{ padding: '0.5rem', fontWeight: 'bold' }}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.tickers.map(tA => (
              <tr key={tA} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.5rem', textAlign: 'left', fontWeight: '600' }}>
                  {tA} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({result.names[tA]?.slice(0, 15)})</span>
                </td>
                {result.tickers.map(tB => {
                  const val = result.matrix[tA]?.[tB] ?? 0;
                  const isDiag = tA === tB;
                  return (
                    <td
                      key={tB}
                      style={{
                        padding: '0.5rem',
                        background: getCorrelationColor(val),
                        fontWeight: isDiag ? 'normal' : 'bold',
                        color: isDiag ? 'var(--text-muted)' : 'inherit'
                      }}
                      title={`${tA} ↔ ${tB}: r = ${val}`}
                    >
                      {isDiag ? '1.0' : val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
