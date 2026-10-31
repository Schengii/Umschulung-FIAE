import React, { useState } from 'react';
import {
  COMPANY_FORMS,
  recommendCompanyForms
} from '../../utils/wisoCompanyFormsEngine';
import {
  Building2,
  Scale,
  Award,
  Filter
} from 'lucide-react';

export default function WisoCompanyFormsLab({ onRewardXP }) {
  const [selectedFormId, setSelectedFormId] = useState('gmbh');
  const [maxInitialCapital, setMaxInitialCapital] = useState(25000);
  const [needLimitedLiability, setNeedLimitedLiability] = useState(true);
  const [singleFounder, setSingleFounder] = useState(false);
  const [wantExternalInvestorsOnly, setWantExternalInvestorsOnly] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const selectedForm = COMPANY_FORMS.find(f => f.id === selectedFormId) || COMPANY_FORMS[0];

  const recommendations = recommendCompanyForms({
    maxInitialCapital,
    needLimitedLiability,
    singleFounder,
    wantExternalInvestorsOnly
  });

  const handleFinish = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      if (onRewardXP) onRewardXP(60);
    }
  };

  return (
    <div className="lab-container animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Building2 size={14} /> IHK WISO Rechtsformen
            </span>
            <span className="badge badge-indigo">HGB, BGB, GmbHG & AktG</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Rechtsformen & Haftungs-Entscheidungsmatrix
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Systematischer Vergleich von Einzelunternehmen, Personengesellschaften (GbR, OHG, KG) und Kapitalgesellschaften (UG, GmbH, AG).
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={isCompleted}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={18} />
          {isCompleted ? 'Abgeschlossen (+60 XP)' : 'Labor abschließen (+60 XP)'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Entscheidungs-Filter */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} color="var(--accent-teal)" /> Gründungskriterien & Filter
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Verfügbares Startkapital: <strong>{maxInitialCapital.toLocaleString('de-DE')} €</strong>
            </label>
            <input
              type="range"
              min="0"
              max="60000"
              step="5000"
              value={maxInitialCapital}
              onChange={(e) => setMaxInitialCapital(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={needLimitedLiability}
                onChange={(e) => setNeedLimitedLiability(e.target.checked)}
              />
              <span>Haftungsbeschränkung zwingend erforderlich (Privatvermögen schützen)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={singleFounder}
                onChange={(e) => setSingleFounder(e.target.checked)}
              />
              <span>Alleinige Gründung (1 Person ohne Mitgründer)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={wantExternalInvestorsOnly}
                onChange={(e) => setWantExternalInvestorsOnly(e.target.checked)}
              />
              <span>Reine Geldgeber / Investoren ohne operative Führungsbefugnis</span>
            </label>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-teal)', marginBottom: '8px', fontWeight: 600 }}>
              Passende Rechtsformen ({recommendations.length}):
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {recommendations.map(r => (
                <button
                  key={r.id}
                  className={`btn ${selectedFormId === r.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedFormId(r.id)}
                  style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                >
                  {r.name.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailansicht der gewählten Rechtsform */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              {selectedForm.name}
            </h3>
            <span className="badge badge-indigo">{selectedForm.category}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ color: 'var(--accent-amber)', fontSize: '0.8rem', fontWeight: 600 }}>HAFTUNG:</div>
              <div style={{ color: 'var(--text-main)' }}>{selectedForm.liability}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ color: 'var(--accent-teal)', fontSize: '0.8rem', fontWeight: 600 }}>MINDESTKAPITAL:</div>
              <div style={{ color: 'var(--text-main)' }}>{selectedForm.minCapital}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>HANDELSREGISTER (HRA / HRB):</div>
              <div style={{ color: 'var(--text-main)' }}>{selectedForm.commercialRegister}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>GESCHÄFTSFÜHRUNG & ORGANE:</div>
              <div style={{ color: 'var(--text-main)' }}>{selectedForm.management} • <em>Organe: {selectedForm.organs}</em></div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ color: 'var(--accent-teal)', fontSize: '0.8rem', fontWeight: 600 }}>TYPISCHER EINSATZZWECK:</div>
              <div style={{ color: 'var(--text-main)' }}>{selectedForm.bestFor}</div>
            </div>
          </div>
        </div>
      </div>

      {/* IHK Prüfungsmatrix */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scale size={18} color="var(--accent-teal)" /> IHK AP2 WISO Prüfungsklassiker: Handelsregister-Unterscheidung
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Abteilung A (HRA):</strong>
            <p style={{ margin: '4px 0 0' }}>Für <strong>Einzelkaufleute (e.K.)</strong> und <strong>Personengesellschaften (OHG, KG)</strong>. Kennzeichen: Mindestens ein Vollhafter haftet unbeschränkt mit dem Privatvermögen.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Abteilung B (HRB):</strong>
            <p style={{ margin: '4px 0 0' }}>Für <strong>Kapitalgesellschaften (GmbH, UG, AG)</strong>. Kennzeichen: Juristische Personen mit beschränkter Haftung auf das Gesellschaftsvermögen.</p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-main)' }}>Deklaratorisch vs. Konstitutiv:</strong>
            <p style={{ margin: '4px 0 0' }}>Ist-Kaufmann e.K. entsteht bereits mit Aufnahme der Geschäfte (Eintrag ist <em>rechtsbekundend/deklaratorisch</em>). GmbH/AG entstehen erst mit HRB-Eintrag (<em>rechtserzeugend/konstitutiv</em>).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
