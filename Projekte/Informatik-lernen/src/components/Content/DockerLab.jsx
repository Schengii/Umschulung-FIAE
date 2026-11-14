import React, { useState, useMemo } from 'react';
import { Box, Layers, CheckCircle2, AlertTriangle, ShieldCheck, Copy, Award, RefreshCw } from 'lucide-react';
import {
  validateDockerfile,
  simulateBuildCaching,
  validateComposePorts,
  DOCKER_DRILL_QUESTIONS
} from '../../utils/dockerEngine';
import LabDrillSection from '../Shared/LabDrillSection';
import SourceList from '../Shared/SourceList';

const INITIAL_DOCKERFILE = `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

const SOURCES = [
  { title: 'Docker Docs – Dockerfile reference', url: 'https://docs.docker.com/reference/dockerfile/', note: 'Instruktionen: FROM, WORKDIR, COPY, RUN, CMD, ENTRYPOINT' },
  { title: 'Docker Docs – Multi-stage builds', url: 'https://docs.docker.com/build/building/multi-stage/', note: 'Trennung von Build-Tools und Produktions-Runtime-Images' },
  { title: 'Docker Docs – Optimizing Docker builds', url: 'https://docs.docker.com/build/cache/', note: 'Schichten-Caching und Reihenfolge der Instruktionen' },
  { title: 'Docker Compose – Compose file reference', url: 'https://docs.docker.com/compose/compose-file/', note: 'Services, Port-Mappings, Volumes und Networks' }
];

export default function DockerLab({ onRewardXP }) {
  const [activeTab, setActiveTab] = useState('dockerfile');
  const [dockerfileText, setDockerfileText] = useState(INITIAL_DOCKERFILE);
  const [changedArtifact, setChangedArtifact] = useState('source_code');
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Analyse des Dockerfiles
  const validation = useMemo(() => validateDockerfile(dockerfileText), [dockerfileText]);

  // Caching-Simulation
  const cachedLayers = useMemo(
    () => simulateBuildCaching(validation.layers, changedArtifact),
    [validation.layers, changedArtifact]
  );

  // Compose-Simulation
  const [composeServices, setComposeServices] = useState([
    { service: 'frontend', portHost: 80, portContainer: 80 },
    { service: 'api-gateway', portHost: 3000, portContainer: 3000 },
    { service: 'postgres-db', portHost: 5432, portContainer: 5432 }
  ]);

  const composeValidation = useMemo(
    () => validateComposePorts(composeServices),
    [composeServices]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(dockerfileText);
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
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Box size={30} style={{ color: 'var(--accent-primary)' }} /> Docker & Container Architecture Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', maxWidth: '750px' }}>
              Multi-Stage Builds, Schichten-Caching-Analyse, Docker-Compose Port-Topologien und IHK-Prüfungsdrill.
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
          className={`btn ${activeTab === 'dockerfile' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dockerfile')}
          style={{ minHeight: '44px' }}
        >
          <Box size={16} /> 1. Dockerfile Linter & Analyzer
        </button>
        <button
          className={`btn ${activeTab === 'caching' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('caching')}
          style={{ minHeight: '44px' }}
        >
          <Layers size={16} /> 2. Layer-Caching Simulator
        </button>
        <button
          className={`btn ${activeTab === 'compose' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('compose')}
          style={{ minHeight: '44px' }}
        >
          <ShieldCheck size={16} /> 3. Compose Port-Validator
        </button>
        <button
          className={`btn ${activeTab === 'drill' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('drill')}
          style={{ minHeight: '44px' }}
        >
          <Award size={16} /> 4. IHK-Drill
        </button>
      </div>

      {/* Tab 1: Dockerfile Linter */}
      {activeTab === 'dockerfile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label htmlFor="dockerfile-editor" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                Dockerfile Quelltext
              </label>
              <button className="btn btn-secondary btn-sm" onClick={handleCopy} aria-label="Dockerfile kopieren">
                <Copy size={14} /> {copied ? 'Kopiert!' : 'Kopieren'}
              </button>
            </div>
            <textarea
              id="dockerfile-editor"
              value={dockerfileText}
              onChange={(e) => setDockerfileText(e.target.value)}
              rows={14}
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
                onClick={() => setDockerfileText(INITIAL_DOCKERFILE)}
              >
                <RefreshCw size={14} /> Vorlage: Multi-Stage
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDockerfileText("FROM node:latest\nWORKDIR /app\nCOPY . .\nENV DB_PASS=secret\nRUN apt-get install -y curl\nCMD npm start")}
              >
                Fehlerhafte Vorlage laden
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-main)' }}>
              Best-Practice & Sicherheits-Audit
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: validation.score >= 80 ? 'var(--accent-emerald)' : validation.score >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)'
              }}>
                {validation.score}/100
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {validation.isValid ? 'Produktionsreif' : 'Verbesserungsbedarf'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {validation.isMultiStage ? `Multi-Stage Build (${validation.stageCount} Stufen)` : 'Single-Stage Build'}
                </div>
              </div>
            </div>

            {validation.issues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {validation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderLeft: '4px solid var(--accent-rose)',
                      fontSize: '0.88rem',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <AlertTriangle size={16} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
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
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} /> Keine Best-Practice-Verstöße gefunden
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Pinned Base-Images, Multi-Stage Trennung und saubere Exec-Form für CMD vorhanden.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Layer Caching */}
      {activeTab === 'caching' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
            Docker Schichten-Caching Simulation
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
            Wähle aus, welches Artefakt sich in deinem Git-Repository geändert hat, und beobachte, welche Schichten Docker aus dem Build-Cache wiederverwendet und welche neu berechnet werden müssen.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${changedArtifact === 'none' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChangedArtifact('none')}
            >
              Keine Änderung (Re-Build)
            </button>
            <button
              className={`btn ${changedArtifact === 'source_code' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChangedArtifact('source_code')}
            >
              Nur Quellcode geändert (.js / .jsx)
            </button>
            <button
              className={`btn ${changedArtifact === 'package_json' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setChangedArtifact('package_json')}
            >
              Abhängigkeit geändert (package.json)
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cachedLayers.map((layer, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: layer.cached ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)'
                  }}>
                    Schicht {idx + 1}
                  </span>
                  <code style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{layer.instruction}</code>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{layer.rest}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: layer.cached ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                  }}>
                    {layer.cached ? 'CACHED (0s)' : 'BUILDING...'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({layer.reason})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Compose Port Validator */}
      {activeTab === 'compose' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
            Docker Compose Port-Kollisions-Tester
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
            Prüfe, ob mehrere Services denselben Host-Port beanspruchen (`Host:Container`).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '14px', marginBottom: '20px' }}>
            {composeServices.map((srv, idx) => (
              <div key={srv.service} className="glass-panel" style={{ padding: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
                  Service: {srv.service}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor={`port-host-${srv.service}`} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Host-Port:
                  </label>
                  <input
                    id={`port-host-${srv.service}`}
                    type="number"
                    value={srv.portHost}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setComposeServices((prev) =>
                        prev.map((s, i) => i === idx ? { ...s, portHost: val } : s)
                      );
                    }}
                    style={{
                      width: '90px',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)'
                    }}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>: {srv.portContainer}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: composeValidation.hasConflicts ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            borderLeft: `4px solid ${composeValidation.hasConflicts ? 'var(--accent-rose)' : 'var(--accent-emerald)'}`
          }}>
            {composeValidation.hasConflicts ? (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} /> Konflikt entdeckt:
                </div>
                {composeValidation.conflicts.map((c, i) => (
                  <div key={i} style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '4px' }}>{c}</div>
                ))}
              </div>
            ) : (
              <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Alle Host-Ports konfliktfrei gebunden ({composeValidation.boundPortsCount} Services erreichbar).
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Drill */}
      {activeTab === 'drill' && (
        <LabDrillSection
          title="Docker & Containerization IHK-Prüfungsdrill"
          questions={DOCKER_DRILL_QUESTIONS}
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
