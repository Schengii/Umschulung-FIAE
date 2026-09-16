import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import { Coins, X } from 'lucide-react';
import { calculateCryptoFifoTranches } from './performanceUtils';

interface CryptoTaxLossHarvestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentPrices: Record<string, number>;
  baseCurrency?: string;
}

export const CryptoTaxLossHarvestingModal: React.FC<CryptoTaxLossHarvestingModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentPrices,
  baseCurrency = 'EUR'
}) => {
  const fifoResult = useMemo(() => {
    return calculateCryptoFifoTranches(transactions, currentPrices);
  }, [transactions, currentPrices]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '750px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '8px' }}>
              <Coins size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Krypto FiFo Tranchen- & Steuer-Optimierer (§ 23 EStG)</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Haltefristen-Radar (1 Jahr) & Tax-Loss Harvesting vor Steuerfreiheit</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>✅ Steuerfreie Gewinne (&gt; 1 Jahr)</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>
                {fifoResult.totalTaxFreeGainEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>📉 Realisierbare Verluste (Tax-Loss)</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>
                {fifoResult.harvestableLossesEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>
          </div>

          {/* Tranches Table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem', textAlign: 'left' }}>Kaufdatum</th>
                  <th style={{ padding: '0.6rem', textAlign: 'left' }}>Asset</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Menge</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Haltezeit</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Gewinn/Verlust</th>
                  <th style={{ padding: '0.6rem', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {fifoResult.tranches.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Keine Krypto-Kauf-Tranchen gefunden.
                    </td>
                  </tr>
                ) : (
                  fifoResult.tranches.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem' }}>{t.buyDate}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 'bold' }}>{t.ticker}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right' }}>{t.amount}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', color: 'var(--text-muted)' }}>{t.daysHeld} Tage</td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 'bold', color: t.unrealizedGainEur >= 0 ? '#10b981' : '#ef4444' }}>
                        {t.unrealizedGainEur >= 0 ? '+' : ''}{t.unrealizedGainEur.toFixed(2)} €
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                        {t.isTaxFree ? (
                          <span style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            Steuerfrei
                          </span>
                        ) : t.canHarvestLoss ? (
                          <span style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            Verlusttopf nutzen
                          </span>
                        ) : (
                          <span style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            Steuerpflichtig ({365 - t.daysHeld}d Rest)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
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
