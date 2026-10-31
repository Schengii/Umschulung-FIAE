import React, { useState } from 'react';

import { Network, Database, Play, CheckCircle2 } from 'lucide-react';
import { GRAPHQL_AST_SCENARIOS } from '../../data/expertLabsData';
import { useStore } from '../../store/useStore';

export default function GraphqlResolverLab() {
  const { awardXP } = useStore();
  const [mode, setMode] = useState('dataloader'); // 'naive' | 'dataloader'
  const [isExecuted, setIsExecuted] = useState(false);
  const scenario = GRAPHQL_AST_SCENARIOS[0];

  const handleExecute = () => {
    if (isExecuted) return;
    setIsExecuted(true);
    awardXP(65, 'API Master: GraphQL AST & DataLoader');
  };

  const handleReset = () => {
    setIsExecuted(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(236, 72, 153, 0.15)', borderRadius: '20px', color: '#f472b6', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Network size={16} /> GraphQL AST Parser & Resolver Engine
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            GraphQL AST & DataLoader Resolver Lab
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verstehe, wie GraphQL Anfragen in Abstract Syntax Trees parst und wie DataLoader N+1 Abfragen per Batching auflöst.
          </p>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setMode('naive'); handleReset(); }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: mode === 'naive' ? '2px solid #ef4444' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
              background: mode === 'naive' ? 'rgba(239, 68, 68, 0.15)' : 'var(--card-bg, #1e293b)',
              color: mode === 'naive' ? '#fca5a5' : '#94a3b8',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            ⚠️ Naive Execution (N+1 Problem)
          </button>
          <button
            onClick={() => { setMode('dataloader'); handleReset(); }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: mode === 'dataloader' ? '2px solid #10b981' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
              background: mode === 'dataloader' ? 'rgba(16, 185, 129, 0.15)' : 'var(--card-bg, #1e293b)',
              color: mode === 'dataloader' ? '#86efac' : '#94a3b8',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            🚀 DataLoader Batching (Optimiert)
          </button>
        </div>
      </div>

      {/* Grid: Query AST & Resolver Calls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: GraphQL Query */}
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.3)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(236, 72, 153, 0.15)', borderBottom: '1px solid rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#f472b6', fontWeight: 'bold', fontSize: '0.9rem' }}>Incoming GraphQL Query</span>
            <span style={{ fontSize: '0.75rem', background: '#db2777', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>AST PARSED</span>
          </div>
          <pre style={{ margin: 0, padding: '16px', color: '#fbcfe8', fontFamily: 'Fira Code, monospace', fontSize: '0.88rem', lineHeight: '1.6', overflowX: 'auto' }}>
            {scenario.query}
          </pre>
          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.82rem' }}>
            🔍 <strong>AST Tokenizer:</strong> Document &gt; OperationDefinition (query) &gt; Field (user) &gt; SelectionSet (posts)
          </div>
        </div>

        {/* Right: Database Execution Trace */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>
                <Database size={17} color={mode === 'naive' ? '#ef4444' : '#10b981'} />
                <span>Datenbank Queries ({mode === 'naive' ? '5 Roundtrips' : '3 Batch Roundtrips'})</span>
              </div>
              <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: '4px', background: mode === 'naive' ? '#ef4444' : '#10b981', color: '#fff', fontWeight: 'bold' }}>
                {mode === 'naive' ? 'N+1 INEFFIZIENT' : 'BATCH LOADED'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(mode === 'naive' ? scenario.naiveCalls : scenario.dataloaderCalls).map((call) => (
                <div key={call.step} style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '8px', borderLeft: `4px solid ${mode === 'naive' ? '#ef4444' : '#10b981'}` }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>{call.resolver}</div>
                  <div style={{ color: mode === 'naive' ? '#fca5a5' : '#86efac', fontSize: '0.85rem', fontFamily: 'monospace', marginTop: '2px' }}>{call.sql}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleExecute}
            style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: '8px',
              background: isExecuted ? '#22c55e' : 'linear-gradient(90deg, #ec4899, #8b5cf6)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isExecuted ? <CheckCircle2 size={16} /> : <Play size={16} />}
            {isExecuted ? 'Resolver-Pipeline ausgeführt (+65 XP)' : 'Resolver Kette Triggern'}
          </button>
        </div>

      </div>
    </div>
  );
}
