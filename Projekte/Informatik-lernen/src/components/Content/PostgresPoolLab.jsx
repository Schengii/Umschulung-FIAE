import React, { useState, useMemo } from 'react';
import { Database, Award, Layers } from 'lucide-react';
import {
  PostgresPoolSimulator,
  SQL_ISOLATION_LEVELS
} from '../../utils/postgresPoolEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function PostgresPoolLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [poolMode, setPoolMode] = useState('transaction');
  const [clients, setClients] = useState(300);
  const [solved, setSolved] = useState(false);

  const poolMetrics = useMemo(() => {
    const pool = new PostgresPoolSimulator(20, 500);
    pool.poolMode = poolMode;
    return pool.calculatePoolMetrics(clients);
  }, [poolMode, clients]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'postgres_pool_master');
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
              <Database size={14} /> PostgreSQL High Availability
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} /> PgBouncer Pooling &amp; SQL Isolation Levels
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🐘 PostgreSQL Connection Pooling &amp; Transaction Isolation Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Vergleiche Session-, Transaction- und Statement-Pooling mit PgBouncer und untersuche die SQL-Transaktions-Isolationsstufen gegen Dirty Reads, Phantoms und Serialization Anomalies.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Konfiguration Bestätigen (+45 XP)
        </button>
      </div>

      {/* Pool Mode Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => { setPoolMode('transaction'); triggerHaptic('SELECTION'); }}
          className={`btn ${poolMode === 'transaction' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>1. Transaction Pooling (Empfohlen)</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Multiplexing pro Transaktion</div>
        </button>

        <button
          onClick={() => { setPoolMode('session'); triggerHaptic('SELECTION'); }}
          className={`btn ${poolMode === 'session' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>2. Session Pooling</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>1:1 Bindung (Kein Multiplexing)</div>
        </button>

        <button
          onClick={() => { setPoolMode('statement'); triggerHaptic('SELECTION'); }}
          className={`btn ${poolMode === 'statement' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>3. Statement Pooling</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Aggressiv (Keine Multi-Statements)</div>
        </button>
      </div>

      {/* Pool Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Aktive Clients:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {poolMetrics.activeClients} Verbindungen
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>DB Backend Server Prozesse:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            {poolMetrics.activeServerBackends} / 20 Max
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>RAM Einsparung via PgBouncer:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            {poolMetrics.ramSavedPercent}% ({poolMetrics.ramUsagePgBouncerMb} MB statt {poolMetrics.ramUsageDirectMb} MB)
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          Simulierte Client-Anfragen: {clients} Clients
        </label>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={clients}
          onChange={(e) => setClients(parseInt(e.target.value, 10))}
          style={{ width: '100%' }}
        />
      </div>

      {/* SQL Isolation Levels Anomaly Matrix */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
          SQL Transaktions-Isolationsstufen &amp; Phänomene-Matrix (ANSI SQL vs. PostgreSQL):
        </span>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Isolation Level</th>
              <th style={{ padding: '10px' }}>Dirty Read</th>
              <th style={{ padding: '10px' }}>Non-Repeatable Read</th>
              <th style={{ padding: '10px' }}>Phantom Read</th>
              <th style={{ padding: '10px' }}>Serialization Anomaly</th>
            </tr>
          </thead>
          <tbody>
            {SQL_ISOLATION_LEVELS.map((iso, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{iso.level}</td>
                <td style={{ padding: '10px', color: iso.dirtyRead ? '#ef4444' : '#10b981' }}>{iso.dirtyRead ? '❌ Möglich' : '✅ Verhindert'}</td>
                <td style={{ padding: '10px', color: iso.nonRepeatableRead ? '#ef4444' : '#10b981' }}>{iso.nonRepeatableRead ? '❌ Möglich' : '✅ Verhindert'}</td>
                <td style={{ padding: '10px', color: iso.phantomRead ? '#ef4444' : '#10b981' }}>{iso.phantomRead ? '❌ Möglich' : '✅ Verhindert'}</td>
                <td style={{ padding: '10px', color: iso.serializationAnomaly ? '#ef4444' : '#10b981' }}>{iso.serializationAnomaly ? '❌ Möglich' : '✅ Verhindert'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
