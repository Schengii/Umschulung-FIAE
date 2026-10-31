import React, { useState } from 'react';
import { RAG_STEPS } from '../../data/ragAiData';
import { Database } from 'lucide-react';

export default function RagAiSimulator() {
  const [selectedId, setSelectedId] = useState(RAG_STEPS[0].id);

  const activeStep = RAG_STEPS.find(s => s.id === selectedId) || RAG_STEPS[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-purple)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={32} style={{ color: 'var(--accent-purple)' }} /> Local AI LLM & RAG Pipeline Simulator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Retrieval Augmented Generation (RAG): Document Chunking, Vector Embeddings & Vector DB Search.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {RAG_STEPS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === s.id ? 'var(--accent-purple)' : 'var(--bg-card)',
              color: selectedId === s.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === s.id ? '2px solid var(--accent-purple)' : '2px solid var(--border-color)',
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
            <span>RAG Code Example</span>
          </div>
          <pre className="code-body">
            <code>{activeStep.codeExample}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
