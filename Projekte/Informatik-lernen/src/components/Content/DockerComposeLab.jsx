import React, { useState, useMemo } from 'react';
import { 
  Play, Layers, FileCode, RefreshCw, Terminal, 
  Network, HardDrive, ShieldCheck, CheckCircle2, Award, Zap 
} from 'lucide-react';
import { 
  DEFAULT_COMPOSE_PROJECT, 
  resolveDependencyOrder, 
  checkNetworkReachability, 
  generateComposeYaml, 
  simulateComposeUp 
} from '../../utils/dockerComposeEngine';
import { useStore } from '../../store/useStore';

export default function DockerComposeLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [project] = useState(DEFAULT_COMPOSE_PROJECT);
  const [isUp, setIsUp] = useState(false);
  const [activeTab, setActiveTab] = useState('orchestrator'); // orchestrator, networks, volumes, yaml
  const [logs, setLogs] = useState([]);
  const [selectedPingFrom, setSelectedPingFrom] = useState('web');
  const [selectedPingTo, setSelectedPingTo] = useState('postgres');
  const [xpClaimed, setXpClaimed] = useState(false);

  const depAnalysis = useMemo(() => {
    return resolveDependencyOrder(project.services);
  }, [project.services]);

  const pingResult = useMemo(() => {
    return checkNetworkReachability(selectedPingFrom, selectedPingTo, project.services);
  }, [selectedPingFrom, selectedPingTo, project.services]);

  const handleComposeUp = () => {
    if (isUp) return;
    const res = simulateComposeUp(project);
    setIsUp(true);
    setLogs(res.logs);

    if (res.success && !xpClaimed) {
      if (onRewardXP) onRewardXP(45);
      else awardXP(45, 'docker_compose_master');
      setXpClaimed(true);
    }
  };

  const handleComposeDown = () => {
    setIsUp(false);
    setLogs(prev => [
      ...prev,
      '$ docker compose down',
      'Stopping and removing containers, networks and volumes...',
      '✔ Complete. System clean.'
    ]);
  };

  const yamlOutput = useMemo(() => {
    return generateComposeYaml(project);
  }, [project]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> Docker &amp; Microservices
              </span>
              <span className="badge badge-teal">Compose 3.8</span>
              <span className="badge badge-green">DAG &amp; Isolation</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              🐳 Docker Compose Multi-Container Orchestrator
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Orchestriere containerisierte Multi-Tier-Architekturen. Analysiere DAG-Startreihenfolgen via `depends_on`, prüfe Bridge-Netzwerk-Isolation und inspiziere persistente Docker-Volumes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className={`btn ${isUp ? 'btn-rose' : 'btn-primary'}`}
              onClick={isUp ? handleComposeDown : handleComposeUp}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isUp ? <RefreshCw size={16} /> : <Play size={16} />}
              {isUp ? 'docker compose down' : 'docker compose up -d'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'orchestrator' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('orchestrator')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Layers size={14} /> Container Stack &amp; DAG
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'networks' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('networks')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Network size={14} /> Netzwerk-Isolation (Bridge)
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'volumes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('volumes')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <HardDrive size={14} /> Volumes &amp; Persistence
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'yaml' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('yaml')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileCode size={14} /> docker-compose.yml
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'orchestrator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Services List & DAG */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-primary)" />
              Service Dependency Flow (DAG)
            </h2>

            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', marginBottom: '16px', fontSize: '0.85rem' }}>
              <strong>Kahn-Startreihenfolge:</strong>{' '}
              {depAnalysis.launchOrder.map((id, idx) => (
                <span key={id}>
                  <code style={{ color: 'var(--accent-teal)' }}>{id}</code>
                  {idx < depAnalysis.launchOrder.length - 1 && ' ➔ '}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {project.services.map(s => (
                <div key={s.id} style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: isUp ? '1px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800 }}>{s.name}</span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{s.image}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Ports: {s.ports.join(', ') || 'Keine'} | Networks: [{(s.networks || []).join(', ')}]
                    </div>
                    {s.depends_on.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '2px' }}>
                        depends_on: [{s.depends_on.join(', ')}]
                      </div>
                    )}
                  </div>

                  <span className={`badge ${isUp ? 'badge-green' : 'badge-neutral'}`}>
                    {isUp ? 'running' : 'stopped'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Logs */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} color="var(--accent-teal)" />
              Orchestrator Terminal Output
            </h2>

            <div style={{
              background: '#0d1117',
              color: '#38ef7d',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'monospace',
              fontSize: '0.84rem',
              minHeight: '260px',
              maxHeight: '380px',
              overflowY: 'auto',
              lineHeight: '1.6'
            }}>
              {logs.length === 0 ? (
                <div style={{ color: '#8b949e' }}>
                  $ docker compose up -d (Warte auf Ausführung...)
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))
              )}
            </div>

            {isUp && (
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} /> Multi-Container Stack aktiv &amp; gesund
                </span>
                <span className="badge badge-teal">
                  <Award size={14} style={{ marginRight: '4px' }} /> 45 XP erhalten
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'networks' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={18} color="var(--accent-primary)" />
            Netzwerk-Bridge Isolation &amp; Inter-Container Ping-Simulator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Prüfe, ob zwei Container über gemeinsame Docker-Netzwerke kommunizieren können. Aus Sicherheitsgründen sollte der Web-Frontend-Container keinen direkten Netzwerkzugriff auf die interne Datenbank haben!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Quell-Container (From)
              </label>
              <select
                value={selectedPingFrom}
                onChange={(e) => setSelectedPingFrom(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                {project.services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Ziel-Container (To)
              </label>
              <select
                value={selectedPingTo}
                onChange={(e) => setSelectedPingTo(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                {project.services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            background: pingResult.canReach ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
            border: `1px solid ${pingResult.canReach ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '1.1rem', color: pingResult.canReach ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
              {pingResult.canReach ? <CheckCircle2 size={20} /> : <Zap size={20} />}
              {pingResult.canReach ? 'Verbindung erfolgreich (Erreichbar)' : 'Netzwerk-Isolation aktiv (Blockiert)'}
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {pingResult.reason}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'volumes' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HardDrive size={18} color="var(--accent-teal)" />
            Persistente Docker Volumes &amp; Bind-Mounts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {project.volumes.map(v => (
              <div key={v} style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>Volume: <code>{v}</code></span>
                  <span className="badge badge-teal">Named Volume (Driver: local)</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Persistiert Daten auch nach <code>docker compose down</code> auf dem Host-Dateisystem (`/var/lib/docker/volumes/{v}/_data`).
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'yaml' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={18} color="var(--accent-primary)" />
            Generierte docker-compose.yml
          </h2>
          <pre style={{
            background: '#0d1117',
            color: '#e6edf3',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'monospace',
            fontSize: '0.88rem',
            overflowX: 'auto',
            lineHeight: '1.5'
          }}>
            {yamlOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
