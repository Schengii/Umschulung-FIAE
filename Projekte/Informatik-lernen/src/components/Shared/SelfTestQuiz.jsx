import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

/**
 * Kurzer Selbsttest mit sofortigem Feedback.
 * Bei Themenwechsel über `key` zurücksetzen.
 *
 * @param {object} props
 * @param {Array<{frage: string, optionen: string[], korrekt: number, erklaerung: string}>} props.quiz
 * @param {string} [props.title]
 */
export default function SelfTestQuiz({ quiz, title = '✅ Selbsttest' }) {
  const [answers, setAnswers] = useState({});
  const answered = Object.keys(answers).length;
  const correct = quiz.filter((q, i) => answers[i] === q.korrekt).length;

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>{title}</h3>
      {quiz.map((q, qi) => {
        const selected = answers[qi];
        const isDone = selected !== undefined;
        return (
          <div key={qi} style={{ marginBottom: '18px' }}>
            <p style={{ fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>{qi + 1}. {q.frage}</p>
            <div role="group" aria-label={`Antworten zu Frage ${qi + 1}`} style={{ display: 'grid', gap: '8px' }}>
              {q.optionen.map((opt, oi) => {
                const isRight = oi === q.korrekt;
                const isPicked = selected === oi;
                let border = 'var(--border-color)';
                if (isDone && isRight) border = 'var(--accent-emerald)';
                else if (isDone && isPicked) border = 'var(--accent-rose, #e11d48)';
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={isDone}
                    onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                    style={{
                      textAlign: 'left',
                      minHeight: '44px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${border}`,
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      cursor: isDone ? 'default' : 'pointer'
                    }}
                  >
                    {isDone && isRight && <CheckCircle2 size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom', color: 'var(--accent-emerald)' }} />}
                    {isDone && isPicked && !isRight && <XCircle size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />}
                    {opt}
                  </button>
                );
              })}
            </div>
            <div aria-live="polite">
              {isDone && (
                <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {selected === q.korrekt ? 'Richtig! ' : 'Nicht ganz. '}
                  {q.erklaerung}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {answered === quiz.length && (
        <p style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>
          Ergebnis: {correct} von {quiz.length} richtig.
        </p>
      )}
    </div>
  );
}
