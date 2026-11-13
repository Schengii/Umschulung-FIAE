import React, { useState } from 'react';
import { 
  Server, Play, Square, RefreshCw, AlertOctagon, 
  Terminal, FileText, Zap 
} from 'lucide-react';
import { 
  DEFAULT_SERVICE_CONFIG, 
  generateSystemdUnitFile, 
  transitionServiceState 
} from '../../utils/systemdServiceEngine';
import { useStore } from '../../store/useStore';

export default function SystemdServiceLab() {
  const { awardXP } = useStore();
  const [config, setConfig] = useState(DEFAULT_SERVICE_CONFIG);
  const [serviceState, setServiceState] = useState('active'); // 'active' | 'inactive' | 'restarting' | 'failed'
  const [currentMemoryMb, setCurrentMemoryMb] = useState(90);
  const [logs, setLogs] = useState([
    'systemd[1]: Starting IT-DevGame REST API Backend Service...',
    'systemd[1]: Started IT-DevGame REST API Backend Service.'
  ]);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString('de-DE');
    setLogs(prev => [...prev.slice(-15), `[${timestamp}] ${msg}`]);
  };

  const handleAction = (action) => {
    const res = transitionServiceState(serviceState, action, config, currentMemoryMb);
    setServiceState(res.nextState);
    addLog(res.logMessage);

    if (res.willAutoRestart) {
      setTimeout(() => {
        setServiceState('active');
        addLog(`systemd[1]: Scheduled restart job, restart counter is at 1.`);
        addLog(`systemd[1]: Started ${config.description}.`);
      }, (config.restartSec || 5) * 1000);
    }

    if (!rewardClaimed && (action === 'simulate_oom' || action === 'crash')) {
      awardXP(70, 'Linux Systemd & Cgroups v2 Master');
      setRewardClaimed(true);
    }
  };

  const handleMemoryLeak = () => {
    const newMem = config.memoryMaxMb + 60; // Überschreitet MemoryMax
    setCurrentMemoryMb(newMem);
    const res = transitionServiceState(serviceState, 'simulate_oom', config, newMem);
    setServiceState(res.nextState);
    addLog(`kernel: Process 'node' requested ${newMem}MB.`);
    addLog(res.logMessage);

    if (res.willAutoRestart) {
      setTimeout(() => {
        setCurrentMemoryMb(80);
        setServiceState('active');
        addLog(`systemd[1]: Service auto-restarted cleanly with reset memory (${80}MB).`);
      }, (config.restartSec || 5) * 1000);
    }

    if (!rewardClaimed) {
      awardXP(70, 'Linux Systemd & Cgroups v2 Master');
      setRewardClaimed(true);
    }
  };

  const unitFileText = generateSystemdUnitFile(config);

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(234, 179, 8, 0.15)', borderRadius: '20px', color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Server size={16} /> Linux Init-System & Cgroups v2 Resource Management
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Linux Systemd Unit & Cgroups Sandbox
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Simuliere Service Lifecycles, Restart-Policies (always, on-failure) und teste Cgroups-Limits (MemoryMax, CPUQuota) unter OOM-Stress.
          </p>
        </div>

        {/* State Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Status:</span>
          <span style={{
            padding: '6px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            background: 
              serviceState === 'active' ? 'rgba(16, 185, 129, 0.2)' :
              serviceState === 'restarting' ? 'rgba(234, 179, 8, 0.2)' :
              serviceState === 'failed' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(148, 163, 184, 0.2)',
            color:
              serviceState === 'active' ? 'var(--accent-emerald)' :
              serviceState === 'restarting' ? 'var(--accent-amber)' :
              serviceState === 'failed' ? 'var(--accent-rose)' : 'var(--text-dim)',
            border: `1px solid ${
              serviceState === 'active' ? 'var(--accent-emerald)' :
              serviceState === 'restarting' ? 'var(--accent-amber)' :
              serviceState === 'failed' ? 'var(--accent-rose)' : '#64748b'
            }`
          }}>
            {serviceState === 'active' ? '● active (running)' :
             serviceState === 'restarting' ? '◌ activating (auto-restart)' :
             serviceState === 'failed' ? '✕ failed (crashed)' : '○ inactive (dead)'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Controls & Configuration */}
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 16px 0' }}>
            Systemctl Service Steuerung
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => handleAction('start')}
              disabled={serviceState === 'active'}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: serviceState === 'active' ? 'var(--bg-card-hover)' : 'var(--accent-emerald)',
                color: 'var(--text-main)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                border: 'none',
                cursor: serviceState === 'active' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Play size={15} /> systemctl start
            </button>

            <button
              onClick={() => handleAction('stop')}
              disabled={serviceState === 'inactive'}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: serviceState === 'inactive' ? 'var(--bg-card-hover)' : '#64748b',
                color: 'var(--text-main)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                border: 'none',
                cursor: serviceState === 'inactive' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Square size={15} /> systemctl stop
            </button>

            <button
              onClick={() => handleAction('restart')}
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--accent-cyan)',
                color: 'var(--text-on-accent)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} /> restart
            </button>
          </div>

          <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '8px', fontWeight: 'bold' }}>
              Fehlersimulation & Stresstests:
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleAction('crash')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: 'var(--accent-rose)',
                  fontSize: '0.82rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <AlertOctagon size={14} /> Crash simulieren (exit 1)
              </button>

              <button
                onClick={handleMemoryLeak}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'rgba(234, 179, 8, 0.2)',
                  border: '1px solid #eab308',
                  color: 'var(--accent-amber)',
                  fontSize: '0.82rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={14} /> Memory Leak (Cgroups OOM)
              </button>
            </div>
          </div>

          {/* Configuration Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div>
              <label htmlFor="systemd-service-lab-1" style={{ color: 'var(--text-dim)' }}>Restart-Policy:</label>
              <select id="systemd-service-lab-1"
                value={config.restart}
                onChange={(e) => setConfig(prev => ({ ...prev, restart: e.target.value }))}
                style={{ width: '100%', padding: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)' }}
              >
                <option value="on-failure">on-failure (Standard bei Server-Diensten)</option>
                <option value="always">always (Automatischer Restart bei jedem Exit)</option>
                <option value="no">no (Kein automatischer Neustart bei Absturz)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label htmlFor="systemd-service-lab-2" style={{ color: 'var(--text-dim)' }}>Cgroups MemoryMax:</label>
                <input id="systemd-service-lab-2"
                  type="number"
                  value={config.memoryMaxMb}
                  onChange={(e) => setConfig(prev => ({ ...prev, memoryMaxMb: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label htmlFor="systemd-service-lab-3" style={{ color: 'var(--text-dim)' }}>RestartSec (Sekunden):</label>
                <input id="systemd-service-lab-3"
                  type="number"
                  value={config.restartSec}
                  onChange={(e) => setConfig(prev => ({ ...prev, restartSec: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-main)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Journalctl Terminal */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace' }}>
              <Terminal size={14} /> journalctl -u {config.unitName} -f
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Live Systemd Journal</span>
          </div>

          <div style={{ flex: 1, background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '8px', fontFamily: 'Consolas, monospace', fontSize: '0.82rem', lineHeight: '1.5', overflowY: 'auto', maxHeight: '300px' }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{ 
                color: log.includes('FAILURE') || log.includes('Killed') ? 'var(--accent-rose)' : 
                       log.includes('Restarting') || log.includes('leak') ? 'var(--accent-amber)' : 
                       log.includes('Started') ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                marginBottom: '4px' 
              }}>
                {log}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Aktueller RAM-Bedarf: <strong style={{ color: currentMemoryMb > config.memoryMaxMb ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{currentMemoryMb} MB</strong> / Limit: {config.memoryMaxMb} MB
          </div>
        </div>
      </div>

      {/* Generated Unit File Preview */}
      <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="var(--accent-cyan)" /> /etc/systemd/system/{config.unitName}
        </h3>
        <pre style={{ margin: 0, padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--accent-cyan)', fontSize: '0.85rem', lineHeight: '1.5', overflowX: 'auto' }}>
          <code>{unitFileText}</code>
        </pre>
      </div>
    </div>
  );
}
