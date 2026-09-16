import React, { useState } from 'react';
import { Network, Router, HardDrive, ArrowRight, Play } from 'lucide-react';

export default function PacketTracerLab({ onRewardXP }) {
  const [simulationState, setSimulationState] = useState('idle'); // 'idle' | 'pinging' | 'success'
  const [activeHop, setActiveHop] = useState(null);
  const [pingLogs, setPingLogs] = useState([]);

  const runPingSimulation = async () => {
    setSimulationState('pinging');
    setPingLogs(['PING 192.168.2.50 (Server) from 192.168.1.10: 56 data bytes']);

    // Hop 1: PC1 -> Router
    setActiveHop('pc1-router');
    await new Promise(r => setTimeout(r, 800));
    setPingLogs(prev => [...prev, '64 bytes from 192.168.1.1 (Gateway): icmp_seq=1 ttl=64 time=1.2 ms']);

    // Hop 2: Router -> Server
    setActiveHop('router-server');
    await new Promise(r => setTimeout(r, 800));
    setPingLogs(prev => [...prev, '64 bytes from 192.168.2.50 (Server): icmp_seq=2 ttl=63 time=14.5 ms']);

    // Complete
    setActiveHop(null);
    setSimulationState('success');
    setPingLogs(prev => [...prev, '--- 192.168.2.50 ping statistics ---', '2 packets transmitted, 2 received, 0% packet loss, time 1600ms']);
    if (onRewardXP) onRewardXP(35);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <Network size={14} /> Systemintegration & Routing
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            📡 Network Packet Tracer & Route Visualizer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Simuliere ICMP Ping-Paketläufe, Gateway-Hop-Zeiten und Subnetz-Routing.
          </p>
        </div>
      </div>

      {/* Network Topology Visualizer */}
      <div style={{ background: '#0f172a', padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
        {/* PC 1 */}
        <div style={{ textAlign: 'center', padding: '16px', background: activeHop === 'pc1-router' ? 'rgba(56,189,248,0.2)' : '#1e293b', borderRadius: '12px', border: '2px solid #38bdf8' }}>
          <HardDrive size={40} color="#38bdf8" />
          <div style={{ color: '#fff', fontWeight: '700', marginTop: '8px' }}>PC 1</div>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>192.168.1.10</span>
        </div>

        <ArrowRight size={28} color={activeHop === 'pc1-router' ? '#10b981' : '#64748b'} />

        {/* Router */}
        <div style={{ textAlign: 'center', padding: '16px', background: activeHop === 'router-server' ? 'rgba(56,189,248,0.2)' : '#1e293b', borderRadius: '12px', border: '2px solid #a855f7' }}>
          <Router size={40} color="#a855f7" />
          <div style={{ color: '#fff', fontWeight: '700', marginTop: '8px' }}>Core Router</div>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>192.168.1.1 / 192.168.2.1</span>
        </div>

        <ArrowRight size={28} color={activeHop === 'router-server' ? '#10b981' : '#64748b'} />

        {/* Server */}
        <div style={{ textAlign: 'center', padding: '16px', background: simulationState === 'success' ? 'rgba(16,185,129,0.2)' : '#1e293b', borderRadius: '12px', border: '2px solid #10b981' }}>
          <HardDrive size={40} color="#10b981" />
          <div style={{ color: '#fff', fontWeight: '700', marginTop: '8px' }}>Web Server</div>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>192.168.2.50</span>
        </div>
      </div>

      {/* Control & Terminal Log */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div>
          <button className="btn btn-primary" onClick={runPingSimulation} disabled={simulationState === 'pinging'}>
            <Play size={16} /> {simulationState === 'pinging' ? 'Sende Pakete...' : 'ICMP Ping Starten'}
          </button>
        </div>

        <div style={{ background: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '0.85rem', minHeight: '140px' }}>
          {pingLogs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
