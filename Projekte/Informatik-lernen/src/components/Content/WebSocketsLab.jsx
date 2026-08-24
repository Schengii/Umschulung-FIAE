import React, { useState } from 'react';
import { WEBSOCKET_PATTERNS } from '../../data/websocketData';
import { Network, Radio, Copy } from 'lucide-react';

export default function WebSocketsLab() {
  const [selectedId, setSelectedId] = useState(WEBSOCKET_PATTERNS[0].id);
  const [copied, setCopied] = useState(false);

  const activePattern = WEBSOCKET_PATTERNS.find(p => p.id === selectedId) || WEBSOCKET_PATTERNS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activePattern.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-teal)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={32} style={{ color: 'var(--accent-teal)' }} /> WebSockets & Realtime Live Collaboration Lab
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Lerne den HTTP 101 Handshake, TCP Duplex-Verbindungen & Socket.io Event Broadcasts.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {WEBSOCKET_PATTERNS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === p.id ? 'var(--accent-teal)' : 'var(--bg-card)',
              color: selectedId === p.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === p.id ? '2px solid var(--accent-teal)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
          {activePattern.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: '1.6', marginBottom: '24px' }}>
          {activePattern.desc}
        </p>

        <div className="code-window">
          <div className="code-header">
            <span>WebSocket Protocol Snippet</span>
            <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
              <Copy size={14} /> {copied ? 'Kopiert ✓' : 'Kopieren'}
            </button>
          </div>
          <pre className="code-body">
            <code>{activePattern.codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
