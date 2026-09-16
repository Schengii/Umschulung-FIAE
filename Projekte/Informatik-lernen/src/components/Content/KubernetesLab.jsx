import React, { useState } from 'react';
import { K8S_MODULES } from '../../data/k8sData';
import { Cpu, Copy } from 'lucide-react';

export default function KubernetesLab() {
  const [selectedId, setSelectedId] = useState(K8S_MODULES[0].id);
  const [copied, setCopied] = useState(false);

  const activeModule = K8S_MODULES.find(m => m.id === selectedId) || K8S_MODULES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeModule.yamlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-indigo)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={32} style={{ color: 'var(--accent-indigo)' }} /> Kubernetes & Cloud Native Architecture Lab
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Erstelle K8s Deployments, Replicas, Services (LoadBalancer) & Ingress Routing.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {K8S_MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === m.id ? 'var(--accent-indigo)' : 'var(--bg-card)',
              color: selectedId === m.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === m.id ? '2px solid var(--accent-indigo)' : '2px solid var(--border-color)',
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
            <span>Kubernetes Manifest ({activeModule.title})</span>
            <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
              <Copy size={14} /> {copied ? 'Kopiert ✓' : 'Kopieren'}
            </button>
          </div>
          <pre className="code-body">
            <code>{activeModule.yamlSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
