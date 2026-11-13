import React, { useState, useMemo } from 'react';
import { 
  Globe, RefreshCw, 
  Wifi, Shield, Layers
} from 'lucide-react';
import { 
  calculateHandshakeLatency, 
  simulateStreamTransfer, 
  simulateConnectionMigration 
} from '../../utils/http3QuicEngine';
import { useStore } from '../../store/useStore';

export default function Http3QuicLab() {
  const { awardXP } = useStore();
  const [packetLossPct, setPacketLossPct] = useState(15);
  const [streamCount, setStreamCount] = useState(4);
  const [isResumedHandshake, setIsResumedHandshake] = useState(true);
  const [activeTab, setActiveTab] = useState('simulation'); // 'simulation' | 'handshake' | 'migration'
  const [simSeed, setSimSeed] = useState(42);
  const [migrationState, setMigrationState] = useState(null);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const h2Simulation = useMemo(() => {
    return simulateStreamTransfer({
      protocol: 'HTTP/2',
      streamCount,
      packetLossRate: packetLossPct / 100,
      seed: simSeed
    });
  }, [streamCount, packetLossPct, simSeed]);

  const h3Simulation = useMemo(() => {
    return simulateStreamTransfer({
      protocol: 'HTTP/3',
      streamCount,
      packetLossRate: packetLossPct / 100,
      seed: simSeed
    });
  }, [streamCount, packetLossPct, simSeed]);

  const handleRerunSimulation = () => {
    setSimSeed(Math.random());
    if (!rewardClaimed) {
      awardXP(75, 'Web Architecture Master: HTTP/3 & QUIC Protocol');
      setRewardClaimed(true);
    }
  };

  const handleTestMigration = (proto) => {
    const res = simulateConnectionMigration(proto);
    setMigrationState(res);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '20px', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Globe size={16} /> Next-Gen Transport: UDP-basiertes QUIC & 0-RTT Multiplexing
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            HTTP/3 & QUIC Protocol Inspector
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Vergleiche HTTP/1.1, HTTP/2 und HTTP/3: Erlebe, wie QUIC Head-of-Line Blocking bei Paketverlust vollständig eliminiert.
          </p>
        </div>

        {/* Action Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('simulation')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'simulation' ? '#0284c7' : 'transparent',
              color: 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={15} /> Stream-Simulator
          </button>
          <button
            onClick={() => setActiveTab('handshake')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'handshake' ? '#0284c7' : 'transparent',
              color: 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Shield size={15} /> 0-RTT Handshake
          </button>
          <button
            onClick={() => setActiveTab('migration')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'migration' ? '#0284c7' : 'transparent',
              color: 'var(--text-main)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Wifi size={15} /> Connection Migration
          </button>
        </div>
      </div>

      {activeTab === 'simulation' && (
        <>
          {/* Controls Bar */}
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: 'bold' }}>
                  Simulierter Paketverlust: {packetLossPct}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="5"
                  value={packetLossPct}
                  onChange={(e) => setPacketLossPct(Number(e.target.value))}
                  style={{ width: '180px', accentColor: '#38bdf8' }}
                />
              </div>

              <div>
                <label htmlFor="http3-quic-lab-1" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '4px', fontWeight: 'bold' }}>
                  Parallele Ressourcen-Streams:
                </label>
                <select id="http3-quic-lab-1"
                  value={streamCount}
                  onChange={(e) => setStreamCount(Number(e.target.value))}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    padding: '6px 12px',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value={4}>4 Streams</option>
                  <option value={6}>6 Streams (HTTP/1.1 Limit)</option>
                  <option value={8}>8 Streams</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRerunSimulation}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                background: 'var(--accent-cyan)',
                color: 'var(--text-on-accent)',
                fontWeight: 'bold',
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} /> Neu simulieren
            </button>
          </div>

          {/* Protocol Comparison Side-by-Side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* HTTP/2 Card */}
            <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-amber)', margin: 0 }}>
                  HTTP/2 (TCP)
                </h3>
                <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  Single TCP Socket
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
                Gesamte Ladezeit: <strong style={{ color: h2Simulation.totalHolPenaltyMs > 0 ? 'var(--accent-rose)' : 'var(--text-main)', fontSize: '1.1rem' }}>{h2Simulation.totalDurationMs} ms</strong>
                {h2Simulation.totalHolPenaltyMs > 0 && (
                  <span style={{ color: 'var(--accent-rose)', marginLeft: '8px', fontSize: '0.8rem' }}>
                    (inkl. +{h2Simulation.totalHolPenaltyMs}ms TCP HoL-Blocking!)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {h2Simulation.streams.map(stream => (
                  <div key={stream.streamId} style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{stream.name}</span>
                      <span style={{ color: stream.isStalledByHoL ? 'var(--accent-rose)' : 'var(--text-dim)' }}>
                        {stream.durationMs} ms {stream.isStalledByHoL && '⚠️ HoL Stalled'}
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${Math.min(100, (stream.durationMs / (h2Simulation.totalDurationMs || 1)) * 100)}%`,
                          background: stream.isStalledByHoL ? '#ef4444' : stream.packetsLost > 0 ? '#f59e0b' : '#10b981'
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* HTTP/3 QUIC Card */}
            <div style={{ background: 'rgba(2, 132, 199, 0.08)', borderRadius: '12px', padding: '20px', border: '2px solid #38bdf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-cyan)', margin: 0 }}>
                  HTTP/3 (QUIC / UDP)
                </h3>
                <span style={{ fontSize: '0.75rem', background: 'var(--accent-cyan)', color: 'var(--text-on-accent)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  Unabhängige UDP Streams
                </span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
                Gesamte Ladezeit: <strong style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>{h3Simulation.totalDurationMs} ms</strong>
                <span style={{ color: 'var(--accent-emerald)', marginLeft: '8px', fontSize: '0.8rem' }}>
                  ✓ Kein Head-of-Line Blocking
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {h3Simulation.streams.map(stream => (
                  <div key={stream.streamId} style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{stream.name}</span>
                      <span style={{ color: stream.packetsLost > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                        {stream.durationMs} ms {stream.packetsLost > 0 ? `(${stream.packetsLost} Pkt. Drop)` : '✓ Schneller Stream'}
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${Math.min(100, (stream.durationMs / (h2Simulation.totalDurationMs || 1)) * 100)}%`,
                          background: stream.packetsLost > 0 ? '#f59e0b' : '#38bdf8'
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div style={{ padding: '16px', background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            💡 <strong>Wichtigste Erkenntnis:</strong> Da HTTP/2 alle virtuellen Streams über **eine einzige TCP-Verbindung** tunnelt, stoppt ein verlorenes TCP-Paket den gesamten Strom (TCP Head-of-Line-Blocking). **HTTP/3 über QUIC (UDP)** wickelt jeden Stream transporttechnisch unabhängig ab, sodass Paketverluste nur den betroffenen Stream verzögern und alle anderen ungestört durchgehen!
          </div>
        </>
      )}

      {activeTab === 'handshake' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
                Handshake Latenz & Session Resumption (0-RTT)
              </h3>
              <button
                onClick={() => setIsResumedHandshake(prev => !prev)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: isResumedHandshake ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.1)',
                  border: isResumedHandshake ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                  color: isResumedHandshake ? 'var(--accent-cyan)' : 'var(--text-dim)',
                  fontSize: '0.82rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Modus: {isResumedHandshake ? 'Wiederkehrender Nutzer (Session Resumed)' : 'Erstaufruf (Initial Connect)'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '16px' }}>
              {['HTTP/1.1', 'HTTP/2', 'HTTP/3'].map(proto => {
                const hs = calculateHandshakeLatency(proto, 50, isResumedHandshake);
                const isH3 = proto === 'HTTP/3';

                return (
                  <div key={proto} style={{ background: isH3 ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-tertiary)', border: isH3 ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontWeight: 'bold', color: isH3 ? 'var(--accent-cyan)' : 'var(--text-main)', marginBottom: '8px' }}>
                      {proto}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: isH3 ? 'var(--accent-cyan)' : 'var(--text-main)', marginBottom: '6px' }}>
                      {hs.latencyMs} ms
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      {hs.rttCount} RTT (Round Trip Times)
                    </div>
                    {hs.is0RttPossible && (
                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 'bold' }}>
                        ⚡ 0-RTT: Daten werden direkt mit dem ersten Paket verschickt (Early Data)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'migration' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 16px 0' }}>
              Connection ID Migration (Netzwerkwechsel WLAN → 5G Mobilfunk)
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', margin: '0 0 16px 0' }}>
              Beim Verlassen des Büros wechselt das Endgerät von der WLAN-IP (z. B. 192.168.1.50) zur Mobilfunk-IP (z. B. 10.120.45.89). Teste, wie die Protokolle reagieren:
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => handleTestMigration('HTTP/2')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #f59e0b',
                  color: 'var(--accent-amber)',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Netzwerkwechsel mit HTTP/2 testen
              </button>
              <button
                onClick={() => handleTestMigration('HTTP/3')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid #38bdf8',
                  color: 'var(--accent-cyan)',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Netzwerkwechsel mit HTTP/3 testen
              </button>
            </div>

            {migrationState && (
              <div style={{ 
                background: migrationState.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: migrationState.success ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '1rem', color: migrationState.success ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginBottom: '6px' }}>
                  {migrationState.success ? '✓ Nahtlose Verbindungsmigration erfolgreich!' : '❌ Verbindungsunterbrechung (Socket Teardown)'}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {migrationState.description}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                  Zusätzlicher Neuaufbau-Verzug: <strong>{migrationState.handshakeDelayMs} ms</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
