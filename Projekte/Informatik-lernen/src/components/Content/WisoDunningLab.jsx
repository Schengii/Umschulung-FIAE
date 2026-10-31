import React, { useState, useMemo } from 'react';
import {
  FileText, Award, Scale
} from 'lucide-react';
import {
  calculateSkontoEffektivzins,
  calculateVerzugszinsen,
  IHK_DUNNING_STAGES
} from '../../utils/wisoDunningEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function WisoDunningLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [skontoPercent, setSkontoPercent] = useState(3.0);
  const [zahlungsziel, setZahlungsziel] = useState(30);
  const [skontofrist, setSkontofrist] = useState(10);

  const [rechnungsbetrag, setRechnungsbetrag] = useState(15000);
  const [verzugstage, setVerzugstage] = useState(45);
  const [isB2B, setIsB2B] = useState(true);
  const [solved, setSolved] = useState(false);

  const skontoData = useMemo(() => {
    return calculateSkontoEffektivzins({
      skontoPercent,
      zahlungszielTage: zahlungsziel,
      skontofristTage: skontofrist
    });
  }, [skontoPercent, zahlungsziel, skontofrist]);

  const verzugData = useMemo(() => {
    return calculateVerzugszinsen({
      rechnungsbetrag,
      verzugstage,
      isB2B,
      basiszinssatzPercent: 3.62
    });
  }, [rechnungsbetrag, verzugstage, isB2B]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'wiso_dunning_master');
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
              <Scale size={14} /> IHK WISO Kaufmännische Steuerung
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Skonto-Effektivzins, Verzugszinsen &amp; Mahnwesen
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            💶 IHK Skonto-Effektivzins &amp; Mahnwesen Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Berechne den effektiven Jahreszinssatz von Skonto, kalkuliere gesetzliche Verzugszinsen nach BGB § 288 (B2B vs. B2C) und lerne das 3-stufige gerichtliche Mahnverfahren.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Berechnung Bestätigen (+45 XP)
        </button>
      </div>

      {/* Skonto Calculation Section */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-primary)', display: 'block', marginBottom: '14px' }}>
          1. Skonto-Effektivverzinsung (p_eff = (Skonto% * 360) / (Zahlungsziel - Skontofrist)):
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Skontosatz: {skontoPercent}%
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={skontoPercent}
              onChange={(e) => setSkontoPercent(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />

            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '4px' }}>
              Skontofrist: {skontofrist} Tage (Netto: {zahlungsziel} Tage)
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={skontofrist}
              onChange={(e) => setSkontofrist(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />

            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '4px' }}>
              Zahlungsziel (Netto): {zahlungsziel} Tage
            </label>
            <input
              type="range"
              min="15"
              max="60"
              value={zahlungsziel}
              onChange={(e) => setZahlungsziel(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Effektiver Jahreszins:</span>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
              {skontoData.effektivzinsPercent}% p.a.
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {skontoData.recommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Default Interest Calculation Section */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
            2. Verzugszinsen nach BGB § 288 ({isB2B ? 'B2B Geschäftskunden: Basis + 9%' : 'B2C Verbraucher: Basis + 5%'}):
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setIsB2B(true); triggerHaptic('SELECTION'); }}
              className={`btn ${isB2B ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              B2B (+ 9% &amp; 40€ Pauschale)
            </button>
            <button
              onClick={() => { setIsB2B(false); triggerHaptic('SELECTION'); }}
              className={`btn ${!isB2B ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              B2C (+ 5%)
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Rechnungsbetrag: {rechnungsbetrag.toLocaleString('de-DE')} €
            </label>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={rechnungsbetrag}
              onChange={(e) => setRechnungsbetrag(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />

            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '4px' }}>
              Verzugstage: {verzugstage} Tage
            </label>
            <input
              type="range"
              min="1"
              max="180"
              value={verzugstage}
              onChange={(e) => setVerzugstage(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hauptforderung:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '2px' }}>
              {verzugData.rechnungsbetrag.toLocaleString('de-DE')} €
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verzugszins ({verzugData.verzugszinsSatzPercent}% für {verzugData.verzugstage} Tage):</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444', marginTop: '2px' }}>
              +{verzugData.zinsenBetrag.toLocaleString('de-DE')} €
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mahnpauschale (§ 288 Abs. 5 BGB):</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '2px' }}>
              +{verzugData.mahnpauschaleBetrag.toLocaleString('de-DE')} €
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gesamte Forderung:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>
              {verzugData.gesamtForderung.toLocaleString('de-DE')} €
            </div>
          </div>
        </div>
      </div>

      {/* Dunning Stages Grid */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
          3. IHK Ablauf: Kaufmännisches vs. Gerichtliches Mahnverfahren:
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {IHK_DUNNING_STAGES.map((st, idx) => (
            <div key={idx} style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.84rem', color: 'var(--text-main)' }}>{st.stage}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', marginTop: '2px' }}>{st.type} ({st.cost})</div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{st.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
