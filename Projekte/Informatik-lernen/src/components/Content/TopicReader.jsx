import React, { useState, useEffect, useMemo } from 'react';
import { TOPICS, loadTopicContent } from '../../data/topicsData';
import { parseMarkdown, blocksToPlainText, extractToc } from '../../utils/markdownEngine';
import MarkdownContent from '../Shared/MarkdownContent';
import SourceList from '../Shared/SourceList';
import {
  CheckCircle2, XCircle, HelpCircle, Code, Award, ArrowLeft, ArrowRight, VolumeX, Pause, Play,
  Target, ListOrdered, PenLine, Lightbulb, Eye, EyeOff, FlaskConical, RotateCcw
} from 'lucide-react';

/**
 * Eine Übungsaufgabe: Tipps lassen sich einzeln aufdecken, die Lösung per Schalter.
 * @param {{ exercise: { id: string, title: string, prompt: string, hints?: string[], solution: string }, index: number, onNavigate?: (path: string) => void }} props
 */
function Exercise({ exercise, index, onNavigate }) {
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const hints = exercise.hints || [];
  const solutionId = `exercise-solution-${exercise.id}`;

  return (
    <article className="glass-panel" style={{ padding: '22px', marginBottom: '16px', border: '1px solid var(--border-color)' }} aria-labelledby={`exercise-title-${exercise.id}`}>
      <h3 id={`exercise-title-${exercise.id}`} style={{ fontSize: '1.08rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-main)' }}>
        Aufgabe {index + 1}: {exercise.title}
      </h3>
      <MarkdownContent markdown={exercise.prompt} onNavigate={onNavigate} />

      {hints.slice(0, hintsShown).map((hint, i) => (
        <div key={i} className="md-callout md-callout-tip" style={{ marginTop: '10px' }}>
          <div className="md-callout-title"><Lightbulb size={16} aria-hidden="true" /> Tipp {i + 1}</div>
          <MarkdownContent markdown={hint} onNavigate={onNavigate} />
        </div>
      ))}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
        {hintsShown < hints.length && (
          <button className="btn btn-secondary btn-sm" onClick={() => setHintsShown((n) => n + 1)}>
            <Lightbulb size={16} aria-hidden="true" /> Tipp {hintsShown + 1} von {hints.length} anzeigen
          </button>
        )}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setSolutionOpen((o) => !o)}
          aria-expanded={solutionOpen}
          aria-controls={solutionId}
        >
          {solutionOpen ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          {solutionOpen ? 'Lösung ausblenden' : 'Lösung anzeigen'}
        </button>
      </div>

      <div id={solutionId} hidden={!solutionOpen} style={{ marginTop: '14px' }}>
        {solutionOpen && (
          <div className="md-callout md-callout-example">
            <div className="md-callout-title"><CheckCircle2 size={16} aria-hidden="true" /> Lösung</div>
            <MarkdownContent markdown={exercise.solution} onNavigate={onNavigate} />
          </div>
        )}
      </div>
    </article>
  );
}

export default function TopicReader({ topicId, onBack, onCompleteTopic, isCompleted, onNavigate, onSelectTopic }) {
  const topicIndex = TOPICS.findIndex((t) => t.id === topicId);
  const topic = topicIndex >= 0 ? TOPICS[topicIndex] : null;
  const prevTopic = topicIndex > 0 ? TOPICS[topicIndex - 1] : null;
  const nextTopic = topicIndex >= 0 && topicIndex < TOPICS.length - 1 ? TOPICS[topicIndex + 1] : null;

  const [loaded, setLoaded] = useState({ id: null, content: null });
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechUnsupported, setSpeechUnsupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!topic) return undefined;
    loadTopicContent(topic.id).then((content) => {
      if (!cancelled) setLoaded({ id: topic.id, content });
    });
    return () => {
      cancelled = true;
    };
  }, [topic]);

  // App.jsx rendert den Reader mit key={topicId}: Bei einem Themenwechsel (Vor/Zurück) entsteht eine
  // neue Instanz mit frischem Quiz- und Vorlesezustand. Hier nur nach oben scrollen und beim Verlassen
  // das Vorlesen stoppen.
  useEffect(() => {
    window.scrollTo?.({ top: 0 });
    return () => window.speechSynthesis?.cancel();
  }, [topicId]);

  const data = loaded.id === topic?.id ? loaded.content : null;
  const blocks = useMemo(() => (data ? parseMarkdown(data.content) : []), [data]);
  const toc = useMemo(() => extractToc(blocks), [blocks]);

  if (!topic) {
    return (
      <div className="glass-panel" style={{ padding: '28px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>Artikel nicht gefunden</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Zu dieser Adresse gibt es keinen Wissensartikel.</p>
        <button onClick={onBack} className="btn btn-secondary btn-sm"><ArrowLeft size={16} /> Zur Übersicht</button>
      </div>
    );
  }

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechUnsupported(true);
      return;
    }
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${topic.title}. ${topic.summary}. ${blocksToPlainText(blocks)}`);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = utterance.onend;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handleStopSpeak = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const jumpTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: document.body.classList.contains('reduced-motion') ? 'auto' : 'smooth', block: 'start' });
      el.focus({ preventScroll: true });
    }
  };

  const quiz = data?.quiz || [];
  const correctCount = quiz.filter((q, i) => selectedAnswers[i] === q.correct).length;
  const allAnswered = Object.keys(selectedAnswers).length === quiz.length;

  const handleFinishQuiz = () => {
    setShowQuizResult(true);
    onCompleteTopic(topic.id, 50);
  };

  const sectionTitle = { fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      <button
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontWeight: '600' }}
      >
        <ArrowLeft size={16} aria-hidden="true" /> Zurück zur Übersicht
      </button>

      {/* Kopf */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">{topic.category}</span>
            <span className="badge badge-teal">{topic.difficultyLevel}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={handleSpeak}
                disabled={!data}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.82rem', minHeight: '32px' }}
                title="Artikel vorlesen (Text-to-Speech)"
              >
                {isSpeaking && !isPaused ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                <span>{isSpeaking ? (isPaused ? 'Fortsetzen' : 'Pause') : 'Vorlesen'}</span>
              </button>
              {isSpeaking && (
                <button
                  onClick={handleStopSpeak}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', minHeight: '32px' }}
                  aria-label="Vorlesen stoppen"
                >
                  <VolumeX size={16} aria-hidden="true" />
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>⏱️ {topic.readTime}</span>
            {isCompleted && (
              <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} aria-hidden="true" /> Abgeschlossen
              </span>
            )}
          </div>
        </div>
        {speechUnsupported && (
          <p role="status" style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', margin: '0 0 8px' }}>
            Die Vorlesefunktion wird von diesem Browser nicht unterstützt.
          </p>
        )}

        <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>
          {topic.icon} {topic.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>{topic.summary}</p>

        {data?.learningGoals?.length > 0 && (
          <div style={{ marginTop: '18px', padding: '14px 18px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Target size={18} style={{ color: 'var(--accent-emerald)' }} aria-hidden="true" /> Nach diesem Artikel kannst du …
            </h2>
            <ul style={{ margin: 0, paddingLeft: '22px', color: 'var(--text-main)', lineHeight: 1.6 }}>
              {data.learningGoals.map((g) => <li key={g}>{g}</li>)}
            </ul>
          </div>
        )}
      </div>

      {!data ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }} role="status">
          Artikel wird geladen …
        </div>
      ) : (
        <>
          {toc.length >= 3 && (
            <nav className="glass-panel" aria-label="Inhaltsverzeichnis" style={{ padding: '20px 24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <ListOrdered size={18} style={{ color: 'var(--accent-primary)' }} aria-hidden="true" /> Inhalt
              </h2>
              <ol style={{ margin: 0, paddingLeft: '22px', display: 'grid', gap: '4px' }}>
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        jumpTo(item.id);
                      }}
                      style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
                {data.exercises?.length > 0 && (
                  <li>
                    <a href="#uebungsaufgaben" onClick={(e) => { e.preventDefault(); jumpTo('uebungsaufgaben'); }} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Übungsaufgaben
                    </a>
                  </li>
                )}
                {quiz.length > 0 && (
                  <li>
                    <a href="#wissens-check" onClick={(e) => { e.preventDefault(); jumpTo('wissens-check'); }} style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                      Wissens-Check
                    </a>
                  </li>
                )}
              </ol>
            </nav>
          )}

          {/* Artikel */}
          <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
            <MarkdownContent blocks={blocks} onNavigate={onNavigate} />

            {data.codeSnippet && (
              <div className="code-window" style={{ marginTop: '24px' }}>
                <div className="code-header">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Code size={16} aria-hidden="true" /> Praxis-Beispiel
                  </span>
                  <span>{data.codeLanguage || 'Code'}</span>
                </div>
                <pre className="code-body"><code>{data.codeSnippet}</code></pre>
              </div>
            )}
          </div>

          {/* Übungsaufgaben */}
          {data.exercises?.length > 0 && (
            <section style={{ marginBottom: '24px' }} aria-labelledby="uebungsaufgaben">
              <h2 id="uebungsaufgaben" tabIndex={-1} style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <PenLine size={24} style={{ color: 'var(--accent-amber)' }} aria-hidden="true" /> Übungsaufgaben
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 16px' }}>
                Erst selbst lösen (Papier und Taschenrechner wie in der Prüfung), dann Tipps und Lösung aufdecken.
              </p>
              {data.exercises.map((ex, i) => <Exercise key={ex.id} exercise={ex} index={i} onNavigate={onNavigate} />)}
            </section>
          )}

          {/* Praxis im Lab */}
          {data.relatedLabs?.length > 0 && onNavigate && (
            <section className="glass-panel" style={{ padding: '22px', marginBottom: '24px' }} aria-labelledby="praxis-labs">
              <h2 id="praxis-labs" style={{ ...sectionTitle, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FlaskConical size={20} style={{ color: 'var(--accent-teal)' }} aria-hidden="true" /> Praxis im Lab
              </h2>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {data.relatedLabs.map((lab) => (
                  <button key={lab.id} className="btn btn-secondary btn-sm" onClick={() => onNavigate(lab.id)}>
                    {lab.label} <ArrowRight size={14} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Wissens-Check */}
          {quiz.length > 0 && (
            <section className="glass-panel" style={{ padding: '32px', border: '2px solid var(--accent-primary)' }} aria-labelledby="wissens-check">
              <h2 id="wissens-check" tabIndex={-1} style={{ ...sectionTitle, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <HelpCircle size={26} style={{ color: 'var(--accent-primary)' }} aria-hidden="true" /> Wissens-Check ({quiz.length} Fragen)
              </h2>

              {quiz.map((q, qIdx) => (
                <fieldset key={qIdx} style={{ marginBottom: '24px', background: 'var(--bg-tertiary)', padding: '22px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <legend style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', padding: '0 6px', float: 'left', width: '100%', marginBottom: '14px' }}>
                    {qIdx + 1}. {q.question}
                  </legend>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', clear: 'both' }}>
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[qIdx] === oIdx;
                      const isCorrect = q.correct === oIdx;
                      let btnBg = 'var(--bg-secondary)';
                      let btnBorder = 'var(--border-color)';
                      let icon = null;
                      if (showQuizResult) {
                        if (isCorrect) {
                          btnBg = 'color-mix(in srgb, var(--accent-emerald) 15%, transparent)';
                          btnBorder = 'var(--accent-emerald)';
                          icon = <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', minWidth: '18px' }} aria-label="richtig" />;
                        } else if (isSelected) {
                          btnBg = 'color-mix(in srgb, var(--accent-rose) 15%, transparent)';
                          btnBorder = 'var(--accent-rose)';
                          icon = <XCircle size={18} style={{ color: 'var(--accent-rose)', minWidth: '18px' }} aria-label="falsch" />;
                        }
                      } else if (isSelected) {
                        btnBg = 'color-mix(in srgb, var(--accent-primary) 15%, transparent)';
                        btnBorder = 'var(--accent-primary)';
                      }
                      return (
                        <button
                          key={oIdx}
                          onClick={() => !showQuizResult && setSelectedAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                          aria-pressed={isSelected}
                          style={{
                            minHeight: '44px', padding: '12px 18px', borderRadius: 'var(--radius-md)', background: btnBg,
                            border: `2px solid ${btnBorder}`, color: 'var(--text-main)', textAlign: 'left',
                            cursor: showQuizResult ? 'default' : 'pointer', fontSize: '0.95rem', fontWeight: '600',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
                          }}
                        >
                          <span>{opt}</span>
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                  {showQuizResult && (
                    <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-main)', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-teal)', padding: '12px 16px', borderRadius: '4px' }}>
                      💡 <strong>Erklärung:</strong> {q.explanation}
                    </div>
                  )}
                </fieldset>
              ))}

              {!showQuizResult ? (
                <button
                  className="btn btn-primary"
                  onClick={handleFinishQuiz}
                  disabled={!allAnswered}
                  style={{ opacity: allAnswered ? 1 : 0.5, width: '100%', minHeight: '48px', fontSize: '1rem' }}
                >
                  <Award size={20} aria-hidden="true" /> Auswerten und Modul abschließen (+50 XP)
                </button>
              ) : (
                <div role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '1.1rem' }}>
                    <CheckCircle2 size={24} aria-hidden="true" /> {correctCount} von {quiz.length} richtig – Modul absolviert.
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedAnswers({}); setShowQuizResult(false); }}>
                    <RotateCcw size={16} aria-hidden="true" /> Quiz wiederholen
                  </button>
                </div>
              )}
            </section>
          )}

          {data.sources?.length > 0 && <SourceList sources={data.sources} checkedOn={data.sourcesCheckedOn} />}

          {/* Vor / Zurück */}
          {onSelectTopic && (prevTopic || nextTopic) && (
            <nav aria-label="Weitere Artikel" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
              {prevTopic ? (
                <button className="btn btn-secondary" onClick={() => onSelectTopic(prevTopic.id)} style={{ maxWidth: '100%' }}>
                  <ArrowLeft size={16} aria-hidden="true" /> {prevTopic.icon} {prevTopic.title}
                </button>
              ) : <span />}
              {nextTopic && (
                <button className="btn btn-secondary" onClick={() => onSelectTopic(nextTopic.id)} style={{ maxWidth: '100%' }}>
                  {nextTopic.icon} {nextTopic.title} <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
