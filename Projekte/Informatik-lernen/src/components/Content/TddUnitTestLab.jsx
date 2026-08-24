import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, Award, Sparkles, Code } from 'lucide-react';

export default function TddUnitTestLab({ onRewardXP }) {
  const [code, setCode] = useState(`function add(a, b) {\n  return a + b;\n}`);
  const [testResult, setTestResult] = useState(null);

  const handleRunTests = () => {
    try {
      // Evaluate function
      // eslint-disable-next-line no-new-func
      const fn = new Function(`${code}; return add;`)();
      
      const test1 = fn(2, 3) === 5;
      const test2 = fn(-1, 1) === 0;
      const test3 = fn(0, 0) === 0;

      if (test1 && test2 && test3) {
        setTestResult({ success: true, text: '✅ Alle 3 Unit Tests (Jest) wurden erfolgreich bestanden! (+80 XP)' });
        onRewardXP(80);
      } else {
        setTestResult({ success: false, text: '❌ Test fehlgeschlagen: Die Funktion liefert nicht das erwartete Ergebnis.' });
      }
    } catch (e) {
      setTestResult({ success: false, text: `❌ Syntax Fehler: ${e.message}` });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', border: '2px solid var(--accent-primary)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span className="badge badge-indigo">Test-Driven Development (TDD)</span>
        <span style={{ fontSize: '0.88rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
          Belohnung: +80 XP
        </span>
      </div>

      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
        🧪 Unit-Testing & TDD Challenge (Jest Simulator)
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '1rem' }}>
        Schreibe und repariere die Funktion `add(a, b)`, um alle automatisierten Unit Tests grün zu machen.
      </p>

      {/* Code Editor */}
      <div className="code-window" style={{ marginBottom: '20px' }}>
        <div className="code-header">
          <span>add.js (Implementation)</span>
          <span>JavaScript</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: '100%',
            minHeight: '120px',
            background: '#0f172a',
            color: '#f8fafc',
            border: 'none',
            padding: '16px',
            fontFamily: 'var(--font-code)',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>

      <button className="btn btn-primary" onClick={handleRunTests} style={{ width: '100%', minHeight: '48px', fontSize: '1rem', marginBottom: '20px' }}>
        <Play size={18} /> Unit Tests ausführen (Jest)
      </button>

      {testResult && (
        <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: testResult.success ? 'rgba(5, 150, 105, 0.15)' : 'rgba(225, 29, 72, 0.15)', color: testResult.success ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>
          {testResult.text}
        </div>
      )}
    </div>
  );
}
