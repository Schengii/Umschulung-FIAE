import React, { useState, useEffect } from 'react';
import { Keyboard, Timer, Award, CheckCircle2, RefreshCw } from 'lucide-react';

export default function CodeTypingSpeedrun({ onCompleteGame }) {
  const snippets = [
    { lang: 'JavaScript', code: 'const sum = (a, b) => a + b;' },
    { lang: 'Python', code: 'def greeting(name):\n    return f"Hallo {name}"' },
    { lang: 'SQL', code: 'SELECT * FROM users WHERE active = 1;' }
  ];

  const [snippetIdx, setSnippetIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentSnippet = snippets[snippetIdx];

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (!startTime) setStartTime(Date.now());
    setUserInput(val);

    if (val.trim() === currentSnippet.code.trim()) {
      const durationInMinutes = (Date.now() - startTime) / 60000;
      const words = currentSnippet.code.split(' ').length;
      const calculatedWpm = Math.round(words / (durationInMinutes || 0.01));
      setWpm(calculatedWpm);
      setIsCompleted(true);
      onCompleteGame('typing_god', 70);
    }
  };

  const handleRestart = () => {
    setUserInput('');
    setStartTime(null);
    setWpm(null);
    setIsCompleted(false);
    setSnippetIdx((prev) => (prev + 1) % snippets.length);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', border: '2px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Keyboard size={16} /> Code Speedrun & Typing Test
        </span>
        <span style={{ fontSize: '0.88rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
          {currentSnippet.lang} Speed Test
        </span>
      </div>

      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
        ⌨️ Code Typing Speedrun
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '1rem' }}>
        Tippe den untenstehenden Code so schnell und präzise wie möglich ab.
      </p>

      {/* Target Code Snippet Window */}
      <div style={{ background: '#0f172a', color: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--font-code)', fontSize: '1.05rem', marginBottom: '20px', border: '1px solid #334155', userSelect: 'none' }}>
        {currentSnippet.code}
      </div>

      {/* User Input Area */}
      <textarea
        value={userInput}
        onChange={handleInputChange}
        disabled={isCompleted}
        placeholder="Hier den Code exakt abtippen..."
        style={{
          width: '100%',
          minHeight: '90px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-main)',
          border: '2px solid var(--accent-primary)',
          fontFamily: 'var(--font-code)',
          fontSize: '1rem',
          outline: 'none',
          marginBottom: '20px'
        }}
      />

      {isCompleted && (
        <div style={{ background: 'rgba(5, 150, 105, 0.15)', border: '2px solid var(--accent-emerald)', padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0 0 6px' }}>
            🎉 Perfekt abgetippt!
          </h3>
          <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 16px' }}>
            Geschwindigkeit: <span style={{ color: 'var(--accent-amber)' }}>{wpm} WPM</span> (+70 XP)
          </p>
          <button className="btn btn-primary" onClick={handleRestart}>
            <RefreshCw size={18} /> Nächstes Code-Snippet
          </button>
        </div>
      )}
    </div>
  );
}
