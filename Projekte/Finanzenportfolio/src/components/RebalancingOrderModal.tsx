import React, { useState, useMemo } from 'react';
import type { Holding, TargetAllocation, AssetCategory } from '../types';
import { Scale, Copy, Check, X, ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react';
import { calculateRebalanceOrders, formatRebalancingOrdersForClipboard } from '../utils/rebalanceUtils';

interface RebalancingOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  targetAllocations?: TargetAllocation[];
  baseCurrency?: string;
}

export const RebalancingOrderModal: React.FC<RebalancingOrderModalProps> = ({
  isOpen,
  onClose,
  holdings,
  targetAllocations,
  baseCurrency = 'EUR'
}) => {
  const [mode, setMode] = useState<'FULL' | 'CASHFLOW_ONLY'>('FULL');
  const [freshCapitalEur, setFreshCapitalEur] = useState<number>(0);
  const [toleranceBandPercent, setToleranceBandPercent] = useState<number>(0.5);
  const [copied, setCopied] = useState<boolean>(false);

  // Targets from strategy or defaults
  const targetsRecord = useMemo(() => {
    const map: Record<AssetCategory, number> = {
      ETF: 50,
      Stock: 30,
      Crypto: 10,
      Bond: 10,
      PreciousMetal: 0,
      Cash: 0,
      RealEstate: 0,
      P2P: 0
    };
    if (targetAllocations && targetAllocations.length > 0) {
      targetAllocations.forEach(ta => {
        if (ta.category in map) {
          map[ta.category] = ta.weight;
        }
      });
    }
    return map;
  }, [targetAllocations]);

  const rebalanceResult = useMemo(() => {
    return calculateRebalanceOrders(holdings, targetsRecord, {
      mode,
      freshCapitalEur,
      toleranceBandPercent
    });
  }, [holdings, targetsRecord, mode, freshCapitalEur, toleranceBandPercent]);

  const handleCopy = () => {
    const text = formatRebalancingOrdersForClipboard(rebalanceResult, baseCurrency);
    navigator.clipboard.writeText(text);
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
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
              <Scale size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>Portfolio-Rebalancing & Order-Assistent</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Soll/Ist-Vergleich aller 8 Anlageklassen & passgenaue Orderausführung
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Controls Bar */}
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Mode Switch */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setMode('FULL')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: mode === 'FULL' ? 'bold' : 'normal',
                background: mode === 'FULL' ? '#3b82f6' : 'transparent',
                color: mode === 'FULL' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              🔄 Voll-Rebalancing (Kauf & Verkauf)
            </button>
            <button
              onClick={() => setMode('CASHFLOW_ONLY')}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: mode === 'CASHFLOW_ONLY' ? 'bold' : 'normal',
                background: mode === 'CASHFLOW_ONLY' ? '#10b981' : 'transparent',
                color: mode === 'CASHFLOW_ONLY' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              💸 Nur Zukäufe (Keine Verkäufe)
            </button>
          </div>

          {/* Fresh Capital Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frisches Kapital:</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                step="100"
                value={freshCapitalEur === 0 ? '' : freshCapitalEur}
                placeholder="0"
                onChange={e => setFreshCapitalEur(Math.max(0, Number(e.target.value) || 0))}
                style={{
                  width: '110px',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.85rem',
                  background: 'var(--bg-dark, #020617)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main, #fff)',
                  textAlign: 'right'
                }}
              />
              <span style={{ marginLeft: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{baseCurrency}</span>
            </div>
          </div>

          {/* Tolerance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toleranz:</span>
            <select
              value={toleranceBandPercent}
              onChange={e => setToleranceBandPercent(Number(e.target.value))}
              style={{
                padding: '0.35rem 0.5rem',
                fontSize: '0.8rem',
                background: 'var(--bg-dark, #020617)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-main, #fff)'
              }}
            >
              <option value={0}>0% (Strikter Zielwert)</option>
              <option value={0.5}>±0.5% Band</option>
              <option value={1.0}>±1.0% Band</option>
              <option value={2.0}>±2.0% Band</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aktueller Depotwert</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 'bold', marginTop: '0.2rem' }}>
                {rebalanceResult.totalPortfolioValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>🟢 Empfohlenes Kaufvolumen</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>
                {rebalanceResult.totalBuyVolumeEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>

            {mode === 'FULL' && (
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>🔴 Empfohlenes Verkaufsvolumen</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>
                  {rebalanceResult.totalSellVolumeEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                </div>
              </div>
            )}

            {freshCapitalEur > 0 && (
              <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold' }}>🎯 Zielwert nach Cashflow</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.2rem' }}>
                  {rebalanceResult.postRebalanceValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                </div>
              </div>
            )}
          </div>

          {mode === 'CASHFLOW_ONLY' && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: '#a7f3d0' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Steuerschonender Modus:</strong> Es werden keine Verkäufe getätigt. Untergewichtete Asset-Klassen werden gezielt durch neues Spar- bzw. Anlagekapital aufgestockt.
              </span>
            </div>
          )}

          {/* Orders Table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.7rem', textAlign: 'left' }}>Asset-Klasse</th>
                  <th style={{ padding: '0.7rem', textAlign: 'right' }}>Ist-Wert (Ist-%)</th>
                  <th style={{ padding: '0.7rem', textAlign: 'right' }}>Soll-Wert (Soll-%)</th>
                  <th style={{ padding: '0.7rem', textAlign: 'right' }}>Abweichung</th>
                  <th style={{ padding: '0.7rem', textAlign: 'center' }}>Aktion</th>
                  <th style={{ padding: '0.7rem', textAlign: 'right' }}>Order-Summe</th>
                </tr>
              </thead>
              <tbody>
                {rebalanceResult.categoryOrders.map(order => {
                  const isBuy = order.action === 'BUY';
                  const isSell = order.action === 'SELL';
                  const actionColor = isBuy ? '#10b981' : isSell ? '#ef4444' : 'var(--text-muted)';
                  const actionBg = isBuy ? 'rgba(16, 185, 129, 0.15)' : isSell ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)';

                  return (
                    <React.Fragment key={order.category}>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.7rem', fontWeight: 'bold' }}>
                          {order.category}
                        </td>
                        <td style={{ padding: '0.7rem', textAlign: 'right' }}>
                          {order.currentValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                            ({order.currentWeightPercent.toFixed(1)}%)
                          </span>
                        </td>
                        <td style={{ padding: '0.7rem', textAlign: 'right' }}>
                          {order.targetValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                            ({order.targetWeightPercent.toFixed(1)}%)
                          </span>
                        </td>
                        <td style={{ padding: '0.7rem', textAlign: 'right', fontWeight: '500', color: Math.abs(order.driftPercent) < 0.5 ? 'var(--text-muted)' : order.driftPercent > 0 ? '#ef4444' : '#10b981' }}>
                          {order.driftPercent > 0 ? '+' : ''}{order.driftPercent.toFixed(1)}%
                        </td>
                        <td style={{ padding: '0.7rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: actionBg,
                            color: actionColor,
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            {isBuy && <ArrowUpRight size={13} />}
                            {isSell && <ArrowDownRight size={13} />}
                            {!isBuy && !isSell && <Minus size={13} />}
                            {order.action === 'BUY' ? 'KAUF' : order.action === 'SELL' ? 'VERKAUF' : 'HALTEN'}
                          </span>
                        </td>
                        <td style={{ padding: '0.7rem', textAlign: 'right', fontWeight: 'bold', color: actionColor }}>
                          {order.orderValueEur > 0 ? order.orderValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency }) : '—'}
                        </td>
                      </tr>
                      {order.suggestedAssets.length > 0 && order.orderValueEur > 0 && (
                        <tr style={{ background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)' }}>
                          <td colSpan={6} style={{ padding: '0.4rem 0.7rem 0.6rem 2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Vorgeschlagene Assets für diesen Auftrag:</span>
                              {order.suggestedAssets.map(a => (
                                <div key={a.ticker} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '0.5rem' }}>
                                  <span>{a.ticker} ({a.name})</span>
                                  <span>
                                    ~{a.suggestedShares} Stk. @ {a.currentPrice.toFixed(2)} € = <strong>{a.suggestedAmountEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</strong>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            {copied ? 'Orderliste in Zwischenablage kopiert!' : 'Orderliste für Broker kopieren'}
          </button>

          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
