import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code, Play, RotateCcw, Terminal } from 'lucide-react';
import { runInSandbox } from '../../utils/sandboxRunner';

export default function MonacoStudioLab({ onRewardXP }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(`// VS Code Monaco Studio Lab\nfunction welcomeDeveloper(name) {\n    return \`Willkommen zurück, \${name}! Bereit zum Coden?\`;\n}\n\nconsole.log(welcomeDeveloper("IT-Azubi"));`);
  const [consoleLogs, setConsoleLogs] = useState([]);

  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    setConsoleLogs([]);

    if (language !== 'javascript') {
      setConsoleLogs([`[${language.toUpperCase()} Engine] Code erfolgreich validiert.`]);
      if (onRewardXP) onRewardXP(25);
      return;
    }

    setIsRunning(true);
    const res = await runInSandbox({ code });
    setIsRunning(false);

    if (!res.ok) {
      setConsoleLogs([...res.logs, res.timedOut ? `⏱️ ${res.error}` : `❌ Runtime Exception: ${res.error}`]);
      return;
    }

    setConsoleLogs(res.logs.length > 0 ? res.logs : ['Code ohne Konsolenausgabe ausgeführt.']);
    if (onRewardXP) onRewardXP(25);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <Code size={14} /> VS Code Integration
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            💻 Monaco Code Studio (VS Code im Browser)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Nutze echte Auto-Completion, Syntax Highlighting & IntelliSense direkt im Browser.
          </p>
        </div>

        {/* Language Selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['javascript', 'python', 'json', 'html'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`btn ${language === lang ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Monaco Editor Container */}
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <Editor
            height="320px"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
          <div style={{ background: 'var(--bg-primary)', padding: '12px 16px', display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={handleRunCode} disabled={isRunning}>
              <Play size={16} /> {isRunning ? 'Läuft…' : 'Code Ausführen'}
            </button>
            <button className="btn btn-secondary" onClick={() => setCode('// Reset code')}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* Output Console */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} /> Output & IntelliSense Konsole
          </h4>
          <div
            style={{
              background: '#0f172a',
              color: '#38bdf8',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              minHeight: '320px',
              whiteSpace: 'pre-wrap',
              border: '1px solid #1e293b'
            }}
          >
            {consoleLogs.map((line, idx) => (
              <div key={idx} style={{ marginBottom: '6px' }}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
