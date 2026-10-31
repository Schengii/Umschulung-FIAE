import React, { useState, useEffect } from 'react';
import { Network, Zap, Activity, ShieldAlert, Play, Pause } from 'lucide-react';

export default function SystemDesignLab({ onRewardXP }) {
  const [rps, setRps] = useState(1200);
  const [algorithm, setAlgorithm] = useState('round_robin'); // 'round_robin' | 'least_conn' | 'ip_hash'
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Servers state
  const [servers, setServers] = useState([
    { id: 1, name: 'App Server #1', cpu: 32, status: 'healthy', requests: 0 },
    { id: 2, name: 'App Server #2', cpu: 28, status: 'healthy', requests: 0 },
    { id: 3, name: 'App Server #3', cpu: 35, status: 'healthy', requests: 0 }
  ]);

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalRequests: 14820,
    avgLatency: 24,
    cacheHitRate: 85,
    errorRate: 0.1
  });

  // Traffic Simulation Loop
  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        setServers(prevServers => {
          const healthyServers = prevServers.filter(s => s.status === 'healthy');
          if (healthyServers.length === 0) return prevServers;

          let newServers = [...prevServers];
          if (algorithm === 'round_robin') {
            const loadPerServer = Math.round(rps / healthyServers.length);
            newServers = newServers.map(s => {
              if (s.status !== 'healthy') return s;
              const cpuUsage = Math.min(99, Math.max(15, Math.round((loadPerServer / 1500) * 80 + Math.random() * 10)));
              return { ...s, cpu: cpuUsage, requests: s.requests + Math.floor(loadPerServer / 10) };
            });
          } else if (algorithm === 'least_conn') {
            newServers = newServers.map(s => {
              if (s.status !== 'healthy') return s;
              const cpuUsage = Math.min(99, Math.max(15, Math.round(30 + Math.random() * 15)));
              return { ...s, cpu: cpuUsage, requests: s.requests + Math.floor(rps / (healthyServers.length * 10)) };
            });
          } else {
            newServers = newServers.map(s => {
              if (s.status !== 'healthy') return s;
              const cpuUsage = Math.min(99, Math.max(15, Math.round(40 + Math.random() * 20)));
              return { ...s, cpu: cpuUsage, requests: s.requests + Math.floor(rps / (healthyServers.length * 10)) };
            });
          }

          return newServers;
        });

        setMetrics(prev => {
          const activeCount = servers.filter(s => s.status === 'healthy').length;
          const isOverloaded = activeCount === 0 || (rps > 4000 && activeCount < 2);
          return {
            totalRequests: prev.totalRequests + Math.floor(rps / 5),
            avgLatency: isOverloaded ? 450 : cacheEnabled ? 18 + Math.floor(Math.random() * 8) : 65 + Math.floor(Math.random() * 15),
            cacheHitRate: cacheEnabled ? 88 + Math.floor(Math.random() * 6) : 0,
            errorRate: isOverloaded ? 12.4 : 0.02
          };
        });
      }, 800);
    }

    return () => clearInterval(interval);
  }, [isSimulating, rps, algorithm, cacheEnabled, servers]);

  const toggleServerHealth = (id) => {
    setServers(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'healthy' ? 'crashed' : 'healthy', cpu: s.status === 'healthy' ? 0 : 25 } : s));
  };

  const handleTrafficSpike = () => {
    setRps(5000);
    setIsSimulating(true);
    if (onRewardXP) onRewardXP(30);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Network size={14} /> System Architecture & Microservices
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            ⚡ System Design & Load Balancer Simulator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Simuliere Traffic-Spikes, Load Balancing Algorithmen (Round Robin, Least Conn), Redis Caching & DB Replikation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleTrafficSpike} style={{ gap: '6px', borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}>
            <Zap size={16} /> Traffic Spike (5000 RPS)
          </button>
          <button className="btn btn-primary" onClick={() => setIsSimulating(!isSimulating)} style={{ gap: '8px', minWidth: '160px' }}>
            {isSimulating ? <Pause size={18} /> : <Play size={18} />}
            {isSimulating ? 'Simulation Stoppen' : 'Simulation Starten'}
          </button>
        </div>
      </div>

      {/* Control Panel Bar */}
      <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
          {/* Traffic RPS Slider */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Traffic Load (RPS):</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>{rps} Req/sec</span>
            </label>
            <input
              type="range"
              min="100"
              max="8000"
              step="100"
              value={rps}
              onChange={(e) => setRps(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Load Balancer Algorithm */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
              Load Balancing Algorithmus:
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontWeight: '600' }}
            >
              <option value="round_robin">Round Robin (Gleichmäßig)</option>
              <option value="least_conn">Least Connections (Min. Auslastung)</option>
              <option value="ip_hash">IP Hash (Sticky Sessions)</option>
            </select>
          </div>

          {/* Redis Cache Toggle */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
              Redis Caching Layer:
            </label>
            <button
              onClick={() => setCacheEnabled(!cacheEnabled)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                background: cacheEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)',
                color: cacheEnabled ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                border: cacheEnabled ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-rose)',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {cacheEnabled ? '⚡ Cache Aktiviert (Hit-Rate ~88%)' : '❌ Cache Deaktiviert (DB Direct)'}
            </button>
          </div>
        </div>
      </div>

      {/* Live System Metrics Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gesamte Requests</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>{metrics.totalRequests.toLocaleString()}</div>
        </div>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ø Antwortzeit (Latenz)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: metrics.avgLatency > 200 ? '#ef4444' : '#10b981' }}>{metrics.avgLatency} ms</div>
        </div>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Redis Cache Hit Rate</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#6366f1' }}>{metrics.cacheHitRate}%</div>
        </div>
        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fehlerquote (Error Rate)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: metrics.errorRate > 1 ? '#ef4444' : '#10b981' }}>{metrics.errorRate}%</div>
        </div>
      </div>

      {/* Visual System Architecture Diagram */}
      <div style={{ background: '#0f172a', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b' }}>
        <h4 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: '700', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} style={{ color: '#38bdf8' }} /> Interaktiver System-Topologie Graph
        </h4>

        {/* Load Balancer Node */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-block', background: '#1e293b', padding: '14px 28px', borderRadius: 'var(--radius-lg)', border: '2px solid #6366f1', boxShadow: '0 0 15px rgba(99,102,241,0.3)' }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>NGINX LOAD BALANCER</div>
            <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '1.1rem' }}>{algorithm.toUpperCase().replace('_', ' ')}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Eingehender Traffic: {rps} RPS</div>
          </div>
        </div>

        {/* App Servers Pool */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {servers.map((server) => (
            <div
              key={server.id}
              style={{
                background: server.status === 'healthy' ? '#020617' : 'rgba(239,68,68,0.1)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: server.status === 'healthy' ? '1px solid #334155' : '2px solid #ef4444',
                color: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{server.name}</span>
                <button
                  onClick={() => toggleServerHealth(server.id)}
                  style={{
                    background: server.status === 'healthy' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                    color: server.status === 'healthy' ? '#ef4444' : '#10b981',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {server.status === 'healthy' ? 'Server Töten' : 'Neustarten'}
                </button>
              </div>

              {server.status === 'healthy' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>CPU Auslastung:</span>
                    <span style={{ fontWeight: '700', color: server.cpu > 80 ? '#ef4444' : '#38bdf8' }}>{server.cpu}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${server.cpu}%`, height: '100%', background: server.cpu > 80 ? '#ef4444' : '#38bdf8', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '8px' }}>
                    Abgearbeitete Requests: {server.requests.toLocaleString()}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={16} /> SERVER DOWN (Crash)
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Database & Cache Layer */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Redis Cache */}
          <div style={{ background: '#020617', padding: '16px', borderRadius: 'var(--radius-md)', border: cacheEnabled ? '1px solid #6366f1' : '1px dashed #334155' }}>
            <div style={{ color: '#a5b4fc', fontSize: '0.8rem', fontWeight: '800' }}>REDIS CACHE CLUSTER</div>
            <div style={{ color: '#f8fafc', fontWeight: '700', marginTop: '4px' }}>In-Memory Key-Value Storage</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
              Status: {cacheEnabled ? 'ONLINE (88% Hits)' : 'OFFLINE (Bypassed)'}
            </div>
          </div>

          {/* PostgreSQL Primary DB */}
          <div style={{ background: '#020617', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
            <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '800' }}>POSTGRESQL PRIMARY (WRITE)</div>
            <div style={{ color: '#f8fafc', fontWeight: '700', marginTop: '4px' }}>Master Database Node</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>Replikation: 2 Read-Replicas synchron</div>
          </div>
        </div>
      </div>
    </div>
  );
}
