import React, { useState } from 'react';
import { DOCKER_MODULES } from '../../data/dockerData';
import { Box, Play, CheckCircle2, Copy } from 'lucide-react';

export default function DockerLab() {
  const [selectedId, setSelectedId] = useState(DOCKER_MODULES[0].id);
  const [copied, setCopied] = useState(false);

  const activeModule = DOCKER_MODULES.find(m => m.id === selectedId) || DOCKER_MODULES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeModule.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Box size={32} style={{ color: 'var(--accent-primary)' }} /> Docker & Containerization Interactive Lab
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Lerne Dockerfiles, Multi-Stage Builds & Docker Compose für moderne Cloud-native Entwicklungen.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {DOCKER_MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === m.id ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: selectedId === m.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === m.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {m.title}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
          {activeModule.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: '1.6', marginBottom: '24px' }}>
          {activeModule.desc}
        </p>

        <div className="code-window">
          <div className="code-header">
            <span>{activeModule.title} Snippet</span>
            <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
              <Copy size={14} /> {copied ? 'Kopiert ✓' : 'Kopieren'}
            </button>
          </div>
          <pre className="code-body">
            <code>{activeModule.snippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
