import React, { useState, useMemo } from 'react';
import { Database, Award, Split } from 'lucide-react';
import { PostgresPartitioningSimulator } from '../../utils/postgresPartitioningEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function PostgresPartitioningLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [partitionType, setPartitionType] = useState('RANGE');
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => new PostgresPartitioningSimulator(), []);
  const pruningData = useMemo(() => sim.evaluateQueryPruning(partitionType, partitionType === 'RANGE' ? '2026-05-20' : 'DE'), [sim, partitionType]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'postgres_partitioning_master');
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
              <Database size={14} /> PostgreSQL High-Performance
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Split size={14} /> Declarative Table Partitioning &amp; Pruning
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🗄️ PostgreSQL Partitioning &amp; Pruning Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Erkunde deklaratives Tabellen-Partitioning (`RANGE`, `LIST`, `HASH`), analysiere SQL DDL Statements und beobachte Partition Pruning im Ausführungsplan.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Partitioning Bestätigen (+45 XP)
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => { setPartitionType('RANGE'); triggerHaptic('SELECTION'); }}
          className={`btn ${partitionType === 'RANGE' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>1. Range Partitioning</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>PARTITION BY RANGE (created_at)</div>
        </button>

        <button
          onClick={() => { setPartitionType('LIST'); triggerHaptic('SELECTION'); }}
          className={`btn ${partitionType === 'LIST' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>2. List Partitioning</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>PARTITION BY LIST (region)</div>
        </button>

        <button
          onClick={() => { setPartitionType('HASH'); triggerHaptic('SELECTION'); }}
          className={`btn ${partitionType === 'HASH' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>3. Hash Partitioning</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>PARTITION BY HASH (customer_id)</div>
        </button>
      </div>

      {/* DDL & Pruning Plan Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Parent & Partition Tables DDL */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            Deklarative Tabellen-Struktur (DDL):
          </span>
          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#38bdf8', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.78rem', lineHeight: '1.4', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {pruningData.schema.parentDdl}
          </pre>

          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pruningData.schema.partitions.map(p => (
              <div key={p.name} style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                <code>{p.name} {p.rule}</code>
                <span style={{ color: 'var(--text-muted)' }}>{p.rowCount.toLocaleString('de-DE')} Rows</span>
              </div>
            ))}
          </div>
        </div>

        {/* EXPLAIN Query Plan with Pruning */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
              EXPLAIN Query &amp; Partition Pruning:
            </span>
            <span className="badge badge-emerald">
              -{pruningData.ioReductionPercent}% Disk I/O
            </span>
          </div>

          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#10b981', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.4', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {pruningData.queryExplain}
          </pre>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Partition Pruning schließt Partitionen automatisch vor dem Scan aus und halbiert die Abfragezeit.
          </div>
        </div>
      </div>
    </div>
  );
}
