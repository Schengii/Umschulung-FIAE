import React, { useState } from 'react';
import { Play, Layers, Server, Database, ShieldCheck, FileCode, CheckCircle2, RefreshCw, Terminal, Cpu, HardDrive } from 'lucide-react';

const INITIAL_SERVICES = [
  {
    id: 'frontend',
    name: 'Frontend Web App',
    image: 'nginx:alpine',
    portHost: 8080,
    portContainer: 80,
    env: 'NODE_ENV=production',
    enabled: true,
    status: 'stopped'
  },
  {
    id: 'backend',
    name: 'Node.js Express API',
    image: 'node:20-alpine',
    portHost: 3000,
    portContainer: 3000,
    env: 'DB_HOST=postgres\nREDIS_HOST=redis',
    enabled: true,
    status: 'stopped'
  },
  {
    id: 'postgres',
    name: 'PostgreSQL Database',
    image: 'postgres:16-alpine',
    portHost: 5432,
    portContainer: 5432,
    env: 'POSTGRES_DB=devgame\nPOSTGRES_USER=admin\nPOSTGRES_PASSWORD=secret',
    enabled: true,
    status: 'stopped'
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    image: 'redis:7-alpine',
    portHost: 6379,
    portContainer: 6379,
    env: '',
    enabled: true,
    status: 'stopped'
  }
];

export default function DockerComposeLab({ onRewardXP }) {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [isUp, setIsUp] = useState(false);
  const [logs, setLogs] = useState([]);

  const toggleService = (id) => {
    if (isUp) return;
    setServices(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleComposeUp = () => {
    if (isUp) return;
    setIsUp(true);
    setLogs(['$ docker compose up -d', 'Creating network "app_default"...']);

    const enabledList = services.filter(s => s.enabled);
    let delay = 600;

    enabledList.forEach((s, idx) => {
      setTimeout(() => {
        setServices(prev => prev.map(item => item.id === s.id ? { ...item, status: 'running' } : item));
        setLogs(prev => [...prev, `[+] Container ${s.id}-1 Created & Started (${s.image} -> ${s.portHost}:${s.portContainer})`]);

        if (idx === enabledList.length - 1) {
          setLogs(prev => [...prev, '✔ Multi-Container Stack is HEALTHY and listening for requests.']);
          if (onRewardXP) onRewardXP(35);
        }
      }, delay);
      delay += 800;
    });
  };

  const handleComposeDown = () => {
    setIsUp(false);
    setLogs(['$ docker compose down', 'Stopping containers...']);

    setTimeout(() => {
      setServices(prev => prev.map(s => ({ ...s, status: 'stopped' })));
      setLogs(prev => [...prev, '✔ All containers stopped and removed.']);
    }, 800);
  };

  const generateComposeYaml = () => {
    const activeServicesYaml = services
      .filter(s => s.enabled)
      .map(s => {
        let envYaml = s.env
          ? `    environment:\n` + s.env.split('\n').map(line => `      - ${line}`).join('\n')
          : '';
        return `  ${s.id}:\n    image: ${s.image}\n    ports:\n      - "${s.portHost}:${s.portContainer}"${envYaml ? '\n' + envYaml : ''}`;
      })
      .join('\n\n');

    return `version: '3.8'

services:
${activeServicesYaml}
`;
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} /> Docker & Microservices Orchestration
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🐳 Docker Compose Multi-Container Studio
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Konfiguriere Multi-Container Stacks (Frontend, Node API, Postgres DB & Redis) und erstelle `docker-compose.yml`.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isUp ? (
            <button className="btn btn-secondary" onClick={handleComposeDown} style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)', gap: '8px' }}>
              <RefreshCw size={16} /> Docker Compose Down
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleComposeUp} style={{ gap: '8px', minWidth: '180px' }}>
              <Play size={18} /> Docker Compose Up
            </button>
          )}
        </div>
      </div>

      {/* Container Stack Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {services.map((s) => (
          <div
            key={s.id}
            onClick={() => toggleService(s.id)}
            style={{
              background: s.status === 'running' ? 'rgba(16,185,129,0.15)' : s.enabled ? 'var(--bg-primary)' : 'rgba(148,163,184,0.08)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              border: s.status === 'running' ? '2px solid var(--accent-emerald)' : s.enabled ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
              opacity: s.enabled ? 1 : 0.5,
              cursor: isUp ? 'default' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                {s.id}
              </span>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: s.status === 'running' ? '#10b981' : '#64748b',
                boxShadow: s.status === 'running' ? '0 0 8px #10b981' : 'none'
              }} />
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
              {s.name}
            </h4>

            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Image: {s.image}
            </div>

            <div style={{ display: 'inline-block', background: '#0f172a', color: '#38bdf8', padding: '4px 8px', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
              Port: {s.portHost}:{s.portContainer}
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Terminal Logs & Compose YAML */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Container Logs */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} style={{ color: '#38bdf8' }} /> Container Logs Stream
          </h4>
          <div style={{
            background: '#020617',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            color: '#38bdf8',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            minHeight: '240px',
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #0f172a'
          }}>
            {logs.length === 0 ? (
              <span style={{ color: '#64748b' }}>Starte den Stack mit "Docker Compose Up"...</span>
            ) : (
              logs.map((line, idx) => (
                <div key={idx} style={{ marginBottom: '4px', color: line.includes('HEALTHY') ? '#10b981' : '#38bdf8' }}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Generated docker-compose.yml */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={16} style={{ color: '#10b981' }} /> Generierte `docker-compose.yml`
          </h4>
          <pre style={{
            margin: 0,
            padding: '14px',
            background: '#020617',
            borderRadius: 'var(--radius-md)',
            color: '#a5b4fc',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            minHeight: '240px',
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #0f172a'
          }}>
            {generateComposeYaml()}
          </pre>
        </div>
      </div>
    </div>
  );
}
