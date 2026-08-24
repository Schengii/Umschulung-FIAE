import React, { useState } from 'react';
import { GitBranch, GitCommit, GitMerge, ArrowRight, CheckCircle2, RotateCcw, Terminal } from 'lucide-react';

export default function GitLab({ onRewardXP }) {
  const [commits, setCommits] = useState([
    { id: 'c1', message: 'Initial commit', branch: 'main' },
    { id: 'c2', message: 'Add README.md', branch: 'main' }
  ]);
  const [activeBranch, setActiveBranch] = useState('main');
  const [branches, setBranches] = useState(['main']);
  const [commandInput, setCommandInput] = useState('');
  const [logs, setLogs] = useState(['Willkommen im Visual Git Branching Simulator! Gib Git-Befehle ein oder nutze Quick-Buttons.']);
  const [taskIndex, setTaskIndex] = useState(0);

  const tasks = [
    { title: 'Task 1: Erstelle einen neuen Branch', desc: 'Führe den Befehl `git branch feature` aus oder nutze den Button.' },
    { title: 'Task 2: Wechsle auf den Feature-Branch', desc: 'Führe `git checkout feature` aus.' },
    { title: 'Task 3: Erstelle einen Commit auf dem Feature-Branch', desc: 'Führe `git commit -m "Feature added"` aus.' },
    { title: 'Task 4: Merge den Feature-Branch zurück in den Main-Branch', desc: 'Wechsle auf main (`git checkout main`) und führe `git merge feature` aus.' }
  ];

  const addLog = (msg) => setLogs(prev => [msg, ...prev]);

  const handleCreateBranch = (branchName) => {
    if (!branchName) return;
    if (branches.includes(branchName)) {
      addLog(`❌ Branch '${branchName}' existiert bereits!`);
      return;
    }
    setBranches([...branches, branchName]);
    addLog(`✅ Branch '${branchName}' erfolgreich erstellt.`);
    if (taskIndex === 0 && branchName === 'feature') {
      setTaskIndex(1);
      if (onRewardXP) onRewardXP(15);
    }
  };

  const handleCheckout = (branchName) => {
    if (!branches.includes(branchName)) {
      addLog(`❌ Branch '${branchName}' existiert nicht.`);
      return;
    }
    setActiveBranch(branchName);
    addLog(`🔀 Switched to branch '${branchName}'.`);
    if (taskIndex === 1 && branchName === 'feature') {
      setTaskIndex(2);
      if (onRewardXP) onRewardXP(15);
    }
  };

  const handleCommit = (msg = 'New commit') => {
    const newCommit = {
      id: `c${commits.length + 1}`,
      message: msg,
      branch: activeBranch
    };
    setCommits([...commits, newCommit]);
    addLog(`📌 Commit [${newCommit.id}] '${msg}' auf Branch '${activeBranch}' erstellt.`);
    if (taskIndex === 2 && activeBranch === 'feature') {
      setTaskIndex(3);
      if (onRewardXP) onRewardXP(20);
    }
  };

  const handleMerge = (sourceBranch) => {
    if (activeBranch === sourceBranch) {
      addLog(`❌ Kann Branch nicht in sich selbst mergen.`);
      return;
    }
    const mergeCommit = {
      id: `c${commits.length + 1}`,
      message: `Merge branch '${sourceBranch}' into ${activeBranch}`,
      branch: activeBranch,
      isMerge: true
    };
    setCommits([...commits, mergeCommit]);
    addLog(`🔀 Merge commit '${mergeCommit.message}' erstellt.`);
    if (taskIndex === 3 && activeBranch === 'main' && sourceBranch === 'feature') {
      setTaskIndex(0);
      if (onRewardXP) onRewardXP(40);
    }
  };

  const handleRunCommand = (e) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;
    setCommandInput('');

    addLog(`$ ${cmd}`);

    if (cmd.startsWith('git branch ')) {
      const name = cmd.replace('git branch ', '').trim();
      handleCreateBranch(name);
    } else if (cmd.startsWith('git checkout ')) {
      const name = cmd.replace('git checkout ', '').trim();
      handleCheckout(name);
    } else if (cmd.startsWith('git commit')) {
      const match = cmd.match(/-m\s+"([^"]+)"/) || cmd.match(/-m\s+'([^']+)'/);
      const msg = match ? match[1] : 'Update code';
      handleCommit(msg);
    } else if (cmd.startsWith('git merge ')) {
      const name = cmd.replace('git merge ', '').trim();
      handleMerge(name);
    } else {
      addLog(`⚠️ Befehl nicht erkannt. Unterstützt: 'git branch <name>', 'git checkout <name>', 'git commit -m "..."', 'git merge <name>'`);
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <GitBranch size={14} /> DevOps & Version Control
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🌿 Interaktiver Visual Git Branching Simulator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verstehe Git Commits, Branches & Merge-Trees mit visueller Echtzeit-Animation.
          </p>
        </div>
      </div>

      {/* Interactive Quest Banner */}
      <div style={{ background: 'var(--bg-primary)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', borderLeft: '4px solid var(--accent-indigo)' }}>
        <h4 style={{ margin: '0 0 6px 0', color: 'var(--accent-indigo)', fontWeight: '700' }}>
          🎯 {tasks[taskIndex].title}
        </h4>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          {tasks[taskIndex].desc}
        </p>
      </div>

      {/* Visual Commit Tree View */}
      <div style={{ background: '#0f172a', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
          Git Tree Visualizer (HEAD &rarr; <span style={{ color: '#38bdf8' }}>{activeBranch}</span>)
        </h4>

        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', alignItems: 'center' }}>
          {commits.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  background: c.branch === 'main' ? '#1e293b' : '#312e81',
                  border: c.branch === activeBranch ? '2px solid #38bdf8' : '1px solid #475569',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  minWidth: '140px',
                  boxShadow: c.branch === activeBranch ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>{c.id}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: c.branch === 'main' ? '#334155' : '#4338ca', color: '#f8fafc' }}>
                    {c.branch}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#f8fafc', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.message}
                </div>
              </div>
              {i < commits.length - 1 && <ArrowRight size={20} style={{ color: '#64748b', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Controls & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Terminal Input */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} /> Git Konsole
          </h4>
          <form onSubmit={handleRunCommand} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder='z.B. git commit -m "Code fix"'
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-main)',
                fontFamily: 'monospace'
              }}
            />
            <button type="submit" className="btn btn-primary">Ausführen</button>
          </form>

          {/* Quick Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => handleCommit('Schneller Commit')} style={{ fontSize: '0.85rem' }}>
              + git commit
            </button>
            <button className="btn btn-secondary" onClick={() => handleCreateBranch('feature')} style={{ fontSize: '0.85rem' }}>
              + branch feature
            </button>
            <button className="btn btn-secondary" onClick={() => handleCheckout('feature')} style={{ fontSize: '0.85rem' }}>
              checkout feature
            </button>
            <button className="btn btn-secondary" onClick={() => handleCheckout('main')} style={{ fontSize: '0.85rem' }}>
              checkout main
            </button>
            <button className="btn btn-secondary" onClick={() => handleMerge('feature')} style={{ fontSize: '0.85rem' }}>
              merge feature
            </button>
          </div>
        </div>

        {/* Output Logs */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-main)' }}>
            Ausgabe-Protokoll (Log)
          </h4>
          <div style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', height: '160px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1' }}>
            {logs.map((l, idx) => (
              <div key={idx} style={{ marginBottom: '6px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
