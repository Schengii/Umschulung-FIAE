import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Award, Calculator
} from 'lucide-react';
import { calculateNetPresentValue } from '../../utils/wisoCapitalValueEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WisoCapitalValueLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [invest, setInvest] = useState(100000);
  const [rate, setRate] = useState(8.0);
  const [cf1, setCf1] = useState(35000);
  const [cf2, setCf2] = useState(40000);
  const [cf3, setCf3] = useState(45000);
  const [salvage, setSalvage] = useState(5000);
  const [solved, setSolved] = useState(false);

  const npvData = useMemo(() => {
    return calculateNetPresentValue({
      anschaffungsauszahlung: invest,
      kalkulationszinssatzPercent: rate,
      cashflows: [cf1, cf2, cf3],
      liquidationserloes: salvage
    });
  }, [invest, rate, cf1, cf2, cf3, salvage]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'wiso_capital_value_master');
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={14} /> IHK Investitionsrechnung
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} /> Kapitalwertmethode (NPV &amp; Barwert)
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📊 IHK Kapitalwertmethode (NPV) Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Führe dynamische Investitionsrechnungen durch, zinse jährliche Einzahlungsüberschüsse (Cashflows) ab und beurteile die Wirtschaftlichkeit (Kapitalwert $\ge 0$).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Kapitalwert Bestätigen (+45 XP)
        </button>
      </div>

      {/* Key Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Summe der Barwerte:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {npvData.sumBarwerte.toLocaleString('de-DE')} €
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Kapitalwert (NPV = Barwerte - I0):</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: npvData.isProfitable ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {npvData.kapitalwert >= 0 ? '+' : ''}{npvData.kapitalwert.toLocaleString('de-DE')} €
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>IHK Wirtschaftlichkeitsurteil:</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: npvData.isProfitable ? '#10b981' : '#ef4444', marginTop: '6px' }}>
            {npvData.isProfitable ? '✅ Vorteilhafte Investition' : '❌ Unvorteilhaft'}
          </div>
        </div>
      </div>

      {/* Cashflow Barwert Table */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Periode (t)</th>
              <th style={{ padding: '10px' }}>Cashflow (R_t)</th>
              <th style={{ padding: '10px' }}>Abzinsungsfaktor (1 / (1+i)^t)</th>
              <th style={{ padding: '10px' }}>Barwert (Diskontiert)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>t=0 (Anschaffung I_0)</td>
              <td style={{ padding: '10px', color: '#ef4444' }}>-{invest.toLocaleString('de-DE')} €</td>
              <td style={{ padding: '10px' }}>1.0000</td>
              <td style={{ padding: '10px', color: '#ef4444', fontWeight: 'bold' }}>-{invest.toLocaleString('de-DE')} €</td>
            </tr>
            {npvData.cashflowDetails.map(row => (
              <tr key={row.jahr} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>Jahr {row.jahr}</td>
                <td style={{ padding: '10px', color: '#10b981' }}>+{row.cashflow.toLocaleString('de-DE')} €</td>
                <td style={{ padding: '10px' }}>{row.abzinsungsfaktor}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>+{row.barwert.toLocaleString('de-DE')} €</td>
              </tr>
            ))}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Jahr 3 (Restwert L_3)</td>
              <td style={{ padding: '10px', color: '#10b981' }}>+{salvage.toLocaleString('de-DE')} €</td>
              <td style={{ padding: '10px' }}>{(1 / Math.pow(1 + rate/100, 3)).toFixed(4)}</td>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>+{npvData.barwertLn.toLocaleString('de-DE')} €</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Sliders */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Anschaffungsauszahlung (I_0): {invest.toLocaleString('de-DE')} €</label>
            <input type="range" min="20000" max="250000" step="5000" value={invest} onChange={(e) => setInvest(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>Kalkulationszinssatz (i): {rate}%</label>
            <input type="range" min="2" max="15" step="0.5" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Cashflow Jahr 1: {cf1.toLocaleString('de-DE')} €</label>
            <input type="range" min="10000" max="100000" step="2500" value={cf1} onChange={(e) => setCf1(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>Cashflow Jahr 2: {cf2.toLocaleString('de-DE')} €</label>
            <input type="range" min="10000" max="100000" step="2500" value={cf2} onChange={(e) => setCf2(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Cashflow Jahr 3: {cf3.toLocaleString('de-DE')} €</label>
            <input type="range" min="10000" max="100000" step="2500" value={cf3} onChange={(e) => setCf3(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>Liquidationserlös (Restwert L_3): {salvage.toLocaleString('de-DE')} €</label>
            <input type="range" min="0" max="30000" step="1000" value={salvage} onChange={(e) => setSalvage(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
