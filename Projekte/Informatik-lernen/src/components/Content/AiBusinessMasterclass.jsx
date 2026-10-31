import React, { useState } from 'react';
import { AI_BUSINESS_MODULES } from '../../data/aiBusinessData';
import { Bot, Copy } from 'lucide-react';

export default function AiBusinessMasterclass() {
  const [selectedId, setSelectedId] = useState(AI_BUSINESS_MODULES[0].id);
  const [copied, setCopied] = useState(false);

  const activeModule = AI_BUSINESS_MODULES.find(m => m.id === selectedId) || AI_BUSINESS_MODULES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeModule.promptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bot size={32} style={{ color: 'var(--accent-primary)' }} /> AI Business & Deep Learning Masterclass
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Golems & Coursera-inspirierter Kurs für KI-Effizienz im Beruf, Business Prompts & Neuronale Netze.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {AI_BUSINESS_MODULES.map((m) => (
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

      {/* Selected Module Details */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>{activeModule.category}</span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
          {activeModule.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: '1.6', marginBottom: '24px' }}>
          {activeModule.desc}
        </p>

        {/* Prompt Template Box */}
        <div className="code-window" style={{ marginBottom: '20px' }}>
          <div className="code-header">
            <span>Prompt Vorlage / Code Snippet</span>
            <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
              <Copy size={14} /> {copied ? 'Kopiert ✓' : 'Kopieren'}
            </button>
          </div>
          <pre className="code-body">
            <code>{activeModule.promptTemplate}</code>
          </pre>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-amber)' }}>
          <strong style={{ color: 'var(--accent-amber)', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>💡 Pro-Tipp / Best Practice:</strong>
          <p style={{ margin: 0, fontSize: '0.94rem', color: 'var(--text-main)' }}>{activeModule.bestPractice}</p>
        </div>
      </div>
    </div>
  );
}
