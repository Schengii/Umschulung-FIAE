import React, { useState, useEffect, useRef } from 'react';
import { ORAL_EXAM_DATA } from '../../data/oralExamData';
import { GraduationCap, Timer, CheckCircle2, ChevronRight, RotateCcw, Sparkles, Mic, MicOff } from 'lucide-react';

export default function IhkOralExamSimulator({ onRewardXP }) {
  const [selectedRole, setSelectedRole] = useState('ae'); // 'ae' | 'fisi'
  const [selectedProject, setSelectedProject] = useState(ORAL_EXAM_DATA.ae.projects[0]);
  const [examState, setExamState] = useState('intro'); // 'intro' | 'presentation' | 'colloquium' | 'result'
  
  // Voice Input Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  
  // Timer State (in Seconds)
  const [timeLeft, setTimeLeft] = useState(900); // 15 Min
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fachgespräch Questions State
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const roleData = ORAL_EXAM_DATA[selectedRole];
  const questions = roleData.questions;
  const currentQuestion = questions[currentQIdx];

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Die Web Speech API wird von diesem Browser leider nicht unterstützt. Bitte nutze Google Chrome oder Edge.');
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);

      // Check if transcript matches any option text partially
      if (currentQuestion && !showFeedback) {
        currentQuestion.options.forEach((opt, idx) => {
          const keywords = opt.text.toLowerCase().split(' ').filter(w => w.length > 4);
          const matchCount = keywords.filter(k => currentText.toLowerCase().includes(k)).length;
          if (matchCount >= 2 && currentText.length > 15) {
            handleSelectOption(idx);
          }
        });
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const toggleChecklist = (id) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleStartExam = () => {
    setExamState('presentation');
    setTimeLeft(900);
    setIsTimerRunning(true);
  };

  const handleFinishPresentation = () => {
    setExamState('colloquium');
    setTimeLeft(900); // 15 Min für Fachgespräch
    setCurrentQIdx(0);
    setAnswers({});
    setShowFeedback(false);
    setSelectedOption(null);
  };

  const handleSelectOption = (idx) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    const isCorrect = currentQuestion.options[idx].isCorrect;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: isCorrect }));
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      setIsTimerRunning(false);
      setExamState('result');
      const correctCount = Object.values({ ...answers, [currentQuestion.id]: currentQuestion.options[selectedOption]?.isCorrect }).filter(Boolean).length;
      const score = Math.round((correctCount / questions.length) * 100);
      if (score >= 50 && onRewardXP) {
        onRewardXP(score >= 80 ? 60 : 35);
      }
    }
  };

  const calculateScore = () => {
    const correctCount = Object.values(answers).filter(Boolean).length;
    return Math.round((correctCount / questions.length) * 100);
  };

  const getIhkGrade = (percent) => {
    if (percent >= 92) return { grade: 'Sehr Gut (1)', text: 'Hervorragende Prüfungsleistung!' };
    if (percent >= 81) return { grade: 'Gut (2)', text: 'Solides Fachwissen und souveräne Argumentation.' };
    if (percent >= 67) return { grade: 'Befriedigend (3)', text: 'Bestanden, aber kleinere Lücken in der Begründung.' };
    if (percent >= 50) return { grade: 'Ausreichend (4)', text: 'Knapp bestanden. Bitte Begrifflichkeiten vertiefen.' };
    return { grade: 'Nicht Bestanden (5/6)', text: 'Wichtige Kernkonzepte müssen wiederholt werden.' };
  };

  const handleReset = () => {
    setExamState('intro');
    setTimeLeft(900);
    setIsTimerRunning(false);
    setCurrentQIdx(0);
    setAnswers({});
    setSelectedOption(null);
    setShowFeedback(false);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <GraduationCap size={14} /> IHK AP Teil 2 Mündliche Prüfung
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🎙️ IHK Projektpräsentations- & Fachgesprächs-Simulator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Simuliere den 30-minütigen Ernstfall: 15 Min. Projektpräsentation & 15 Min. Fachgespräch vor dem IHK-Prüfungsausschuss.
          </p>
        </div>

        {examState !== 'intro' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-primary)', padding: '8px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Timer size={20} color="var(--accent-primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {examState === 'presentation' ? 'Präsentationszeit (15 Min)' : 'Fachgesprächszeit (15 Min)'}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'monospace', color: timeLeft < 180 ? 'var(--accent-rose)' : 'var(--accent-primary)' }}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* INTRO SCREEN */}
      {examState === 'intro' && (
        <div>
          {/* Role & Project Selection */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              1. Wähle deinen IHK-Ausbildungsberuf:
            </h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                className={`btn ${selectedRole === 'ae' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setSelectedRole('ae'); setSelectedProject(ORAL_EXAM_DATA.ae.projects[0]); }}
              >
                💻 Anwendungsentwicklung (FIAE)
              </button>
              <button
                className={`btn ${selectedRole === 'fisi' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setSelectedRole('fisi'); setSelectedProject(ORAL_EXAM_DATA.fisi.projects[0]); }}
              >
                🌐 Systemintegration (FISI)
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              2. Wähle dein betriebliches Abschlussprojekt:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {roleData.projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  style={{
                    background: selectedProject.id === p.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-primary)',
                    border: selectedProject.id === p.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    padding: '18px',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer'
                  }}
                >
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                    {p.title}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                    {p.context}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleStartExam} style={{ gap: '8px', fontSize: '1rem', padding: '14px 28px' }}>
            <Sparkles size={18} /> IHK-Prüfung Starten (15m + 15m)
          </button>
        </div>
      )}

      {/* PHASE 1: PRESENTATION CHECKLIST */}
      {examState === 'presentation' && (
        <div>
          <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', borderLeft: '4px solid var(--accent-primary)' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>
              🎯 Phase 1: Deine 15-minütige Projektpräsentation
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Thema: <strong>{selectedProject.title}</strong>. Hake alle Abschnitte ab, die du während deiner Präsentation behandelst:
            </p>
          </div>

          <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
            {checklist.map(item => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: item.checked ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-primary)',
                  border: item.checked ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {item.checked ? <CheckCircle2 size={22} color="var(--accent-emerald)" /> : <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid var(--border-color)' }} />}
                <span style={{ fontSize: '0.95rem', fontWeight: item.checked ? '700' : '500', color: item.checked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={handleFinishPresentation}
            style={{ gap: '8px' }}
          >
            Präsentation beenden & Weiter zum Fachgespräch &rarr;
          </button>
        </div>
      )}

      {/* PHASE 2: COLLOQUIUM (FACHGESPRÄCH) */}
      {examState === 'colloquium' && currentQuestion && (
        <div>
          {/* Question Card */}
          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{currentQuestion.avatar}</span>
                <div>
                  <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem' }}>
                    {currentQuestion.examiner}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                    Frage {currentQIdx + 1} von {questions.length}
                  </div>
                </div>
              </div>

              {/* Voice Speech Recognition Toggle Button */}
              <button
                onClick={toggleVoiceInput}
                className="btn btn-sm"
                style={{
                  background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-secondary)',
                  border: `1px solid ${isListening ? 'var(--accent-rose)' : 'var(--border-color)'}`,
                  color: isListening ? 'var(--accent-rose)' : 'var(--text-main)',
                  gap: '6px',
                  fontWeight: 700
                }}
                title="Sprich deine Antwort per Mikrofon ein"
              >
                {isListening ? <Mic size={15} className="animate-pulse" /> : <MicOff size={15} />}
                <span>{isListening ? 'Aufnahme aktiv... (Sprich jetzt)' : 'Mikrofon Antwort'}</span>
              </button>
            </div>

            {/* Live Audio Transcript Display */}
            {isListening && transcript && (
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--accent-primary)', marginBottom: '16px', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                🎙️ <strong>Erkannte Sprache:</strong> "{transcript}"
              </div>
            )}

            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              "{currentQuestion.question}"
            </h3>

            {/* Multiple Choice Options */}
            <div style={{ display: 'grid', gap: '12px' }}>
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let bg = 'var(--bg-card)';
                let border = '1px solid var(--border-color)';

                if (showFeedback) {
                  if (opt.isCorrect) {
                    bg = 'rgba(16, 185, 129, 0.15)';
                    border = '2px solid var(--accent-emerald)';
                  } else if (isSelected && !opt.isCorrect) {
                    bg = 'rgba(239, 68, 68, 0.15)';
                    border = '2px solid var(--accent-rose)';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    style={{
                      textAlign: 'left',
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      background: bg,
                      border: border,
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      cursor: showFeedback ? 'default' : 'pointer'
                    }}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Feedback Box */}
            {showFeedback && (
              <div style={{ marginTop: '20px', padding: '16px', borderRadius: 'var(--radius-md)', background: currentQuestion.options[selectedOption]?.isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: currentQuestion.options[selectedOption]?.isCorrect ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-rose)' }}>
                <div style={{ fontWeight: '800', marginBottom: '6px', color: currentQuestion.options[selectedOption]?.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {currentQuestion.options[selectedOption]?.isCorrect ? '✅ IHK-Prüfer nickt zustimmend' : '❌ Kritische Nachfrage des Prüfers'}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {currentQuestion.options[selectedOption]?.feedback}
                </div>
              </div>
            )}
          </div>

          {showFeedback && (
            <button className="btn btn-primary" onClick={handleNextQuestion} style={{ gap: '8px' }}>
              {currentQIdx < questions.length - 1 ? 'Nächste Prüfer-Frage' : 'Prüfung Auswerten'} <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* RESULT SCREEN */}
      {examState === 'result' && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
            {calculateScore() >= 50 ? '🎓' : '📚'}
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-main)' }}>
            IHK-Abschlussnote: {getIhkGrade(calculateScore()).grade}
          </h3>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            {getIhkGrade(calculateScore()).text} ({calculateScore()} % im Fachgespräch)
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleReset} style={{ gap: '8px' }}>
              <RotateCcw size={16} /> Erneut Trainieren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
