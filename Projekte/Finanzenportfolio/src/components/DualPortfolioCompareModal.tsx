import React, { useState, useMemo } from 'react';
import type { Portfolio } from '../types';
import { Columns, X } from 'lucide-react';
import { compareTwoPortfolios, calculateHoldingsFromTransactions } from './performanceUtils';

interface DualPortfolioCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolios: Portfolio[];
  baseCurrency?: string;
}

export const DualPortfolioCompareModal: React.FC<DualPortfolioCompareModalProps> = ({
  isOpen,
  onClose,
  portfolios,
  baseCurrency = 'EUR'
}) => {
  const [portfolioIdA, setPortfolioIdA] = useState<string>(portfolios[0]?.id || '');
  const [portfolioIdB, setPortfolioIdB] = useState<string>(portfolios[1]?.id || portfolios[0]?.id || '');

  const portA = portfolios.find(p => p.id === portfolioIdA) || portfolios[0];
  const portB = portfolios.find(p => p.id === portfolioIdB) || portfolios[1] || portfolios[0];

  const holdingsA = useMemo(() => calculateHoldingsFromTransactions(portA?.transactions || []), [portA]);
  const holdingsB = useMemo(() => calculateHoldingsFromTransactions(portB?.transactions || []), [portB]);

  const comparison = useMemo(() => compareTwoPortfolios(holdingsA, holdingsB), [holdingsA, holdingsB]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(5px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '750px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
              <Columns size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Side-by-Side Dual Portfolio-Vergleich</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gegenüberstellung zweier Strategien oder Depots</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Portfolio A</label>
              <select
                value={portfolioIdA}
                onChange={(e) => setPortfolioIdA(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)' }}
              >
                {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Portfolio B</label>
              <select
                value={portfolioIdB}
                onChange={(e) => setPortfolioIdB(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)' }}
              >
                {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Comparison Matrix */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Kennzahl</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: '#3b82f6' }}>{portA?.name || 'A'}</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', color: '#a855f7' }}>{portB?.name || 'B'}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Depotwert</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                    {comparison.totalValueA.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                    {comparison.totalValueB.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Einstandswert</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {comparison.totalCostA.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {comparison.totalCostB.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Gesamtrendite</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: comparison.returnPercentA >= 0 ? '#10b981' : '#ef4444' }}>
                    {comparison.returnPercentA >= 0 ? '+' : ''}{comparison.returnPercentA}%
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: comparison.returnPercentB >= 0 ? '#10b981' : '#ef4444' }}>
                    {comparison.returnPercentB >= 0 ? '+' : ''}{comparison.returnPercentB}%
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Positionen</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{comparison.holdingsCountA} Assets</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>{comparison.holdingsCountB} Assets</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
