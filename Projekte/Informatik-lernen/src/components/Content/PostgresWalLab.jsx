import React, { useState, useMemo } from 'react';
import { Database, Award, HardDrive, ArrowRight, RefreshCw } from 'lucide-react';
import { PostgresWalSimulator } from '../../utils/postgresWalEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function PostgresWalLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [primaryLsn, setPrimaryLsn] = useState('0/16B3748');
  const [standbyLsn, setStandbyLsn] = useState('0/169A120');
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => new PostgresWalSimulator(), []);
  const lagData = useMemo(() => sim.calculateLag(primaryLsn, standbyLsn), [sim, primaryLsn, standbyLsn]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'postgres_wal_master');
      }
    }
  };

  const handleSync = () => {
    setStandbyLsn(primaryLsn);
    triggerHaptic('SUCCESS');
    handleClaim();
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Database size={14} /> Database High-Availability
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <HardDrive size={14} /> PostgreSQL WAL &amp; LSN Replication Lag
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            💾 PostgreSQL WAL &amp; Streaming Replication Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Untersuche Write-Ahead Logging (WAL), berechne Log Sequence Number (LSN) Byte-Offsets und überwache Replikations-Verzögerungen (`replay_lag`) zwischen Primary und Standby.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> WAL-Replikation Bestätigen (+45 XP)
        </button>
      </div>

      {/* Replication Lag Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Replication Lag (Bytes):</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: lagData.isSynchronized ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {lagData.lagBytes.toLocaleString('de-DE')} Bytes
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Replication Lag (MB):</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: lagData.isSynchronized ? '#10b981' : 'var(--accent-primary)', marginTop: '4px' }}>
            {lagData.lagMb} MB
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Geschätzte Replay-Latenz:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: lagData.isSynchronized ? '#10b981' : 'var(--text-main)', marginTop: '4px' }}>
            ~{lagData.replayLagMs} ms
          </div>
        </div>
      </div>

      {/* LSN Input Bar */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Primary pg_current_wal_lsn():</label>
          <input
            type="text"
            value={primaryLsn}
            onChange={(e) => setPrimaryLsn(e.target.value)}
            style={{ width: '160px', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
        </div>

        <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Standby pg_last_wal_replay_lsn():</label>
          <input
            type="text"
            value={standbyLsn}
            onChange={(e) => setStandbyLsn(e.target.value)}
            style={{ width: '160px', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
        </div>

        <button
          onClick={handleSync}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem', marginLeft: 'auto' }}
        >
          <RefreshCw size={14} /> Standby Synchronisieren (0-Lag)
        </button>
      </div>
    </div>
  );
}
