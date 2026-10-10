import React, { useState } from 'react';
import { Award, GitFork, Play, RotateCcw, ArrowRight, ArrowLeft, BookOpen, Layers, ChevronRight } from 'lucide-react';
import {
  STRUKTOGRAMM_PRESETS,
  traceRabattStaffel,
  traceMaximumSuche,
  traceKapitalVerdopplung,
  DIN_66261_ELEMENTS,
  STRUKTOGRAMM_DRILL_QUESTIONS
} from '../../utils/struktogrammEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';
import IhkDrillPanel from '../Shared/IhkDrillPanel';

export default function StruktogrammLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('visualizer'); // 'visualizer' | 'trace' | 'elements' | 'drill'
  const [selectedPresetId, setSelectedPresetId] = useState('rabatt_staffel');
  const [xpClaimed, setXpClaimed] = useState(false);

  // Trace Table State
  const [traceInputVal, setTraceInputVal] = useState('350');
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activePreset = STRUKTOGRAMM_PRESETS.find(p => p.id === selectedPresetId) || STRUKTOGRAMM_PRESETS[0];

  // Trace Steps abhängig vom gewählten Szenario
  let traceSteps = [];
  if (selectedPresetId === 'rabatt_staffel') {
    const val = Number(traceInputVal) || 0;
    traceSteps = traceRabattStaffel(val);
  } else if (selectedPresetId === 'maximum_suche') {
    traceSteps = traceMaximumSuche([12, 45, 8, 32]);
  } else if (selectedPresetId === 'zinseszins_verdopplung') {
    traceSteps = traceKapitalVerdopplung(1000, 5);
  }

  const currentStep = traceSteps[activeStepIndex] || traceSteps[0] || null;

  const handlePresetSelect = (id) => {
    setSelectedPresetId(id);
    setActiveStepIndex(0);
    if (id === 'rabatt_staffel') setTraceInputVal('350');
    triggerHaptic('LIGHT');
  };

  const handleStepNext = () => {
    if (activeStepIndex < traceSteps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
      triggerHaptic('LIGHT');
    }
  };

  const handleStepPrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
      triggerHaptic('LIGHT');
    }
  };

  const handleStepReset = () => {
    setActiveStepIndex(0);
    triggerHaptic('MEDIUM');
  };

  const handleEvaluateDrill = (correctCount) => {
    if (correctCount >= 3 && !xpClaimed) {
      setXpClaimed(true);
      if (onRewardXP) {
        onRewardXP(55, 'struktogramm_master');
      } else if (awardXP) {
        awardXP(55, 'struktogramm_master');
      }
      triggerHaptic('SUCCESS');
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* HEADER */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <GitFork size={24} />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800' }}>
                DIN 66261 Nassi-Shneiderman Struktogramm & Schreibtischtest Studio
              </h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', maxWidth: '780px' }}>
              Interaktive Visualisierung von Sequenzen, Verzweigungen und Schleifen. Führe schrittweise Schreibtischtests (Trace Tables) mit Live-Variablenbelegung durch – ein Kernbestandteil der IHK AP1 & AP2 Prüfungen.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              DIN 66261
            </span>
            <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              +55 XP
            </span>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('visualizer')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'visualizer' ? 'var(--accent-primary, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'visualizer' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} /> Struktogramm-Renderer
          </button>
          <button
            onClick={() => setActiveTab('trace')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'trace' ? 'var(--accent-primary, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'trace' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Play size={16} /> Schreibtischtest (Trace)
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'elements' ? 'var(--accent-primary, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'elements' ? '#fff' : 'var(--text-muted, #94a3b8)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={16} /> DIN 66261 Bausteine
          </button>
          <button
            onClick={() => setActiveTab('drill')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'drill' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
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

      {/* SZENARIEN-AUSWAHL FÜR VISUALIZER & TRACE */}
      {(activeTab === 'visualizer' || activeTab === 'trace') && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', marginBottom: '8px' }}>
            IHK Prüfungs-Szenario wählen:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {STRUKTOGRAMM_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  border: selectedPresetId === preset.id ? '2px solid #6366f1' : '1px solid var(--border-color, #334155)',
                  background: selectedPresetId === preset.id ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.92rem', marginBottom: '4px' }}>{preset.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>{preset.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: STRUKTOGRAMM RENDERER */}
      {activeTab === 'visualizer' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            {activePreset.title} (DIN 66261 Darstellung)
          </h2>

          {/* VISUELLES STRUKTOGRAMM */}
          <div style={{ maxWidth: '680px', margin: '0 auto', border: '3px solid #6366f1', borderRadius: '4px', background: 'var(--bg-card, #1e293b)', overflow: 'hidden' }}>
            {/* Header Block */}
            <div style={{ padding: '12px 16px', borderBottom: '2px solid #6366f1', background: 'rgba(99, 102, 241, 0.1)', fontWeight: '700', fontSize: '0.95rem' }}>
              Programm: {activePreset.id.toUpperCase()}
            </div>

            {selectedPresetId === 'rabatt_staffel' && (
              <>
                <div style={{ padding: '10px 16px', borderBottom: '2px solid #6366f1' }}>
                  Eingabe: <code>bestellwert</code>
                </div>

                {/* Verzweigung bestellwert >= 500 */}
                <div style={{ borderBottom: '2px solid #6366f1' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', borderBottom: '1px solid #475569', fontSize: '0.85rem' }}>
                    <div style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontWeight: '700' }}>Ja (True)</div>
                    <div style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontWeight: '700', borderLeft: '1px solid #475569' }}>Nein (False)</div>
                  </div>
                  <div style={{ padding: '6px 12px', textAlign: 'center', fontWeight: '700', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid #475569' }}>
                    bestellwert &gt;= 500 ?
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    <div style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#34d399' }}>
                      rabattsatz = 10
                    </div>
                    {/* Verschachtelte Verzweigung >= 200 */}
                    <div style={{ borderLeft: '1px solid #475569' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', borderBottom: '1px solid #475569', fontSize: '0.8rem' }}>
                        <div style={{ padding: '4px', color: '#34d399', fontWeight: '700' }}>Ja</div>
                        <div style={{ padding: '4px', color: '#f87171', fontWeight: '700', borderLeft: '1px solid #475569' }}>Nein</div>
                      </div>
                      <div style={{ padding: '4px 8px', textAlign: 'center', fontSize: '0.82rem', fontWeight: '700', borderBottom: '1px solid #475569' }}>
                        bestellwert &gt;= 200 ?
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.85rem' }}>
                        <div style={{ padding: '8px', textAlign: 'center' }}>rabattsatz = 5</div>
                        <div style={{ padding: '8px', textAlign: 'center', borderLeft: '1px solid #475569' }}>rabattsatz = 0</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '10px 16px', borderBottom: '2px solid #6366f1' }}>
                  rabattbetrag = (bestellwert * rabattsatz) / 100
                </div>
                <div style={{ padding: '10px 16px', borderBottom: '2px solid #6366f1' }}>
                  endpreis = bestellwert - rabattbetrag
                </div>
                <div style={{ padding: '10px 16px' }}>
                  Ausgabe: <code>rabattbetrag, endpreis</code>
                </div>
              </>
            )}

            {selectedPresetId === 'maximum_suche' && (
              <>
                <div style={{ padding: '10px 16px', borderBottom: '2px solid #6366f1' }}>
                  Eingabe: <code>werte[0..3] = [12, 45, 8, 32]</code>
                </div>
                <div style={{ padding: '10px 16px', borderBottom: '2px solid #6366f1' }}>
                  <code>max = werte[0]</code>
                </div>
                {/* Zählschleife FOR */}
                <div style={{ borderBottom: '2px solid #6366f1', display: 'flex' }}>
                  <div style={{ width: '40px', background: 'rgba(99, 102, 241, 0.2)', borderRight: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', fontSize: '0.78rem', fontWeight: '700', padding: '10px 0', letterSpacing: '2px' }}>
                    FOR (i=1..3)
                  </div>
                  <div style={{ flex: 1, padding: '10px' }}>
                    <div style={{ border: '1px solid #475569', borderRadius: '4px' }}>
                      <div style={{ padding: '6px', textAlign: 'center', fontWeight: '700', fontSize: '0.85rem', borderBottom: '1px solid #475569' }}>
                        werte[i] &gt; max ?
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.85rem' }}>
                        <div style={{ padding: '8px', textAlign: 'center', color: '#34d399', fontWeight: '600' }}>max = werte[i]</div>
                        <div style={{ padding: '8px', textAlign: 'center', borderLeft: '1px solid #475569', color: 'var(--text-muted)' }}>tue nichts</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '10px 16px' }}>
                  Ausgabe: <code>max</code>
                </div>
              </>
            )}

            {selectedPresetId === 'zinseszins_verdopplung' && (
              <>
                <div style={{ padding: '10px 16px', borderBottom: '2px solid #6366f1' }}>
                  <code>kapital = startkapital; jahre = 0</code>
                </div>
                {/* WHILE Schleife */}
                <div style={{ borderBottom: '2px solid #6366f1', display: 'flex' }}>
                  <div style={{ width: '40px', background: 'rgba(16, 185, 129, 0.2)', borderRight: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', writingMode: 'vertical-rl', fontSize: '0.78rem', fontWeight: '700', padding: '10px 0', letterSpacing: '2px', color: '#34d399' }}>
                    WHILE
                  </div>
                  <div style={{ flex: 1, padding: '10px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', marginBottom: '8px' }}>
                      Solange: <code>kapital &lt; startkapital * 2</code>
                    </div>
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '6px' }}>
                      kapital = kapital * (1 + p / 100)
                    </div>
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                      jahre = jahre + 1
                    </div>
                  </div>
                </div>
                <div style={{ padding: '10px 16px' }}>
                  Ausgabe: <code>jahre, kapital</code>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHREIBTISCHTEST TRACE TABLE */}
      {activeTab === 'trace' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
                Schreibtischtest: Schritt-für-Schritt Ablaufverfolgung
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
                Schritt {activeStepIndex + 1} von {traceSteps.length}
              </div>
            </div>

            {selectedPresetId === 'rabatt_staffel' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Test-Bestellwert (€):</label>
                <input
                  type="number"
                  value={traceInputVal}
                  onChange={(e) => { setTraceInputVal(e.target.value); setActiveStepIndex(0); }}
                  style={{ width: '100px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color, #334155)', background: 'var(--bg-card, #0f172a)', color: 'inherit' }}
                />
              </div>
            )}

            {/* Steuerungstasten */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleStepPrev}
                disabled={activeStepIndex === 0}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #334155)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'inherit',
                  cursor: activeStepIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: activeStepIndex === 0 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={16} /> Zurück
              </button>
              <button
                onClick={handleStepNext}
                disabled={activeStepIndex >= traceSteps.length - 1}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#6366f1',
                  color: '#fff',
                  fontWeight: '700',
                  cursor: activeStepIndex >= traceSteps.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: activeStepIndex >= traceSteps.length - 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Schritt weiter <ArrowRight size={16} />
              </button>
              <button
                onClick={handleStepReset}
                title="Zurücksetzen"
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #334155)',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* AKTUELLER SCHRITT HIGHLIGHT */}
          {currentStep && (
            <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#818cf8', marginBottom: '4px' }}>
                <ChevronRight size={18} /> Takt {currentStep.stepNumber}: {currentStep.action}
              </div>
              <div style={{ fontSize: '0.92rem' }}>{currentStep.description}</div>
            </div>
          )}

          {/* TABELLE DES SCHREIBTISCHTESTS */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color, #334155)', color: 'var(--text-muted, #94a3b8)' }}>
                  <th style={{ padding: '8px 12px' }}>Takt</th>
                  <th style={{ padding: '8px 12px' }}>Aktion</th>
                  <th style={{ padding: '8px 12px' }}>Variablenbelegung</th>
                  <th style={{ padding: '8px 12px' }}>Erklärung / IHK-Kommentar</th>
                </tr>
              </thead>
              <tbody>
                {traceSteps.map((s, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: idx === activeStepIndex ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      fontWeight: idx === activeStepIndex ? '700' : 'normal'
                    }}
                  >
                    <td style={{ padding: '8px 12px' }}>#{s.stepNumber}</td>
                    <td style={{ padding: '8px 12px', color: '#818cf8' }}>{s.action}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>
                      {Object.entries(s.variables)
                        .filter(([k]) => k !== 'array')
                        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                        .join(' | ')}
                    </td>
                    <td style={{ padding: '8px 12px' }}>{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DIN 66261 BAUSTEINE */}
      {activeTab === 'elements' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginTop: 0, marginBottom: '16px' }}>
            DIN 66261 Normelemente im Überblick
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {DIN_66261_ELEMENTS.map(el => (
              <div key={el.type} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #334155)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{ fontWeight: '700', color: '#818cf8', fontSize: '0.95rem', marginBottom: '4px' }}>
                  {el.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '8px', fontWeight: '600' }}>
                  Symbol: {el.symbol}
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.45' }}>
                  {el.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: IHK DRILL */}
      {activeTab === 'drill' && (
        <IhkDrillPanel
          title="IHK Prüfungs-Drill: DIN 66261 & Schreibtischtests"
          questions={STRUKTOGRAMM_DRILL_QUESTIONS}
          accentColor="#6366f1"
          selectedBg="rgba(99, 102, 241, 0.2)"
          selectedBorderColor="#6366f1"
          xpClaimed={xpClaimed}
          onEvaluate={handleEvaluateDrill}
        />
      )}
    </div>
  );
}
