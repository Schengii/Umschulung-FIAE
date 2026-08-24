import React, { useState } from 'react';
import { API_STUDIO_ENDPOINTS } from '../../data/apiStudioData';
import { Network, Send, CheckCircle2, Copy } from 'lucide-react';

export default function ApiBenchStudio() {
  const [selectedId, setSelectedId] = useState(API_STUDIO_ENDPOINTS[0].id);

  const activeApi = API_STUDIO_ENDPOINTS.find(a => a.id === selectedId) || API_STUDIO_ENDPOINTS[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-purple)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={32} style={{ color: 'var(--accent-purple)' }} /> GraphQL & REST API Benchmark Studio
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Teste REST Endpunkte vs GraphQL Queries & analysiere HTTP Status Codes in Echtzeit.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {API_STUDIO_ENDPOINTS.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedId(a.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === a.id ? 'var(--accent-purple)' : 'var(--bg-card)',
              color: selectedId === a.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === a.id ? '2px solid var(--accent-purple)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {a.type}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span className="badge badge-indigo">{activeApi.method}</span>
          <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--text-main)', flex: 1 }}>{activeApi.url}</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>200 OK</span>
        </div>

        {activeApi.query && (
          <div className="code-window" style={{ marginBottom: '20px' }}>
            <div className="code-header">
              <span>GraphQL Query</span>
            </div>
            <pre className="code-body">
              <code>{activeApi.query}</code>
            </pre>
          </div>
        )}

        <div className="code-window">
          <div className="code-header">
            <span>JSON Server Response</span>
          </div>
          <pre className="code-body">
            <code>{activeApi.responseBody}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
