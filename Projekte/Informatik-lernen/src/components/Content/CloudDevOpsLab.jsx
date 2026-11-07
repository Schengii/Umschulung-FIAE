import React, { useState, useMemo } from 'react';
import { Cloud, GitBranch, DollarSign, CheckCircle2, AlertTriangle, Play, RefreshCw, Award, Copy, Check, X } from 'lucide-react';
import {
  validatePipelineYaml,
  simulatePipelineRun,
  calculateCloudCost,
  CLOUD_DEVOPS_DRILL_QUESTIONS
} from '../../utils/cloudDevOpsEngine';
import LabDrillSection from '../Shared/LabDrillSection';
import SourceList from '../Shared/SourceList';

const INITIAL_PIPELINE = `name: CI/CD Production Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run lint:ci
      - run: npm run test:fast`;

const SOURCES = [
  { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', note: 'Workflows, Jobs, Steps, Triggers und Secrets-Management' },
  { title: 'The Twelve-Factor App – Dev/prod parity', url: 'https://12factor.net/dev-prod-parity', note: 'Kontinuierliche Bereitstellung und Angleichung von Entwicklung und Betrieb' },
  { title: 'Martin Fowler – Continuous Integration & Deployment', url: 'https://martinfowler.com/articles/continuousIntegration.html', note: 'Grundlagen moderner automatisierter Build- und Test-Pipelines' }
];

const DEFAULT_STAGES = [
  { id: 'lint', name: '1. Linting & Formatting', durationSec: 3 },
  { id: 'typecheck', name: '2. Typecheck (TypeScript)', durationSec: 4 },
  { id: 'test', name: '3. Unit Tests & Coverage', durationSec: 8 },
  { id: 'build', name: '4. Docker Image Build', durationSec: 12 },
  { id: 'deploy', name: '5. Production Deployment', durationSec: 6 }
];

export default function CloudDevOpsLab({ onRewardXP }) {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [pipelineYaml, setPipelineYaml] = useState(INITIAL_PIPELINE);
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Pipeline Validation
  const validation = useMemo(() => validatePipelineYaml(pipelineYaml), [pipelineYaml]);

  // Pipeline Runner State
  const [failingStage, setFailingStage] = useState(/** @type {string | null} */ (null));
  const [pipelineRun, setPipelineRun] = useState(() => simulatePipelineRun(DEFAULT_STAGES, null));

  const handleRunPipeline = () => {
    setPipelineRun(simulatePipelineRun(DEFAULT_STAGES, failingStage));
  };

  // Cloud Cost State
  const [cloudSpec, setCloudSpec] = useState({
    instances: 2,
    vCpuPerInstance: 2,
    ramGbPerInstance: 4,
    storageGb: 100,
    egressGb: 250
  });

  const costs = useMemo(() => calculateCloudCost(cloudSpec), [cloudSpec]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pipelineYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimLabXp = () => {
    if (!xpClaimed && onRewardXP && validation.isValid) {
      onRewardXP(45);
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-teal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cloud size={30} style={{ color: 'var(--accent-teal)' }} /> Cloud Infrastructure & DevOps Playground
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', maxWidth: '750px' }}>
              CI/CD Pipeline-Spezifikation (GitHub Actions), Stage-Runner Simulator, Cloud TCO-Kostenrechner und IHK-Prüfungsdrill.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {validation.isValid && !xpClaimed && (
              <button
                className="btn btn-primary"
                onClick={handleClaimLabXp}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Award size={18} /> +45 XP Einlösen
              </button>
            )}
            {xpClaimed && (
              <span className="badge badge-success" style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} /> 45 XP erhalten
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        <button
          className={`btn ${activeTab === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pipeline')}
          style={{ minHeight: '44px' }}
        >
          <GitBranch size={16} /> 1. CI/CD Pipeline Linter
        </button>
        <button
          className={`btn ${activeTab === 'runner' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('runner')}
          style={{ minHeight: '44px' }}
        >
          <Play size={16} /> 2. Pipeline Stage-Runner
        </button>
        <button
          className={`btn ${activeTab === 'costs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('costs')}
          style={{ minHeight: '44px' }}
        >
          <DollarSign size={16} /> 3. Cloud TCO Rechner
        </button>
        <button
          className={`btn ${activeTab === 'drill' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('drill')}
          style={{ minHeight: '44px' }}
        >
          <Award size={16} /> 4. IHK-Drill
        </button>
      </div>

      {/* Tab 1: Pipeline Linter */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label htmlFor="pipeline-yaml-editor" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                GitHub Actions Workflow YAML
              </label>
              <button className="btn btn-secondary btn-sm" onClick={handleCopy} aria-label="YAML kopieren">
                <Copy size={14} /> {copied ? 'Kopiert!' : 'Kopieren'}
              </button>
            </div>
            <textarea
              id="pipeline-yaml-editor"
              value={pipelineYaml}
              onChange={(e) => setPipelineYaml(e.target.value)}
              rows={15}
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.9rem',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                lineHeight: 1.5,
                resize: 'vertical'
              }}
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPipelineYaml(INITIAL_PIPELINE)}
              >
                <RefreshCw size={14} /> Standard-Vorlage
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPipelineYaml("jobs:\n  deploy:\n    steps:\n      - run: npm install\n        env:\n          password: \"plaintext_secret\"")}
              >
                Unsichere Vorlage laden
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
              Pipeline-Audit & Best Practices
            </h3>

            {validation.issues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {validation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: issue.startsWith('Best Practice') || issue.includes('SHA') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      borderLeft: `4px solid ${issue.startsWith('Best Practice') || issue.includes('SHA') ? 'var(--accent-amber)' : 'var(--accent-rose)'}`,
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <AlertTriangle size={16} style={{ color: issue.startsWith('Best Practice') || issue.includes('SHA') ? 'var(--accent-amber)' : 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderLeft: '4px solid var(--accent-emerald)',
                color: 'var(--text-main)'
              }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} /> Perfekte CI/CD Pipeline
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Triggerevents, deterministische Paketinstallation (`npm ci`) und Secrets-Hygiene sind vollständig gewährleistet.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Pipeline Stage Runner */}
      {activeTab === 'runner' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-main)' }}>
                CI/CD Stage-Execution Simulator
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Simuliere den Durchlauf der Pipeline-Stufen und beobachte, wie Folgeschritte bei Fehlern abgebrochen werden (Fail Fast).
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={failingStage || ''}
                onChange={(e) => setFailingStage(e.target.value ? e.target.value : null)}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
              >
                <option value="">Simulation: Alle Stufen erfolgreich</option>
                <option value="test">Simulation: Tests schlagen fehl</option>
                <option value="build">Simulation: Docker-Build schlägt fehl</option>
              </select>
              <button className="btn btn-primary" onClick={handleRunPipeline} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Play size={16} /> Pipeline Starten
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {pipelineRun.map((stage) => (
              <div
                key={stage.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: stage.status === 'success'
                    ? 'rgba(16, 185, 129, 0.08)'
                    : stage.status === 'failed'
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(100, 116, 139, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {stage.status === 'success' && <Check size={18} style={{ color: 'var(--accent-emerald)' }} />}
                  {stage.status === 'failed' && <X size={18} style={{ color: 'var(--accent-rose)' }} />}
                  {stage.status === 'skipped' && <AlertTriangle size={18} style={{ color: 'var(--text-muted)' }} />}
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{stage.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stage.message}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)'
                  }}>
                    {stage.actualDuration}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Cloud TCO Rechner */}
      {activeTab === 'costs' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
            Cloud Infrastruktur TCO-Kalkulator
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Berechne monatliche Gesamtkosten (Compute, Storage, Network Egress) für eine skalierbare Server-Infrastruktur.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-panel" style={{ padding: '14px', border: '1px solid var(--border-color)' }}>
              <label htmlFor="cloud-instances-input" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Server-Instanzen:
              </label>
              <input
                id="cloud-instances-input"
                type="number"
                min="1"
                max="20"
                value={cloudSpec.instances}
                onChange={(e) => setCloudSpec({ ...cloudSpec, instances: Number(e.target.value) })}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
              />
            </div>

            <div className="glass-panel" style={{ padding: '14px', border: '1px solid var(--border-color)' }}>
              <label htmlFor="cloud-vcpu-input" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                vCPU je Instanz:
              </label>
              <input
                id="cloud-vcpu-input"
                type="number"
                min="1"
                max="32"
                value={cloudSpec.vCpuPerInstance}
                onChange={(e) => setCloudSpec({ ...cloudSpec, vCpuPerInstance: Number(e.target.value) })}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
              />
            </div>

            <div className="glass-panel" style={{ padding: '14px', border: '1px solid var(--border-color)' }}>
              <label htmlFor="cloud-ram-input" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                RAM je Instanz (GB):
              </label>
              <input
                id="cloud-ram-input"
                type="number"
                min="1"
                max="128"
                value={cloudSpec.ramGbPerInstance}
                onChange={(e) => setCloudSpec({ ...cloudSpec, ramGbPerInstance: Number(e.target.value) })}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
              />
            </div>

            <div className="glass-panel" style={{ padding: '14px', border: '1px solid var(--border-color)' }}>
              <label htmlFor="cloud-ssd-input" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                SSD Speicher (GB):
              </label>
              <input
                id="cloud-ssd-input"
                type="number"
                min="20"
                max="2000"
                value={cloudSpec.storageGb}
                onChange={(e) => setCloudSpec({ ...cloudSpec, storageGb: Number(e.target.value) })}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
            gap: '14px',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(20, 184, 166, 0.1)',
            borderLeft: '4px solid var(--accent-teal)'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Compute-Kosten (Monat):</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{costs.computeCost} €</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Storage-Kosten (Monat):</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{costs.storageCost} €</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Netzwerk-Egress (Monat):</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{costs.networkCost} €</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gesamtkosten (TCO / Monat):</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-teal)' }}>{costs.totalMonthlyCost} €</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Drill */}
      {activeTab === 'drill' && (
        <LabDrillSection
          title="Cloud Architecture & DevOps IHK-Prüfungsdrill"
          questions={CLOUD_DEVOPS_DRILL_QUESTIONS}
          xpReward={55}
          onRewardXP={onRewardXP}
        />
      )}

      {/* Quellen */}
      <div style={{ marginTop: '28px' }}>
        <SourceList sources={SOURCES} />
      </div>
    </div>
  );
}
