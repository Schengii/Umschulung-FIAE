import React, { useMemo } from 'react';
import type { Holding, Transaction } from '../types';
import { Globe, AlertTriangle, ShieldCheck } from 'lucide-react';
import { calculateFxExposure } from './performanceUtils';

interface FxExposureWidgetProps {
  holdings: Holding[];
  transactions: Transaction[];
  baseCurrency?: string;
}

export const FxExposureWidget: React.FC<FxExposureWidgetProps> = ({
  holdings,
  transactions,
  baseCurrency = 'EUR'
}) => {
  const result = useMemo(() => {
    return calculateFxExposure(holdings, transactions);
  }, [holdings, transactions]);

  const CURRENCY_COLORS: Record<string, string> = {
    EUR: '#3b82f6',
    USD: '#10b981',
    CHF: '#ef4444',
    GBP: '#a855f7',
    OTHER: '#f59e0b'
  };

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe className="text-blue-400" size={18} /> Währungsrisiko- & FX-Exposure Matrix
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Echtzeit-Aufteilung deines Portfolios nach Original-Währungsräumen & Stresstest bei Währungsabwertung.
          </p>
        </div>
      </div>

      {/* Exposure Bar */}
      <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)' }}>
        {result.exposures.map(exp => (
          <div
            key={exp.currency}
            style={{
              width: `${exp.percentage}%`,
              background: CURRENCY_COLORS[exp.currency] || '#94a3b8',
              transition: 'width 0.3s ease'
            }}
            title={`${exp.currency}: ${exp.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Grid of currencies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {result.exposures.filter(e => e.valueEur > 0).map(exp => {
          const isForeign = exp.currency !== 'EUR';
          const lossIfDrop10 = exp.valueEur - exp.stressedValueEurDrop10Pct;

          return (
            <div
              key={exp.currency}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: CURRENCY_COLORS[exp.currency] }} />
                  {exp.currency}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                  {exp.percentage.toFixed(1)}%
                </span>
              </div>

              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.4rem' }}>
                {exp.valueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>

              {isForeign && (
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertTriangle size={12} /> -10% FX: -{lossIfDrop10.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Note */}
      <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldCheck size={16} className="text-blue-400" />
        <span>
          Fremdwährungsanteil: <strong>{result.foreignExposurePercent.toFixed(1)}%</strong>. {result.foreignExposurePercent > 50 ? 'Gute internationale Risikostreuung mit US-Wachstumsfokus.' : 'Hohe Euro-Heimatmarktgewichtung.'}
        </span>
      </div>
    </div>
  );
};
