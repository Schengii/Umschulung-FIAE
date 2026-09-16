import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Award, Scale
} from 'lucide-react';
import {
  calculateContributionMargin,
  calculateMultiStageContribution
} from '../../utils/wisoContributionMarginEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WisoContributionMarginLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [preis, setPreis] = useState(150);
  const [varKosten, setVarKosten] = useState(90);
  const [fixkosten, setFixkosten] = useState(60000);
  const [menge, setMenge] = useState(1200);
  const [tab, setTab] = useState('bep'); // 'bep' | 'multistage'
  const [solved, setSolved] = useState(false);

  const cmData = useMemo(() => {
    return calculateContributionMargin({
      preis,
      variableStueckkosten: varKosten,
      fixkosten,
      menge
    });
  }, [preis, varKosten, fixkosten, menge]);

  const multiData = useMemo(() => {
    return calculateMultiStageContribution({
      erloese: menge * preis,
      varKosten: menge * varKosten,
      erzeugnisFixkosten: 15000,
      gruppenFixkosten: 10000,
      bereichsFixkosten: 15000,
      unternehmensFixkosten: 20000
    });
  }, [menge, preis, varKosten]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'wiso_contribution_margin_master');
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
              <Scale size={14} /> IHK Kosten- &amp; Leistungsrechnung (KLR)
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} /> Deckungsbeitrag &amp; Break-Even-Point
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📊 IHK Deckungsbeitrags- &amp; Break-Even-Point Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Berechne Stückdeckungsbeitrag (db = p - k_v), Gewinnschwelle (BEP = K_f / db) und mehrstufige Fixkostendeckung für IHK Prüfungen (AP1/AP2).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> KLR-Berechnung Bestätigen (+45 XP)
        </button>
      </div>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={() => { setTab('bep'); triggerHaptic('SELECTION'); }}
          className={`btn ${tab === 'bep' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          1. Einstufige Deckungsbeitragsrechnung &amp; BEP
        </button>
        <button
          onClick={() => { setTab('multistage'); triggerHaptic('SELECTION'); }}
          className={`btn ${tab === 'multistage' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px' }}
        >
          2. Mehrstufige Fixkostenspaltung (Stufen I - IV)
        </button>
      </div>

      {tab === 'bep' ? (
        <>
          {/* Key Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Stückdeckungsbeitrag (db):</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
                {cmData.stueckDb.toLocaleString('de-DE')} € / Stk.
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gewinnschwelle (Break-Even-Point):</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
                {cmData.bepMenge.toLocaleString('de-DE')} Stück
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Betriebsergebnis (Gewinn/Verlust):</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: cmData.isProfit ? '#10b981' : '#ef4444', marginTop: '4px' }}>
                {cmData.betriebsergebnis >= 0 ? '+' : ''}{cmData.betriebsergebnis.toLocaleString('de-DE')} €
              </div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Verkaufspreis (p): {preis} €
                </label>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="10"
                  value={preis}
                  onChange={(e) => setPreis(parseInt(e.target.value, 10))}
                  style={{ width: '100%' }}
                />

                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>
                  Variable Stückkosten (kv): {varKosten} €
                </label>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="5"
                  value={varKosten}
                  onChange={(e) => setVarKosten(parseInt(e.target.value, 10))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Gesamte Fixkosten (Kf): {fixkosten.toLocaleString('de-DE')} €
                </label>
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={fixkosten}
                  onChange={(e) => setFixkosten(parseInt(e.target.value, 10))}
                  style={{ width: '100%' }}
                />

                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>
                  Absatzmenge (x): {menge} Stück
                </label>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={menge}
                  onChange={(e) => setMenge(parseInt(e.target.value, 10))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Multi-Stage Breakdown */
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--accent-primary)', display: 'block', marginBottom: '14px' }}>
            Mehrstufige Fixkostendeckungsrechnung:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
              <span>1. Umsatzerlöse ({menge} Stk. × {preis} €)</span>
              <strong>{multiData.erloese.toLocaleString('de-DE')} €</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
              <span>- Variable Gesamtkosten ({menge} Stk. × {varKosten} €)</span>
              <strong style={{ color: '#ef4444' }}>-{multiData.varKosten.toLocaleString('de-DE')} €</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', fontWeight: 'bold' }}>
              <span>= Deckungsbeitrag I (Erzeugnis-DB)</span>
              <strong style={{ color: 'var(--accent-primary)' }}>{multiData.db1.toLocaleString('de-DE')} €</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', fontWeight: 'bold' }}>
              <span>= Deckungsbeitrag II (nach Erzeugnisfixkosten 15.000 €)</span>
              <strong style={{ color: '#10b981' }}>{multiData.db2.toLocaleString('de-DE')} €</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', fontWeight: 'bold' }}>
              <span>= Deckungsbeitrag III (nach Gruppenfixkosten 10.000 €)</span>
              <strong style={{ color: '#10b981' }}>{multiData.db3.toLocaleString('de-DE')} €</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: multiData.isProfit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem' }}>
              <span>= Betriebsergebnis (nach allen Fixkosten)</span>
              <strong style={{ color: multiData.isProfit ? '#10b981' : '#ef4444' }}>
                {multiData.betriebsergebnis >= 0 ? '+' : ''}{multiData.betriebsergebnis.toLocaleString('de-DE')} €
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
