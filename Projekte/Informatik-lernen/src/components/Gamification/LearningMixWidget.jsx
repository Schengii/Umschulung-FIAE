import React, { useMemo, useState } from 'react';
import { Target, CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { EXAM_QUESTIONS } from '../../data/examData';
import { DRILL_QUESTIONS } from '../../data/drillQuestions';
import { FLASHCARDS_DATA } from '../../data/flashcardsData';
import { calculateSM2 } from '../../utils/srsAlgorithm';
import { toDateKey } from '../../utils/mistakeJournalEngine';
import { buildPlacementTest, buildDailyMix, scorePlacement } from '../../utils/learningMixEngine';

// Dashboard-Widget "Einstufungstest & Tages-Lernmix":
// - Einstufungstest (12 Fragen quer durch AP1/AP2/WiSo) füllt den Bereitschafts-Score sofort.
// - Tages-Lernmix (10 Fragen): fällige Fehler zuerst, dann neue Fragen aus den schwächsten Bereichen.
// Bis zu 3 Karteikarten (SM-2) sind im Lernmix enthalten.
// Falsche Antworten landen automatisch im Fehlerjournal.
const QUESTIONS_BY_ID = new Map([...EXAM_QUESTIONS, ...DRILL_QUESTIONS].map((q) => [String(q.id), q]));
const CARDS_BY_ID = new Map(FLASHCARDS_DATA.map((c) => [String(c.id), c]));
const DRILL_IDS = DRILL_QUESTIONS.map((q) => String(q.id));

export default function LearningMixWidget() {
  const journal = useStore((s) => s.userState.mistakeJournal);
  const placement = useStore((s) => s.userState.placementResult);
  const mixLog = useStore((s) => s.userState.dailyMixLog);
  const recordMistakeResults = useStore((s) => s.recordMistakeResults);
  const recordPlacementResult = useStore((s) => s.recordPlacementResult);
  const recordDailyMixResult = useStore((s) => s.recordDailyMixResult);
  const awardXP = useStore((s) => s.awardXP);
  const srsFlashcards = useStore((s) => s.userState.srsFlashcards);
  const updateSrsCard = useStore((s) => s.updateSrsCard);

  // session: { kind: 'placement'|'mix', ids, index, picked, flags: boolean[] }
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);

  const [today] = useState(() => toDateKey(new Date()));
  const mixDoneToday = mixLog?.date === today;
  const mixPreview = useMemo(
    () => buildDailyMix({ journal, questions: EXAM_QUESTIONS, placement, extraKnownIds: DRILL_IDS, cards: FLASHCARDS_DATA, srsData: srsFlashcards }),
    [journal, placement, srsFlashcards]
  );

  const start = (kind) => {
    const items =
      kind === 'placement'
        ? buildPlacementTest(EXAM_QUESTIONS).map((id) => ({ type: 'q', id }))
        : [...mixPreview.cardIds.map((id) => ({ type: 'card', id })), ...mixPreview.ids.map((id) => ({ type: 'q', id }))];
    if (items.length === 0) return;
    setSummary(null);
    setSession({ kind, items, index: 0, picked: null, flipped: false, flags: [] });
  };

  if (session) {
    const item = session.items[session.index];
    const isCard = item.type === 'card';
    const card = isCard ? CARDS_BY_ID.get(item.id) : null;
    const question = isCard ? null : QUESTIONS_BY_ID.get(item.id);
    const answered = session.picked !== null;
    const title = session.kind === 'placement' ? 'Einstufungstest' : 'Heute lernen';

    // Karteikarte: Selbstbewertung nach SM-2 (1 = nochmal, 3 = schwer, 4 = gut, 5 = leicht)
    const rateCard = (quality) => {
      const prev = srsFlashcards?.[card.id] || { repetitions: 0, interval: 1, easeFactor: 2.5 };
      updateSrsCard(card.id, calculateSM2({ quality, repetitions: prev.repetitions, interval: prev.interval, easeFactor: prev.easeFactor }));
      goNext([...session.flags, quality >= 3]);
    };

    const choose = (optionIndex) => {
      if (answered) return;
      const correct = optionIndex === question.correct;
      recordMistakeResults([{ id: question.id, correct }]);
      setSession({ ...session, picked: optionIndex, flags: [...session.flags, correct] });
    };

    const goNext = (flags) => {
      if (session.index + 1 < session.items.length) {
        setSession({ ...session, index: session.index + 1, picked: null, flipped: false, flags });
        return;
      }
      const correctCount = flags.filter(Boolean).length;
      const total = session.items.length;
      if (session.kind === 'placement') {
        recordPlacementResult(scorePlacement(session.items.map((it) => QUESTIONS_BY_ID.get(it.id)), flags));
        awardXP(20);
        setSummary({ kind: 'placement', correctCount, total, xp: 20 });
      } else {
        recordDailyMixResult({ date: today, correct: correctCount, total });
        const xp = mixDoneToday ? 0 : 5 + correctCount * 2; // XP nur einmal pro Tag
        if (xp > 0) awardXP(xp);
        setSummary({ kind: 'mix', correctCount, total, xp });
      }
      setSession(null);
    };
    const next = () => goNext(session.flags);

    return (
      <section className="glass-panel" aria-labelledby="learning-mix-title" style={{ padding: '24px', marginBottom: '32px', border: '2px solid var(--accent-indigo, #6366f1)' }}>
        <h3 id="learning-mix-title" style={{ marginBottom: '4px' }}>{title} ({session.index + 1}/{session.items.length})</h3>
        {isCard ? (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>Karteikarte · {card.category}</p>
            <p style={{ fontWeight: 600, margin: '12px 0' }}>{card.front}</p>
            {session.flipped ? (
              <div role="status">
                <p style={{ marginBottom: '12px' }}>{card.back}</p>
                <div role="group" aria-label="Wie gut wusstest du es?" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => rateCard(1)}>Nochmal</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => rateCard(3)}>Schwer</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => rateCard(4)}>Gut</button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => rateCard(5)}>Leicht</button>
                </div>
              </div>
            ) : (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setSession({ ...session, flipped: true })}>Antwort zeigen</button>
            )}
          </>
        ) : (
        <>
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
            <p style={{ marginBottom: '8px' }}>{session.picked === question.correct ? 'Richtig!' : 'Leider falsch – die Frage kommt ins Fehlerjournal.'}</p>
            {question.explanation && <p style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>{question.explanation}</p>}
            <button type="button" className="btn btn-primary btn-sm" onClick={next}>
              {session.index + 1 >= session.items.length ? 'Auswerten' : 'Nächste Frage'}
            </button>
          </div>
        )}
        </>
        )}
      </section>
    );
  }

  return (
    <section className="glass-panel" aria-labelledby="learning-mix-title" style={{ padding: '24px', marginBottom: '32px', border: '2px solid var(--accent-indigo, #6366f1)' }}>
      <h3 id="learning-mix-title" style={{ marginBottom: '12px' }}>Heute lernen</h3>
      {summary && (
        <p role="status" style={{ marginBottom: '12px' }}>
          {summary.kind === 'placement' ? 'Einstufung abgeschlossen' : 'Tages-Lernmix geschafft'}: {summary.correctCount}/{summary.total} richtig
          {summary.xp > 0 ? ` (+${summary.xp} XP)` : ''}.
        </p>
      )}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => start('mix')} disabled={mixPreview.ids.length + mixPreview.cardIds.length === 0} style={{ gap: '6px' }}>
          <CalendarCheck size={14} aria-hidden="true" /> {mixDoneToday ? 'Nochmal üben' : 'Tages-Lernmix starten'} ({mixPreview.ids.length + mixPreview.cardIds.length} Aufgaben)
        </button>
        <button type="button" className={`btn btn-sm ${placement ? 'btn-secondary' : 'btn-primary'}`} onClick={() => start('placement')} style={{ gap: '6px' }}>
          <Target size={14} aria-hidden="true" /> {placement ? 'Einstufungstest wiederholen' : 'Einstufungstest (12 Fragen)'}
        </button>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
        {mixDoneToday ? `Heute erledigt: ${mixLog.correct}/${mixLog.total} richtig. ` : ''}
        Der Lernmix enthält {mixPreview.dueCount} fällige Fehler, {mixPreview.cardIds.length} Karteikarten und neue Fragen aus deinen schwächsten Bereichen.
        {!placement && ' Der Einstufungstest setzt deinen Bereitschafts-Score auf einen realistischen Startwert.'}
      </p>
    </section>
  );
}
