import React, { useState } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';
import { useStore } from '../../store/useStore';

/**
 * Multiple-Choice-Prüfungsdrill im IHK-Stil, wie ihn mehrere Labs als
 * eigenen Tab anbieten. Hält Auswahl und Auswertungsanzeige selbst; die
 * XP-Vergabe bleibt beim Lab, weil sich manche Labs die einmaligen XP mit
 * anderen Aktionen teilen (z. B. DHCP-Handshake).
 *
 * @param {object} props
 * @param {string} props.title - Überschrift des Drills
 * @param {Array<{id: string, frage: string, optionen: string[], korrektIndex: number, erklaerung: string}>} props.questions
 * @param {string} props.accentColor - Akzentfarbe (Icon, Prüfen-Button)
 * @param {string} props.selectedBg - Hintergrund der gewählten Option vor der Auswertung
 * @param {string} props.selectedBorderColor - Rahmenfarbe der gewählten Option vor der Auswertung
 * @param {boolean} props.xpClaimed - zeigt das "+55 XP Erhalten!"-Badge
 * @param {number|null} [props.xpAmount] - XP-Belohnung für den Hinweistext (Standard 55); `null` für Labs, deren XP anderweitig vergeben werden – dann entfallen alle XP-Hinweise
 * @param {(correctCount: number) => void} props.onEvaluate - wird beim Prüfen mit der Anzahl richtiger Antworten aufgerufen
 *
 * Jede Auswertung wird zusätzlich ins Fehlerjournal geschrieben (Store-Aktion
 * `recordMistakeResults`). Damit die Fragen dort wiederholt werden können, müssen sie
 * in `src/data/drillQuestions.js` eingetragen sein; unbekannte IDs ignoriert das Widget.
 */
export default function IhkDrillPanel({ title, questions, accentColor, selectedBg, selectedBorderColor, xpClaimed, onEvaluate, xpAmount = 55 }) {
  const recordMistakeResults = useStore((s) => s.recordMistakeResults);
  const [drillAnswers, setDrillAnswers] = useState({});
  const [showDrillFeedback, setShowDrillFeedback] = useState(false);
  const allAnswered = Object.keys(drillAnswers).length >= questions.length;

  const handleDrillSelect = (qId, optionIdx) => {
    if (showDrillFeedback) return;
    setDrillAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    triggerHaptic('LIGHT');
  };

  const handleCheckDrill = () => {
    setShowDrillFeedback(true);
    // Falsche Antworten kommen ins Fehlerjournal (Wiederholung über das Dashboard-Widget)
    recordMistakeResults?.(questions.map((q) => ({ id: q.id, correct: drillAnswers[q.id] === q.korrektIndex })));
    onEvaluate(questions.filter((q) => drillAnswers[q.id] === q.korrektIndex).length);
  };

  const handleResetDrill = () => {
    setDrillAnswers({});
    setShowDrillFeedback(false);
    triggerHaptic('MEDIUM');
  };

  return (
    <div style={{
      background: 'var(--bg-card, #1e293b)',
      padding: '1.5rem',
      borderRadius: '1rem',
      border: '1px solid var(--border-color, #334155)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={22} color={accentColor} />
            {title}
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
            {xpAmount === null
              ? `Teste dein Wissen mit ${questions.length} Fragen im IHK-Stil. Falsche Antworten kommen ins Fehlerjournal.`
              : <>Beantworte mindestens 3 von {questions.length} Fragen korrekt zur Freischaltung von <strong>+{xpAmount} XP</strong>.</>}
          </p>
        </div>
        {xpAmount !== null && xpClaimed && (
          <span style={{ background: '#10b981', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '1rem', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={16} /> +{xpAmount} XP Erhalten!
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {questions.map((q, qIndex) => {
          const selectedIdx = drillAnswers[q.id];
          return (
            <div
              key={q.id}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '1.25rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-color, #334155)'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                {qIndex + 1}. {q.frage}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                {q.optionen.map((opt, optIdx) => {
                  const isSelected = selectedIdx === optIdx;
                  let btnBg = 'rgba(255, 255, 255, 0.03)';
                  let btnBorder = '1px solid var(--border-color, #334155)';

                  if (showDrillFeedback) {
                    if (optIdx === q.korrektIndex) {
                      btnBg = 'rgba(16, 185, 129, 0.2)';
                      btnBorder = '1px solid #10b981';
                    } else if (isSelected) {
                      btnBg = 'rgba(239, 68, 68, 0.2)';
                      btnBorder = '1px solid #ef4444';
                    }
                  } else if (isSelected) {
                    btnBg = selectedBg;
                    btnBorder = `1px solid ${selectedBorderColor}`;
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleDrillSelect(q.id, optIdx)}
                      style={{
                        textAlign: 'left',
                        padding: '0.65rem 1rem',
                        borderRadius: '0.5rem',
                        background: btnBg,
                        border: btnBorder,
                        color: 'inherit',
                        cursor: showDrillFeedback ? 'default' : 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {String.fromCharCode(65 + optIdx)}) {opt}
                    </button>
                  );
                })}
              </div>

              {showDrillFeedback && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.85rem' }}>
                  <strong style={{ color: selectedIdx === q.korrektIndex ? '#10b981' : '#f59e0b' }}>
                    {selectedIdx === q.korrektIndex ? '✓ Richtig!' : '✗ Lösung & Erklärung:'}
                  </strong>{' '}
                  {q.erklaerung}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {!showDrillFeedback ? (
          <button
            onClick={handleCheckDrill}
            disabled={!allAnswered}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: allAnswered ? accentColor : 'var(--border-color, #334155)',
              color: '#fff',
              fontWeight: 600,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem'
            }}
          >
            {xpAmount === null ? 'Antworten prüfen' : 'Antworten prüfen & XP sichern'}
          </button>
        ) : (
          <button
            onClick={handleResetDrill}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color, #334155)',
              background: 'transparent',
              color: 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Drill wiederholen
          </button>
        )}
      </div>
    </div>
  );
}
