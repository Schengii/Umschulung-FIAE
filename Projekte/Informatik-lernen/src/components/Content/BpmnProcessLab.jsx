import React, { useState } from 'react';
import {
  Workflow,
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers
} from 'lucide-react';
import {
  validateBpmnProcess,
  stepBpmnExecution,
  IHK_BPMN_TEMPLATES
} from '../../utils/bpmnProcessEngine';

const IHK_DRILL_QUESTIONS = [
  {
    id: 1,
    question: 'Welches Gateway teilt einen Sequenzfluss in mehrere parallele Zweige auf, die alle gleichzeitig ausgeführt werden?',
    options: [
      'Exklusives Gateway (XOR, X-Symbol)',
      'Paralleles Gateway (AND, +-Symbol)',
      'Inklusives Gateway (OR, O-Symbol)',
      'Ereignisbasiertes Gateway'
    ],
    correctIndex: 1,
    explanation: 'Das parallele Gateway (AND, gekennzeichnet durch ein Pluszeichen) erzeugt für jeden ausgehenden Pfad einen eigenen Token, die synchron ablaufen.'
  },
  {
    id: 2,
    question: 'Was symbolisiert eine "Swimlane" (Schwimmbahn) innerhalb eines BPMN-Pools?',
    options: [
      'Die zeitliche Dauer einer Prozessaktivität',
      'Eine organisatorische Rolle, Abteilung oder Systemkomponente',
      'Eine externe Schnittstelle zu Drittanbietern',
      'Einen physikalischen Netzwerk-Switch'
    ],
    correctIndex: 1,
    explanation: 'In BPMN 2.0 unterteilen Swimlanes einen Pool in Verantwortungsbereiche wie Rollen (z. B. Sachbearbeiter, Kunde) oder Abteilungen (Vertrieb, Logistik, Buchhaltung).'
  },
  {
    id: 3,
    question: 'Welche Aussage zur Modellierung von Startereignissen nach BPMN 2.0 ist korrekt?',
    options: [
      'Ein Startereignis muss mindestens zwei eingehende Sequenzflüsse haben.',
      'Ein Prozess darf erst ab 5 Aktivitäten ein Startereignis verwenden.',
      'Ein Startereignis darf NIEMALS einen eingehenden Sequenzfluss besitzen.',
      'Startereignisse werden durch einen dicken, doppelten Kreisrand dargestellt.'
    ],
    correctIndex: 2,
    explanation: 'Startereignisse initiieren den Prozessfluss und dürfen keine eingehenden Sequenzflüsse besitzen. Der doppelte Kreisrand steht für Zwischenereignisse (Intermediate Events).'
  }
];

export default function BpmnProcessLab({ onRewardXP = () => {} }) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('order_fulfillment');
  const [processData, setProcessData] = useState(IHK_BPMN_TEMPLATES.order_fulfillment);
  const [activeTokenNodeIds, setActiveTokenNodeIds] = useState(['start_1']);
  const [activeTab, setActiveTab] = useState('modeler');
  const [xorChoice, setXorChoice] = useState('Ja');
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillSubmitted, setDrillSubmitted] = useState(false);
  const [claimedXP, setClaimedXP] = useState(false);

  // Validate Process
  const validation = validateBpmnProcess(processData);

  const handleSelectTemplate = (key) => {
    setSelectedTemplateKey(key);
    const tmpl = IHK_BPMN_TEMPLATES[key];
    setProcessData(tmpl);
    const firstStart = tmpl.nodes.find((n) => n.type === 'START_EVENT');
    setActiveTokenNodeIds(firstStart ? [firstStart.id] : []);
  };

  const handleResetSimulation = () => {
    const firstStart = processData.nodes.find((n) => n.type === 'START_EVENT');
    setActiveTokenNodeIds(firstStart ? [firstStart.id] : []);
  };

  const handleStepForward = () => {
    const next = stepBpmnExecution(processData, activeTokenNodeIds, xorChoice);
    if (next.length > 0) {
      setActiveTokenNodeIds(next);
    }
  };

  const handleDrillSubmit = () => {
    setDrillSubmitted(true);
    let correct = 0;
    IHK_DRILL_QUESTIONS.forEach((q) => {
      if (drillAnswers[q.id] === q.correctIndex) correct++;
    });

    if (correct === IHK_DRILL_QUESTIONS.length && !claimedXP) {
      onRewardXP(55, 'bpmn_process_master');
      setClaimedXP(true);
    }
  };

  return (
    <div className="bpmn-lab-container" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.15) 0%, rgba(109, 40, 217, 0.15) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Workflow size={28} style={{ color: 'var(--accent-teal)' }} />
              <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
                BPMN 2.0 Geschäftsprozessmodellierung & Swimlanes Studio
              </h1>
            </div>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-dim)', fontSize: '0.95rem' }}>
              Offizieller IHK-Standard für FIDP, Kaufleute IT-Systemmanagement & FIAE (LF 2 & 3): Events, Gateways, Swimlanes & Token-Simulation
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleSelectTemplate('order_fulfillment')}
              aria-label="Vorlage Auftragsabwicklung wählen"
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: selectedTemplateKey === 'order_fulfillment' ? 'var(--accent-teal)' : 'var(--bg-card)',
                color: selectedTemplateKey === 'order_fulfillment' ? '#ffffff' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Auftragsabwicklung (E-Commerce)
            </button>
            <button
              type="button"
              onClick={() => handleSelectTemplate('incident_management')}
              aria-label="Vorlage Incident Management wählen"
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: selectedTemplateKey === 'incident_management' ? 'var(--accent-purple)' : 'var(--bg-card)',
                color: selectedTemplateKey === 'incident_management' ? '#ffffff' : 'var(--text-main)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Incident Management (ITIL)
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          {[
            { id: 'modeler', label: 'Prozess-Canvas & Swimlanes', icon: Layers },
            { id: 'linter', label: `IHK-Compliance Linter (${validation.score}%)`, icon: ShieldCheck },
            { id: 'drill', label: 'IHK-Prüfungsdrill (+55 XP)', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? '1px solid var(--accent-teal)' : '1px solid transparent',
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--accent-teal)' : 'var(--text-dim)',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Process Modeler & Simulation View */}
      {activeTab === 'modeler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Simulation Controls */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Token-Simulation:</span>
              <button
                type="button"
                onClick={handleStepForward}
                aria-label="Einen Schritt im Prozess vorwärts gehen"
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  background: 'var(--accent-teal)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem'
                }}
              >
                <Play size={14} /> Schritt vorwärts
              </button>
              <button
                type="button"
                onClick={handleResetSimulation}
                aria-label="Simulation auf Start zurücksetzen"
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span>XOR-Bedingungsauswahl:</span>
              <button
                type="button"
                onClick={() => setXorChoice('Ja')}
                aria-label="XOR-Bedingung Ja wählen"
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-color)',
                  background: xorChoice === 'Ja' ? 'var(--accent-teal)' : 'var(--bg-primary)',
                  color: xorChoice === 'Ja' ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Ja (Positiv)
              </button>
              <button
                type="button"
                onClick={() => setXorChoice('Nein')}
                aria-label="XOR-Bedingung Nein wählen"
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-color)',
                  background: xorChoice === 'Nein' ? 'var(--accent-rose)' : 'var(--bg-primary)',
                  color: xorChoice === 'Nein' ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Nein (Abbruch/Eskalation)
              </button>
            </div>
          </div>

          {/* Swimlanes Canvas */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflowX: 'auto',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ minWidth: '760px' }}>
              {processData.lanes.map((lane) => {
                const laneNodes = processData.nodes.filter((n) => n.laneId === lane.id);

                return (
                  <div
                    key={lane.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '180px 1fr',
                      borderBottom: '1px solid var(--border-subtle)',
                      minHeight: '110px'
                    }}
                  >
                    {/* Swimlane Label */}
                    <div
                      style={{
                        background: lane.color ? `${lane.color}15` : 'var(--bg-primary)',
                        borderRight: '2px solid var(--border-color)',
                        padding: '1rem',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        color: lane.color || 'var(--text-main)'
                      }}
                    >
                      {lane.name}
                    </div>

                    {/* Nodes in this Lane */}
                    <div
                      style={{
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      {laneNodes.length === 0 ? (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          Keine Aktivitäten in dieser Lane
                        </span>
                      ) : (
                        laneNodes.map((node) => {
                          const isTokenActive = activeTokenNodeIds.includes(node.id);
                          const isStart = node.type === 'START_EVENT';
                          const isEnd = node.type === 'END_EVENT';
                          const isGateway = node.type.startsWith('GATEWAY_');

                          let symbol = null;
                          if (node.type === 'GATEWAY_XOR') symbol = 'X';
                          if (node.type === 'GATEWAY_AND') symbol = '+';
                          if (node.type === 'GATEWAY_OR') symbol = 'O';

                          return (
                            <div
                              key={node.id}
                              style={{
                                padding: isGateway ? '0.6rem 0.8rem' : isStart || isEnd ? '0.6rem 0.9rem' : '0.6rem 1rem',
                                borderRadius: isStart || isEnd ? '999px' : isGateway ? 'var(--radius-xs)' : 'var(--radius-sm)',
                                border: isTokenActive
                                  ? '2px solid var(--accent-teal)'
                                  : isStart
                                  ? '2px solid var(--accent-emerald)'
                                  : isEnd
                                  ? '3px double var(--accent-rose)'
                                  : '1px solid var(--border-color)',
                                background: isTokenActive
                                  ? 'rgba(15, 118, 110, 0.2)'
                                  : isStart
                                  ? 'rgba(4, 120, 87, 0.1)'
                                  : isEnd
                                  ? 'rgba(190, 18, 60, 0.1)'
                                  : 'var(--bg-primary)',
                                transform: isTokenActive ? 'scale(1.05)' : 'none',
                                transition: 'all 0.2s ease',
                                boxShadow: isTokenActive ? '0 0 12px rgba(15, 118, 110, 0.4)' : 'var(--shadow-sm)',
                                maxWidth: '240px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {isGateway && (
                                  <span
                                    style={{
                                      fontWeight: 800,
                                      fontSize: '0.9rem',
                                      color: 'var(--accent-amber)',
                                      background: 'rgba(180, 83, 9, 0.15)',
                                      padding: '0.1rem 0.35rem',
                                      borderRadius: '3px'
                                    }}
                                  >
                                    {symbol}
                                  </span>
                                )}
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{node.name}</span>
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                                {node.type.replace(/_/g, ' ')}
                                {isTokenActive && ' • [AKTIVER TOKEN]'}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Linter Tab */}
      {activeTab === 'linter' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} style={{ color: 'var(--accent-teal)' }} />
              IHK-Konformitäts-Linter nach OMG BPMN 2.0
            </h2>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: validation.isValid ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                background: validation.isValid ? 'rgba(4, 120, 87, 0.1)' : 'rgba(190, 18, 60, 0.1)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                border: `1px solid ${validation.isValid ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
              }}
            >
              Prüfungsscore: {validation.score} / 100
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {validation.errors.length === 0 && validation.warnings.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(4, 120, 87, 0.1)',
                  border: '1px solid var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <CheckCircle2 size={22} style={{ color: 'var(--accent-emerald)' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Prozess ist 100% IHK- und OMG-konform</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    Keine Sackgassen, sauber schließende Gateways, gültige Startereignisse und vollständige Swimlane-Zuordnung.
                  </div>
                </div>
              </div>
            ) : (
              <>
                {validation.errors.map((err) => (
                  <div
                    key={err}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(190, 18, 60, 0.08)',
                      border: '1px solid var(--accent-rose)',
                      color: 'var(--accent-rose)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <AlertTriangle size={16} /> <strong>Fehler:</strong> {err}
                  </div>
                ))}
                {validation.warnings.map((warn) => (
                  <div
                    key={warn}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(180, 83, 9, 0.08)',
                      border: '1px solid var(--accent-amber)',
                      color: 'var(--accent-amber)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <AlertTriangle size={16} /> <strong>Warnung:</strong> {warn}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Drill Tab */}
      {activeTab === 'drill' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={22} style={{ color: 'var(--accent-amber)' }} />
                IHK-Prüfungsdrill: BPMN 2.0 Meisterschaft
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Beantworte alle 3 Prüfungsfragen korrekt, um +55 XP zu verdienen.
              </p>
            </div>
            {claimedXP && (
              <span
                style={{
                  background: 'rgba(4, 120, 87, 0.15)',
                  color: 'var(--accent-emerald)',
                  border: '1px solid var(--accent-emerald)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                +55 XP Freigeschaltet!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {IHK_DRILL_QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  {idx + 1}. {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = drillAnswers[q.id] === optIdx;
                    const isCorrect = q.correctIndex === optIdx;
                    let borderCol = 'var(--border-color)';
                    let bgCol = 'var(--bg-card)';

                    if (drillSubmitted) {
                      if (isCorrect) {
                        borderCol = 'var(--accent-emerald)';
                        bgCol = 'rgba(4, 120, 87, 0.1)';
                      } else if (isSelected) {
                        borderCol = 'var(--accent-rose)';
                        bgCol = 'rgba(190, 18, 60, 0.1)';
                      }
                    } else if (isSelected) {
                      borderCol = 'var(--accent-teal)';
                      bgCol = 'rgba(15, 118, 110, 0.08)';
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => !drillSubmitted && setDrillAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        aria-label={`Antwort ${optIdx + 1}: ${opt}`}
                        style={{
                          textAlign: 'left',
                          padding: '0.6rem 0.8rem',
                          borderRadius: 'var(--radius-xs)',
                          border: `1px solid ${borderCol}`,
                          background: bgCol,
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          cursor: drillSubmitted ? 'default' : 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {drillSubmitted && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', marginRight: '0.3rem', color: 'var(--accent-teal)' }} />
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            {drillSubmitted ? (
              <button
                type="button"
                onClick={() => {
                  setDrillSubmitted(false);
                  setDrillAnswers({});
                }}
                aria-label="Prüfungsdrill wiederholen"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Nochmals versuchen
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDrillSubmit}
                aria-label="Antworten prüfen und XP sichern"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'var(--accent-teal)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Antworten auswerten
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
