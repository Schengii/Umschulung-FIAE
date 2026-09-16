import React, { useState, useMemo } from 'react';
import type { Holding } from '../types';
import { Layers } from 'lucide-react';
import { calculateBondDurationSensitivity } from './performanceUtils';

interface BondDurationWidgetProps {
  holdings: Holding[];
  baseCurrency?: string;
}

export const BondDurationWidget: React.FC<BondDurationWidgetProps> = ({
  holdings,
  baseCurrency = 'EUR'
}) => {
  const [rateShiftBps, setRateShiftBps] = useState<number>(100); // +100 bps

  const result = useMemo(() => {
    return calculateBondDurationSensitivity(holdings, rateShiftBps);
  }, [holdings, rateShiftBps]);

  if (result.bondHoldingsValueEur === 0) return null;

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers className="text-cyan-400" size={18} /> Anleihen-Duration & Zinsänderungsrisiko
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Sensitivität von Renten- und Geldmarktfonds bei Zinsänderungen (Modified Duration: {result.weightedDurationYears} Jahre).
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Leitzins-Verschiebung (Δy):</span>
          <strong style={{ color: rateShiftBps >= 0 ? '#ef4444' : '#10b981' }}>
            {rateShiftBps >= 0 ? '+' : ''}{rateShiftBps} Basispunkte ({(rateShiftBps / 100).toFixed(2)}%)
          </strong>
        </div>
        <input
          type="range"
          min={-300}
          max={300}
          step={25}
          value={rateShiftBps}
          onChange={(e) => setRateShiftBps(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Anleihen-Volumen</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.2rem' }}>
            {result.bondHoldingsValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kursänderung (geschätzt)</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: result.estimatedPriceChangePercent >= 0 ? '#10b981' : '#ef4444', marginTop: '0.2rem' }}>
            {result.estimatedPriceChangePercent >= 0 ? '+' : ''}{result.estimatedPriceChangePercent.toFixed(2)}%
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wertänderung Depot</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: result.estimatedValueImpactEur >= 0 ? '#10b981' : '#ef4444', marginTop: '0.2rem' }}>
            {result.estimatedValueImpactEur >= 0 ? '+' : ''}{result.estimatedValueImpactEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
        </div>
      </div>
    </div>
  );
};
