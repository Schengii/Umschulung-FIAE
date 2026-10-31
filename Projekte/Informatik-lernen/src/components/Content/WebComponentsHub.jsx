import React, { useState } from 'react';
import { WEB_COMPONENTS_DATA } from '../../data/webComponentsData';
import { Layers } from 'lucide-react';

export default function WebComponentsHub() {
  const [selectedId, setSelectedId] = useState(WEB_COMPONENTS_DATA[0].id);

  const activeComp = WEB_COMPONENTS_DATA.find(w => w.id === selectedId) || WEB_COMPONENTS_DATA[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-teal)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={32} style={{ color: 'var(--accent-teal)' }} /> Web Components & Micro-Frontends Hub
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Lerne moderne Komponenten-Technologien: **Lit.dev**, **Vaadin** und **Native W3C Web Components**.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {WEB_COMPONENTS_DATA.map((w) => (
          <button
            key={w.id}
            onClick={() => setSelectedId(w.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === w.id ? 'var(--accent-teal)' : 'var(--bg-card)',
              color: selectedId === w.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === w.id ? '2px solid var(--accent-teal)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {w.icon} {w.name}
          </button>
        ))}
      </div>

      {/* Details */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <span className="badge badge-teal" style={{ marginBottom: '10px' }}>{activeComp.badge}</span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
          {activeComp.icon} {activeComp.name}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px' }}>
          {activeComp.desc}
        </p>

        {/* Code Window */}
        <div className="code-window">
          <div className="code-header">
            <span>Code Beispiel ({activeComp.name})</span>
            <span>Web Component Syntax</span>
          </div>
          <pre className="code-body">
            <code>{activeComp.exampleCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
