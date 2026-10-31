import React, { useState, useMemo } from 'react';
import { Database, Award, Flame } from 'lucide-react';
import { PostgresFlamegraphSimulator } from '../../utils/postgresFlamegraphEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function PostgresFlamegraphLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [solved, setSolved] = useState(false);
  const sim = useMemo(() => new PostgresFlamegraphSimulator(), []);
  const metrics = useMemo(() => sim.calculateMetrics(), [sim]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'postgres_flamegraph_master');
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
              <Database size={14} /> PostgreSQL Query Optimization
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={14} /> EXPLAIN ANALYZE &amp; Buffer Cache FlameGraph
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🔥 PostgreSQL EXPLAIN FlameGraph Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Analysiere Abfrageausführungspläne mit FlameGraphs, erkenne Shared Buffer Cache Misses vs. Disk Reads und optimiere langsame `Seq Scan` Bottlenecks.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Plan-Analyse Bestätigen (+45 XP)
        </button>
      </div>

      {/* Query Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gesamte Ausführungszeit:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {metrics.totalExecutionTimeMs} ms
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Shared Buffer Cache Hit Ratio:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            {metrics.cacheHitRatioPercent}% Hits
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Disk I/O Reads:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: metrics.hasSeqScanBottleneck ? '#ef4444' : '#10b981', marginTop: '4px' }}>
            {metrics.totalSharedReadBlocks} Blocks (Disk)
          </div>
        </div>
      </div>

      {/* Interactive FlameGraph View */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
          Hierarchischer Query FlameGraph &amp; Zeitverteilung:
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Level 1: Root Aggregate */}
          <div style={{ width: '100%', background: '#6366f1', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            Aggregate (142.5 ms | 100% Query Time)
          </div>

          {/* Level 2: Hash Join */}
          <div style={{ width: '90%', background: '#ec4899', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            Hash Join (128.2 ms | 90% Query Time)
          </div>

          {/* Level 3: Children */}
          <div style={{ display: 'flex', gap: '8px', width: '90%' }}>
            <div style={{ width: '35%', background: '#10b981', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Index Scan on orders (45.1 ms)
            </div>
            <div style={{ width: '65%', background: '#ef4444', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              Seq Scan on customers (83.1 ms - Bottleneck!)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
