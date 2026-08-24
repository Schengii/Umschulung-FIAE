import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Play, RotateCcw, ShieldAlert, CheckCircle2, Lock, ArrowRight, Layers, AlertOctagon } from 'lucide-react';
import { SQL_ISOLATION_SCENARIOS } from '../../data/nextGenLabsData';
import { useStore } from '../../store/useStore';

export default function SqlTransactionLab() {
  const { awardXP } = useStore();
  const [selectedScenarioId, setSelectedScenarioId] = useState(SQL_ISOLATION_SCENARIOS[0].id);
  const [stepAIdx, setStepAIdx] = useState(0);
  const [stepBIdx, setStepBIdx] = useState(0);
  const [selectedIsolation, setSelectedIsolation] = useState('READ UNCOMMITTED');
  const [isCompleted, setIsCompleted] = useState(false);

  const scenario = SQL_ISOLATION_SCENARIOS.find(s => s.id === selectedScenarioId) || SQL_ISOLATION_SCENARIOS[0];

  const handleStepA = () => {
    if (stepAIdx < scenario.sessionA.length) {
      setStepAIdx(prev => prev + 1);
    }
  };

  const handleStepB = () => {
    if (stepBIdx < scenario.sessionB.length) {
      setStepBIdx(prev => prev + 1);
      if (!isCompleted) {
        setIsCompleted(true);
        awardXP(70, 'Datenbank Master: ACID Transaktionen');
      }
    }
  };

  const handleReset = () => {
    setStepAIdx(0);
    setStepBIdx(0);
    setIsCompleted(false);
  };

  const handleSelectScenario = (id) => {
    setSelectedScenarioId(id);
    setStepAIdx(0);
    setStepBIdx(0);
    setIsCompleted(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '20px', color: '#c084fc', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Database size={16} /> Multi-Client RDBMS Concurrency & Locking
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            SQL Transaktionen, ACID & Deadlock Simulator
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verstehe Isolationsstufen (Dirty Read, Non-repeatable Read, Phantom Read) und simuliere zirkuläre Lock-Konflikte in 2 Sessions.
          </p>
        </div>

        {/* Scenarios */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {SQL_ISOLATION_SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: selectedScenarioId === s.id ? '2px solid #a855f7' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
                background: selectedScenarioId === s.id ? 'rgba(168, 85, 247, 0.2)' : 'var(--card-bg, #1e293b)',
                color: selectedScenarioId === s.id ? '#e9d5ff' : 'var(--text-secondary, #94a3b8)',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              {s.title.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Isolation Level Selector */}
      <div style={{ background: 'var(--card-bg, #1e293b)', padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
          <Lock size={16} color="#fbbf24" /> Aktives Isolation Level:
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedIsolation(lvl)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: selectedIsolation === lvl ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.08)',
                background: selectedIsolation === lvl ? '#9333ea' : 'rgba(255,255,255,0.04)',
                color: '#fff',
                fontSize: '0.78rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Two Parallel SQL Consoles (Session A & Session B) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Session A */}
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(99, 102, 241, 0.15)', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', color: '#818cf8', fontSize: '0.9rem' }}>💻 Client-Session A (Transaction #101)</span>
            <span style={{ fontSize: '0.75rem', background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>PID: 4892</span>
          </div>

          <div style={{ padding: '16px', flex: 1, fontFamily: 'Fira Code, monospace', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scenario.sessionA.map((step, idx) => {
              const isExecuted = idx < stepAIdx;
              return (
                <div key={idx} style={{ padding: '8px 10px', borderRadius: '6px', background: isExecuted ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)', borderLeft: isExecuted ? '4px solid #6366f1' : '4px solid transparent' }}>
                  <div style={{ color: isExecuted ? '#c7d2fe' : '#64748b', fontWeight: 'bold' }}>{step.cmd}</div>
                  <div style={{ fontSize: '0.78rem', color: isExecuted ? '#94a3b8' : '#475569', marginTop: '2px' }}>{step.desc}</div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '12px 16px', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={handleStepA}
              disabled={stepAIdx >= scenario.sessionA.length}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                background: stepAIdx >= scenario.sessionA.length ? '#475569' : '#6366f1',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                border: 'none',
                cursor: stepAIdx >= scenario.sessionA.length ? 'default' : 'pointer'
              }}
            >
              Befehl in Session A ausführen ({stepAIdx}/{scenario.sessionA.length})
            </button>
          </div>
        </div>

        {/* Session B */}
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', background: 'rgba(236, 72, 153, 0.15)', borderBottom: '1px solid rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', color: '#f472b6', fontSize: '0.9rem' }}>🌐 Client-Session B (Transaction #102)</span>
            <span style={{ fontSize: '0.75rem', background: '#db2777', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>PID: 4910</span>
          </div>

          <div style={{ padding: '16px', flex: 1, fontFamily: 'Fira Code, monospace', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scenario.sessionB.map((step, idx) => {
              const isExecuted = idx < stepBIdx;
              return (
                <div key={idx} style={{ padding: '8px 10px', borderRadius: '6px', background: isExecuted ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.03)', borderLeft: isExecuted ? '4px solid #ec4899' : '4px solid transparent' }}>
                  <div style={{ color: isExecuted ? '#fbcfe8' : '#64748b', fontWeight: 'bold' }}>{step.cmd}</div>
                  <div style={{ fontSize: '0.78rem', color: isExecuted ? '#94a3b8' : '#475569', marginTop: '2px' }}>{step.desc}</div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '12px 16px', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={handleStepB}
              disabled={stepBIdx >= scenario.sessionB.length}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                background: stepBIdx >= scenario.sessionB.length ? '#475569' : '#ec4899',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                border: 'none',
                cursor: stepBIdx >= scenario.sessionB.length ? 'default' : 'pointer'
              }}
            >
              Befehl in Session B ausführen ({stepBIdx}/{scenario.sessionB.length})
            </button>
          </div>
        </div>

      </div>

      {/* Explanation & Results Footer */}
      <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#c084fc', marginBottom: '6px' }}>
            Erkenntnis & ACID-Analyse:
          </div>
          <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.5' }}>
            {scenario.explanation}
          </div>
        </div>

        <button
          onClick={handleReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.88rem'
          }}
        >
          <RotateCcw size={16} /> Zurücksetzen
        </button>
      </div>

    </div>
  );
}
