import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { Coins, X, Copy, Check, Info, Flame, Clock } from 'lucide-react';
import { calculateCryptoTaxLossHarvesting } from '../utils/cryptoTaxUtils';

interface CryptoTaxLossOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentPrices: Record<string, number>;
  baseCurrency?: string;
}

export const CryptoTaxLossOptimizerModal: React.FC<CryptoTaxLossOptimizerModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentPrices,
  baseCurrency = 'EUR'
}) => {
  const [marginalTaxRate, setMarginalTaxRate] = useState<number>(42.0);
  const [copied, setCopied] = useState<boolean>(false);

  const summary = useMemo(() => {
    return calculateCryptoTaxLossHarvesting(transactions, currentPrices, {
      marginalTaxRatePercent: marginalTaxRate
    });
  }, [transactions, currentPrices, marginalTaxRate]);

  const handleCopySummary = () => {
    const lines = [
      '=== KRYPTO TAX-LOSS HARVESTING BERICHT (§ 23 EStG) ===',
      `Realisierte steuerpflichtige Krypto-Gewinne im lfd. Kalenderjahr: ${summary.realizedGainsThisYearEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}`,
      `Realisierbares Verlustvolumen (< 1 Jahr Haltedauer): ${summary.totalHarvestableLossesEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}`,
      `Angenommener Grenzsteuersatz: ${marginalTaxRate}%`,
      `Mögliche Einkommensteuer-Ersparnis: ~${summary.estimatedTaxSavingsEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}`,
      '-------------------------------------------------------',
      'AKTIONIERBARE VERLUSTTRANCHEN:'
    ];

    const actionable = summary.lots.filter(l => l.isActionable);
    if (actionable.length === 0) {
      lines.push('Keine Krypto-Verlusttranchen unter 1 Jahr Haltedauer gefunden.');
    } else {
      actionable.forEach(l => {
        lines.push(`- ${l.ticker} (${l.name}): ${l.amount} Stk., Verlust: -${l.unrealizedLossEur.toFixed(2)} € (Restzeit bis Steuerfreiheit: ${l.daysRemainingInTaxYearWindow} Tage, Kauf am ${l.buyDate})`);
      });
    }

    lines.push('-------------------------------------------------------');
    lines.push('Hinweis: Steuerliche Verlustverrechnung nach § 23 Abs. 3 EStG. Keine Anlageberatung.');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '850px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '8px' }}>
              <Coins size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>Krypto Tax-Loss Harvesting & 1-Jahres-Radar (§ 23 EStG)</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Steuerwirksame Verlustrealisierung vor Eintritt der Steuerfreiheit (365-Tage-Frist)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>📉 Realisierbare Verluste (&lt; 1J)</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>
                -{summary.totalHarvestableLossesEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Noch innerhalb der Spekulationsfrist</span>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>💰 Mögliche Steuerersparnis</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>
                +{summary.estimatedTaxSavingsEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>bei {marginalTaxRate}% persönl. Steuersatz</span>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold' }}>📊 Realisierte Gewinne lfd. Jahr</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.2rem' }}>
                {summary.realizedGainsThisYearEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sofort gegenrechenbar nach § 23 Abs. 3</span>
            </div>
          </div>

          {/* Steuersatz Slider / Input & Info Box */}
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Persönlicher Einkommensteuersatz:</span>
              <input
                type="number"
                min="10"
                max="45"
                step="1"
                value={marginalTaxRate}
                onChange={e => setMarginalTaxRate(Number(e.target.value) || 0)}
                style={{ width: '55px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', textAlign: 'right' }}
              />
              <span>%</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Typisch: 30% - 42% Spitzensteuersatz in Deutschland)
            </div>
          </div>

          <div style={{ padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.75rem', color: '#fde68a' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Warum Tax-Loss Harvesting bei Krypto wichtig ist:</strong> Nach Ablauf von 365 Tagen Haltedauer sind Gewinne steuerfrei – <em>Verluste können dann aber ebenfalls steuerlich nicht mehr geltend gemacht werden!</em> Durch einen Verkauf vor Tag 365 wird der Verlust festgeschrieben und mindert die Einkommensteuerlast.
            </div>
          </div>

          {/* Tranches Table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Krypto-Position</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Kaufdatum</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Menge / Kurs</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Buchverlust</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Steuerersparnis</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Frist-Status</th>
                </tr>
              </thead>
              <tbody>
                {summary.lots.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Keine offenen Krypto-Verlustpositionen vorhanden.
                    </td>
                  </tr>
                ) : (
                  summary.lots.map(lot => {
                    const isUrgent = lot.isActionable && lot.daysRemainingInTaxYearWindow <= 30;

                    return (
                      <tr key={lot.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.6rem 0.8rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{lot.ticker}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lot.name}</div>
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>
                          {lot.buyDate} ({lot.daysHeld} Tage)
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>
                          <div>{lot.amount} Stk.</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {lot.buyPriceEur.toFixed(2)} € ➔ {lot.currentPriceEur.toFixed(2)} €
                          </div>
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>
                          -{lot.unrealizedLossEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 'bold', color: lot.isActionable ? '#10b981' : 'var(--text-muted)' }}>
                          {lot.isActionable ? `+${lot.potentialTaxSavingsEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}` : '0,00 €'}
                        </td>
                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>
                          {lot.isActionable ? (
                            isUrgent ? (
                              <span style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <Flame size={12} /> Noch {lot.daysRemainingInTaxYearWindow} Tage!
                              </span>
                            ) : (
                              <span style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#f59e0b',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <Clock size={12} /> Noch {lot.daysRemainingInTaxYearWindow} Tage
                              </span>
                            )
                          ) : (
                            <span style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem'
                            }}>
                              &gt; 365d (steuerneutral)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleCopySummary}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            {copied ? 'Übersicht kopiert!' : 'Verlusttranchen für Steuerberater / Notiz kopieren'}
          </button>

          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
