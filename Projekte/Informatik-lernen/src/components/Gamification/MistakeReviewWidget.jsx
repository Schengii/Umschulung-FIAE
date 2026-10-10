import React, { useMemo, useState } from 'react';
import { RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { EXAM_QUESTIONS } from '../../data/examData';
import { DRILL_QUESTIONS } from '../../data/drillQuestions';
import { getDueMistakeIds, summarizeJournal } from '../../utils/mistakeJournalEngine';

// Dashboard-Widget "Fehlerjournal": zeigt, wie viele früher falsch beantwortete
// Prüfungsfragen heute zur Wiederholung fällig sind, und startet ein
// Mini-Quiz mit genau diesen Fragen. Antworten fließen zurück ins Journal.
// Prüfungssimulator- und Lab-Drill-Fragen (IDs sind global eindeutig, siehe drillQuestions.test.js)
const QUESTIONS_BY_ID = new Map([...EXAM_QUESTIONS, ...DRILL_QUESTIONS].map((q) => [String(q.id), q]));

export default function MistakeReviewWidget() {
  const rawJournal = useStore((s) => s.userState.mistakeJournal);
  const recordMistakeResults = useStore((s) => s.recordMistakeResults);

  const [session, setSession] = useState(null); // { ids: string[], index: number, picked: number|null }

  // Einträge ohne auffindbare Frage (z. B. Lab-Drill nicht registriert, Katalog geändert) nicht mitzählen
  const journal = useMemo(
    () => Object.fromEntries(Object.entries(rawJournal || {}).filter(([id]) => QUESTIONS_BY_ID.has(id))),
    [rawJournal]
  );
  const summary = useMemo(() => summarizeJournal(journal), [journal]);

  // Journal-Einträge ohne passende Frage (z. B. Fragenkatalog geändert) überspringen
  const startReview = () => {
    const ids = getDueMistakeIds(journal);
    if (ids.length > 0) setSession({ ids, index: 0, picked: null });
  };

  if (summary.total === 0 && !session) return null;

  if (session) {
    const question = QUESTIONS_BY_ID.get(session.ids[session.index]);
    const answered = session.picked !== null;

    const choose = (optionIndex) => {
      if (answered) return;
      recordMistakeResults([{ id: question.id, correct: optionIndex === question.correct }]);
      setSession({ ...session, picked: optionIndex });
    };
    const next = () => {
      if (session.index + 1 >= session.ids.length) setSession(null);
      else setSession({ ...session, index: session.index + 1, picked: null });
    };

    return (
      <section className="glass-panel" aria-labelledby="mistake-review-title" style={{ padding: '24px', marginBottom: '32px', border: '2px solid var(--accent-rose, #f43f5e)' }}>
        <h3 id="mistake-review-title" style={{ marginBottom: '4px' }}>Fehler wiederholen ({session.index + 1}/{session.ids.length})</h3>
        <p style={{ fontWeight: 600, margin: '12px 0' }}>{question.question}</p>
        <div role="group" aria-label="Antwortmöglichkeiten" style={{ display: 'grid', gap: '8px' }}>
          {question.options.map((option, oIdx) => {
            const isCorrect = oIdx === question.correct;
            const isPicked = session.picked === oIdx;
            let borderColor = 'var(--border-color, rgba(255,255,255,0.15))';
            if (answered && isCorrect) borderColor = 'var(--accent-emerald, #10b981)';
            else if (answered && isPicked) borderColor = 'var(--accent-rose, #f43f5e)';
            return (
              <button
                key={oIdx}
                type="button"
                className="btn btn-secondary"
                disabled={answered}
                aria-pressed={isPicked}
                onClick={() => choose(oIdx)}
                style={{ textAlign: 'left', justifyContent: 'flex-start', gap: '8px', border: `2px solid ${borderColor}` }}
              >
                {answered && isCorrect && <CheckCircle2 size={16} aria-hidden="true" />}
                {answered && isPicked && !isCorrect && <XCircle size={16} aria-hidden="true" />}
                {option}
              </button>
            );
          })}
        </div>
        {answered && (
          <div role="status" style={{ marginTop: '12px' }}>
            <p style={{ marginBottom: '8px' }}>
              {session.picked === question.correct
                ? 'Richtig! Die Frage kommt später in größerem Abstand wieder.'
                : 'Leider falsch – die Frage kommt morgen erneut.'}
            </p>
            {question.explanation && <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>{question.explanation}</p>}
            <button type="button" className="btn btn-primary btn-sm" onClick={next}>
              {session.index + 1 >= session.ids.length ? 'Fertig' : 'Nächste Frage'}
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="glass-panel" aria-labelledby="mistake-review-title" style={{ padding: '24px', marginBottom: '32px', border: '2px solid var(--accent-rose, #f43f5e)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 id="mistake-review-title" style={{ marginBottom: '4px' }}>Fehlerjournal</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {summary.total} Frage(n) im Journal, <strong>{summary.due}</strong> heute fällig.
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" disabled={summary.due === 0} onClick={startReview} style={{ gap: '6px' }}>
          <RotateCcw size={14} aria-hidden="true" /> {summary.due > 0 ? 'Jetzt wiederholen' : 'Nichts fällig'}
        </button>
      </div>
    </section>
  );
}
