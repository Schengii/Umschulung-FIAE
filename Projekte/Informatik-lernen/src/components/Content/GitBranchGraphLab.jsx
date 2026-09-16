import React, { useState } from 'react';
import { GitBranch, GitCommit, GitMerge, GitPullRequest, RotateCcw, Sparkles, Terminal } from 'lucide-react';

export default function GitBranchGraphLab({ onRewardXP }) {
  const initialBranches = {
    main: { name: 'main', color: '#6366f1', commits: ['c1', 'c2'] },
    feature: { name: 'feature', color: '#10b981', commits: ['c1', 'c2', 'c3'] }
  };

  const initialCommits = {
    c1: { id: 'c1', msg: 'Initial commit (init repo)', parent: null, x: 50, y: 120 },
    c2: { id: 'c2', msg: 'feat: Core architecture setup', parent: 'c1', x: 170, y: 120 },
    c3: { id: 'c3', msg: 'feat: Add user authentication', parent: 'c2', x: 290, y: 60 }
  };

  const [branches, setBranches] = useState(initialBranches);
  const [commits, setCommits] = useState(initialCommits);
  const [headBranch, setHeadBranch] = useState('feature');
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState(['Git Branch & Graph Simulator initialisiert. Tippe `git status`, `git commit -m "..."`, `git checkout <branch>`, `git merge <branch>` oder nutze die Buttons.']);
  const [activeTutorial, setActiveTutorial] = useState(0);

  const tutorials = [
    {
      title: 'Tutorial 1: Neuer Commit auf Feature-Branch',
      instruction: 'Führe `git commit -m "feat: database setup"` aus oder klicke auf "Neuer Commit".',
      targetCheck: (b, c) => Object.keys(c).length >= 4,
      xp: 25
    },
    {
      title: 'Tutorial 2: Branch wechseln zu `main`',
      instruction: 'Wechsle den aktiven Branch mit `git checkout main` oder `git switch main`.',
      targetCheck: (b, c, h) => h === 'main',
      xp: 25
    },
    {
      title: 'Tutorial 3: Feature Branch mergen (`git merge feature`)',
      instruction: 'Führe auf `main` einen Merge mit `git merge feature` durch.',
      targetCheck: (b, c) => Object.values(c).some(commit => commit.msg.includes('Merge branch')),
      xp: 50
    }
  ];

  const addLog = (msg) => {
    setCliLogs(prev => [msg, ...prev.slice(0, 15)]);
  };

  const createCommit = (msg = 'feat: update module') => {
    const currentBranch = branches[headBranch];
    if (!currentBranch) return;

    const parentId = currentBranch.commits[currentBranch.commits.length - 1];
    const newId = `c${Object.keys(commits).length + 1}`;
    
    // Calculate new position
    const parentCommit = commits[parentId] || { x: 50, y: 120 };
    const newX = parentCommit.x + 110;
    const newY = headBranch === 'main' ? 120 : 60;

    const newCommitObj = {
      id: newId,
      msg: msg,
      parent: parentId,
      x: newX,
      y: newY
    };

    setCommits(prev => ({ ...prev, [newId]: newCommitObj }));
    setBranches(prev => ({
      ...prev,
      [headBranch]: {
        ...prev[headBranch],
        commits: [...prev[headBranch].commits, newId]
      }
    }));

    addLog(`[${headBranch} ${newId}] ${msg}`);

    // Check tutorial completion
    if (tutorials[activeTutorial]?.targetCheck(branches, { ...commits, [newId]: newCommitObj }, headBranch)) {
      if (onRewardXP) onRewardXP(tutorials[activeTutorial].xp);
      if (activeTutorial < tutorials.length - 1) setActiveTutorial(prev => prev + 1);
    }
  };

  const switchBranch = (branchName) => {
    if (!branches[branchName]) {
      addLog(`error: pathspec '${branchName}' did not match any file(s) known to git`);
      return;
    }
    setHeadBranch(branchName);
    addLog(`Switched to branch '${branchName}'`);

    if (tutorials[activeTutorial]?.targetCheck(branches, commits, branchName)) {
      if (onRewardXP) onRewardXP(tutorials[activeTutorial].xp);
      if (activeTutorial < tutorials.length - 1) setActiveTutorial(prev => prev + 1);
    }
  };

  const createBranch = (branchName) => {
    if (!branchName) return;
    if (branches[branchName]) {
      addLog(`fatal: a branch named '${branchName}' already exists`);
      return;
    }

    const currentHeadCommitId = branches[headBranch].commits[branches[headBranch].commits.length - 1];
    const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    const color = colors[Object.keys(branches).length % colors.length];

    setBranches(prev => ({
      ...prev,
      [branchName]: {
        name: branchName,
        color: color,
        commits: [...prev[headBranch].commits]
      }
    }));

    addLog(`Created branch '${branchName}' at commit ${currentHeadCommitId}`);
  };

  const mergeBranch = (sourceBranch) => {
    if (headBranch === sourceBranch) {
      addLog(`Already up to date with ${sourceBranch}`);
      return;
    }
    if (!branches[sourceBranch]) {
      addLog(`merge: ${sourceBranch} - not something we can merge`);
      return;
    }

    const targetBranch = headBranch;
    const mergeCommitId = `c${Object.keys(commits).length + 1}`;
    const parentId = branches[targetBranch].commits[branches[targetBranch].commits.length - 1];
    const parentCommit = commits[parentId] || { x: 50, y: 120 };

    const newCommitObj = {
      id: mergeCommitId,
      msg: `Merge branch '${sourceBranch}' into ${targetBranch}`,
      parent: parentId,
      mergeParent: branches[sourceBranch].commits[branches[sourceBranch].commits.length - 1],
      x: parentCommit.x + 120,
      y: targetBranch === 'main' ? 120 : 60
    };

    setCommits(prev => ({ ...prev, [mergeCommitId]: newCommitObj }));
    setBranches(prev => ({
      ...prev,
      [targetBranch]: {
        ...prev[targetBranch],
        commits: [...prev[targetBranch].commits, mergeCommitId]
      }
    }));

    addLog(`Merge made by the 'ort' strategy: ${sourceBranch} -> ${targetBranch}`);

    if (tutorials[activeTutorial]?.targetCheck(branches, { ...commits, [mergeCommitId]: newCommitObj }, headBranch)) {
      if (onRewardXP) onRewardXP(tutorials[activeTutorial].xp);
      if (activeTutorial < tutorials.length - 1) setActiveTutorial(prev => prev + 1);
    }
  };

  const handleCliSubmit = (e) => {
    e.preventDefault();
    const cmd = cliInput.trim();
    if (!cmd) return;
    setCliInput('');

    if (cmd === 'git status') {
      addLog(`On branch ${headBranch}\nYour branch is up to date with 'origin/${headBranch}'.\nnothing to commit, working tree clean`);
    } else if (cmd.startsWith('git commit')) {
      const match = cmd.match(/git commit -m ["'](.+?)["']/);
      const msg = match ? match[1] : 'chore: auto commit';
      createCommit(msg);
    } else if (cmd.startsWith('git checkout -b ') || cmd.startsWith('git switch -c ')) {
      const branch = cmd.replace('git checkout -b ', '').replace('git switch -c ', '').trim();
      createBranch(branch);
      switchBranch(branch);
    } else if (cmd.startsWith('git checkout ') || cmd.startsWith('git switch ')) {
      const branch = cmd.replace('git checkout ', '').replace('git switch ', '').trim();
      switchBranch(branch);
    } else if (cmd.startsWith('git merge ')) {
      const branch = cmd.replace('git merge ', '').trim();
      mergeBranch(branch);
    } else if (cmd.startsWith('git branch ')) {
      const branch = cmd.replace('git branch ', '').trim();
      createBranch(branch);
    } else if (cmd === 'git log' || cmd === 'git log --oneline') {
      const branchCommits = branches[headBranch].commits;
      const history = branchCommits.map(cid => `${cid} ${commits[cid]?.msg}`).join(' | ');
      addLog(`Commits on ${headBranch}: ${history}`);
    } else {
      addLog(`bash: command not found: ${cmd} (Versuche 'git commit -m "..."', 'git checkout ...' oder 'git merge ...')`);
    }
  };

  const resetGraph = () => {
    setBranches(initialBranches);
    setCommits(initialCommits);
    setHeadBranch('feature');
    setActiveTutorial(0);
    setCliLogs(['Graph zurückgesetzt.']);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <GitBranch size={14} /> Version Control & DevOps
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🌿 Git Branching, Merge & Rebase Visualizer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Verstehe Commits, Pointer, Feature-Branches und Fast-Forward/Merge-Commits visuell in Echtzeit.
          </p>
        </div>

        <button onClick={resetGraph} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Tutorial Guidance Card */}
      {tutorials[activeTutorial] && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))', 
          border: '1px solid var(--accent-primary)', 
          borderRadius: '12px', 
          padding: '16px 20px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '0.95rem' }}>
              <Sparkles size={16} />
              {tutorials[activeTutorial].title}
            </div>
            <p style={{ margin: '4px 0 0', color: 'var(--text-main)', fontSize: '0.9rem' }}>
              {tutorials[activeTutorial].instruction}
            </p>
          </div>
          <span className="badge badge-amber">+{tutorials[activeTutorial].xp} XP Belohnung</span>
        </div>
      )}

      {/* Interactive Commit Graph Visualizer Canvas (SVG) */}
      <div style={{ 
        background: '#090d16', 
        borderRadius: '16px', 
        border: '1px solid #1e293b', 
        padding: '24px', 
        marginBottom: '20px',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>AKTIVER BRANCH (HEAD):</span>
            <span style={{ 
              background: branches[headBranch]?.color || '#6366f1', 
              color: '#fff', 
              padding: '2px 10px', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: 800 
            }}>
              HEAD -&gt; {headBranch}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: '#94a3b8' }}>
            {Object.values(branches).map(b => (
              <span key={b.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.color }} />
                {b.name}
              </span>
            ))}
          </div>
        </div>

        <svg width="100%" height="220" style={{ minWidth: '600px' }}>
          {/* Render Connections */}
          {Object.values(commits).map(c => {
            if (!c.parent || !commits[c.parent]) return null;
            const parent = commits[c.parent];
            return (
              <line
                key={`line-${c.id}-${c.parent}`}
                x1={parent.x}
                y1={parent.y}
                x2={c.x}
                y2={c.y}
                stroke="#475569"
                strokeWidth="3"
                strokeDasharray={c.mergeParent ? "4" : "none"}
              />
            );
          })}

          {/* Render Merge Parents */}
          {Object.values(commits).map(c => {
            if (!c.mergeParent || !commits[c.mergeParent]) return null;
            const mParent = commits[c.mergeParent];
            return (
              <line
                key={`merge-line-${c.id}`}
                x1={mParent.x}
                y1={mParent.y}
                x2={c.x}
                y2={c.y}
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="4"
              />
            );
          })}

          {/* Render Commits Nodes */}
          {Object.values(commits).map(c => {
            const isHead = branches[headBranch]?.commits.slice(-1)[0] === c.id;
            return (
              <g key={c.id}>
                {/* Node Circle */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHead ? "18" : "14"}
                  fill={isHead ? "#6366f1" : "#1e293b"}
                  stroke={isHead ? "#a5b4fc" : "#64748b"}
                  strokeWidth="3"
                />
                <text
                  x={c.x}
                  y={c.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                >
                  {c.id}
                </text>

                {/* Commit Message Label */}
                <text
                  x={c.x}
                  y={c.y + 34}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {c.msg.slice(0, 16)}...
                </text>

                {/* Branch Indicators */}
                {Object.values(branches).map((b, bIdx) => {
                  if (b.commits.slice(-1)[0] === c.id) {
                    return (
                      <g key={b.name} transform={`translate(${c.x - 30}, ${c.y - 42 - (bIdx * 20)})`}>
                        <rect
                          width="60"
                          height="18"
                          rx="4"
                          fill={b.color}
                        />
                        <text
                          x="30"
                          y="13"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          {b.name}
                        </text>
                      </g>
                    );
                  }
                  return null;
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Action Buttons Toolbar */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button 
          onClick={() => createCommit('feat: implement component')} 
          className="btn btn-primary btn-sm"
          style={{ gap: '6px' }}
        >
          <GitCommit size={15} /> Neuer Commit (git commit)
        </button>

        <button 
          onClick={() => switchBranch(headBranch === 'main' ? 'feature' : 'main')} 
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <GitBranch size={15} /> Switch Branch ({headBranch === 'main' ? 'feature' : 'main'})
        </button>

        <button 
          onClick={() => mergeBranch(headBranch === 'main' ? 'feature' : 'main')} 
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px', borderColor: '#10b981', color: '#10b981' }}
        >
          <GitMerge size={15} /> Git Merge ({headBranch === 'main' ? 'feature' : 'main'})
        </button>

        <button 
          onClick={() => createBranch(`hotfix-${Math.floor(Math.random()*100)}`)} 
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <GitPullRequest size={15} /> Neuer Branch (git branch)
        </button>
      </div>

      {/* Interactive Git Terminal Console */}
      <div style={{ background: '#0b0f19', borderRadius: '12px', border: '1px solid #1e293b', padding: '16px', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.8rem', marginBottom: '12px' }}>
          <Terminal size={14} /> Git Interactive CLI Terminal
        </div>

        {/* Logs Output */}
        <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '12px' }}>
          {cliLogs.map((log, index) => (
            <div key={index} style={{ color: log.startsWith('error') || log.startsWith('fatal') ? '#f87171' : '#38bdf8' }}>
              &gt; {log}
            </div>
          ))}
        </div>

        {/* CLI Input */}
        <form onSubmit={handleCliSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>dev@repo:~$</span>
          <input
            type="text"
            value={cliInput}
            onChange={e => setCliInput(e.target.value)}
            placeholder="git commit -m 'feat: my change' / git checkout main / git merge feature"
            style={{
              flex: 1,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#f8fafc',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '8px 14px' }}>
            Ausführen
          </button>
        </form>
      </div>
    </div>
  );
}
