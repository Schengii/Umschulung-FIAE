import React, { useState, useMemo } from 'react';
import type { Holding, Transaction } from '../types';
import { Award, Crown, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
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
  const [filterTier, setFilterTier] = useState<'ALL' | 'ARISTOCRATS' | 'CONTENDERS' | 'RISKY'>('ALL');

  const scores = useMemo(() => {
    return calculateDividendSafetyScores(holdings, transactions);
  }, [holdings, transactions]);

  const filteredScores = useMemo(() => {
    if (filterTier === 'ARISTOCRATS') {
      return scores.filter(s => s.aristocratStatus === 'KING' || s.aristocratStatus === 'ARISTOCRAT');
    }
    if (filterTier === 'CONTENDERS') {
      return scores.filter(s => s.aristocratStatus === 'CONTENDER');
    }
    if (filterTier === 'RISKY') {
      return scores.filter(s => s.cutRiskLevel === 'HIGH' || s.cutRiskLevel === 'MEDIUM');
    }
    return scores;
  }, [scores, filterTier]);

  if (scores.length === 0) return null;

  const kingsCount = scores.filter(s => s.aristocratStatus === 'KING').length;
  const aristocratsCount = scores.filter(s => s.aristocratStatus === 'ARISTOCRAT').length;
  const avg5yCagr = scores.reduce((sum, s) => sum + s.cagr5y, 0) / scores.length;

  return (
    <div style={{ background: 'var(--card-bg, #0f172a)', borderRadius: '14px', border: '1px solid var(--border-color)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            <Award className="text-amber-400" size={20} color="#f59e0b" /> Dividenden-Sicherheits- & Aristokraten-Radar
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Einstufung nach Dividenden-Historie (Könige &gt;50J, Aristokraten &gt;25J), FCF-Payout Ratio & 5J/10J CAGR Wachstumsraten.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '10px', gap: '4px' }}>
          <button
            onClick={() => setFilterTier('ALL')}
            style={{
              border: 'none',
              background: filterTier === 'ALL' ? '#3b82f6' : 'transparent',
              color: filterTier === 'ALL' ? '#ffffff' : 'var(--text-muted)',
              borderRadius: '7px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Alle ({scores.length})
          </button>
          <button
            onClick={() => setFilterTier('ARISTOCRATS')}
            style={{
              border: 'none',
              background: filterTier === 'ARISTOCRATS' ? '#f59e0b' : 'transparent',
              color: filterTier === 'ARISTOCRATS' ? '#ffffff' : 'var(--text-muted)',
              borderRadius: '7px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            👑 Aristokraten ({kingsCount + aristocratsCount})
          </button>
          <button
            onClick={() => setFilterTier('CONTENDERS')}
            style={{
              border: 'none',
              background: filterTier === 'CONTENDERS' ? '#10b981' : 'transparent',
              color: filterTier === 'CONTENDERS' ? '#ffffff' : 'var(--text-muted)',
              borderRadius: '7px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🏆 Contenders (10J+)
          </button>
          <button
            onClick={() => setFilterTier('RISKY')}
            style={{
              border: 'none',
              background: filterTier === 'RISKY' ? '#ef4444' : 'transparent',
              color: filterTier === 'RISKY' ? '#ffffff' : 'var(--text-muted)',
              borderRadius: '7px',
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⚠️ Kürzungsrisiken
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.6rem' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.07)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.6rem 0.9rem', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dividenden-Könige & Aristokraten</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.2rem' }}>
            {kingsCount + aristocratsCount} Werte
          </div>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.07)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.6rem 0.9rem', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ø 5-Jahres Dividenden-CAGR</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>
            +{avg5yCagr.toFixed(1)}% p.a.
          </div>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.07)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.6rem 0.9rem', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sicherheits-Status</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={16} color="#10b981" /> {scores.filter(s => s.cutRiskLevel === 'LOW').length} / {scores.length} Sicher
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
        {filteredScores.map(s => {
          const isKing = s.aristocratStatus === 'KING';
          const isAristocrat = s.aristocratStatus === 'ARISTOCRAT';

          return (
            <div
              key={s.ticker}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isKing ? 'rgba(245, 158, 11, 0.4)' : isAristocrat ? 'rgba(59, 130, 246, 0.3)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                boxShadow: isKing ? '0 4px 15px rgba(245, 158, 11, 0.08)' : undefined
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {s.ticker}
                    {isKing && <Crown size={15} color="#f59e0b" />}
                    {isAristocrat && <Sparkles size={15} color="#3b82f6" />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.name}
                  </div>
                </div>

                <span style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  background: s.safetyScore >= 80 ? 'rgba(16,185,129,0.15)' : s.safetyScore >= 60 ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
                  color: s.safetyScore >= 80 ? '#10b981' : s.safetyScore >= 60 ? '#3b82f6' : '#ef4444'
                }}>
                  {s.safetyScore}/100 Score
                </span>
              </div>

              {/* Status Badge */}
              <div style={{
                fontSize: '0.72rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                background: isKing ? 'rgba(245, 158, 11, 0.12)' : isAristocrat ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.04)',
                color: isKing ? '#f59e0b' : isAristocrat ? '#60a5fa' : 'var(--text-color)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                {s.aristocratLabel}
              </div>

              {/* Yield & Payout Ratios */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Rendite</span>
                  <strong style={{ color: '#10b981', fontSize: '0.9rem' }}>{s.yieldPercent.toFixed(2)}%</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>FCF Payout</span>
                  <strong style={{ color: s.payoutRatioFcfEstimate > 80 ? '#ef4444' : 'var(--text-color)', fontSize: '0.9rem' }}>
                    {s.payoutRatioFcfEstimate}%
                  </strong>
                </div>
              </div>

              {/* CAGR Growth Grid */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} color="#10b981" /> Historisches Dividendenwachstum (CAGR):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>1J</span>
                    <strong style={{ fontSize: '0.72rem', color: '#10b981' }}>+{s.cagr1y}%</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>3J</span>
                    <strong style={{ fontSize: '0.72rem', color: '#10b981' }}>+{s.cagr3y}%</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>5J</span>
                    <strong style={{ fontSize: '0.72rem', color: '#10b981' }}>+{s.cagr5y}%</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>10J</span>
                    <strong style={{ fontSize: '0.72rem', color: '#10b981' }}>+{s.cagr10y}%</strong>
                  </div>
                </div>
              </div>

              {/* Risk Level Warning */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', paddingTop: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Kürzungs-Risiko:</span>
                <span style={{
                  fontWeight: 'bold',
                  color: s.cutRiskLevel === 'LOW' ? '#10b981' : s.cutRiskLevel === 'MEDIUM' ? '#f59e0b' : '#ef4444'
                }}>
                  {s.cutRiskLevel === 'LOW' ? '🟢 Gering (Solide)' : s.cutRiskLevel === 'MEDIUM' ? '🟡 Erhöht (Beobachten)' : '🔴 Akut (Warnung)'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

