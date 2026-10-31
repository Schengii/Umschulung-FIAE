import React, { useState } from 'react';
import {
  Network,
  Layers,
  Activity,
  RefreshCw,
  Award,
  Server,
  Zap
} from 'lucide-react';
import {
  calculateConsumerLag,
  simulateRebalanceEvent
} from '../../utils/kafkaConsumerLagEngine';
import { useStore } from '../../store/useStore';

export default function KafkaConsumerLagLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [completed, setCompleted] = useState(false);

  // Partition states
  const [partitions, setPartitions] = useState([
    { partitionId: 0, logEndOffset: 12500, currentOffset: 12500, assignedConsumer: 'consumer-pod-1' },
    { partitionId: 1, logEndOffset: 24000, currentOffset: 18200, assignedConsumer: 'consumer-pod-2' }, // lag 5800 -> Critical
    { partitionId: 2, logEndOffset: 15000, currentOffset: 13600, assignedConsumer: 'consumer-pod-3' }, // lag 1400 -> Elevated
    { partitionId: 3, logEndOffset: 31000, currentOffset: 31000, assignedConsumer: 'consumer-pod-1' },
    { partitionId: 4, logEndOffset: 9400, currentOffset: 9400, assignedConsumer: 'consumer-pod-2' },
    { partitionId: 5, logEndOffset: 18000, currentOffset: 17950, assignedConsumer: 'consumer-pod-3' }
  ]);

  const [rebalanceProtocol, setRebalanceProtocol] = useState('COOPERATIVE_STICKY');
  const [rebalanceResult, setRebalanceResult] = useState(null);

  const lagMetrics = calculateConsumerLag(partitions);

  const handleSimulateRebalance = () => {
    const res = simulateRebalanceEvent({
      eventType: 'CONSUMER_JOINED',
      protocol: rebalanceProtocol,
      partitionCount: partitions.length,
      existingConsumers: ['consumer-pod-1', 'consumer-pod-2', 'consumer-pod-3']
    });
    setRebalanceResult(res);

    if (!completed) {
      setCompleted(true);
      if (onRewardXP) onRewardXP(65);
      else awardXP(65, 'kafka_consumer_lag_master');
    }
  };

  const handleDrainLag = () => {
    setPartitions(prev => prev.map(p => ({
      ...p,
      currentOffset: p.logEndOffset
    })));
  };

  const handleProduceSpike = () => {
    setPartitions(prev => prev.map(p => ({
      ...p,
      logEndOffset: p.logEndOffset + Math.floor(Math.random() * 4000 + 2000)
    })));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-teal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Network size={14} /> Distributed Event Streaming
              </span>
              <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={14} /> Apache Kafka Architecture
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={28} style={{ color: 'var(--accent-teal)' }} />
              Kafka Consumer Lag &amp; Partition Rebalance Protocol Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '820px' }}>
              Interaktive Überwachung von Log End Offset (LEO), Committed Offsets und Consumer Lag.
              Gegenüberstellung des klassischen <strong>Eager (Stop-the-World)</strong> Rebalances mit dem modernen <strong>Cooperative Sticky Rebalance Protocol</strong>.
            </p>
          </div>

          <div>
            {completed && (
              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} /> +65 XP erhalten
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Metrics Overview & Rebalance Simulator */}
      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* Left: Summary Metrics */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--accent-teal)' }} /> Consumer Group Metriken
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gesamter Lag:</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: lagMetrics.totalLag > 5000 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                {lagMetrics.totalLag.toLocaleString()} msgs
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Maximaler Partitions-Lag:</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: lagMetrics.maxLag > 5000 ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                {lagMetrics.maxLag.toLocaleString()} msgs
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aktive Consumer:</span>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
                3 Pods
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleProduceSpike} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
              ⚡ Lastspitze einspeisen (Producer Spike)
            </button>
            <button onClick={handleDrainLag} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
              ✅ Lag abbauen (Catch-up)
            </button>
          </div>
        </div>

        {/* Right: Rebalance Protocol Sandbox */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={18} style={{ color: 'var(--accent-indigo)' }} /> Rebalance Protocol Simulator
          </h2>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Rebalance-Strategie:
            </label>
            <select
              value={rebalanceProtocol}
              onChange={(e) => setRebalanceProtocol(e.target.value)}
              className="input-select"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option value="COOPERATIVE_STICKY">Cooperative Sticky (Kafka &gt;= 2.4 / Zero Stop-the-World)</option>
              <option value="EAGER">Eager Protocol (Legacy / Stop-the-World Pause)</option>
            </select>
          </div>

          <button
            onClick={handleSimulateRebalance}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} /> Rebalance auslösen (Neuer Consumer Pod)
          </button>

          {rebalanceResult && (
            <div style={{
              marginTop: '14px',
              padding: '14px',
              borderRadius: '8px',
              background: rebalanceResult.isStopTheWorld ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              border: `1px solid ${rebalanceResult.isStopTheWorld ? 'var(--accent-rose)' : 'var(--accent-emerald)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.92rem', color: rebalanceResult.isStopTheWorld ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {rebalanceResult.isStopTheWorld ? '⚠️ Stop-the-World Downtime' : '✨ Zero Stop-The-World (Incremental)'}
                </strong>
                <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                  {rebalanceResult.downtimeMs} ms Pause
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-main)', lineHeight: '1.4' }}>
                {rebalanceResult.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Partitions Table */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} style={{ color: 'var(--accent-teal)' }} /> Partitions-Status &amp; Offset-Fortschritt
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Partition</th>
                <th style={{ padding: '10px' }}>Zugeordneter Pod</th>
                <th style={{ padding: '10px' }}>Log End Offset (LEO)</th>
                <th style={{ padding: '10px' }}>Committed Offset</th>
                <th style={{ padding: '10px' }}>Consumer Lag</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {lagMetrics.partitionsWithLag.map(p => (
                <tr key={p.partitionId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px', fontWeight: '700' }}>Partition #{p.partitionId}</td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>{p.assignedConsumer}</span>
                  </td>
                  <td style={{ padding: '10px' }}>{p.logEndOffset.toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>{p.currentOffset.toLocaleString()}</td>
                  <td style={{ padding: '10px', fontWeight: '700', color: p.status === 'CRITICAL' ? 'var(--accent-rose)' : p.status === 'ELEVATED' ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                    {p.lag.toLocaleString()} msgs
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge ${p.status === 'CRITICAL' ? 'badge-rose' : p.status === 'ELEVATED' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.72rem' }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
