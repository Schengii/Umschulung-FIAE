import React, { useMemo } from 'react';
import type { Holding, Transaction } from '../types';
import { Award, ShieldCheck, Crown, Sparkles } from 'lucide-react';
import { calculateDividendSafetyScores } from './performanceUtils';

interface DividendSafetyScoreWidgetProps {
  holdings: Holding[];
  transactions: Transaction[];
  baseCurrency?: string;
}

export const DividendSafetyScoreWidget: React.FC<DividendSafetyScoreWidgetProps> = ({
  holdings,
  transactions
}) => {
  const scores = useMemo(() => {
    return calculateDividendSafetyScores(holdings, transactions);
  }, [holdings, transactions]);

  if (scores.length === 0) return null;

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award className="text-amber-400" size={18} /> Dividenden-Sicherheits- & Aristokraten-Score
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Einstufung nach Payout Ratio, Dividendenwachstum und Jahren ohne Kürzung (Aristokraten &gt; 25J, Könige &gt; 50J).
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
        {scores.map(s => {
          const isKing = s.aristocratStatus === 'KING';
          const isAristocrat = s.aristocratStatus === 'ARISTOCRAT';

          return (
            <div
              key={s.ticker}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.ticker}</span>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  background: s.safetyScore >= 80 ? 'rgba(16,185,129,0.15)' : s.safetyScore >= 60 ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
                  color: s.safetyScore >= 80 ? '#10b981' : s.safetyScore >= 60 ? '#3b82f6' : '#ef4444'
                }}>
                  {s.safetyScore}/100 Score
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.name}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                <span>Dividendenrendite:</span>
                <strong style={{ color: '#10b981' }}>{s.yieldPercent.toFixed(2)}%</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>Payout Ratio (geschätzt):</span>
                <span>{s.payoutRatioEstimate}%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', marginTop: '0.2rem', color: isKing || isAristocrat ? '#f59e0b' : 'var(--text-muted)' }}>
                {isKing ? <Crown size={14} color="#f59e0b" /> : isAristocrat ? <Sparkles size={14} color="#3b82f6" /> : <ShieldCheck size={14} />}
                <span>
                  {isKing ? '👑 Dividenden-König (>50J)' : isAristocrat ? '⭐ Dividenden-Aristokrat (>25J)' : `${s.consecutiveYearsEstimate} Jahre Kontinuität`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
