import React, { useState } from 'react';
import {
  Network,
  Clock,
  ArrowRightLeft,
  HelpCircle,
  Zap,
  Info,
  Layers,
  Award
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  DATA_UNITS,
  SPEED_UNITS,
  PRESET_CONNECTIONS,
  IHK_SCENARIOS,
  calculateTransferTime
} from '../../utils/transferTimeEngine';

export default function IhkTransferTimeLab() {
  const { setUserState } = useStore();
  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'scenarios' | 'quiz'

  // Calculator State
  const [dataAmount, setDataAmount] = useState(10);
  const [dataUnit, setDataUnit] = useState('GB');
  const [speedAmount, setSpeedAmount] = useState(100);
  const [speedUnit, setSpeedUnit] = useState('MBPS');
  const [overheadPercent, setOverheadPercent] = useState(10);

  // Quiz State
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState({});
  const [earnedXp, setEarnedXp] = useState(false);

  const result = calculateTransferTime({
    dataAmount: Number(dataAmount) || 0,
    dataUnit,
    speedAmount: Number(speedAmount) || 0,
    speedUnit,
    overheadPercent: Number(overheadPercent) || 0,
  });

  const handleApplyPreset = (preset) => {
    setSpeedAmount(preset.downMbps);
    setSpeedUnit('MBPS');
  };

  const handleApplyScenario = (scenario) => {
    setDataAmount(scenario.dataAmount);
    setDataUnit(scenario.dataUnit);
    setSpeedAmount(scenario.speedAmount);
    setSpeedUnit(scenario.speedUnit);
    setOverheadPercent(scenario.overheadPercent);
    setActiveTab('calculator');
  };

  const quizQuestions = [
    {
      id: 'q1',
      question: 'Wie viele Bytes entspricht 1 Gibibyte (GiB) im Vergleich zu 1 Gigabyte (GB)?',
      options: [
        { text: '1 GiB = 1.000.000.000 Byte, 1 GB = 1.073.741.824 Byte', correct: false },
        { text: '1 GiB = 1.073.741.824 Byte (2³⁰), 1 GB = 1.000.000.000 Byte (10⁹)', correct: true },
        { text: 'Beide sind absolut identisch nach DIN-Norm.', correct: false },
      ],
      explanation: 'GiB ist das IEC-Binärpräfix (Basis 2), während GB das SI-Dezimalpräfix (Basis 10) ist. Das führt zu ~7,37% Unterschied.'
    },
    {
      id: 'q2',
      question: 'Eine Datei mit 100 Megabyte (MB, Dezimal) soll über eine 100 Mbit/s Leitung übertragen werden. Wie lange dauert es theoretisch ohne Overhead?',
      options: [
        { text: '1 Sekunde, weil 100 / 100 = 1', correct: false },
        { text: '8 Sekunden, weil 100 MB = 800 Mbit und 800 Mbit / 100 Mbit/s = 8 s', correct: true },
        { text: '60 Sekunden', correct: false },
      ],
      explanation: 'Häufigste IHK-Falle: Bandbreiten werden in Bit/s angegeben, Dateigrößen in Byte. 1 Byte = 8 Bit!'
    },
    {
      id: 'q3',
      question: 'Warum muss in IHK-Prüfungen häufig Protokoll-Overhead (z. B. 5–15%) berücksichtigt werden?',
      options: [
        { text: 'Weil TCP/IP-Header, Frame-Check-Sequenzen und ACK-Pakete Bandbreite beanspruchen.', correct: true },
        { text: 'Weil Router im Sommer heiß laufen.', correct: false },
        { text: 'Weil Kupferkabel den Strom verlangsamen.', correct: false },
      ],
      explanation: 'Nutzdaten werden in Ethernet-Frames, IP-Pakete und TCP-Segmente verpackt, die jeweils eigene Header mitführen.'
    }
  ];

  const handleSelectQuiz = (qId, optionIdx, isCorrect) => {
    if (quizAnswered[qId] !== undefined) return;
    const updated = { ...quizAnswered, [qId]: optionIdx };
    setQuizAnswered(updated);

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }

    if (Object.keys(updated).length === quizQuestions.length && !earnedXp) {
      setEarnedXp(true);
      const xpReward = 50;
      setUserState(prev => ({
        ...prev,
        xp: prev.xp + xpReward,
        completedTopics: prev.completedTopics.includes('transfer_time_lab')
          ? prev.completedTopics
          : [...prev.completedTopics, 'transfer_time_lab']
      }));
    }
  };

  return (
    <div className="lab-container">
      <div className="lab-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Network className="text-blue-500" /> IHK Übertragungszeit- & Bandbreiten-Simulator
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.95rem' }}>
            Prüfungsrelevante Berechnungen: Binär (KiB/MiB/GiB) vs. Dezimal (kB/MB/GB), Bit vs. Byte & Protokoll-Overhead.
          </p>
        </div>
        <div className="xp-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={16} /> 50 XP erreichbar
        </div>
      </div>

      {/* Tabs */}
      <div className="lab-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn ${activeTab === 'calculator' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('calculator')}
        >
          <Clock size={16} /> Rechner & Detail-Rechenweg
        </button>
        <button
          className={`btn ${activeTab === 'scenarios' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('scenarios')}
        >
          <Layers size={16} /> IHK-Prüfungsszenarien
        </button>
        <button
          className={`btn ${activeTab === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('quiz')}
        >
          <HelpCircle size={16} /> IHK-Fallen Quiz ({Object.keys(quizAnswered).length}/{quizQuestions.length})
        </button>
      </div>

      {activeTab === 'calculator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Eingabebereich */}
          <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowRightLeft size={18} /> Eingabeparameter
            </h3>

            {/* Datenmenge */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Datenmenge:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={dataAmount}
                  onChange={(e) => setDataAmount(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color, #ccc)' }}
                />
                <select
                  value={dataUnit}
                  onChange={(e) => setDataUnit(e.target.value)}
                  style={{ flex: 1.2, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color, #ccc)' }}
                >
                  {Object.entries(DATA_UNITS).map(([key, unit]) => (
                    <option key={key} value={key}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bandbreite */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Übertragungsrate (Bandbreite):</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={speedAmount}
                  onChange={(e) => setSpeedAmount(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color, #ccc)' }}
                />
                <select
                  value={speedUnit}
                  onChange={(e) => setSpeedUnit(e.target.value)}
                  style={{ flex: 1.2, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color, #ccc)' }}
                >
                  {Object.entries(SPEED_UNITS).map(([key, unit]) => (
                    <option key={key} value={key}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Schnellauswahl Anschlüsse */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', opacity: 0.8 }}>
                Schnellauswahl gängiger Anschlüsse:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {PRESET_CONNECTIONS.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => handleApplyPreset(p)}
                  >
                    {p.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Overhead Slider */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ fontWeight: 600 }}>Protokoll-Overhead:</label>
                <span style={{ fontWeight: 700 }}>{overheadPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={overheadPercent}
                onChange={(e) => setOverheadPercent(Number(e.target.value))}
                style={{ width: '100%', marginTop: '0.4rem' }}
              />
              <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                Typisch: 0% für reine Brutto-Theorie, 5–10% für TCP/IP/Ethernet-Rechnungen in Prüfungen.
              </span>
            </div>
          </div>

          {/* Ergebnisbereich */}
          <div className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} /> Berechnete Übertragungsdauer
            </h3>

            <div style={{
              padding: '1.25rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Dauer</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color, #2563eb)' }}>
                {result.formattedTime}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '0.25rem' }}>
                ≈ {result.seconds.toFixed(2)} Sekunden ({result.seconds > 60 ? (result.seconds / 60).toFixed(2) + ' Min.' : ''})
              </div>
            </div>

            {/* IHK Rechenschritte */}
            <div className="info-box" style={{ padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Info size={16} /> IHK-Musterlösung / Rechenweg:
              </div>
              <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
                {result.steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '0.3rem' }}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenarios' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {IHK_SCENARIOS.map((sc) => (
            <div key={sc.id} className="card" style={{ padding: '1.25rem', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color, #2563eb)' }}>{sc.title}</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', minHeight: '3rem' }}>{sc.description}</p>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem', opacity: 0.8 }}>
                • <strong>Datenmenge:</strong> {sc.dataAmount} {sc.dataUnit}<br />
                • <strong>Bandbreite:</strong> {sc.speedAmount} {sc.speedUnit}<br />
                • <strong>Overhead:</strong> {sc.overheadPercent}%
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => handleApplyScenario(sc)}
              >
                In Rechner laden & lösen
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'quiz' && (
        <div>
          {quizQuestions.map((q, idx) => {
            const isAnswered = quizAnswered[q.id] !== undefined;
            return (
              <div key={q.id} className="card" style={{ padding: '1.25rem', borderRadius: '10px', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0' }}>{idx + 1}. {q.question}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, oIdx) => {
                    const isSelected = quizAnswered[q.id] === oIdx;
                    let btnStyle = { textAlign: 'left', padding: '0.6rem 1rem' };
                    if (isAnswered) {
                      if (opt.correct) {
                        btnStyle.backgroundColor = '#10b981';
                        btnStyle.color = 'white';
                      } else if (isSelected && !opt.correct) {
                        btnStyle.backgroundColor = '#ef4444';
                        btnStyle.color = 'white';
                      }
                    }
                    return (
                      <button
                        key={oIdx}
                        className="btn btn-secondary"
                        style={btnStyle}
                        disabled={isAnswered}
                        onClick={() => handleSelectQuiz(q.id, oIdx, opt.correct)}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                {isAnswered && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.88rem', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.05)' }}>
                    💡 <strong>Erklärung:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {earnedXp && (
            <div style={{ padding: '1rem', background: '#10b98122', border: '1px solid #10b981', borderRadius: '8px', textAlign: 'center', marginTop: '1rem' }}>
              <Award size={24} style={{ color: '#10b981', display: 'inline-block', marginBottom: '0.25rem' }} />
              <div style={{ fontWeight: 700, color: '#10b981' }}>Quiz gemeistert! +50 XP gutgeschrieben.</div>
              <div style={{ fontSize: '0.85rem' }}>Erreichte Punktzahl: {quizScore} / {quizQuestions.length}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
