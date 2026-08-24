import React, { useState } from 'react';
import { QUIZ_ARENA_CATEGORIES } from '../../data/quizArenaData';
import { Trophy, CheckCircle2, XCircle, Award, Sparkles, RefreshCw } from 'lucide-react';

export default function KnowledgeQuizArena({ onRewardXP }) {
  const [selectedCatId, setSelectedCatId] = useState(QUIZ_ARENA_CATEGORIES[0].id);
  const [userAnswers, setUserAnswers] = useState({});
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [score, setScore] = useState(null);

  const category = QUIZ_ARENA_CATEGORIES.find(c => c.id === selectedCatId) || QUIZ_ARENA_CATEGORIES[0];

  const handleSelectAnswer = (qIdx, optIdx) => {
    if (!isEvaluated) {
      setUserAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    }
  };

  const handleEvaluate = () => {
    let correct = 0;
    category.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / category.questions.length) * 100);
    setScore(finalScore);
    setIsEvaluated(true);

    if (finalScore >= 50) {
      onRewardXP(50);
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsEvaluated(false);
    setScore(null);
  };

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={32} style={{ color: 'var(--accent-amber)' }} /> Interaktive IT Wissens-Quiz Arena
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Teste dein Wissen über KI-Trends, Cloud, Kubernetes, IT-Basics und IHK-Themen.
        </p>
      </div>

      {/* Category Selection Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {QUIZ_ARENA_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCatId(cat.id); handleReset(); }}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedCatId === cat.id ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: selectedCatId === cat.id ? '#ffffff' : 'var(--text-main)',
              border: selectedCatId === cat.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Questions Panel */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span className="badge badge-teal">{category.title}</span>
          <span className="badge badge-indigo">{category.difficulty}</span>
        </div>

        {category.questions.map((q, qIdx) => (
          <div key={qIdx} style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
            <p style={{ fontWeight: '800', fontSize: '1.05rem', marginBottom: '14px', color: 'var(--text-main)' }}>
              {qIdx + 1}. {q.q}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.options.map((opt, oIdx) => {
                const isSelected = userAnswers[qIdx] === oIdx;
                const isCorrect = q.correct === oIdx;
                let bg = 'var(--bg-secondary)';
                let border = 'var(--border-color)';

                if (isEvaluated) {
                  if (isCorrect) {
                    bg = 'rgba(5, 150, 105, 0.15)';
                    border = 'var(--accent-emerald)';
                  } else if (isSelected && !isCorrect) {
                    bg = 'rgba(225, 29, 72, 0.15)';
                    border = 'var(--accent-rose)';
                  }
                } else if (isSelected) {
                  bg = 'rgba(79, 70, 229, 0.15)';
                  border = 'var(--accent-primary)';
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectAnswer(qIdx, oIdx)}
                    style={{
                      minHeight: '44px',
                      padding: '12px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: bg,
                      border: `2px solid ${border}`,
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      fontWeight: 600,
                      cursor: isEvaluated ? 'default' : 'pointer'
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {isEvaluated && (
              <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-main)', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '6px', borderLeft: '4px solid var(--accent-primary)' }}>
                💡 <strong>Erklärung:</strong> {q.explanation}
              </div>
            )}
          </div>
        ))}

        {!isEvaluated ? (
          <button
            className="btn btn-primary"
            onClick={handleEvaluate}
            disabled={Object.keys(userAnswers).length < category.questions.length}
            style={{ opacity: Object.keys(userAnswers).length < category.questions.length ? 0.5 : 1, width: '100%', minHeight: '48px', fontSize: '1rem' }}
          >
            <Award size={20} /> Quiz Auswerten (+50 XP)
          </button>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: score >= 50 ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginBottom: '12px' }}>
              Ergebnis: {score}% {score >= 50 ? 'Bestanden! (+50 XP)' : 'Versuche es erneut'}
            </h3>
            <button className="btn btn-secondary" onClick={handleReset} style={{ minHeight: '44px' }}>
              <RefreshCw size={18} /> Erneut versuchen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
