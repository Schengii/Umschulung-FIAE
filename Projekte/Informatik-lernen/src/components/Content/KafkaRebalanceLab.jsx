import React, { useState, useMemo } from 'react';
import { Shuffle, Award, Server } from 'lucide-react';
import { KafkaRebalanceSimulator } from '../../utils/kafkaRebalanceEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function KafkaRebalanceLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [protocol, setProtocol] = useState('COOPERATIVE_STICKY');
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => {
    const s = new KafkaRebalanceSimulator();
    s.rebalanceProtocol = protocol;
    return s;
  }, [protocol]);

  const rebalanceData = useMemo(() => sim.simulateRebalance('CONSUMER_JOINED'), [sim]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'kafka_rebalance_master');
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
              <Server size={14} /> Distributed Event Streaming
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Shuffle size={14} /> Kafka Consumer Group Rebalance Protocol
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🔄 Kafka Partition Rebalance &amp; Protocol Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Vergleiche Eager (Stop-the-World) mit modernem Cooperative Sticky Rebalancing und beobachte Partitions-Neuzuweisungen ohne Stream-Unterbrechung.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Rebalance Bestätigen (+45 XP)
        </button>
      </div>

      {/* Protocol Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => { setProtocol('COOPERATIVE_STICKY'); triggerHaptic('SELECTION'); }}
          className={`btn ${protocol === 'COOPERATIVE_STICKY' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>1. Cooperative Sticky Rebalance</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Inkrementelle Übergabe (Nahezu 0 Downtime)</div>
        </button>

        <button
          onClick={() => { setProtocol('EAGER'); triggerHaptic('SELECTION'); }}
          className={`btn ${protocol === 'EAGER' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>2. Eager Rebalance (Klassisch)</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Stop-the-World (Alle Partitionen entzogen)</div>
        </button>
      </div>

      {/* Rebalance Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Consumer Group Downtime:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: rebalanceData.isZeroDowntime ? '#10b981' : '#ef4444', marginTop: '4px' }}>
            {rebalanceData.downtimeMs} ms
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rebalance Strategie:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {protocol === 'COOPERATIVE_STICKY' ? 'Incremental' : 'Full Revocation'}
          </div>
        </div>
      </div>

      {/* Partition Assignment Map */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '14px' }}>
          Aktuelle Partitions-Zuweisung ({rebalanceData.topic}):
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {Object.entries(rebalanceData.assignments).map(([consumer, partitions]) => (
            <div key={consumer} style={{ padding: '14px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '8px' }}>
                {consumer}
              </strong>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {partitions.map(p => (
                  <span key={p} className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '14px' }}>
          {rebalanceData.description}
        </div>
      </div>
    </div>
  );
}
