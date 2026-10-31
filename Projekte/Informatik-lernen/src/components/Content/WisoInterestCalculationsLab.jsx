import React, { useState, useMemo } from 'react';
import { Percent, Award, Calculator } from 'lucide-react';
import {
  calculateSimpleInterest,
  calculateCompoundInterest
} from '../../utils/wisoInterestCalculationsEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WisoInterestCalculationsLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [tab, setTab] = useState('simple'); // 'simple' | 'compound'
  const [kapital, setKapital] = useState(50000);
  const [zinssatz, setZinssatz] = useState(5.0);
  const [tage, setTage] = useState(90);
  const [jahre, setJahre] = useState(5);
  const [solved, setSolved] = useState(false);

  const simpleData = useMemo(() => {
    return calculateSimpleInterest({
      kapital,
      zinssatzPercent: zinssatz,
      tage
    });
  }, [kapital, zinssatz, tage]);

  const compoundData = useMemo(() => {
    return calculateCompoundInterest({
      anfangskapital: kapital,
      zinssatzPercent: zinssatz,
      jahre
    });
  }, [kapital, zinssatz, jahre]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'wiso_interest_master');
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
              <Calculator size={14} /> IHK Wirtschafts- &amp; Finanzmathematik
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Percent size={14} /> Deutsche Zinsmethode (30/360) &amp; Zinseszins
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            💰 IHK Zinsrechnung &amp; Zinseszins Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Berechne kaufmännische Tageszinsen nach der deutschen Zinsmethode (30/360) sowie Zinseszins (Aufzinsung / Abzinsung) für IHK-Investitionsrechnungen.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Zinsberechnung Bestätigen (+45 XP)
        </button>
      </div>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={() => { setTab('simple'); triggerHaptic('SELECTION'); }}
          className={`btn ${tab === 'simple' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          1. Kaufmännische Zinsrechnung (Tageszinsen Z = K·p·t / 36000)
        </button>
        <button
          onClick={() => { setTab('compound'); triggerHaptic('SELECTION'); }}
          className={`btn ${tab === 'compound' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          2. Zinseszins &amp; Aufzinsung (K_n = K_0 · (1+i)^n)
        </button>
      </div>

      {tab === 'simple' ? (
        <>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Angelegtes Kapital (K):</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
                {kapital.toLocaleString('de-DE')} €
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Zinsertrag ({tage} Tage à {zinssatz}%):</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
                +{simpleData.zinsen.toLocaleString('de-DE')} €
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Endkapital (K + Z):</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '4px' }}>
                {simpleData.endkapital.toLocaleString('de-DE')} €
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Kapital (K): {kapital.toLocaleString('de-DE')} €</label>
                <input type="range" min="5000" max="250000" step="5000" value={kapital} onChange={(e) => setKapital(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>Zinssatz (p): {zinssatz}%</label>
                <input type="range" min="0.5" max="15" step="0.5" value={zinssatz} onChange={(e) => setZinssatz(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Laufzeit in Tagen (t): {tage} Tage</label>
                <input type="range" min="10" max="360" step="10" value={tage} onChange={(e) => setTage(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Compound Table */
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              Zinseszinsentwicklung über {jahre} Jahre (Aufzinsungsfaktor: {compoundData.aufzinsungsfaktor}):
            </span>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#10b981' }}>
              Gesamtzinsen: +{compoundData.gesamtzinsen.toLocaleString('de-DE')} €
            </div>
          </div>

          <div style={{ marginBottom: '16px', maxWidth: '320px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Laufzeit (n): {jahre} Jahre</label>
            <input type="range" min="1" max="30" step="1" value={jahre} onChange={(e) => setJahre(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Jahr</th>
                <th style={{ padding: '10px' }}>Zinsertrag im Jahr ({zinssatz}%)</th>
                <th style={{ padding: '10px' }}>Kapitalstand am Jahresende</th>
              </tr>
            </thead>
            <tbody>
              {compoundData.yearlyProgression.map(row => (
                <tr key={row.jahr} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>Jahr {row.jahr}</td>
                  <td style={{ padding: '10px', color: '#10b981' }}>+{row.zinsenImJahr.toLocaleString('de-DE')} €</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{row.kapitalEndeJahr.toLocaleString('de-DE')} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
