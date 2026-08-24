import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Zap, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw, AlertTriangle, Layers, Activity } from 'lucide-react';
import { HTTP3_QUIC_BENCHMARKS } from '../../data/cloudArchLabsData';
import { useStore } from '../../store/useStore';

export default function Http3QuicLab() {
  const { awardXP } = useStore();
  const [packetLossActive, setPacketLossActive] = useState(false);
  const [isTested, setIsTested] = useState(false);

  const handleRunBenchmark = () => {
    setIsTested(true);
    awardXP(75, 'Web Architecture Master: HTTP/3 & QUIC Protocol');
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '20px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Globe size={16} /> Next-Gen Transport: UDP-basiertes QUIC & 0-RTT Multiplexing
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            HTTP/3 & QUIC Protocol Inspector
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Vergleiche HTTP/1.1, HTTP/2 und HTTP/3: Erlebe, wie QUIC Head-of-Line Blocking bei Paketverlust vollständig eliminiert.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setPacketLossActive(prev => !prev)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: packetLossActive ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
              background: packetLossActive ? 'rgba(239, 68, 68, 0.2)' : 'var(--card-bg, #1e293b)',
              color: packetLossActive ? '#fca5a5' : '#e2e8f0',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={15} color={packetLossActive ? '#ef4444' : '#fbbf24'} />
            <span>10% Packet Loss Simulation {packetLossActive ? '(AKTIV)' : '(AUS)'}</span>
          </button>

          <button
            onClick={handleRunBenchmark}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: isTested ? '#22c55e' : '#0284c7',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isTested ? <CheckCircle2 size={16} /> : <Zap size={16} />}
            {isTested ? 'Benchmark abgeschlossen (+75 XP)' : 'Benchmark Starten'}
          </button>
        </div>
      </div>

      {/* Protocol Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {HTTP3_QUIC_BENCHMARKS.map((bench, idx) => {
          const isQuic = idx === 2;
          const adjustedLatency = packetLossActive 
            ? (isQuic ? bench.avgLatencyMs + 4 : bench.avgLatencyMs * 2.8).toFixed(1)
            : bench.avgLatencyMs;

          return (
            <div
              key={bench.protocol}
              style={{
                background: isQuic ? 'rgba(2, 132, 199, 0.12)' : 'var(--card-bg, #1e293b)',
                border: isQuic ? '2px solid #38bdf8' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isQuic ? '#38bdf8' : '#fff', margin: 0 }}>
                    {bench.protocol}
                  </h3>
                  {isQuic && (
                    <span style={{ fontSize: '0.75rem', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      UDP QUIC
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Handshake Latenz:</span>
                    <strong style={{ color: '#fbbf24', marginLeft: '6px' }}>{bench.handshakeRtt}</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Head-of-Line Blocking:</span>
                    <strong style={{ color: isQuic ? '#4ade80' : '#f87171', marginLeft: '6px' }}>{bench.headOfLineBlocking}</strong>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Connection Migration:</span>
                    <strong style={{ color: isQuic ? '#4ade80' : '#94a3b8', marginLeft: '6px' }}>{bench.connMigration}</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: isQuic ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gemessene Durchschn. Latenz {packetLossActive && '(unter Packet Loss)'}:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: isQuic ? '#38bdf8' : packetLossActive ? '#ef4444' : '#fff' }}>
                  {adjustedLatency} ms
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '16px', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '10px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
        💡 <strong>Wichtigste Erkenntnis:</strong> Da HTTP/2 mehrere Streams über **eine einzige TCP-Verbindung** bündelt, blockiert ein verlorenes TCP-Paket alle anderen Streams (TCP Head-of-Line-Blocking). **HTTP/3 über QUIC (UDP)** wickelt jeden Stream unabhängig ab, sodass verlorene Pakete nur genau den betroffenen Stream verzögern.
      </div>
    </div>
  );
}
