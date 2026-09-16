import React, { useState, useMemo } from 'react';
import {
  Boxes, Award, Calculator
} from 'lucide-react';
import { calculateAndlerOptimalOrder } from '../../utils/wisoAndlerEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WisoAndlerLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [jahresbedarf, setJahresbedarf] = useState(10000);
  const [bestellfixeKosten, setBestellfixeKosten] = useState(50);
  const [einstandspreis, setEinstandspreis] = useState(20);
  const [lagerkostensatz, setLagerkostensatz] = useState(15);
  const [solved, setSolved] = useState(false);

  const andlerData = useMemo(() => {
    return calculateAndlerOptimalOrder({
      jahresbedarf,
      bestellfixeKosten,
      einstandspreis,
      lagerkostensatzPercent: lagerkostensatz
    });
  }, [jahresbedarf, bestellfixeKosten, einstandspreis, lagerkostensatz]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'wiso_andler_master');
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
              <Boxes size={14} /> IHK Materialwirtschaft
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={14} /> Andler-Formel &amp; Optimale Bestellmenge
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📦 IHK Optimale Bestellmenge (Andler) Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Berechne die klassische Losgrößenformel nach Andler, ermittle das Kostenoptimum im Schnittpunkt von Bestellfixkosten und Lagerhaltungskosten sowie Bestellintervall und -häufigkeit.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Andler-Berechnung Bestätigen (+45 XP)
        </button>
      </div>

      {/* Optimum Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Optimale Bestellmenge (x_opt):</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {andlerData.xOpt.toLocaleString('de-DE')} Stück
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bestellhäufigkeit &amp; Intervall:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            {andlerData.nOpt} × (alle {andlerData.tOptDays} Tage)
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Minimale Gesamtkosten:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            {andlerData.gesamtkosten.toLocaleString('de-DE')} €
          </div>
        </div>
      </div>

      {/* Cost Breakdown & Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Cost Breakdown */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
            Kostenaufschlüsselung im Optimum:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
              <span>Bestellkosten ({andlerData.nOpt} × {bestellfixeKosten} €):</span>
              <strong style={{ color: 'var(--accent-primary)' }}>{andlerData.bestellkosten.toLocaleString('de-DE')} €</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
              <span>Lagerhaltungskosten ({lagerkostensatz}% von durchschn. Lagerbestand):</span>
              <strong style={{ color: '#ec4899' }}>{andlerData.lagerkosten.toLocaleString('de-DE')} €</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.95rem' }}>
              <span>= Minimale Gesamtkosten (Schnittpunkt):</span>
              <strong style={{ color: '#10b981' }}>{andlerData.gesamtkosten.toLocaleString('de-DE')} €</strong>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Jahresbedarf (J): {jahresbedarf} Stk.</label>
              <input type="range" min="1000" max="50000" step="500" value={jahresbedarf} onChange={(e) => setJahresbedarf(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>Bestellfixkosten (kf): {bestellfixeKosten} €</label>
              <input type="range" min="10" max="250" step="5" value={bestellfixeKosten} onChange={(e) => setBestellfixeKosten(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Einstandspreis (p): {einstandspreis} €</label>
              <input type="range" min="2" max="200" step="2" value={einstandspreis} onChange={(e) => setEinstandspreis(parseInt(e.target.value, 10))} style={{ width: '100%' }} />

              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>Lagerkostensatz (ls): {lagerkostensatz} %</label>
              <input type="range" min="5" max="40" step="1" value={lagerkostensatz} onChange={(e) => setLagerkostensatz(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
