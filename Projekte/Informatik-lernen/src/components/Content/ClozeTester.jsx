import React, { useState } from 'react';
import { CLOZE_TESTS } from '../../data/clozeData';
import { FileText, CheckCircle2, AlertCircle, RefreshCw, Award, XCircle } from 'lucide-react';

export default function ClozeTester({ onCompleteCloze }) {
  const [activeTestId, setActiveTestId] = useState(CLOZE_TESTS[0].id);
  const currentTest = CLOZE_TESTS.find((t) => t.id === activeTestId) || CLOZE_TESTS[0];

  const [userSelections, setUserSelections] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const handleSelect = (key, val) => {
    setUserSelections((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const total = Object.keys(currentTest.blanks).length;

    Object.keys(currentTest.blanks).forEach((key) => {
      if (userSelections[key] === currentTest.blanks[key].correct) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / total) * 100);
    setScore(finalScore);
    setIsSubmitted(true);

    if (finalScore >= 75) {
      onCompleteCloze(currentTest.id, currentTest.xpReward);
    }
  };

  const handleReset = () => {
    setUserSelections({});
    setIsSubmitted(false);
    setScore(null);
  };

  // Render Cloze text with inline dropdowns and high-contrast colorblind feedback
  const renderInteractiveText = () => {
    const parts = currentTest.text.split(/(\{\{blank\d+\}\})/g);

    return parts.map((part, idx) => {
      const match = part.match(/\{\{(blank\d+)\}\}/);
      if (match) {
        const blankKey = match[1];
        const blankData = currentTest.blanks[blankKey];
        const selected = userSelections[blankKey] || '';
        const isCorrect = selected === blankData.correct;

        return (
          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', margin: '2px 4px' }}>
            <select
              value={selected}
              onChange={(e) => handleSelect(blankKey, e.target.value)}
              disabled={isSubmitted}
              aria-label={`Lücke ${blankKey}`}
              style={{
                minHeight: '40px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                background: isSubmitted
                  ? isCorrect
                    ? 'rgba(5, 150, 105, 0.15)'
                    : 'rgba(225, 29, 72, 0.15)'
                  : 'var(--bg-tertiary)',
                color: isSubmitted
                  ? isCorrect
                    ? 'var(--accent-emerald)'
                    : 'var(--accent-rose)'
                  : 'var(--text-main)',
                border: isSubmitted
                  ? isCorrect
                    ? '2px solid var(--accent-emerald)'
                    : '2px solid var(--accent-rose)'
                  : '2px solid var(--accent-primary)',
                fontWeight: '700',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: isSubmitted ? 'default' : 'pointer'
              }}
            >
              <option value="">[ Wähle Begriff ]</option>
              {blankData.options.map((opt, oIdx) => (
                <option key={oIdx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {isSubmitted && (
              isCorrect ? (
                <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  <XCircle size={18} style={{ color: 'var(--accent-rose)' }} />
                  (Richtig: {blankData.correct})
                </span>
              )
            )}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header & Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
          <FileText size={30} style={{ color: 'var(--accent-purple)' }} /> Interaktive Lückentexte & IHK-Wissen
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem' }}>
          Befülle die Lücken im Fachkunde-Text mit den korrekten Informatik-Begriffen.
        </p>

        {/* Test Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CLOZE_TESTS.map((test) => (
            <button
              key={test.id}
              onClick={() => {
                setActiveTestId(test.id);
                handleReset();
              }}
              style={{
                minHeight: '44px',
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: '700',
                background: activeTestId === test.id ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                color: activeTestId === test.id ? 'var(--accent-purple)' : 'var(--text-muted)',
                border: activeTestId === test.id ? '2px solid var(--accent-purple)' : '2px solid var(--border-color)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {test.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Cloze Panel */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span className="badge badge-teal">{currentTest.category}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-amber)', fontWeight: '700' }}>
            Belohnung: +{currentTest.xpReward} XP
          </span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-main)' }}>{currentTest.title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.98rem' }}>
          {currentTest.description}
        </p>

        {/* Interactive Text Body */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            lineHeight: '2.3',
            fontSize: '1.05rem',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)'
          }}
        >
          {renderInteractiveText()}
        </div>

        {/* Action Controls */}
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {!isSubmitted ? (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={Object.keys(userSelections).length < Object.keys(currentTest.blanks).length}
              style={{
                opacity: Object.keys(userSelections).length < Object.keys(currentTest.blanks).length ? 0.5 : 1,
                minHeight: '48px',
                fontSize: '1rem',
                width: '100%'
              }}
            >
              <Award size={20} /> Lückentext Auswerten
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
              <button className="btn btn-secondary" onClick={handleReset} style={{ minHeight: '44px' }}>
                <RefreshCw size={16} /> Erneut versuchen
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: score >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  fontWeight: '800',
                  fontSize: '1.15rem'
                }}
              >
                {score >= 75 ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
                <span>Ergebnis: {score}% {score >= 75 ? 'Bestanden! (+XP gutgeschrieben)' : 'Versuche es noch einmal!'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
