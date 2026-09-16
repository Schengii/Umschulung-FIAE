import React, { useState, useMemo } from 'react';
import { Binary, Award, Code } from 'lucide-react';
import { GrpcProtobufSimulator } from '../../utils/grpcProtobufEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function GrpcProtobufLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [username, setUsername] = useState('alice');
  const [userId, setUserId] = useState(150);
  const [isActive, setIsActive] = useState(true);
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => new GrpcProtobufSimulator(), []);
  const protoData = useMemo(() => sim.encodeMessage({ id: userId, username, isActive }), [sim, userId, username, isActive]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'grpc_protobuf_master');
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
              <Binary size={14} /> High-Performance RPC
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Code size={14} /> Protocol Buffers (Proto3) &amp; Binary Wire
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            ⚡ gRPC Protocol Buffers (Proto3) Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Untersuche `.proto` Schemadefinitionen, berechne Bit-Tags (`(field_num &lt;&lt; 3) | wire_type`) und vergleiche Binär-Wire-Formate mit JSON.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Protobuf Wire Bestätigen (+45 XP)
        </button>
      </div>

      {/* Comparison Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Protobuf Wire Size:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
            {protoData.protoBytes} Bytes
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Raw JSON Size:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ec4899', marginTop: '4px' }}>
            {protoData.jsonBytes} Bytes
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bandbreiten-Ersparnis:</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
            -{protoData.compressionRatio}%
          </div>
        </div>
      </div>

      {/* Editor & Wire Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Proto Schema & Controls */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            Proto3 Schema (`user_profile.proto`):
          </span>
          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#38bdf8', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.4', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {protoData.protoSchema}
          </pre>

          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Username (String):</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>User ID (int32): {userId}</label>
              <input
                type="range"
                min="1"
                max="999"
                value={userId}
                onChange={(e) => setUserId(parseInt(e.target.value, 10))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>isActive (bool):</label>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                {isActive ? 'true' : 'false'}
              </button>
            </div>
          </div>
        </div>

        {/* Binary Wire Format Stream */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            Binärer Wire-Format Byte Stream (Hex):
          </span>
          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#10b981', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 'bold', lineHeight: '1.4', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {protoData.hexString}
          </pre>

          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {protoData.wireBreakdown.map(wb => (
              <div key={wb.field} style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Field {wb.field}:</strong> Tag {wb.tag} ({wb.type})</span>
                <code style={{ color: 'var(--accent-primary)' }}>{wb.bytes}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
