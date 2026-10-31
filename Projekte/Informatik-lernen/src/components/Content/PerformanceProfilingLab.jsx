import React, { useState } from 'react';
import { PERF_TOPICS } from '../../data/perfData';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PerformanceProfilingLab() {
  const [selectedId, setSelectedId] = useState(PERF_TOPICS[0].id);

  const activeTopic = PERF_TOPICS.find(t => t.id === selectedId) || PERF_TOPICS[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-rose)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={32} style={{ color: 'var(--accent-rose)' }} /> Performance Profiling & Memory Leak Lab
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Analysiere V8 Garbage Collection (Mark-and-Sweep) & verhindere Memory Leaks in JavaScript.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {PERF_TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === t.id ? 'var(--accent-rose)' : 'var(--bg-card)',
              color: selectedId === t.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === t.id ? '2px solid var(--accent-rose)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t.title}
          </button>
        ))}
      </div>

      <div className="grid-responsive" style={{ gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', border: '2px solid var(--accent-rose)' }}>
          <span className="badge badge-rose" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={14} /> Fehlerhafter Code (Memory Leak)
          </span>
          <div className="code-window">
            <pre className="code-body">
              <code>{activeTopic.badCode}</code>
            </pre>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', border: '2px solid var(--accent-emerald)' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={14} /> Optimierter Code (Sauberer Cleanup)
          </span>
          <div className="code-window">
            <pre className="code-body">
              <code>{activeTopic.goodCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
