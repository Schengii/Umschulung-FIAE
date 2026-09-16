import React, { useState, useMemo } from 'react';
import type { Holding } from '../types';
import { ArrowRightLeft } from 'lucide-react';
import { calculateFxHedgingAnalysis } from './performanceUtils';

interface FxHedgingWidgetProps {
  holdings: Holding[];
  baseCurrency?: string;
}

export const FxHedgingWidget: React.FC<FxHedgingWidgetProps> = ({ holdings, baseCurrency = 'EUR' }) => {
  const [hedgePercent, setHedgePercent] = useState<number>(50);
  const [annualCostPercent, setAnnualCostPercent] = useState<number>(1.2);

  const hedging = useMemo(() => {
    return calculateFxHedgingAnalysis(holdings, hedgePercent, annualCostPercent);
  }, [holdings, hedgePercent, annualCostPercent]);

  if (hedging.totalNonEurValueEur === 0) return null;

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRightLeft className="text-blue-400" size={18} /> Multi-Währungs-Absicherung & FX Hedging Rechner
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Simulation von Währungssicherungs-Kosten vs. Volatilitäts-Reduktion bei Fremdwährungs-Engagements.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ziel-Hedgequote:</span>
            <strong style={{ color: '#3b82f6' }}>{hedgePercent}%</strong>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={hedgePercent}
            onChange={(e) => setHedgePercent(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Hedging-Kosten (Forward Roll):</span>
            <strong style={{ color: '#f59e0b' }}>{annualCostPercent}% p.a.</strong>
          </div>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.1}
            value={annualCostPercent}
            onChange={(e) => setAnnualCostPercent(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fremdwährungs-Volumen</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem' }}>
            {hedging.totalNonEurValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Abgesicherter Betrag ({hedgePercent}%)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.2rem' }}>
            {hedging.hedgedAmountEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Jährliche Hedging-Kosten</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '0.2rem' }}>
            -{hedging.annualHedgingCostEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} / Jahr
          </div>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Währungsrisiko-Reduktion</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>
            ca. -{hedging.varReductionEstimatePercent}%
          </div>
        </div>
      </div>
    </div>
  );
};
