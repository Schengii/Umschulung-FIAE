import React, { useState, useEffect } from 'react';
import { TOPICS } from '../../data/topicsData';
import { CheckCircle2, XCircle, HelpCircle, Code, Award, ArrowLeft, VolumeX, Pause, Play } from 'lucide-react';

export default function TopicReader({ topicId, onBack, onCompleteTopic, isCompleted }) {
  const topic = TOPICS.find((t) => t.id === topicId) || TOPICS[0];
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Audio Vorlesefunktion (Text-to-Speech)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Die Vorlesefunktion wird von Ihrem Browser leider nicht unterstützt.');
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

    // Remove HTML tags for clean reading
    const textToRead = `${topic.title}. ${topic.summary}. ${topic.content.replace(/<[^>]*>?/gm, '')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handleStopSpeak = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const handleOptionSelect = (quizIdx, optionIdx) => {
    setSelectedAnswers((prev) => ({ ...prev, [quizIdx]: optionIdx }));
  };

  const handleFinishQuiz = () => {
    setShowQuizResult(true);
    onCompleteTopic(topic.id, 50);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn btn-secondary btn-sm"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '20px',
          fontWeight: '600'
        }}
        aria-label="Zurück zur Übersicht"
      >
        <ArrowLeft size={16} /> Zurück zur Übersicht
      </button>

      {/* Main Topic Header */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <span className="badge badge-indigo">{topic.category}</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Vorlesefunktion (TTS) Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={handleSpeak}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.82rem' }}
                title="Theorie Vorlesen (Text-to-Speech)"
                aria-label="Theorie Vorlesen"
              >
                {isSpeaking && !isPaused ? <Pause size={16} /> : <Play size={16} />}
                <span>{isSpeaking ? (isPaused ? 'Fortsetzen' : 'Pause') : 'Vorlesen'}</span>
              </button>

              {isSpeaking && (
                <button
                  onClick={handleStopSpeak}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)' }}
                  title="Vorlesen Stoppen"
                  aria-label="Vorlesen Stoppen"
                >
                  <VolumeX size={16} />
                </button>
              )}
            </div>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>⏱️ {topic.readTime}</span>
            {isCompleted && (
              <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Abgeschlossen
              </span>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>
          {topic.icon} {topic.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          {topic.summary}
        </p>
      </div>

      {/* Topic Theory Article Body */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', fontSize: '1.02rem', lineHeight: '1.75' }}>
        <div
          dangerouslySetInnerHTML={{ __html: topic.content.replace(/\n/g, '<br/>') }}
          style={{ whiteSpace: 'pre-line', color: 'var(--text-main)' }}
        />

        {/* Code Snippet Box */}
        {topic.codeSnippet && (
          <div className="code-window" style={{ marginTop: '24px' }}>
            <div className="code-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code size={16} /> Praxis Code-Beispiel
              </span>
              <span>Syntax Standard</span>
            </div>
            <pre className="code-body">
              <code>{topic.codeSnippet}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Interactive Quick Check Quiz */}
      {topic.quiz && (
        <div className="glass-panel" style={{ padding: '32px', border: '2px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <HelpCircle size={26} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>Wissens-Check</h2>
          </div>

          {topic.quiz.map((q, qIdx) => (
            <div key={qIdx} style={{ marginBottom: '24px', background: 'var(--bg-tertiary)', padding: '22px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <p style={{ fontWeight: '700', marginBottom: '14px', fontSize: '1rem', color: 'var(--text-main)' }}>
                {qIdx + 1}. {q.question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[qIdx] === oIdx;
                  const isCorrect = q.correct === oIdx;
                  let btnBg = 'var(--bg-secondary)';
                  let btnBorder = 'var(--border-color)';
                  let icon = null;

                  if (showQuizResult) {
                    if (isCorrect) {
                      btnBg = 'rgba(5, 150, 105, 0.15)';
                      btnBorder = 'var(--accent-emerald)';
                      icon = <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', minWidth: '18px' }} />;
                    } else if (isSelected && !isCorrect) {
                      btnBg = 'rgba(225, 29, 72, 0.15)';
                      btnBorder = 'var(--accent-rose)';
                      icon = <XCircle size={18} style={{ color: 'var(--accent-rose)', minWidth: '18px' }} />;
                    }
                  } else if (isSelected) {
                    btnBg = 'rgba(79, 70, 229, 0.15)';
                    btnBorder = 'var(--accent-primary)';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => !showQuizResult && handleOptionSelect(qIdx, oIdx)}
                      style={{
                        minHeight: '44px',
                        padding: '12px 18px',
                        borderRadius: 'var(--radius-md)',
                        background: btnBg,
                        border: `2px solid ${btnBorder}`,
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: showQuizResult ? 'default' : 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'all 0.2s ease'
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
            </div>
          ))}

          {!showQuizResult ? (
            <button
              className="btn btn-primary"
              onClick={handleFinishQuiz}
              disabled={Object.keys(selectedAnswers).length < topic.quiz.length}
              style={{ opacity: Object.keys(selectedAnswers).length < topic.quiz.length ? 0.5 : 1, width: '100%', minHeight: '48px', fontSize: '1rem' }}
            >
              <Award size={20} /> Modul Abschließen (+50 XP)
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-emerald)', fontWeight: '700', fontSize: '1.1rem' }}>
              <CheckCircle2 size={24} /> Gut gemacht! Das Modul wurde absolviert.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
