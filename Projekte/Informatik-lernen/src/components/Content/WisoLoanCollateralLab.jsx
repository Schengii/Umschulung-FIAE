import React, { useState, useMemo } from 'react';
import { Landmark, Award, Calculator } from 'lucide-react';
import { calculateLoanSchedule } from '../../utils/wisoLoanCollateralEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WisoLoanCollateralLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [darlehensbetrag, setDarlehensbetrag] = useState(100000);
  const [zinssatz, setZinssatz] = useState(5.0);
  const [laufzeit, setLaufzeit] = useState(5);
  const [darlehensTyp, setDarlehensTyp] = useState('ANNUITY');
  const [solved, setSolved] = useState(false);

  const loanData = useMemo(() => {
    return calculateLoanSchedule({
      darlehensbetrag,
      zinssatzPercent: zinssatz,
      laufzeitJahre: laufzeit,
      darlehensTyp
    });
  }, [darlehensbetrag, zinssatz, laufzeit, darlehensTyp]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'wiso_loan_collateral_master');
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
              <Landmark size={14} /> IHK Finanzierung &amp; Investition
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={14} /> Darlehensarten &amp; Tilgungspläne
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🏦 IHK Darlehensarten &amp; Kreditsicherheiten Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Vergleiche Annuitäten-, Raten- und Fälligkeitsdarlehen mit Tilgungsplänen und vertiefe die IHK-Systematik von Personal- und Realsicherheiten.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Finanzierungsplan Bestätigen (+45 XP)
        </button>
      </div>

      {/* Loan Type Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => { setDarlehensTyp('ANNUITY'); triggerHaptic('SELECTION'); }}
          className={`btn ${darlehensTyp === 'ANNUITY' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>1. Annuitätendarlehen</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Konstanter Kapitaldienst (Zins sinkt, Tilgung steigt)</div>
        </button>

        <button
          onClick={() => { setDarlehensTyp('INSTALLMENT'); triggerHaptic('SELECTION'); }}
          className={`btn ${darlehensTyp === 'INSTALLMENT' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>2. Ratendarlehen</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Konstante Tilgung (Kapitaldienst sinkt jährlich)</div>
        </button>

        <button
          onClick={() => { setDarlehensTyp('FIXED_MATURITY'); triggerHaptic('SELECTION'); }}
          className={`btn ${darlehensTyp === 'FIXED_MATURITY' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>3. Fälligkeitsdarlehen</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Nur Zinsen, 100% Tilgung am Laufzeitende</div>
        </button>
      </div>

      {/* Parameter Sliders */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Darlehensbetrag: {darlehensbetrag.toLocaleString('de-DE')} €
            </label>
            <input type="range" min="10000" max="500000" step="5000" value={darlehensbetrag} onChange={(e) => setDarlehensbetrag(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Zinssatz: {zinssatz}%
            </label>
            <input type="range" min="1" max="12" step="0.5" value={zinssatz} onChange={(e) => setZinssatz(parseFloat(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Laufzeit: {laufzeit} Jahre
            </label>
            <input type="range" min="1" max="20" step="1" value={laufzeit} onChange={(e) => setLaufzeit(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Darlehensbetrag:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {darlehensbetrag.toLocaleString('de-DE')} €
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gesamte Zinsbelastung:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>
            {loanData.gesamtZinsen.toLocaleString('de-DE')} €
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gesamter Rückzahlungsbetrag:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            {loanData.gesamtKapitaldienst.toLocaleString('de-DE')} €
          </div>
        </div>
      </div>

      {/* Amortization Table */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
          Jährlicher Tilgungsplan ({darlehensTyp}):
        </span>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Jahr</th>
              <th style={{ padding: '10px' }}>Zinsen ({zinssatz}%)</th>
              <th style={{ padding: '10px' }}>Tilgung</th>
              <th style={{ padding: '10px' }}>Kapitaldienst (Gesamt)</th>
              <th style={{ padding: '10px' }}>Verbleibende Restschuld</th>
            </tr>
          </thead>
          <tbody>
            {loanData.schedule.map(row => (
              <tr key={row.jahr} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>Jahr {row.jahr}</td>
                <td style={{ padding: '10px', color: '#ef4444' }}>{row.zinsen.toLocaleString('de-DE')} €</td>
                <td style={{ padding: '10px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{row.tilgung.toLocaleString('de-DE')} €</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.kapitaldienst.toLocaleString('de-DE')} €</td>
                <td style={{ padding: '10px', color: row.restschuld === 0 ? '#10b981' : 'var(--text-main)' }}>
                  {row.restschuld.toLocaleString('de-DE')} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
