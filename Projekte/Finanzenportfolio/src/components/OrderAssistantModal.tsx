import React, { useState } from 'react';
import type { SavingsPlan, Holding } from '../types';
import { Copy, Check, X, ShoppingCart } from 'lucide-react';

interface OrderAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  savingsPlans: SavingsPlan[];
  holdings: Holding[];
  baseCurrency?: string;
}

export const OrderAssistantModal: React.FC<OrderAssistantModalProps> = ({
  isOpen,
  onClose,
  savingsPlans,
  holdings,
  baseCurrency = 'EUR'
}) => {
  const [selectedBroker, setSelectedBroker] = useState<'TRADE_REPUBLIC' | 'SCALABLE' | 'ING' | 'COMDIRECT'>('TRADE_REPUBLIC');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const orders = savingsPlans.filter(p => p.isActive).map(p => {
    const holding = holdings.find(h => h.ticker === p.ticker);
    return {
      ticker: p.ticker,
      name: p.name,
      amountEur: p.amount,
      currentPrice: holding?.currentPrice || 100,
      approxShares: holding && holding.currentPrice > 0 ? (p.amount / holding.currentPrice).toFixed(4) : '—'
    };
  });

  const totalMonthlySavings = orders.reduce((sum, o) => sum + o.amountEur, 0);

  const copyOrderToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateBulkCopyText = () => {
    return orders.map(o => `${o.ticker} - ${o.name}: ${o.amountEur.toFixed(2)} € (ca. ${o.approxShares} Stk.)`).join('\n');
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '650px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
              <ShoppingCart size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Neobroker Sparplan- & Order-Assistent</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>1-Klick Vorlagen & Copy-Paste für deine Broker-Sparpläne</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Broker Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '8px' }}>
            {(['TRADE_REPUBLIC', 'SCALABLE', 'ING', 'COMDIRECT'] as const).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBroker(b)}
                className={`nav-tab ${selectedBroker === b ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px', textAlign: 'center' }}
              >
                {b === 'TRADE_REPUBLIC' ? 'Trade Republic' : b === 'SCALABLE' ? 'Scalable Capital' : b}
              </button>
            ))}
          </div>

          {/* KPI Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aktive Sparrate gesamt:</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                {totalMonthlySavings.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} / Monat
              </div>
            </div>
            <button
              onClick={() => copyOrderToClipboard(generateBulkCopyText(), 999)}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {copiedIndex === 999 ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copiedIndex === 999 ? 'Alle kopiert!' : 'Alle kopieren'}
            </button>
          </div>

          {/* Orders Table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Wertpapier & Ticker</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Sparrate</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>ca. Stücke</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={o.ticker} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <div style={{ fontWeight: '600' }}>{o.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.ticker}</div>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                      {o.amountEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {o.approxShares} Stk.
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => copyOrderToClipboard(`${o.ticker} ${o.amountEur} EUR`, idx)}
                        style={{
                          background: copiedIndex === idx ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                          color: copiedIndex === idx ? '#10b981' : 'inherit',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {copiedIndex === idx ? <Check size={12} /> : <Copy size={12} />}
                        {copiedIndex === idx ? 'Kopiert' : 'Kopieren'}
                      </button>
                    </td>
                  </tr>
                ))}
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
