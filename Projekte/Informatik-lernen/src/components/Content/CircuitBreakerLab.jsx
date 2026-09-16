import React, { useState } from 'react';

import { HeartPulse } from 'lucide-react';
import { CIRCUIT_BREAKER_STATES, OPENTELEMETRY_TRACES } from '../../data/enterpriseLabsData';
import { useStore } from '../../store/useStore';

export default function CircuitBreakerLab() {
  const { awardXP } = useStore();
  const [selectedStateName, setSelectedStateName] = useState('CLOSED');
  const [isCompleted, setIsCompleted] = useState(false);
  const trace = OPENTELEMETRY_TRACES[0];

  const stateObj = CIRCUIT_BREAKER_STATES.find(s => s.state === selectedStateName) || CIRCUIT_BREAKER_STATES[0];

  const handleSelectState = (stateName) => {
    setSelectedStateName(stateName);
    if (!isCompleted) {
      setIsCompleted(true);
      awardXP(75, 'Resilience Master: Circuit Breaker & Distributed Tracing');
    }
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(34, 197, 94, 0.15)', borderRadius: '20px', color: '#4ade80', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <HeartPulse size={16} /> Microservices Resilience & OpenTelemetry Distributed Tracing
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Circuit Breaker & Service Mesh Resilience Lab
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Schütze kaskadierende Microservice-Ausfälle mit Closed/Open/Half-Open Zuständen und analysiere Spans via Distributed Tracing.
          </p>
        </div>

        {/* State Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {CIRCUIT_BREAKER_STATES.map(s => (
            <button
              key={s.state}
              onClick={() => handleSelectState(s.state)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedStateName === s.state ? `2px solid ${s.color}` : '1px solid var(--border-color, rgba(255,255,255,0.1))',
                background: selectedStateName === s.state ? `${s.color}25` : 'var(--card-bg, #1e293b)',
                color: selectedStateName === s.state ? s.color : '#94a3b8',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {s.state}
            </button>
          ))}
        </div>
      </div>

      {/* State Machine Visualizer */}
      <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#fff' }}>Aktiver Circuit Status:</span>
          <span style={{ fontSize: '0.82rem', padding: '4px 10px', borderRadius: '4px', background: stateObj.color, color: selectedStateName === 'HALF-OPEN' ? '#000' : '#fff', fontWeight: 'bold' }}>
            {stateObj.metrics.status}
          </span>
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>
          {stateObj.desc}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Durchsatz (Requests):</span>
            <strong style={{ color: '#38bdf8', fontSize: '1.1rem' }}>{stateObj.metrics.requests} req/s</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Fehleranzahl:</span>
            <strong style={{ color: '#f87171', fontSize: '1.1rem' }}>{stateObj.metrics.failures}</strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Fehlerrate:</span>
            <strong style={{ color: stateObj.color, fontSize: '1.1rem' }}>{stateObj.metrics.errorRate}</strong>
          </div>
        </div>
      </div>

      {/* OpenTelemetry Distributed Tracing Waterfall */}
      <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', textTransform: 'uppercase' }}>OpenTelemetry Trace Waterfall</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '2px 0 0 0' }}>{trace.name}</h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontFamily: 'monospace', fontWeight: 'bold' }}>
            Total: {trace.totalDurationMs} ms
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {trace.spans.map((span, idx) => {
            const widthPct = Math.max(15, Math.round((span.durationMs / trace.totalDurationMs) * 100));
            const leftPct = idx * 10;

            return (
              <div key={span.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{span.name}</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{span.durationMs} ms</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #6366f1, #38bdf8)',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
