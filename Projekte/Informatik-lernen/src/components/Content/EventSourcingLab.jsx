import React, { useState, useMemo } from 'react';
import { History, Award, Database, ArrowRight } from 'lucide-react';
import { EventSourcingProjectionEngine } from '../../utils/eventSourcingEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function EventSourcingLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [replayStep, setReplayStep] = useState(5);
  const [solved, setSolved] = useState(false);

  const engine = useMemo(() => new EventSourcingProjectionEngine(), []);
  const projectedState = useMemo(() => engine.projectState(replayStep), [engine, replayStep]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'event_sourcing_master');
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} /> Domain-Driven Design (DDD)
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <History size={14} /> Event-Sourcing &amp; CQRS Replay
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📜 Event-Sourcing &amp; CQRS Read-Model Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Erkunde unveränderliche Append-Only Event Logs, führe deterministische Replays durch und beobachte, wie CQRS-Projektionen im Read-Model schrittweise aufgebaut werden.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Replay-Projektion Bestätigen (+45 XP)
        </button>
      </div>

      {/* Step Replay Slider */}
      <div style={{ background: 'var(--bg-secondary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Event Replay Cursor:</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '2px' }}>
            Event {replayStep} von {engine.eventLog.length} angewendet
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setReplayStep(Math.max(1, replayStep - 1)); triggerHaptic('SELECTION'); }}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            Zurück
          </button>
          <button
            onClick={() => { setReplayStep(Math.min(engine.eventLog.length, replayStep + 1)); triggerHaptic('SELECTION'); }}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            Nächstes Event <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Grid: Event Log vs. Materialized Read-Model */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Append-Only Event Log */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
            Append-Only Event Store (Unveränderlich):
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {engine.eventLog.map(evt => {
              const isApplied = evt.id <= replayStep;
              return (
                <div
                  key={evt.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${isApplied ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    background: isApplied ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-primary)',
                    opacity: isApplied ? 1 : 0.45,
                    fontSize: '0.82rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span style={{ color: isApplied ? 'var(--accent-primary)' : 'var(--text-main)' }}>#{evt.id} {evt.type}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{evt.timestamp}</span>
                  </div>
                  <pre style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {JSON.stringify(evt.payload)}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Materialized Read Model */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
            Materialisierte CQRS Read-Model Projektion (`OrderView`):
          </span>

          <pre style={{ margin: 0, padding: '16px', background: '#090d16', color: '#10b981', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.5', overflowX: 'auto' }}>
            {JSON.stringify(projectedState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
