import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { Coins, ShieldCheck, AlertTriangle, Calculator, Sparkles } from 'lucide-react';
import { calculateCryptoStakingTaxSummary } from './performanceUtils';

interface CryptoStakingTaxWidgetProps {
  transactions: Transaction[];
  baseCurrency?: string;
}

export const CryptoStakingTaxWidget: React.FC<CryptoStakingTaxWidgetProps> = ({
  transactions,
  baseCurrency = 'EUR'
}) => {
  const [showIlCalc, setShowIlCalc] = useState(false);
  const [priceRatioChangePct, setPriceRatioChangePct] = useState(50); // Asset A rose +50% vs Asset B

  const summary = useMemo(() => {
    return calculateCryptoStakingTaxSummary(transactions);
  }, [transactions]);

  // Impermanent Loss Formula: 2 * sqrt(k) / (1 + k) - 1
  const impermanentLossPct = useMemo(() => {
    const k = (100 + priceRatioChangePct) / 100;
    if (k <= 0) return 0;
    const il = (2 * Math.sqrt(k)) / (1 + k) - 1;
    return Math.abs(il * 100);
  }, [priceRatioChangePct]);

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Coins className="text-amber-500" size={18} /> Krypto-Staking, Lending & DeFi Tracker (§ 22 Nr. 3 EStG)
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Erträge aus Staking, Lending & Liquidity Pools mit 256 € Freigrenzen-Radar & Impermanent Loss Rechner.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowIlCalc(!showIlCalc)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              borderRadius: '6px',
              padding: '0.3rem 0.6rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Calculator size={13} /> {showIlCalc ? 'IL Rechner schließen' : 'Impermanent Loss'}
          </button>

          <span style={{
            padding: '0.25rem 0.6rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            background: summary.isTaxFree ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: summary.isTaxFree ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            {summary.isTaxFree ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
            {summary.isTaxFree ? 'Steuerfrei (< 256 € Freigrenze)' : 'Steuerpflichtig (> 256 € Freigrenze)'}
          </span>
        </div>
      </div>

      {/* Impermanent Loss Interactive Calculator */}
      {showIlCalc && (
        <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} /> Liquidity Pool Impermanent Loss Simulation
            </span>
            <span style={{ fontWeight: 'bold', color: '#ef4444' }}>
              Verlust gegenüber HODL: -{impermanentLossPct.toFixed(2)}%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Preisänderung Asset A vs B: {priceRatioChangePct}%</span>
            <input
              type="range"
              min="-80"
              max="300"
              step="5"
              value={priceRatioChangePct}
              onChange={e => setPriceRatioChangePct(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      )}

      {/* Progress Bar for 256 Euro Freigrenze */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Freigrenze ausgeschöpft: {summary.exemptionUsedPercent.toFixed(1)}%</span>
          <span style={{ fontWeight: 'bold' }}>
            {summary.totalStakingIncomeEur.toFixed(2)} € / {summary.exemptionLimitEur.toFixed(2)} €
          </span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${summary.exemptionUsedPercent}%`,
            height: '100%',
            background: summary.isTaxFree ? '#10b981' : '#ef4444',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Staking & DeFi Erträge</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.2rem' }}>
            {summary.totalStakingIncomeEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{summary.stakingTransactionsCount} Ertragsbuchungen</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Geschätzte Einkommensteuer</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: summary.isTaxFree ? '#10b981' : '#ef4444', marginTop: '0.2rem' }}>
            {summary.estimatedIncomeTaxEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {summary.isTaxFree ? '0 € dank Freigrenze' : 'Zu versteuern mit persönl. Steuersatz'}
          </div>
        </div>
      </div>
    </div>
  );
};

