import React, { useState } from 'react';

import { Database, CheckCircle2, RotateCcw, Play, Server } from 'lucide-react';
import { REDIS_CACHING_STRATEGIES } from '../../data/enterpriseLabsData';
import { useStore } from '../../store/useStore';

export default function RedisCachingLab() {
  const { awardXP } = useStore();
  const [selectedStrategyId, setSelectedStrategyId] = useState(REDIS_CACHING_STRATEGIES[0].id);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const cacheMemory = [
    { key: 'user:42', val: '{"name":"Alice","role":"Admin"}', ttl: 3540 },
    { key: 'product:108', val: '{"title":"Laptop Pro","price":1299}', ttl: 1820 },
    { key: 'stats:daily', val: '{"pageviews":48920}', ttl: 450 }
  ];
  const [isCompleted, setIsCompleted] = useState(false);

  const strategy = REDIS_CACHING_STRATEGIES.find(s => s.id === selectedStrategyId) || REDIS_CACHING_STRATEGIES[0];

  const handleNextStep = () => {
    if (activeStepIdx < strategy.flow.length - 1) {
      setActiveStepIdx(prev => prev + 1);
    } else if (!isCompleted) {
      setIsCompleted(true);
      awardXP(75, 'Performance Architect: Redis In-Memory Caching');
    }
  };

  const handleReset = () => {
    setActiveStepIdx(0);
    setIsCompleted(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', color: '#f87171', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Database size={16} /> Redis In-Memory Key-Value Store & Caching Strategies
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Redis Caching & Invalidation Strategies Lab
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Vergleiche Cache-Aside, Write-Through und Schutzmechanismen gegen Cache Stampede (Thundering Herd / Distributed Locks).
          </p>
        </div>

        {/* Strategy Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {REDIS_CACHING_STRATEGIES.map(s => (
            <button
              key={s.id}
              onClick={() => { setSelectedStrategyId(s.id); handleReset(); }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedStrategyId === s.id ? '2px solid #ef4444' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
                background: selectedStrategyId === s.id ? 'rgba(239, 68, 68, 0.2)' : 'var(--card-bg, #1e293b)',
                color: selectedStrategyId === s.id ? '#fca5a5' : '#94a3b8',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {s.name.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Erwartete Cache Hit-Ratio:</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80' }}>{strategy.hitRatio}</div>
        </div>
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Eingesparte DB-Latenz:</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>{strategy.latencySaved}</div>
        </div>
      </div>

      {/* Grid: Strategy Flow & Live Redis Memory Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Execution Flow */}
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>
              {strategy.name}
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '16px' }}>
              {strategy.desc}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {strategy.flow.map((stepText, idx) => {
                const isCurrent = idx === activeStepIdx;
                const isPassed = idx < activeStepIdx;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: isCurrent ? 'rgba(239, 68, 68, 0.25)' : isPassed ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255,255,255,0.03)',
                      borderLeft: isCurrent ? '4px solid #ef4444' : isPassed ? '4px solid #22c55e' : '4px solid transparent',
                      color: isCurrent ? '#fca5a5' : isPassed ? '#86efac' : '#94a3b8',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace'
                    }}
                  >
                    {stepText}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleReset}
              style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={handleNextStep}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: isCompleted ? '#22c55e' : '#ef4444',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isCompleted ? <CheckCircle2 size={16} /> : <Play size={16} />}
              {isCompleted ? 'Cache-Strategie verifiziert (+75 XP)' : `Nächster Schritt (${activeStepIdx + 1}/${strategy.flow.length})`}
            </button>
          </div>
        </div>

        {/* Right: Live Redis In-Memory Table */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>
              <Server size={17} color="#ef4444" /> Redis In-Memory Keyspace (Port 6379)
            </div>
            <span style={{ fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              RAM 0.8ms
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cacheMemory.map(item => (
              <div key={item.key} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#fca5a5', fontFamily: 'monospace', fontSize: '0.88rem' }}>{item.key}</strong>
                  <span style={{ color: '#fbbf24', fontSize: '0.78rem', fontFamily: 'monospace' }}>TTL: {item.ttl}s</span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.val}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
            💡 <strong>Eviction Policy:</strong> Wenn Redis die Speicherobergrenze (z. B. `maxmemory 4gb`) erreicht, entfernt die `allkeys-lru` Policy automatisch die am längsten ungenutzten Keys aus dem Speicher.
          </div>
        </div>

      </div>
    </div>
  );
}
