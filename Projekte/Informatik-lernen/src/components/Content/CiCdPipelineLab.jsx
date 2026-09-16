import React, { useState } from 'react';
import { Play, CheckCircle2, FileCode, Layers, Terminal, RefreshCw } from 'lucide-react';

const INITIAL_STAGES = [
  { id: 'lint', name: 'Code Quality & Lint', icon: 'Code', enabled: true, command: 'npm run lint', status: 'idle', duration: '2s' },
  { id: 'test', name: 'Automated Unit Tests', icon: 'CheckCircle2', enabled: true, command: 'npm run test', status: 'idle', duration: '4s' },
  { id: 'security', name: 'SAST Security Scan', icon: 'ShieldCheck', enabled: true, command: 'npx trivy fs .', status: 'idle', duration: '3s' },
  { id: 'build', name: 'Production Build', icon: 'Cpu', enabled: true, command: 'npm run build', status: 'idle', duration: '5s' },
  { id: 'docker', name: 'Build & Push Docker Image', icon: 'Layers', enabled: true, command: 'docker build -t app:latest . && docker push', status: 'idle', duration: '6s' },
  { id: 'deploy', name: 'Kubernetes Rolling Deploy', icon: 'UploadCloud', enabled: true, command: 'kubectl apply -f k8s/', status: 'idle', duration: '4s' }
];

export default function CiCdPipelineLab({ onRewardXP }) {
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const toggleStage = (stageId) => {
    if (isRunning) return;
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, enabled: !s.enabled } : s));
  };

  const handleRunPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs(['🚀 [Runner] Initializing GitHub Actions Runner (ubuntu-latest)...']);

    const enabledStages = stages.filter(s => s.enabled);
    if (enabledStages.length === 0) {
      setLogs(prev => [...prev, '⚠️ Keine Stages aktiviert! Pipeline gestoppt.']);
      setIsRunning(false);
      return;
    }

    let currentIndex = 0;

    const runStep = () => {
      if (currentIndex >= enabledStages.length) {
        setIsRunning(false);
        setLogs(prev => [...prev, '🎉 [SUCCESS] Pipeline erfolgreich abgeschlossen! Anwendung deployed.', 'STATUS: ALL CHECKS PASSED']);
        if (onRewardXP) onRewardXP(40);
        return;
      }

      const current = enabledStages[currentIndex];

      setStages(prev => prev.map(s => s.id === current.id ? { ...s, status: 'running' } : s));
      setLogs(prev => [...prev, `▶️ Executing Step [${current.name}]: $ ${current.command}`]);

      setTimeout(() => {
        setStages(prev => prev.map(s => s.id === current.id ? { ...s, status: 'success' } : s));
        setLogs(prev => [...prev, `✅ Step [${current.name}] completed in ${current.duration}.`]);
        currentIndex++;
        runStep();
      }, 1200);
    };

    runStep();
  };

  const resetPipeline = () => {
    setIsRunning(false);
    setLogs([]);
    setStages(INITIAL_STAGES);
  };

  const generateYaml = () => {
    const activeStepsYaml = stages
      .filter(s => s.enabled)
      .map(s => `      - name: ${s.name}\n        run: ${s.command}`)
      .join('\n\n');

    return `name: CI/CD Production Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: '20'

${activeStepsYaml}
`;
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} /> Cloud DevOps & Automation
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🚀 CI/CD Pipeline & GitHub Actions Builder
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Designe automatisierte Build, Test & Deployment-Pipelines und generiere `.github/workflows/deploy.yml` Code.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={resetPipeline} disabled={isRunning} style={{ gap: '6px' }}>
            <RefreshCw size={16} /> Zurücksetzen
          </button>
          <button className="btn btn-primary" onClick={handleRunPipeline} disabled={isRunning} style={{ gap: '8px', minWidth: '160px' }}>
            <Play size={18} /> {isRunning ? 'Pipeline läuft...' : 'Pipeline ausführen'}
          </button>
        </div>
      </div>

      {/* Visual Pipeline Stage Node Map */}
      <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>
          📋 Pipeline Stages konfigurieren:
        </h4>

        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', alignItems: 'center' }}>
          {stages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div
                onClick={() => toggleStage(stage.id)}
                style={{
                  minWidth: '180px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: stage.status === 'running' ? 'rgba(99,102,241,0.25)' : stage.status === 'success' ? 'rgba(16,185,129,0.15)' : stage.enabled ? 'var(--bg-card)' : 'rgba(148,163,184,0.1)',
                  border: stage.status === 'running' ? '2px solid var(--accent-primary)' : stage.status === 'success' ? '2px solid var(--accent-emerald)' : stage.enabled ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
                  opacity: stage.enabled ? 1 : 0.5,
                  cursor: isRunning ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>STEP {idx + 1}</span>
                  {stage.status === 'success' ? (
                    <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
                  ) : stage.status === 'running' ? (
                    <RefreshCw size={18} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <input type="checkbox" checked={stage.enabled} onChange={() => {}} style={{ cursor: 'pointer' }} />
                  )}
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {stage.name}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {stage.command}
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div style={{ color: 'var(--text-muted)', fontWeight: '800', fontSize: '1.2rem' }}>➔</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Grid: Live Log Runner & YAML Code Generator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Live Runner Terminal */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} style={{ color: '#38bdf8' }} /> GitHub Actions Live Log Output
          </h4>
          <div style={{
            background: '#020617',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            color: '#38bdf8',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            minHeight: '260px',
            maxHeight: '320px',
            overflowY: 'auto',
            border: '1px solid #0f172a'
          }}>
            {logs.length === 0 ? (
              <span style={{ color: '#64748b' }}>Klicke auf "Pipeline ausführen", um den CI/CD Runner zu starten...</span>
            ) : (
              logs.map((line, idx) => (
                <div key={idx} style={{ marginBottom: '4px', color: line.includes('SUCCESS') ? '#10b981' : line.includes('▶️') ? '#a5b4fc' : '#38bdf8' }}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Generated YAML Code */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={16} style={{ color: '#10b981' }} /> Generierte Workflow YAML (`.github/workflows/deploy.yml`)
          </h4>
          <pre style={{
            margin: 0,
            padding: '14px',
            background: '#020617',
            borderRadius: 'var(--radius-md)',
            color: '#a5b4fc',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            minHeight: '260px',
            maxHeight: '320px',
            overflowY: 'auto',
            border: '1px solid #0f172a'
          }}>
            {generateYaml()}
          </pre>
        </div>
      </div>
    </div>
  );
}
