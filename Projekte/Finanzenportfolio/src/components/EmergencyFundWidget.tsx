import React, { useState, useMemo } from 'react';
import type { Holding } from '../types';
import { Wallet } from 'lucide-react';
import { calculateEmergencyFundStatus } from './performanceUtils';

interface EmergencyFundWidgetProps {
  holdings: Holding[];
  baseCurrency?: string;
}

export const EmergencyFundWidget: React.FC<EmergencyFundWidgetProps> = ({
  holdings,
  baseCurrency = 'EUR'
}) => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(2000);
  const [targetMonths, setTargetMonths] = useState<number>(3);

  // Calculate current cash & money market holdings
  const currentCash = useMemo(() => {
    return holdings
      .filter(h => h.category === 'Bond' || h.name.toLowerCase().includes('geldmarkt') || h.name.toLowerCase().includes('tagesgeld') || h.name.toLowerCase().includes('cash'))
      .reduce((sum, h) => sum + h.currentValue, 0);
  }, [holdings]);

  const fund = useMemo(() => {
    return calculateEmergencyFundStatus(monthlyExpenses, currentCash, targetMonths);
  }, [monthlyExpenses, currentCash, targetMonths]);

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet className="text-emerald-400" size={18} /> Dynamischer Notgroschen- & Liquiditäts-Assistent
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Empfohlene Liquiditätsreserve für unvorhergesehene Ausgaben auf Tagesgeld / Geldmarkt ({fund.targetMonths} Monatsausgaben).
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Monatliche Fixkosten & Lebenshaltung:</span>
            <strong style={{ color: 'var(--text-main)' }}>{monthlyExpenses} €</strong>
          </div>
          <input
            type="range"
            min={500}
            max={6000}
            step={100}
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Sicherheits-Puffer:</span>
            <strong style={{ color: '#10b981' }}>{targetMonths} Monate</strong>
          </div>
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={targetMonths}
            onChange={(e) => setTargetMonths(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Notgroschen-Deckung ({fund.coveredMonths} Monate):</span>
          <strong style={{ color: fund.progressPercent >= 100 ? '#10b981' : '#f59e0b' }}>{fund.progressPercent}%</strong>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, fund.progressPercent)}%`,
            background: fund.progressPercent >= 100 ? '#10b981' : fund.progressPercent >= 50 ? '#f59e0b' : '#ef4444',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aktuelle Liquidität</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem' }}>
            {fund.currentCashEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Zielbetrag ({fund.targetMonths} Mo.)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>
            {fund.targetAmountEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</span>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginTop: '0.3rem', color: fund.status === 'HEALTHY' || fund.status === 'SURPLUS' ? '#10b981' : '#f59e0b' }}>
            {fund.status === 'SURPLUS' ? 'Überschuss liquide' : fund.status === 'HEALTHY' ? 'Voll gedeckt' : 'Aufbau empfohlen'}
          </div>
        </div>
      </div>
    </div>
  );
};
