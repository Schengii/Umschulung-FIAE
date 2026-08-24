import React, { useState } from 'react';
import { OAUTH_STEPS } from '../../data/oauthData';
import { ShieldCheck, Lock, Copy } from 'lucide-react';

export default function OauthOidcLab() {
  const [selectedId, setSelectedId] = useState(OAUTH_STEPS[0].id);
  const [copied, setCopied] = useState(false);

  const activeStep = OAUTH_STEPS.find(s => s.id === selectedId) || OAUTH_STEPS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeStep.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-indigo)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lock size={32} style={{ color: 'var(--accent-indigo)' }} /> OAuth2 & OpenID Connect (OIDC) Security Playground
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Verstehe Authorization Code Flow mit PKCE, JWT Tokens (Header, Payload, Signature) & Access Tokens.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {OAUTH_STEPS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === s.id ? 'var(--accent-indigo)' : 'var(--bg-card)',
              color: selectedId === s.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === s.id ? '2px solid var(--accent-indigo)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
          {activeStep.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: '1.6', marginBottom: '24px' }}>
          {activeStep.desc}
        </p>

        <div className="code-window">
          <div className="code-header">
            <span>OAuth2 Code Snippet</span>
            <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
              <Copy size={14} /> {copied ? 'Kopiert ✓' : 'Kopieren'}
            </button>
          </div>
          <pre className="code-body">
            <code>{activeStep.codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
