import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle2, Code, Zap, Award, ArrowRight, RotateCcw } from 'lucide-react';
import { CLEAN_CODE_CHALLENGES } from '../../data/nextGenLabsData';
import { useStore } from '../../store/useStore';

export default function CleanCodeReviewLab() {
  const { awardXP } = useStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [completedList, setCompletedList] = useState([]);

  const challenge = CLEAN_CODE_CHALLENGES[currentIdx];

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOptionId(option.id);
    setIsAnswered(true);

    if (option.correct) {
      if (!completedList.includes(challenge.id)) {
        setCompletedList([...completedList, challenge.id]);
        awardXP(challenge.xp, `Clean Code Master: ${challenge.title}`);
      }
    }
  };

  const handleNext = () => {
    if (currentIdx < CLEAN_CODE_CHALLENGES.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', color: '#f87171', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <ShieldCheck size={16} /> Code Auditing & Vulnerability Hunter
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Clean Code Review & Refactoring Arena
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Finde kritische Sicherheitslücken (OWASP Top 10), Memory Leaks und N+1 Query Antipatterns und wähle das optimale Refactoring.
          </p>
        </div>

        {/* Progress Badge */}
        <div style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--card-bg, #1e293b)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} color="#fbbf24" /> Challenge {currentIdx + 1} / {CLEAN_CODE_CHALLENGES.length}
        </div>
      </div>

      {/* Code Vulnerability Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Bad Code Box */}
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.4)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <AlertTriangle size={17} color="#ef4444" />
              <span>{challenge.title}</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              BUGGY CODE
            </span>
          </div>
          <pre style={{ margin: 0, padding: '16px', color: '#fca5a5', fontFamily: 'Fira Code, monospace', fontSize: '0.88rem', lineHeight: '1.6', overflowX: 'auto' }}>
            {challenge.badCode}
          </pre>
          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.82rem' }}>
            ⚠️ <strong>Sicherheits-Audit:</strong> {challenge.vulnExplanation}
          </div>
        </div>

        {/* Options & Quiz / Refactored Code */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '18px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>
              Wie muss dieser Code professionell refactored werden?
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {challenge.options.map(opt => {
                const isSelected = selectedOptionId === opt.id;
                let bg = 'rgba(255,255,255,0.04)';
                let border = '1px solid rgba(255,255,255,0.1)';
                let textColor = '#e2e8f0';

                if (isAnswered) {
                  if (opt.correct) {
                    bg = 'rgba(34, 197, 94, 0.2)';
                    border = '1px solid #22c55e';
                    textColor = '#86efac';
                  } else if (isSelected && !opt.correct) {
                    bg = 'rgba(239, 68, 68, 0.2)';
                    border = '1px solid #ef4444';
                    textColor = '#fca5a5';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: bg,
                      border: border,
                      color: textColor,
                      fontSize: '0.88rem',
                      textAlign: 'left',
                      cursor: isAnswered ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>•</span>
                    <div style={{ flex: 1 }}>
                      <div>{opt.label}</div>
                      {isAnswered && (
                        <div style={{ fontSize: '0.8rem', marginTop: '6px', opacity: 0.9 }}>
                          {opt.critique}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Solution Code Preview (Revealed on Answer) */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.4)', overflow: 'hidden' }}
            >
              <div style={{ padding: '10px 16px', background: 'rgba(34, 197, 94, 0.15)', borderBottom: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#86efac', fontSize: '0.88rem', fontWeight: 'bold' }}>
                  <CheckCircle2 size={16} color="#22c55e" />
                  <span>Sauberes Production Refactoring</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  CLEAN CODE
                </span>
              </div>
              <pre style={{ margin: 0, padding: '14px', color: '#86efac', fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', lineHeight: '1.5', overflowX: 'auto' }}>
                {challenge.refactoredCode}
              </pre>
            </motion.div>
          )}

          {/* Navigation Controls */}
          {isAnswered && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {currentIdx < CLEAN_CODE_CHALLENGES.length - 1 ? (
                <button
                  onClick={handleNext}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#6366f1',
                    color: '#fff',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Nächste Challenge <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#22c55e',
                    color: '#fff',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={16} /> Alle Challenges abgeschlossen! Von vorne starten
                </button>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
