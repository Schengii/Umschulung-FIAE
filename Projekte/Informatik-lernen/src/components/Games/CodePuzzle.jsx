import React, { useState } from 'react';
import { CODE_PUZZLE_LEVELS } from '../../data/gamesData';
import { Puzzle, ArrowUp, ArrowDown, CheckCircle2, Play } from 'lucide-react';

export default function CodePuzzle({ onCompleteGame }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const currentPuzzle = CODE_PUZZLE_LEVELS[levelIdx];

  // For Puzzle 1 (Line Reordering)
  const [userLines, setUserLines] = useState(currentPuzzle.lines || []);
  const [isSuccess, setIsSuccess] = useState(false);

  const hasNextLevel = levelIdx < CODE_PUZZLE_LEVELS.length - 1;

  const goToNextLevel = () => {
    if (!hasNextLevel) return;
    const nextIdx = levelIdx + 1;
    setLevelIdx(nextIdx);
    setUserLines(CODE_PUZZLE_LEVELS[nextIdx].lines || []);
    setIsSuccess(false);
  };

  const moveLine = (idx, direction) => {
    const newLines = [...userLines];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newLines.length) return;

    const temp = newLines[idx];
    newLines[idx] = newLines[targetIdx];
    newLines[targetIdx] = temp;

    setUserLines(newLines);
    setIsSuccess(false);
  };

  const checkOrder = () => {
    const currentOrder = userLines.map(l => l.id);
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(currentPuzzle.correctOrder);

    if (isCorrect) {
      setIsSuccess(true);
      onCompleteGame(`code_puzzle_${currentPuzzle.id}`, currentPuzzle.xpReward);
    } else {
      alert('Die Reihenfolge ist noch nicht ganz korrekt. Überprüfe die Logik!');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Puzzle size={28} color="var(--accent-amber)" /> Code Bug Hunter & Syntax Puzzle
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Bring verdrehte Codezeilen in die richtige Reihenfolge oder finde Fehler.
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        
        <span className="badge badge-amber" style={{ marginBottom: '12px' }}>Level {currentPuzzle.id}</span>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>{currentPuzzle.title}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
          {currentPuzzle.instructions}
        </p>

        {/* Lines Re-order Editor */}
        <div style={{ background: '#090d16', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
          {userLines.map((line, idx) => (
            <div
              key={line.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-tertiary)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '8px',
                fontFamily: 'var(--font-code)',
                fontSize: '0.95rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <span>{line.text}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => moveLine(idx, -1)}
                  disabled={idx === 0}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#fff',
                    cursor: idx === 0 ? 'default' : 'pointer',
                    opacity: idx === 0 ? 0.3 : 1
                  }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveLine(idx, 1)}
                  disabled={idx === userLines.length - 1}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#fff',
                    cursor: idx === userLines.length - 1 ? 'default' : 'pointer',
                    opacity: idx === userLines.length - 1 ? 0.3 : 1
                  }}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={checkOrder}>
            <Play size={16} /> Code Prüfen
          </button>
          
          {isSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontWeight: '700' }}>
              <CheckCircle2 size={22} /> Perfekt! Code ist korrekt strukturiert. (+{currentPuzzle.xpReward} XP)
            </div>
          )}

          {isSuccess && hasNextLevel && (
            <button className="btn btn-secondary" onClick={goToNextLevel}>
              Nächstes Level &rarr;
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
