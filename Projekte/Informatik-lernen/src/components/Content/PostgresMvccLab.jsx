import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, CheckCircle2, RotateCcw, Play, Layers, ArrowRight, ShieldAlert } from 'lucide-react';
import { POSTGRES_MVCC_SCENARIOS } from '../../data/cloudArchLabsData';
import { useStore } from '../../store/useStore';

export default function PostgresMvccLab() {
  const { awardXP } = useStore();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStep = POSTGRES_MVCC_SCENARIOS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < POSTGRES_MVCC_SCENARIOS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else if (!isCompleted) {
      setIsCompleted(true);
      awardXP(75, 'PostgreSQL Master: MVCC & VACUUM Engine');
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsCompleted(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '20px', color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Database size={16} /> PostgreSQL Multi-Version Concurrency Control (MVCC)
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            PostgreSQL MVCC & VACUUM Storage Simulator
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verstehe die internen Speicherstrukturen: `xmin`, `xmax`, Dead Tuples, Table Bloat und die Speicherbereinigung durch `VACUUM`.
          </p>
        </div>

        <span style={{ fontSize: '0.85rem', padding: '6px 14px', borderRadius: '8px', background: 'var(--card-bg, #1e293b)', border: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontWeight: 'bold' }}>
          Schritt {currentStepIdx + 1} / {POSTGRES_MVCC_SCENARIOS.length}
        </span>
      </div>

      {/* Grid: SQL Action & Table Page Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Action & Explanation */}
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '6px' }}>
              Transaktion #{currentStep.txId}
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', fontFamily: 'Fira Code, monospace', color: '#86efac', fontSize: '0.9rem', marginBottom: '16px' }}>
              {currentStep.action}
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '16px' }}>
              {currentStep.desc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleReset}
              style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: isCompleted ? '#22c55e' : '#10b981',
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
              {isCompleted ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              {isCompleted ? 'MVCC & VACUUM verifiziert (+75 XP)' : 'Nächste SQL Operation'}
            </button>
          </div>
        </div>

        {/* Right: Table Page 0 Memory Layout */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>
              <Layers size={17} color="#34d399" /> 8 KB Disk Page (users_table_page_0)
            </div>
            <span style={{ fontSize: '0.75rem', background: '#34d399', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              HEAP TUPLES
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentStep.tablePage.map(tuple => {
              const isDead = tuple.state.includes('DEAD');
              const isReclaimed = tuple.state.includes('RECLAIMED');

              return (
                <div
                  key={tuple.tuple}
                  style={{
                    background: isReclaimed ? 'rgba(59, 130, 246, 0.1)' : isDead ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    border: isReclaimed ? '1px dashed #3b82f6' : isDead ? '1px solid #ef4444' : '1px solid #22c55e',
                    padding: '12px',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <strong style={{ color: isReclaimed ? '#93c5fd' : isDead ? '#fca5a5' : '#86efac', fontFamily: 'monospace' }}>
                      Tuple {tuple.tuple} [xmin={tuple.xmin}, xmax={tuple.xmax}]
                    </strong>
                    <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', color: '#fff' }}>
                      {tuple.state}
                    </span>
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {tuple.data}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
            💡 <strong>Tipp:</strong> `VACUUM` gibt den Speicherplatz innerhalb der Tabelle frei, damit neue INSERTs ihn nutzen können. Erst `VACUUM FULL` schreibt die Tabelle komplett neu und gibt ungenutzten Plattenplatz an das Betriebssystem zurück.
          </div>
        </div>

      </div>
    </div>
  );
}
