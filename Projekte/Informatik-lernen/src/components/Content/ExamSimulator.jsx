import React, { useState, useEffect, useCallback } from 'react';
import { EXAM_QUESTIONS, IHK_EXAM_MODES, getIhkGrade } from '../../data/examData';
import { Timer, CheckCircle2, XCircle, RefreshCw, Play, Pause, FileCheck2 } from 'lucide-react';

export default function ExamSimulator({ onCompleteExam }) {
  const [activeModeId, setActiveModeId] = useState('ap1');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  
  // Real-time Exam Timer (90 or 15 mins)
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentMode = IHK_EXAM_MODES.find(m => m.id === activeModeId) || IHK_EXAM_MODES[0];
  
  // Filter questions for active mode or show full mix
  const filteredQuestions = activeModeId === 'quick_mixed' 
    ? EXAM_QUESTIONS 
    : EXAM_QUESTIONS.filter(q => q.examType === activeModeId || q.examType === 'ap1');

  const handleSubmit = useCallback(() => {
    let earnedPoints = 0;
    let maxPoints = 0;
    let correctCount = 0;

    filteredQuestions.forEach((q, idx) => {
      const qPoints = q.points || 10;
      maxPoints += qPoints;
      if (selectedAnswers[idx] === q.correct) {
        earnedPoints += qPoints;
        correctCount++;
      }
    });

    const percent = Math.round((earnedPoints / maxPoints) * 100);
    const gradeInfo = getIhkGrade(percent);

    const result = {
      earnedPoints,
      maxPoints,
      percent,
      correctCount,
      totalCount: filteredQuestions.length,
      gradeInfo
    };

    setScoreData(result);
    setIsSubmitted(true);
    setIsTimerRunning(false);

    if (percent >= 50 && onCompleteExam) {
      onCompleteExam(percent, percent >= 80 ? 150 : 80);
    }
  }, [filteredQuestions, selectedAnswers, onCompleteExam]);

  useEffect(() => {
    setTimeLeft(currentMode.durationMinutes * 60);
    setIsTimerRunning(true);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScoreData(null);
  }, [activeModeId, currentMode.durationMinutes]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isSubmitted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted, timeLeft, handleSubmit]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (qIdx, optIdx) => {
    if (!isSubmitted) {
      setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScoreData(null);
    setTimeLeft(currentMode.durationMinutes * 60);
    setIsTimerRunning(true);
  };

  return (
    <div style={{ maxWidth: '940px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header & Mode Switcher */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {IHK_EXAM_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setActiveModeId(mode.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  border: activeModeId === mode.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: activeModeId === mode.id ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                  color: activeModeId === mode.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {mode.title.split(':')[0]}
              </button>
            ))}
          </div>

          {/* Real-time Exam Clock */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-secondary)', 
            padding: '6px 14px', 
            borderRadius: '9999px',
            border: `1px solid ${timeLeft < 300 ? 'var(--accent-rose)' : 'var(--border-color)'}`,
            color: timeLeft < 300 ? 'var(--accent-rose)' : 'var(--accent-amber)', 
            fontWeight: 800,
            fontSize: '0.95rem'
          }}>
            <Timer size={18} />
            <span>{formatTimer(timeLeft)}</span>
            {!isSubmitted && (
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}
                title={isTimerRunning ? 'Timer pausieren' : 'Timer fortsetzen'}
              >
                {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
              </button>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
          🎓 {currentMode.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: '1.6', margin: 0 }}>
          {currentMode.description}
        </p>
      </div>

      {/* Results Banner when submitted */}
      {isSubmitted && scoreData && (
        <div className="glass-panel" style={{ 
          padding: '24px', 
          marginBottom: '28px', 
          border: `2px solid ${scoreData.gradeInfo.color}`,
          background: `${scoreData.gradeInfo.color}15`,
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: scoreData.gradeInfo.color }}>
                Offizielles IHK Prüfungs-Ergebnis
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', margin: '4px 0' }}>
                Note {scoreData.gradeInfo.grade} ({scoreData.gradeInfo.text}) — {scoreData.percent}%
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.95rem' }}>
                {scoreData.gradeInfo.note} ({scoreData.earnedPoints} von {scoreData.maxPoints} Punkten erzielt)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleReset} 
                className="btn btn-primary"
                style={{ gap: '8px' }}
              >
                <RefreshCw size={16} /> Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredQuestions.map((q, idx) => (
          <div key={q.id} className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
              <span className="badge badge-teal">{q.category}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{q.points || 10} IHK-Punkte</span>
            </div>

            <p style={{ fontWeight: '800', fontSize: '1.05rem', marginBottom: '16px', color: 'var(--text-main)' }}>
              Frage {idx + 1}: {q.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[idx] === oIdx;
                const isCorrect = q.correct === oIdx;
                let btnBg = 'var(--bg-tertiary)';
                let btnBorder = 'var(--border-color)';
                let icon = null;

                if (isSubmitted) {
                  if (isCorrect) {
                    btnBg = 'rgba(5, 150, 105, 0.15)';
                    btnBorder = 'var(--accent-emerald)';
                    icon = <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />;
                  } else if (isSelected && !isCorrect) {
                    btnBg = 'rgba(225, 29, 72, 0.15)';
                    btnBorder = 'var(--accent-rose)';
                    icon = <XCircle size={18} style={{ color: 'var(--accent-rose)' }} />;
                  }
                } else if (isSelected) {
                  btnBg = 'rgba(79, 70, 229, 0.15)';
                  btnBorder = 'var(--accent-primary)';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(idx, oIdx)}
                    style={{
                      minHeight: '44px',
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: btnBg,
                      border: `2px solid ${btnBorder}`,
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.95rem',
                      fontWeight: isSelected ? '700' : '500',
                      cursor: isSubmitted ? 'default' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after submission */}
            {isSubmitted && q.explanation && (
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <strong>Erklärung & IHK-Musterlösung:</strong> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Action Bar */}
      {!isSubmitted && (
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: '1.1rem', fontWeight: 800, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' }}
          >
            <FileCheck2 size={20} /> IHK-Prüfung Jetzt Abgeben & Auswerten
          </button>
        </div>
      )}
    </div>
  );
}
