import React, { useState, useMemo } from 'react';
import type { Holding } from '../types';
import { Grid, AlertTriangle, X, Sparkles } from 'lucide-react';
import { calculateCorrelationAnalysis } from '../utils/correlationUtils';

interface CorrelationHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  baseCurrency?: string;
}

export const CorrelationHeatmapModal: React.FC<CorrelationHeatmapModalProps> = ({
  isOpen,
  onClose,
  holdings
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'EQUITY_ONLY' | 'EXCLUDE_CASH'>('ALL');

  const filteredHoldings = useMemo(() => {
    if (selectedFilter === 'EQUITY_ONLY') {
      return holdings.filter(h => h.category === 'Stock' || h.category === 'ETF');
    }
    if (selectedFilter === 'EXCLUDE_CASH') {
      return holdings.filter(h => h.category !== 'Cash');
    }
    return holdings;
  }, [holdings, selectedFilter]);

  const analysis = useMemo(() => {
    return calculateCorrelationAnalysis(filteredHoldings);
  }, [filteredHoldings]);

  if (!isOpen) return null;

  const getCellColor = (val: number, isDiag: boolean) => {
    if (isDiag) return 'rgba(255, 255, 255, 0.05)';
    if (val >= 0.75) return 'rgba(239, 68, 68, 0.4)'; // Red - High cluster risk
    if (val >= 0.50) return 'rgba(245, 158, 11, 0.35)'; // Amber - Moderate correlation
    if (val >= 0.20) return 'rgba(59, 130, 246, 0.3)'; // Blue - Low correlation
    return 'rgba(16, 185, 129, 0.35)'; // Green - Highly uncorrelated or negative
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '920px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', borderRadius: '8px' }}>
              <Grid size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>Portfoliokorrelations- & Diversifikations-Heatmap</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Pearson-Korrelation (-1 bis +1) & Klumpenrisiko-Erkennung
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary KPIs & Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.6rem 0.9rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ø Portfolio-Korrelation</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: analysis.averageCorrelation <= 0.35 ? '#10b981' : analysis.averageCorrelation <= 0.60 ? '#3b82f6' : '#ef4444' }}>
                  {analysis.averageCorrelation.toFixed(2)}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.6rem 0.9rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Diversifikations-Score</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {analysis.diversificationScorePercent}% ({analysis.diversificationScore})
                </div>
              </div>
            </div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setSelectedFilter('ALL')}
                style={{
                  padding: '0.35rem 0.7rem', fontSize: '0.75rem', border: 'none', borderRadius: '6px',
                  background: selectedFilter === 'ALL' ? '#3b82f6' : 'transparent',
                  color: selectedFilter === 'ALL' ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                Alle Assets
              </button>
              <button
                onClick={() => setSelectedFilter('EQUITY_ONLY')}
                style={{
                  padding: '0.35rem 0.7rem', fontSize: '0.75rem', border: 'none', borderRadius: '6px',
                  background: selectedFilter === 'EQUITY_ONLY' ? '#3b82f6' : 'transparent',
                  color: selectedFilter === 'EQUITY_ONLY' ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                Nur Aktien & ETFs
              </button>
              <button
                onClick={() => setSelectedFilter('EXCLUDE_CASH')}
                style={{
                  padding: '0.35rem 0.7rem', fontSize: '0.75rem', border: 'none', borderRadius: '6px',
                  background: selectedFilter === 'EXCLUDE_CASH' ? '#3b82f6' : 'transparent',
                  color: selectedFilter === 'EXCLUDE_CASH' ? '#fff' : 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                Ohne Cash
              </button>
            </div>
          </div>

          {/* Cluster Alert Box if any */}
          {analysis.clusters.length > 0 && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.8rem', color: '#fca5a5' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
              <div>
                <strong>Klumpenrisiko erkannt:</strong> {analysis.clusters[0].riskDescription}
                <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {analysis.clusters[0].tickers.map(t => (
                    <span key={t} style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Heatmap Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Legende:</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.5)' }} /> &lt; 0.20 (Unkorreliert)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(59, 130, 246, 0.5)' }} /> 0.20 - 0.50 (Niedrig)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.5)' }} /> 0.50 - 0.75 (Moderat)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.5)' }} /> &ge; 0.75 (Klumpen)
            </span>
          </div>

          {/* Interactive Heatmap Matrix */}
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)', maxHeight: '420px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '0.6rem', textAlign: 'left', color: 'var(--text-muted)', background: 'var(--card-bg)' }}>Position</th>
                  {analysis.tickers.map(t => (
                    <th key={t} style={{ padding: '0.6rem', fontWeight: 'bold', background: 'var(--card-bg)', minWidth: '65px' }} title={analysis.names[t]}>
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analysis.tickers.map(tA => (
                  <tr key={tA} style={{ borderTop: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.6rem', textAlign: 'left', fontWeight: '600', position: 'sticky', left: 0, background: 'var(--card-bg)', zIndex: 5 }}>
                      <div>{tA}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{analysis.names[tA]?.slice(0, 16)}</div>
                    </td>
                    {analysis.tickers.map(tB => {
                      const val = analysis.matrix[tA]?.[tB] ?? 0;
                      const isDiag = tA === tB;
                      return (
                        <td
                          key={tB}
                          style={{
                            padding: '0.6rem',
                            background: getCellColor(val, isDiag),
                            fontWeight: isDiag ? 'normal' : 'bold',
                            color: isDiag ? 'var(--text-muted)' : 'inherit',
                            transition: 'background 0.15s'
                          }}
                          title={`${tA} ↔ ${tB}: Korrelation r = ${val}`}
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

          {/* Recommendations Box */}
          <div style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <Sparkles size={16} color="#3b82f6" />
              <span>Erkenntnisse & Diversifikations-Optimierung</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
