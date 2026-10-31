import React, { useState } from 'react';
import { Award, Code2, GitBranch, Bug, Layers, Activity } from 'lucide-react';
import {
  ermittleAequivalenzklassen,
  ermittleGrenzwerte,
  berechneMcCabeKomplexitaet,
  berechneTestabdeckung,
  TESTVERFAHREN_DRILL_QUESTIONS
} from '../../utils/testverfahrenEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';
import IhkDrillPanel from '../Shared/IhkDrillPanel';

export default function TestverfahrenLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('blackbox'); // 'blackbox' | 'whitebox' | 'drill'
  const [xpClaimed, setXpClaimed] = useState(false);

  // 1. Black-Box State
  const [selectedPreset, setSelectedPreset] = useState('alter');
  const [customRange, setCustomRange] = useState({
    feldName: 'Alter',
    min: 18,
    max: 67,
    einheit: ' Jahre'
  });
  const [testInput, setTestInput] = useState('25');

  const presets = {
    alter: { feldName: 'Alter', min: 18, max: 67, einheit: ' Jahre' },
    rabatt: { feldName: 'Bestellwert', min: 100, max: 1000, einheit: ' €' },
    passwort: { feldName: 'Passwortlänge', min: 8, max: 32, einheit: ' Zeichen' },
    temperatur: { feldName: 'Serverraum-Temp', min: 18, max: 24, einheit: ' °C' }
  };

  const handlePresetChange = (key) => {
    setSelectedPreset(key);
    if (presets[key]) {
      setCustomRange(presets[key]);
      setTestInput(String(Math.round((presets[key].min + presets[key].max) / 2)));
    }
    triggerHaptic('LIGHT');
  };

  const aekList = ermittleAequivalenzklassen(customRange);
  const grenzwerteList = ermittleGrenzwerte(customRange.min, customRange.max);

  // Evaluation des eingegebenen Testwerts
  const numInput = Number(testInput);
  const isInputNumber = !isNaN(numInput) && testInput.trim() !== '';
  let inputAekResult = 'UÄK-3 (Typfehler)';
  let isInputValid = false;

  if (!isInputNumber) {
    inputAekResult = 'UÄK-3 (Nicht-numerischer Wert / Formatfehler)';
    isInputValid = false;
  } else if (numInput < customRange.min) {
    inputAekResult = `UÄK-1 (Unterhalb Minimum ${customRange.min})`;
    isInputValid = false;
  } else if (numInput > customRange.max) {
    inputAekResult = `UÄK-2 (Oberhalb Maximum ${customRange.max})`;
    isInputValid = false;
  } else {
    inputAekResult = `GÄK-1 (Im gültigen Wertebereich ${customRange.min}..${customRange.max})`;
    isInputValid = true;
  }

  // 2. White-Box State
  const [graphParams, setGraphParams] = useState({
    knoten: 8,
    kanten: 11,
    komponenten: 1
  });

  const [covParams, setCovParams] = useState({
    gesamtAnweisungen: 24,
    abgedeckteAnweisungen: 24,
    gesamtZweige: 8,
    abgedeckteZweige: 6,
    gesamtPfade: 16,
    abgedecktePfade: 4
  });

  const mccabeRes = berechneMcCabeKomplexitaet(graphParams);
  const covRes = berechneTestabdeckung(covParams);

  // 3. Drill
  const handleEvaluateDrill = (correctCount) => {
    if (correctCount >= 3 && !xpClaimed) {
      setXpClaimed(true);
      triggerHaptic('SUCCESS');
      const fn = onRewardXP || awardXP;
      fn?.(55, 'IHK Software-Testverfahren Master');
    } else {
      triggerHaptic(correctCount >= 2 ? 'SUCCESS' : 'WARNING');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-card, #1e293b)',
        padding: '1.5rem',
        borderRadius: '1rem',
        border: '1px solid var(--border-color, #334155)',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              display: 'flex',
              color: '#fff'
            }}>
              <Bug size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                IHK Software-Testverfahren & Grenzwertanalyse Studio
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                Black-Box Äquivalenzklassenbildung (GÄK/UÄK), 6-Punkte Grenzwertanalyse & McCabe Kontrollfluss-Komplexität ($M = E - N + 2P$)
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              padding: '0.35rem 0.75rem',
              borderRadius: '2rem',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              IHK AP2 FIAE Pflichtstoff
            </span>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              padding: '0.35rem 0.75rem',
              borderRadius: '2rem',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              +55 XP
            </span>
          </div>
        </div>

        {/* Tab-Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { id: 'blackbox', label: '1. Äquivalenzklassen & Grenzwerte (Black-Box)', icon: Layers },
            { id: 'whitebox', label: '2. McCabe & Überdeckungsmetriken (White-Box)', icon: GitBranch },
            { id: 'drill', label: '3. IHK Prüfungs-Drill (+55 XP)', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  triggerHaptic('LIGHT');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  background: isActive ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#fff' : 'var(--text-muted, #94a3b8)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: BLACK-BOX TESTING */}
      {activeTab === 'blackbox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Preset Buttons & Tester */}
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>IHK Prüfungs-Szenario:</span>
                {Object.keys(presets).map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePresetChange(key)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '0.4rem',
                      border: '1px solid var(--border-color, #334155)',
                      background: selectedPreset === key ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedPreset === key ? '#fff' : 'inherit',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    {presets[key].feldName} ({presets[key].min}..{presets[key].max})
                  </button>
                ))}
              </div>

              {/* Live Eingabetester */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Testwert eingeben:</label>
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  style={{
                    width: '90px',
                    padding: '0.4rem',
                    textAlign: 'center',
                    borderRadius: '0.4rem',
                    border: `2px solid ${isInputValid ? '#10b981' : '#ef4444'}`,
                    fontWeight: 700,
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            {/* Testwert Feedback Box */}
            <div style={{
              background: isInputValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: `1px solid ${isInputValid ? '#10b981' : '#ef4444'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.9rem'
            }}>
              <div>
                <strong>Zugeordnete Äquivalenzklasse:</strong> <span style={{ fontWeight: 600 }}>{inputAekResult}</span>
              </div>
              <div style={{ fontWeight: 700, color: isInputValid ? '#10b981' : '#ef4444' }}>
                Status: {isInputValid ? '✓ Gültig (Akzeptiert)' : '✗ Ungültig (Abgewiesen / Validierungsfehler)'}
              </div>
            </div>
          </div>

          {/* Äquivalenzklassen Tabelle */}
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="#6366f1" />
              1. Äquivalenzklassentabelle (ÄKB)
            </h2>

            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color, #334155)' }}>
                    <th style={{ padding: '0.6rem' }}>Klasse</th>
                    <th style={{ padding: '0.6rem' }}>Typ</th>
                    <th style={{ padding: '0.6rem' }}>Bedingung</th>
                    <th style={{ padding: '0.6rem' }}>Beschreibung</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Test-Repräsentant</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Soll-Ergebnis</th>
                  </tr>
                </thead>
                <tbody>
                  {aekList.map((aek) => (
                    <tr key={aek.id} style={{ borderBottom: '1px solid var(--border-color, #334155)' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 700 }}>{aek.id}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <span style={{
                          background: aek.typ === 'GÄK' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: aek.typ === 'GÄK' ? '#10b981' : '#ef4444',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.3rem',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {aek.typ}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', fontFamily: 'monospace' }}>{aek.bedingung}</td>
                      <td style={{ padding: '0.6rem' }}>{aek.bezeichnung}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', fontWeight: 600 }}>{aek.repraesentant}</td>
                      <td style={{ padding: '0.6rem', textAlign: 'center', fontWeight: 700, color: aek.erwartetesErgebnis === 'GÜLTIG' ? '#10b981' : '#ef4444' }}>
                        {aek.erwartetesErgebnis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <strong>IHK-Merksatz:</strong> Ein repräsentativer Testwert pro Äquivalenzklasse genügt zur vollständigen Abdeckung der Klasse, da das System für alle Werte derselben Klasse dasselbe Verhalten zeigen muss.
            </div>
          </div>

          {/* 6-Punkte Grenzwertanalyse */}
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code2 size={20} color="#6366f1" />
              2. 6-Punkte Grenzwertanalyse (Boundary Value Analysis)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {grenzwerteList.map((gw, idx) => (
                <div
                  key={idx}
                  style={{
                    background: gw.status === 'GÜLTIG' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${gw.status === 'GÜLTIG' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>{gw.bezeichnung}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.3rem',
                        background: gw.status === 'GÜLTIG' ? '#10b981' : '#ef4444',
                        color: '#fff'
                      }}>
                        {gw.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: gw.status === 'GÜLTIG' ? '#10b981' : '#ef4444', marginBottom: '0.35rem' }}>
                      {gw.wert}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', lineHeight: '1.3' }}>
                    {gw.beschreibung}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHITE-BOX TESTING */}
      {activeTab === 'whitebox' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* McCabe Rechner */}
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitBranch size={20} color="#6366f1" />
              McCabe Zyklomatische Komplexität
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
                  Anzahl Kanten (Edges E): {graphParams.kanten}
                </label>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={graphParams.kanten}
                  onChange={(e) => setGraphParams({ ...graphParams, kanten: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
                  Anzahl Knoten (Nodes N): {graphParams.knoten}
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={graphParams.knoten}
                  onChange={(e) => setGraphParams({ ...graphParams, knoten: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
                  Zusammenhängende Komponenten (P): {graphParams.komponenten}
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={graphParams.komponenten}
                  onChange={(e) => setGraphParams({ ...graphParams, komponenten: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              border: '1px solid #6366f1',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>
                Formel: M = E - N + 2P = {graphParams.kanten} - {graphParams.knoten} + 2({graphParams.komponenten})
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
                M = {mccabeRes.mccabeKomplexitaet}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '0.3rem',
                background: mccabeRes.risikoKlasse === 'NIEDRIG' ? '#10b981' : mccabeRes.risikoKlasse === 'MITTEL' ? '#f59e0b' : '#ef4444',
                color: '#fff'
              }}>
                Risiko: {mccabeRes.risikoKlasse}
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', lineHeight: '1.4' }}>
              {mccabeRes.empfehlung}
            </p>
          </div>

          {/* Testüberdeckungs Metriken (C0, C1, C2) */}
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color, #334155)'
          }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#10b981" />
              Kontrollfluss-Überdeckungsmetriken
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* C0 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                  <span><strong>C0: Anweisungsüberdeckung</strong> (Statement Coverage)</span>
                  <strong style={{ color: covRes.istC0Vollstaendig ? '#10b981' : '#f59e0b' }}>{covRes.c0AnweisungsUeberdeckung}%</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${covRes.c0AnweisungsUeberdeckung}%`, background: covRes.istC0Vollstaendig ? '#10b981' : '#f59e0b', height: '100%' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem' }}>
                  Wurde jede Zeile/Anweisung im Quellcode mindestens einmal ausgeführt?
                </div>
              </div>

              {/* C1 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                  <span><strong>C1: Zweigüberdeckung</strong> (Branch Coverage)</span>
                  <strong style={{ color: covRes.istC1Vollstaendig ? '#10b981' : '#f59e0b' }}>{covRes.c1ZweigUeberdeckung}%</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${covRes.c1ZweigUeberdeckung}%`, background: covRes.istC1Vollstaendig ? '#10b981' : '#f59e0b', height: '100%' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem' }}>
                  Wurde jede Verzweigungskante (true & false) durchlaufen? (100% C1 impliziert 100% C0).
                </div>
              </div>

              {/* C2 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                  <span><strong>C2: Pfadüberdeckung</strong> (Path Coverage)</span>
                  <strong style={{ color: '#6366f1' }}>{covRes.c2PfadUeberdeckung}%</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${covRes.c2PfadUeberdeckung}%`, background: '#6366f1', height: '100%' }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem' }}>
                  Wurden alle theoretisch möglichen Ausführungspfade getestet? (Bei Schleifen oft exponentiell viele).
                </div>
              </div>

              {/* Regler für Zweige */}
              <div style={{ borderTop: '1px solid var(--border-color, #334155)', paddingTop: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '0.25rem' }}>
                  Abgedeckte Zweige ({covParams.abgedeckteZweige} von {covParams.gesamtZweige}):
                </label>
                <input
                  type="range"
                  min="0"
                  max={covParams.gesamtZweige}
                  value={covParams.abgedeckteZweige}
                  onChange={(e) => setCovParams({ ...covParams, abgedeckteZweige: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IHK PRÜFUNGS-DRILL */}
      {activeTab === 'drill' && (
        <IhkDrillPanel
          title="IHK Prüfungs-Drill: Software-Testverfahren & Metriken"
          questions={TESTVERFAHREN_DRILL_QUESTIONS}
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
