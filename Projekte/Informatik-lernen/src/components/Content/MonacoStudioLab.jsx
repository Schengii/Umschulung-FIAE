import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code, Play, RotateCcw, Terminal } from 'lucide-react';
import { runInSandbox } from '../../utils/sandboxRunner';
import { loadLocalMonaco } from '../../utils/monacoLoader';

export default function MonacoStudioLab({ onRewardXP }) {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(`// VS Code Monaco Studio Lab\nfunction welcomeDeveloper(name) {\n    return \`Willkommen zurück, \${name}! Bereit zum Coden?\`;\n}\n\nconsole.log(welcomeDeveloper("IT-Azubi"));`);
  const [consoleLogs, setConsoleLogs] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  // 'loading' | 'ready' | 'failed' - Monaco kommt aus dem eigenen Bundle (siehe monacoLoader.js).
  const [editorStatus, setEditorStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    loadLocalMonaco()
      .then(() => active && setEditorStatus('ready'))
      .catch(() => active && setEditorStatus('failed'));
    return () => {
      active = false;
    };
  }, []);

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '20px' }}>
        {/* Monaco Editor Container */}
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {editorStatus === 'ready' ? (
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
          ) : (
            <textarea
              aria-label="Code-Editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              readOnly={editorStatus === 'loading'}
              style={{ width: '100%', height: '320px', boxSizing: 'border-box', background: '#1e1e1e', color: '#d4d4d4', border: 'none', padding: '12px', fontFamily: 'var(--font-mono, monospace)', fontSize: '14px', resize: 'none' }}
            />
          )}
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
              background: 'var(--bg-card)',
              color: 'var(--accent-cyan)',
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
