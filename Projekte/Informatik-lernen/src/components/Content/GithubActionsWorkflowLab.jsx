import React, { useState } from 'react';
import { 
  Play, GitPullRequest, Terminal, CheckCircle2, 
  Layers, Lock, Award, RefreshCw, Cpu 
} from 'lucide-react';
import { 
  DEFAULT_WORKFLOW, 
  resolveJobDependencyStages, 
  executeWorkflowPipeline 
} from '../../utils/githubActionsEngine';
import { useStore } from '../../store/useStore';

export default function GithubActionsWorkflowLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [workflow] = useState(DEFAULT_WORKFLOW);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [cachedKeys, setCachedKeys] = useState([]);
  const [xpClaimed, setXpClaimed] = useState(false);

  const stagesAnalysis = resolveJobDependencyStages(workflow.jobs);

  const handleRunPipeline = () => {
    setIsRunning(true);
    setPipelineResult(null);

    setTimeout(() => {
      const res = executeWorkflowPipeline(workflow, cachedKeys);
      setPipelineResult(res);
      setIsRunning(false);
      // Beim nächsten Lauf ist Cache aktiv
      setCachedKeys(prev => Array.from(new Set([...prev, 'npm-deps-v1'])));

      if (res.success && !xpClaimed) {
        if (onRewardXP) onRewardXP(50);
        else awardXP(50, 'github_actions_master');
        setXpClaimed(true);
      }
    }, 700);
  };

  const handleClearCache = () => {
    setCachedKeys([]);
    setPipelineResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GitPullRequest size={14} /> CI/CD Automation
              </span>
              <span className="badge badge-teal">GitHub Actions</span>
              <span className="badge badge-green">DAG &amp; Caching</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              ⚡ Dynamic CI/CD GitHub Actions Workflow Simulator
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Simuliere produktionsreife GitHub Actions Workflows: Parallele Job-Ausführung anhand von `needs`, dependency caching via `actions/cache@v4` und automatische Secrets-Maskierung im Runner-Log.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleClearCache}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} /> Cache leeren
            </button>
            <button
              className="btn btn-primary"
              disabled={isRunning}
              onClick={handleRunPipeline}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isRunning ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
              {isRunning ? 'Pipeline läuft...' : 'Workflow starten (Run)'}
            </button>
          </div>
        </div>

        {/* Workflow Info Bar */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Workflow: <strong style={{ color: 'var(--text-main)' }}>{workflow.name}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Triggers: <code style={{ color: 'var(--accent-teal)' }}>[{workflow.on.join(', ')}]</code>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            Cache-Status: <strong style={{ color: cachedKeys.length > 0 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
              {cachedKeys.length > 0 ? 'Cache Warm (Hit erwartet)' : 'Cache Cold (Miss)'}
            </strong>
          </span>
        </div>
      </div>

      {/* DAG Workflow Visualizer & Logs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Stages DAG */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-primary)" />
            Workflow Stages (Job Dependency Graph)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stagesAnalysis.stages.map((stageJobs, stageIdx) => (
              <div key={stageIdx} style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                  STAGE {stageIdx + 1} {stageJobs.length > 1 ? '(Parallele Ausführung)' : ''}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {stageJobs.map(jobId => {
                    const job = workflow.jobs.find(j => j.id === jobId);
                    const jobRes = pipelineResult?.jobResults?.[jobId];
                    return (
                      <div key={jobId} style={{
                        flex: 1,
                        minWidth: '180px',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card)',
                        border: jobRes ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{job?.name}</span>
                          {jobRes && <CheckCircle2 size={16} color="var(--accent-emerald)" />}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Runner: {job?.runs_on} | {job?.steps.length} Steps
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '2px' }}>
              <Lock size={14} /> Automatische Secrets-Maskierung
            </div>
            Umgebungsvariablen wie <code>DEPLOY_TOKEN</code> werden im Log automatisch unkenntlich gemacht (<code>***</code>).
          </div>
        </div>

        {/* Runner Logs Terminal */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--accent-teal)" />
              Runner Console Logs
            </h2>
            {pipelineResult?.success && (
              <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={14} /> {(pipelineResult.totalDurationMs / 1000).toFixed(2)}s Dauer
              </span>
            )}
          </div>

          <div style={{
            background: '#0d1117',
            color: '#58a6ff',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            minHeight: '300px',
            maxHeight: '440px',
            overflowY: 'auto',
            lineHeight: '1.6'
          }}>
            {!pipelineResult ? (
              <div style={{ color: '#8b949e' }}>
                Drücke auf "Workflow starten", um die CI/CD Pipeline auszuführen...
              </div>
            ) : (
              pipelineResult.logs.map((line, idx) => (
                <div key={idx} style={{ color: line.startsWith('✓') ? '#3fb950' : line.includes('Cache HIT') ? '#2ea043' : line.startsWith('===') ? '#d29922' : '#e6edf3' }}>
                  {line}
                </div>
              ))
            )}
          </div>

          {pipelineResult?.success && (
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Pipeline erfolgreich durchgelaufen
              </span>
              <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Award size={14} /> 50 XP gutgeschrieben
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
