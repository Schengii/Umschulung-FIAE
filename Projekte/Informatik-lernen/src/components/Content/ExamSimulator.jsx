import React, { useState, useEffect, useCallback } from 'react';
import { EXAM_QUESTIONS, IHK_EXAM_MODES, getIhkGrade } from '../../data/examData';
import { Timer, CheckCircle2, XCircle, RefreshCw, Play, Pause, FileCheck2, Bookmark, BookmarkCheck, BarChart3, Filter } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

export default function ExamSimulator({ onCompleteExam, onRecordResults }) {
  const [activeModeId, setActiveModeId] = useState('ap1');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({});
  const [questionFilter, setQuestionFilter] = useState('all'); // 'all' | 'bookmarked' | 'unanswered'
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

  const toggleBookmark = (qId) => {
    setBookmarkedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
    triggerHaptic('LIGHT');
  };

  const handleSubmit = useCallback(() => {
    let earnedPoints = 0;
    let maxPoints = 0;
    let correctCount = 0;
    const categoryStats = {};

    filteredQuestions.forEach((q, idx) => {
      const qPoints = q.points || 10;
      maxPoints += qPoints;
      const isCorrect = selectedAnswers[idx] === q.correct;

      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { correct: 0, total: 0, points: 0, maxPoints: 0 };
      }
      categoryStats[q.category].total += 1;
      categoryStats[q.category].maxPoints += qPoints;

      if (isCorrect) {
        earnedPoints += qPoints;
        correctCount++;
        categoryStats[q.category].correct += 1;
        categoryStats[q.category].points += qPoints;
      }
    });

    // Unbeantwortete Fragen zählen als Fehler und landen im Fehlerjournal
    if (onRecordResults) {
      onRecordResults(filteredQuestions.map((q, idx) => ({ id: q.id, correct: selectedAnswers[idx] === q.correct })));
    }

    const percent = Math.round((earnedPoints / maxPoints) * 100);
    const gradeInfo = getIhkGrade(percent);

    const result = {
      earnedPoints,
      maxPoints,
      percent,
      correctCount,
      totalCount: filteredQuestions.length,
      gradeInfo,
      categoryStats
    };

    setScoreData(result);
    setIsSubmitted(true);
    setIsTimerRunning(false);
    triggerHaptic(percent >= 50 ? 'SUCCESS' : 'WARNING');

    if (percent >= 50 && onCompleteExam) {
      onCompleteExam(percent, percent >= 80 ? 150 : 80);
    }
  }, [filteredQuestions, selectedAnswers, onCompleteExam, onRecordResults]);

  useEffect(() => {
    setTimeLeft(currentMode.durationMinutes * 60);
    setIsTimerRunning(true);
    setSelectedAnswers({});
    setBookmarkedQuestions({});
    setQuestionFilter('all');
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
      triggerHaptic('LIGHT');
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setBookmarkedQuestions({});
    setQuestionFilter('all');
    setIsSubmitted(false);
    setScoreData(null);
    setTimeLeft(currentMode.durationMinutes * 60);
    setIsTimerRunning(true);
    triggerHaptic('MEDIUM');
  };

  // Filtered view logic
  const bookmarkedCount = filteredQuestions.filter(q => bookmarkedQuestions[q.id]).length;
  const unansweredCount = filteredQuestions.filter((_, idx) => selectedAnswers[idx] === undefined).length;

  const visibleQuestions = filteredQuestions.filter((q, idx) => {
    if (questionFilter === 'bookmarked') return bookmarkedQuestions[q.id];
    if (questionFilter === 'unanswered') return selectedAnswers[idx] === undefined;
    return true;
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header & Mode Switcher */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
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

        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
          🎓 {currentMode.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
          {currentMode.description} ({filteredQuestions.length} Fragen im Pool)
        </p>

        {/* Action & Filter Bar */}
        {!isSubmitted && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              <Filter size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Ansicht filtern:
            </span>
            <button
              onClick={() => setQuestionFilter('all')}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                border: 'none',
                background: questionFilter === 'all' ? 'var(--accent-primary, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
                color: questionFilter === 'all' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Alle ({filteredQuestions.length})
            </button>
            <button
              onClick={() => setQuestionFilter('bookmarked')}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                border: 'none',
                background: questionFilter === 'bookmarked' ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                color: questionFilter === 'bookmarked' ? '#000' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Markiert ({bookmarkedCount})
            </button>
            <button
              onClick={() => setQuestionFilter('unanswered')}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                border: 'none',
                background: questionFilter === 'unanswered' ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
                color: questionFilter === 'unanswered' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Offen ({unansweredCount})
            </button>
          </div>
        )}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
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

          {/* Detaillierte Themen-/Kategorie-Aufschlüsselung */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={18} /> Ergebnis nach Wissensgebieten / IHK-Themen:
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {Object.entries(scoreData.categoryStats).map(([catName, stats]) => {
                const catPercent = Math.round((stats.correct / stats.total) * 100);
                const isCatPassed = catPercent >= 50;
                return (
                  <div key={catName} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-main)' }}>{catName}</span>
                      <span style={{ color: isCatPassed ? '#10b981' : '#ef4444' }}>{catPercent}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${catPercent}%`, height: '100%', background: isCatPassed ? '#10b981' : '#ef4444' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {stats.correct} von {stats.total} Fragen richtig
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Exam Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {visibleQuestions.map((q) => {
          const originalIdx = filteredQuestions.findIndex(orig => orig.id === q.id);
          const isBookmarked = !!bookmarkedQuestions[q.id];

          return (
            <div key={q.id} className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)', borderRadius: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-teal">{q.category}</span>
                  <button
                    onClick={() => toggleBookmark(q.id)}
                    title={isBookmarked ? 'Markierung aufheben' : 'Frage für Nachprüfung markieren'}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: isBookmarked ? '#f59e0b' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}
                  >
                    {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    {isBookmarked && <span>Markiert</span>}
                  </button>
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{q.points || 10} IHK-Punkte</span>
              </div>

              <p style={{ fontWeight: '800', fontSize: '1.05rem', marginBottom: '16px', color: 'var(--text-main)' }}>
                Frage {originalIdx + 1}: {q.question}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[originalIdx] === oIdx;
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
                      onClick={() => handleSelect(originalIdx, oIdx)}
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
          );
        })}
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
