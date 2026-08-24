import React, { useState } from 'react';
import { GitBranch, Play, CheckCircle2, XCircle, Terminal, Copy, Award, ShieldCheck, RefreshCw, Cpu, Layers } from 'lucide-react';

const AVAILABLE_JOBS = [
  { id: 'checkout', name: 'Git Checkout', icon: GitBranch, stage: 'source', time: '1s' },
  { id: 'lint', name: 'Oxlint / ESLint Code Quality', icon: Layers, stage: 'test', time: '2s' },
  { id: 'test', name: 'Vitest Unit & Integration Tests', icon: Cpu, stage: 'test', time: '3s' },
  { id: 'sec_scan', name: 'Trivy / Snyk Vulnerability Scan', icon: ShieldCheck, stage: 'security', time: '2s' },
  { id: 'docker_build', name: 'Docker Container Build & Push', icon: Layers, stage: 'build', time: '4s' },
  { id: 'deploy_k8s', name: 'Deploy to Kubernetes Staging Cluster', icon: Play, stage: 'deploy', time: '3s' }
];

export default function CiCdWorkflowLab({ onRewardXP }) {
  const [selectedPipeline, setSelectedPipeline] = useState([
    'checkout', 'lint', 'test', 'sec_scan', 'docker_build', 'deploy_k8s'
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentJobIdx, setCurrentJobIdx] = useState(-1);
  const [jobStatuses, setJobStatuses] = useState({});
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'yaml'
  const [copied, setCopied] = useState(false);

  const addLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const runPipeline = () => {
    if (selectedPipeline.length === 0 || isRunning) return;
    setIsRunning(true);
    setCurrentJobIdx(0);
    setJobStatuses({});
    setLogs([]);
    addLog('🚀 CI/CD Pipeline gestartet (Trigger: push on main)...');

    executeStep(0);
  };

  const executeStep = (idx) => {
    if (idx >= selectedPipeline.length) {
      setIsRunning(false);
      setCurrentJobIdx(-1);
      addLog('🎉 Pipeline erfolgreich abgeschlossen! Image deployed.');
      if (onRewardXP) onRewardXP(40);
      return;
    }

    const jobId = selectedPipeline[idx];
    const jobInfo = AVAILABLE_JOBS.find(j => j.id === jobId);
    setCurrentJobIdx(idx);
    setJobStatuses(prev => ({ ...prev, [jobId]: 'running' }));
    addLog(`▶️ Starte Job: ${jobInfo?.name}...`);

    setTimeout(() => {
      setJobStatuses(prev => ({ ...prev, [jobId]: 'success' }));
      addLog(`✅ Job '${jobInfo?.name}' erfolgreich abgeschlossen in ${jobInfo?.time}.`);
      executeStep(idx + 1);
    }, 1200);
  };

  const toggleJob = (jobId) => {
    if (isRunning) return;
    if (selectedPipeline.includes(jobId)) {
      setSelectedPipeline(selectedPipeline.filter(id => id !== jobId));
    } else {
      setSelectedPipeline([...selectedPipeline, jobId]);
    }
  };

  const generateYaml = () => {
    return `name: CI/CD Pipeline Build & Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  pipeline:
    runs-on: ubuntu-latest
    steps:
${selectedPipeline.map(id => {
  const job = AVAILABLE_JOBS.find(j => j.id === id);
  return `      - name: ${job?.name}
        run: echo "Executing ${job?.id}..."`;
}).join('\n')}
`;
  };

  const handleCopyYaml = () => {
    navigator.clipboard.writeText(generateYaml());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <GitBranch size={14} /> Cloud & DevOps Automation
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            ⚙️ CI/CD Workflow Pipeline Builder & Runner
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Konstruiere deine eigene GitHub Actions / GitLab CI Pipeline mit Stufen, Jobs und Live-Runner Simulation.
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            className={`btn ${activeTab === 'visual' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('visual')}
            style={{ fontSize: '0.88rem', padding: '8px 16px' }}
          >
            Visual Pipeline
          </button>
          <button
            className={`btn ${activeTab === 'yaml' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('yaml')}
            style={{ fontSize: '0.88rem', padding: '8px 16px' }}
          >
            GitHub Actions YAML
          </button>
        </div>
      </div>

      {activeTab === 'visual' && (
        <div>
          {/* Job Picker */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Wähle Pipeline-Jobs & Stufen:
            </h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {AVAILABLE_JOBS.map(j => {
                const isSelected = selectedPipeline.includes(j.id);
                const Icon = j.icon;
                return (
                  <button
                    key={j.id}
                    onClick={() => toggleJob(j.id)}
                    disabled={isRunning}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-primary)',
                      border: isSelected ? '2px solid var(--accent-indigo)' : '1px solid var(--border-color)',
                      color: isSelected ? 'var(--accent-indigo)' : 'var(--text-muted)',
                      fontWeight: '700',
                      cursor: isRunning ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Icon size={16} />
                    {j.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pipeline Track Visualizer */}
          <div style={{ background: '#0f172a', padding: '28px', borderRadius: 'var(--radius-lg)', marginBottom: '20px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '600px' }}>
              {selectedPipeline.map((jobId, idx) => {
                const job = AVAILABLE_JOBS.find(j => j.id === jobId);
                const status = jobStatuses[jobId];
                const isActive = currentJobIdx === idx;
                const Icon = job?.icon || Layers;

                return (
                  <React.Fragment key={jobId}>
                    <div
                      style={{
                        flex: 1,
                        background: status === 'success' ? '#064e3b' : isActive ? '#312e81' : '#1e293b',
                        border: status === 'success' ? '2px solid var(--accent-emerald)' : isActive ? '2px solid #818cf8' : '1px solid #334155',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        minWidth: '150px',
                        boxShadow: isActive ? '0 0 16px rgba(129, 140, 248, 0.4)' : 'none',
                        transition: 'all 0.3s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <Icon size={18} color={status === 'success' ? '#34d399' : '#a5b4fc'} />
                        {status === 'success' && <CheckCircle2 size={16} color="#34d399" />}
                        {isActive && <RefreshCw size={16} color="#818cf8" className="animate-spin" />}
                      </div>
                      <div style={{ color: '#f8fafc', fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>
                        {job?.name}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        Dauer: {job?.time}
                      </div>
                    </div>

                    {idx < selectedPipeline.length - 1 && (
                      <div style={{ color: '#475569', fontWeight: '800' }}>&rarr;</div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Action Button & Logs */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
            <button
              className="btn btn-primary"
              onClick={runPipeline}
              disabled={isRunning || selectedPipeline.length === 0}
              style={{ gap: '8px' }}
            >
              <Play size={16} /> {isRunning ? 'Pipeline Läuft...' : 'Pipeline Ausführen'}
            </button>
          </div>

          {/* Terminal Console Output */}
          <div style={{ background: '#020617', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.85rem', color: '#38bdf8', minHeight: '130px', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} /> Runner Terminal Log
            </div>
            {logs.length === 0 && <span style={{ color: '#475569' }}>Klicke auf "Pipeline Ausführen" um Runner-Logs zu sehen...</span>}
            {logs.map((l, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>{l}</div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'yaml' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button className="btn btn-secondary" onClick={handleCopyYaml} style={{ gap: '6px', fontSize: '0.85rem' }}>
              <Copy size={14} /> {copied ? 'Kopiert!' : 'YAML Kopieren'}
            </button>
          </div>
          <pre style={{ background: '#0f172a', padding: '20px', borderRadius: 'var(--radius-lg)', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.88rem', overflowX: 'auto', border: '1px solid #1e293b' }}>
            {generateYaml()}
          </pre>
        </div>
      )}
    </div>
  );
}
