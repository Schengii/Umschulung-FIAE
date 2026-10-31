import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Play, CheckCircle2, Terminal, Cpu, Apple, Box, RotateCcw, FileCode } from 'lucide-react';
import { CICD_YAML_TEMPLATES } from '../../data/advancedLabsData';
import { useStore } from '../../store/useStore';

export default function CiCdMatrixLinterLab() {
  const { awardXP } = useStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState(CICD_YAML_TEMPLATES[0].id);
  const [activeTab, setActiveTab] = useState('yaml'); // 'yaml' | 'matrix'
  const [isRunning, setIsRunning] = useState(false);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const template = CICD_YAML_TEMPLATES.find(t => t.id === selectedTemplateId) || CICD_YAML_TEMPLATES[0];

  const handleRunMatrix = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCompletedJobs([]);
    setActiveTab('matrix');

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < template.matrixVariants.length) {
        setCompletedJobs(prev => [...prev, template.matrixVariants[idx].id]);
        idx++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        if (!isCompleted) {
          setIsCompleted(true);
          awardXP(80, 'DevOps Meister: CI/CD Matrix Pipeline');
        }
      }
    }, 450);
  };

  const handleReset = () => {
    setCompletedJobs([]);
    setIsRunning(false);
    setIsCompleted(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '20px', color: '#818cf8', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Layers size={16} /> GitHub Actions Multi-OS Matrix & Workflow Simulator
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            CI/CD Matrix Linter & Parallel Runner Lab
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Validiere GitHub Actions YAML-Syntax, teste Matrix-Strategien (Ubuntu, Windows, macOS) und simuliere Runner-Pipelines in Echtzeit.
          </p>
        </div>

        {/* Template Selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {CICD_YAML_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTemplateId(t.id);
                handleReset();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedTemplateId === t.id ? '2px solid #6366f1' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
                background: selectedTemplateId === t.id ? 'rgba(99, 102, 241, 0.2)' : 'var(--card-bg, #1e293b)',
                color: selectedTemplateId === t.id ? '#a5b4fc' : 'var(--text-secondary, #94a3b8)',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {t.title.split(' ')[0]} {t.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('yaml')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === 'yaml' ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'yaml' ? '#6366f1' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileCode size={15} /> YAML Workflow Editor
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === 'matrix' ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'matrix' ? '#6366f1' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Cpu size={15} /> Parallele Matrix Runner ({completedJobs.length}/{template.matrixVariants.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            onClick={handleRunMatrix}
            disabled={isRunning}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              background: isCompleted ? '#22c55e' : '#6366f1',
              border: 'none',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.88rem',
              cursor: isRunning ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}
          >
            {isCompleted ? <CheckCircle2 size={16} /> : <Play size={16} />}
            {isRunning ? 'Pipeline läuft parallel...' : isCompleted ? 'Matrix Erfolgreich (+80 XP)' : 'Workflow Ausführen'}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'yaml' ? (
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: 'monospace' }}>.github/workflows/ci.yml</span>
            <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Valid GitHub Actions Syntax</span>
          </div>
          <pre style={{ margin: 0, padding: '20px', color: '#38bdf8', fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', lineHeight: '1.6', overflowX: 'auto' }}>
            {template.yaml}
          </pre>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {template.matrixVariants.map((job) => {
            const isDone = completedJobs.includes(job.id);
            const isCurrent = isRunning && !isDone;

            return (
              <motion.div
                key={job.id}
                layout
                style={{
                  background: isDone ? 'rgba(34, 197, 94, 0.1)' : 'var(--card-bg, #1e293b)',
                  border: isDone ? '1px solid #22c55e' : isCurrent ? '1px solid #6366f1' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#fff', fontSize: '0.92rem' }}>
                    {job.os.includes('ubuntu') ? <Terminal size={17} color="#f97316" /> : job.os.includes('windows') ? <Box size={17} color="#38bdf8" /> : <Apple size={17} color="#e2e8f0" />}
                    <span>{job.os}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: isDone ? '#22c55e' : '#475569', color: '#fff', fontWeight: 'bold' }}>
                    {isDone ? 'PASS' : isCurrent ? 'RUNNING' : 'QUEUED'}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Node.js: <strong style={{ color: '#818cf8' }}>{job.node}</strong> • Dauer: {job.duration}
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '8px', fontSize: '0.78rem', fontFamily: 'monospace', color: isDone ? '#86efac' : '#94a3b8' }}>
                  {isDone ? '✓ Steps completed: Checkout, Setup, Lint, Test, Build' : isCurrent ? '⚙️ Executing npm test -- --coverage...' : '⏳ Waiting for runner allocation...'}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer Info Box */}
      <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '10px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
        💡 <strong>DevOps Best Practice:</strong> Mit `strategy.fail-fast: false` brechen andere Matrix-Builds nicht sofort ab, wenn ein einzelnes OS fehlschlägt. So erhältst du ein vollständiges Fehlerbild über alle Zielplattformen hinweg.
      </div>
    </div>
  );
}
