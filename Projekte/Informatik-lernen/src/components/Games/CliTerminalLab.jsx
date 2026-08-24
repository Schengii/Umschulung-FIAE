import React, { useState } from 'react';
import { Terminal, CheckCircle2, Play, RefreshCw, Award } from 'lucide-react';

export default function CliTerminalLab({ onCompleteGame }) {
  const [history, setHistory] = useState([
    { type: 'output', text: 'Willkommen im IT-DevGame Terminal Simulator v1.0' },
    { type: 'output', text: 'Tippe "help" für eine Übersicht verfügbarer Befehle.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [completedTasks, setCompletedTasks] = useState([]);

  const tasks = [
    { id: 'ls', command: 'ls', desc: '1. Ordnerinhalt auflisten: Tippe "ls"' },
    { id: 'mkdir', command: 'mkdir mein_projekt', desc: '2. Neuen Ordner erstellen: Tippe "mkdir mein_projekt"' },
    { id: 'cd', command: 'cd mein_projekt', desc: '3. In den Ordner wechseln: Tippe "cd mein_projekt"' },
    { id: 'git', command: 'git status', desc: '4. Git Status prüfen: Tippe "git status"' }
  ];

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    const newHistory = [...history, { type: 'input', text: `dev@it-system:~$ ${cmd}` }];

    let response = '';
    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      response = 'Verfügbare Befehle: ls, mkdir <name>, cd <folder>, pwd, git status, clear, help';
    } else if (lower === 'ls') {
      response = 'README.md  package.json  src/  public/  dist/';
    } else if (lower.startsWith('mkdir')) {
      response = `Ordner "${cmd.split(' ')[1] || 'ordner'}" erfolgreich erstellt.`;
    } else if (lower.startsWith('cd')) {
      response = `Verzeichnis gewechselt zu: ~/${cmd.split(' ')[1] || ''}`;
    } else if (lower === 'pwd') {
      response = '/home/developer/Informatik-lernen';
    } else if (lower === 'git status') {
      response = 'On branch main\nYour branch is up to date with origin/main.\nnothing to commit, working tree clean';
    } else if (lower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else {
      response = `Befehl nicht gefunden: ${cmd}. Tippe "help" für Hilfe.`;
    }

    newHistory.push({ type: 'output', text: response });
    setHistory(newHistory);
    setInputVal('');

    // Check if task matched
    tasks.forEach(task => {
      if (cmd.toLowerCase() === task.command.toLowerCase() && !completedTasks.includes(task.id)) {
        const nextTasks = [...completedTasks, task.id];
        setCompletedTasks(nextTasks);
        if (nextTasks.length === tasks.length) {
          onCompleteGame('cli_master', 75);
        }
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', border: '2px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span className="badge badge-teal">Kommandozeilen Trainer (CLI)</span>
        <span style={{ fontSize: '0.88rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
          Aufgaben gelöst: {completedTasks.length} / {tasks.length}
        </span>
      </div>

      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Terminal size={28} style={{ color: 'var(--accent-primary)' }} /> Interaktives Linux / Bash Terminal
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '1rem' }}>
        Lerne die wichtigsten Terminal-Befehle für Linux, macOS & Windows PowerShell.
      </p>

      {/* Task Progress List */}
      <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
          🎯 Terminal-Übungsaufgaben:
        </strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          {tasks.map(t => {
            const isDone = completedTasks.includes(t.id);
            return (
              <div key={t.id} style={{ fontSize: '0.85rem', color: isDone ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} style={{ color: isDone ? 'var(--accent-emerald)' : 'var(--border-color)' }} />
                <span>{t.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Terminal Window */}
      <div style={{ background: '#0f172a', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid #334155' }}>
        <div style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '8px', fontFamily: 'var(--font-code)' }}>bash - dev@it-system:~</span>
        </div>

        <div style={{ padding: '20px', minHeight: '260px', maxHeight: '350px', overflowY: 'auto', fontFamily: 'var(--font-code)', fontSize: '0.92rem', color: '#f8fafc', lineHeight: '1.6' }}>
          {history.map((item, idx) => (
            <div key={idx} style={{ color: item.type === 'input' ? '#818cf8' : '#cbd5e1', whiteSpace: 'pre-wrap' }}>
              {item.text}
            </div>
          ))}

          <form onSubmit={handleCommandSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ color: '#2dd4bf', fontWeight: 800, marginRight: '8px' }}>dev@it-system:~$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-code)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              autoFocus
            />
          </form>
        </div>
      </div>
    </div>
  );
}
