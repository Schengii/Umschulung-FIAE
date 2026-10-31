import React, { useState } from 'react';
import { Database, AlertTriangle, CheckCircle2, Award, Layers, ShieldCheck } from 'lucide-react';
import {
  UNNORMALIZED_ORDER_DATA,
  FIRST_NORMAL_FORM_TABLE,
  SECOND_NORMAL_FORM_TABLES,
  THIRD_NORMAL_FORM_TABLES,
  DATABASE_ANOMALIES,
  evaluateNormalForm,
  NORMALIZATION_DRILL_QUESTIONS
} from '../../utils/databaseNormalizationEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';
import IhkDrillPanel from '../Shared/IhkDrillPanel';

export default function DatabaseNormalizationLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('stufen'); // 'stufen' | 'anomalien' | 'drill'
  const [selectedStage, setSelectedStage] = useState('1NF'); // '0NF' | '1NF' | '2NF' | '3NF'
  const [activeAnomalyId, setActiveAnomalyId] = useState('update_anomaly');
  const [xpClaimed, setXpClaimed] = useState(false);

  const stageEvaluation = evaluateNormalForm(selectedStage);
  const activeAnomaly = DATABASE_ANOMALIES.find(a => a.id === activeAnomalyId) || DATABASE_ANOMALIES[0];

  const handleEvaluateDrill = (correctCount) => {
    if (correctCount >= 3 && !xpClaimed) {
      setXpClaimed(true);
      if (onRewardXP) {
        onRewardXP(55, 'database_normalization_master');
      } else if (awardXP) {
        awardXP(55, 'database_normalization_master');
      }
      triggerHaptic('SUCCESS');
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* HEADER */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Database size={24} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800' }}>
                IHK Relationales Datenbank-Normalisierungs-Studio (1. NF, 2. NF, 3. NF)
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', maxWidth: '800px' }}>
              Überführe unnormalisierte Relationen schrittweise in die 1., 2. und 3. Normalform. Verstehe funktionale und transitive Abhängigkeiten und simuliere Datenanomalien (INSERT, UPDATE, DELETE).
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              IHK AP1 & AP2
            </span>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              +55 XP
            </span>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('stufen')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'stufen' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'stufen' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} /> Normalisierungs-Stufen (0NF - 3NF)
          </button>
          <button
            onClick={() => setActiveTab('anomalien')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'anomalien' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'anomalien' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={16} /> Anomalien-Simulator
          </button>
          <button
            onClick={() => setActiveTab('drill')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'drill' ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'drill' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Award size={16} /> IHK-Drill (+55 XP)
          </button>
        </div>
      </div>

      {/* TAB 1: NORMALISIERUNGS-STUFEN */}
      {activeTab === 'stufen' && (
        <div>
          {/* Stufen-Switcher Buttons */}
          <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {[
                { id: '0NF', label: '0. NF (Unnormalisiert)', desc: 'Wiederholgruppen & Mehrfachwerte' },
                { id: '1NF', label: '1. Normalform', desc: 'Atomare Attribute & Primärschlüssel' },
                { id: '2NF', label: '2. Normalform', desc: 'Keine partiellen Abhängigkeiten' },
                { id: '3NF', label: '3. Normalform', desc: 'Keine transitiven Abhängigkeiten' }
              ].map(stage => (
                <button
                  key={stage.id}
                  onClick={() => { setSelectedStage(stage.id); triggerHaptic('LIGHT'); }}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    border: selectedStage === stage.id ? '2px solid #10b981' : '1px solid var(--border-color, #334155)',
                    background: selectedStage === stage.id ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    color: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: selectedStage === stage.id ? '#34d399' : 'inherit' }}>
                    {stage.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>{stage.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Stufen-Erklärung */}
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid #10b981' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: '700' }}>
              Regel für {selectedStage}:
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-muted, #94a3b8)' }}>
              {stageEvaluation.rule}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {stageEvaluation.criteria.map((c, i) => (
                <span key={i} style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', fontSize: '0.78rem' }}>
                  • {c}
                </span>
              ))}
            </div>
          </div>

          {/* TABELLEN-DARSTELLUNG */}
          {selectedStage === '0NF' && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} /> Unnormalisierte Auftragsdaten (0. NF)
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '16px' }}>
                Mehrfachwerte in den Spalten "Kunde" (PLZ + Ort vermischt) und "Positionen" (mehrere Artikel in einer einzigen Zelle).
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155' }}>
                      <th style={{ padding: '8px 12px' }}>BestellNr</th>
                      <th style={{ padding: '8px 12px' }}>Bestelldatum</th>
                      <th style={{ padding: '8px 12px', color: '#f87171' }}>Kunde (nicht atomar!)</th>
                      <th style={{ padding: '8px 12px', color: '#f87171' }}>Positionen (Wiederholgruppe!)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {UNNORMALIZED_ORDER_DATA.map(row => (
                      <tr key={row.BestellNr} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: '700' }}>{row.BestellNr}</td>
                        <td style={{ padding: '8px 12px' }}>{row.Bestelldatum}</td>
                        <td style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.05)' }}>{row.Kunde}</td>
                        <td style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.05)' }}>{row.Positionen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedStage === '1NF' && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#34d399' }}>
                Tabelle: {FIRST_NORMAL_FORM_TABLE.name} (1. NF erreicht)
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '16px' }}>
                {FIRST_NORMAL_FORM_TABLE.description}
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155' }}>
                      {FIRST_NORMAL_FORM_TABLE.columns.map(col => (
                        <th key={col.name} style={{ padding: '8px 10px', color: col.isPrimaryKey ? '#34d399' : 'inherit' }}>
                          {col.label} {col.isPrimaryKey && '(PK)'}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FIRST_NORMAL_FORM_TABLE.sampleData.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: '#34d399' }}>{row.BestellNr}</td>
                        <td style={{ padding: '8px 10px' }}>{row.Bestelldatum}</td>
                        <td style={{ padding: '8px 10px' }}>{row.KundenNr}</td>
                        <td style={{ padding: '8px 10px' }}>{row.Kundenname}</td>
                        <td style={{ padding: '8px 10px' }}>{row.PLZ}</td>
                        <td style={{ padding: '8px 10px' }}>{row.Ort}</td>
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: '#34d399' }}>{row.ArtikelNr}</td>
                        <td style={{ padding: '8px 10px' }}>{row.Artikelname}</td>
                        <td style={{ padding: '8px 10px' }}>{row.Einzelpreis} €</td>
                        <td style={{ padding: '8px 10px', fontWeight: '700' }}>{row.Menge}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '0.82rem' }}>
                <strong>Problem in 1NF:</strong> Zusammengesetzter Primärschlüssel (BestellNr + ArtikelNr). Aber "Kundenname" hängt nur von "BestellNr" ab, und "Artikelname" nur von "ArtikelNr" (partielle funktionale Abhängigkeiten)!
              </div>
            </div>
          )}

          {selectedStage === '2NF' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {SECOND_NORMAL_FORM_TABLES.map(tbl => (
                <div key={tbl.name} className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#34d399' }}>
                    Tabelle: {tbl.name} (PK: {tbl.primaryKey.join(', ')})
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>{tbl.description}</p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #334155' }}>
                          {tbl.columns.map(col => (
                            <th key={col.name} style={{ padding: '6px 10px', color: col.isPrimaryKey ? '#34d399' : col.isForeignKey ? '#818cf8' : 'inherit' }}>
                              {col.label} {col.isPrimaryKey ? '(PK)' : col.isForeignKey ? '(FK)' : ''}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tbl.sampleData.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {tbl.columns.map(col => (
                              <td key={col.name} style={{ padding: '6px 10px' }}>
                                {String(row[col.name])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedStage === '3NF' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.88rem', fontWeight: '600' }}>
                <CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                Optimale 3. Normalform erreicht: Alle transitiven Abhängigkeiten aufgelöst (z.B. PLZ -&gt; Ort in eigene Tabelle ausgelagert).
              </div>
              {THIRD_NORMAL_FORM_TABLES.map(tbl => (
                <div key={tbl.name} className="glass-panel" style={{ padding: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#34d399' }}>
                    Tabelle: {tbl.name} (PK: {tbl.primaryKey.join(', ')})
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>{tbl.description}</p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #334155' }}>
                          {tbl.columns.map(col => (
                            <th key={col.name} style={{ padding: '6px 10px', color: col.isPrimaryKey ? '#34d399' : col.isForeignKey ? '#818cf8' : 'inherit' }}>
                              {col.label} {col.isPrimaryKey ? '(PK)' : col.isForeignKey ? '(FK)' : ''}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tbl.sampleData.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {tbl.columns.map(col => (
                              <td key={col.name} style={{ padding: '6px 10px' }}>
                                {String(row[col.name])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANOMALIEN-SIMULATOR */}
      {activeTab === 'anomalien' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            Die 3 klassischen Datenbank-Anomalien im Vergleich
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {DATABASE_ANOMALIES.map(anom => (
              <button
                key={anom.id}
                onClick={() => { setActiveAnomalyId(anom.id); triggerHaptic('LIGHT'); }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  border: activeAnomalyId === anom.id ? '2px solid #ef4444' : '1px solid var(--border-color, #334155)',
                  background: activeAnomalyId === anom.id ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: activeAnomalyId === anom.id ? '#f87171' : 'inherit' }}>
                  {anom.title}
                </div>
              </button>
            ))}
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color, #334155)', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '700', color: '#f87171' }}>
              Definition:
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.5' }}>
              {activeAnomaly.definition}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* 1NF Problem */}
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <div style={{ fontWeight: '700', color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} /> In 1. Normalform (Fehlerzustand):
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
                {activeAnomaly.scenario1NF}
              </p>
            </div>

            {/* 3NF Lösung */}
            <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <div style={{ fontWeight: '700', color: '#34d399', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} /> Gelöst in 3. Normalform:
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.5' }}>
                {activeAnomaly.solution3NF}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IHK DRILL */}
      {activeTab === 'drill' && (
        <IhkDrillPanel
          title="IHK Prüfungs-Drill: Normalisierung & Anomalien"
          questions={NORMALIZATION_DRILL_QUESTIONS}
          accentColor="#10b981"
          selectedBg="rgba(16, 185, 129, 0.2)"
          selectedBorderColor="#10b981"
          xpClaimed={xpClaimed}
          onEvaluate={handleEvaluateDrill}
        />
      )}
    </div>
  );
}
