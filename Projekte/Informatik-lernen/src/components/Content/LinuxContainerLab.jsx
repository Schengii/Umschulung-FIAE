import React, { useState, useMemo } from 'react';
import { Box, Award, Layers } from 'lucide-react';
import { LINUX_NAMESPACES, CgroupsV2Controller } from '../../utils/linuxContainerEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function LinuxContainerLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [selectedNs, setSelectedNs] = useState('PID');
  const [cpuLimit, setCpuLimit] = useState(1.5);
  const [memMax, setMemMax] = useState(512);
  const [activeThreads, setActiveThreads] = useState(2);
  const [usedMem, setUsedMem] = useState(380);
  const [solved, setSolved] = useState(false);

  const controller = useMemo(() => {
    const cg = new CgroupsV2Controller();
    cg.setCpuLimit(cpuLimit);
    cg.setMemoryLimit(memMax);
    return cg;
  }, [cpuLimit, memMax]);

  const processState = useMemo(() => {
    return controller.evaluateProcessState(activeThreads, usedMem);
  }, [controller, activeThreads, usedMem]);

  const activeNsObj = LINUX_NAMESPACES.find(n => n.type === selectedNs) || LINUX_NAMESPACES[0];

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'linux_container_master');
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
              <Box size={14} /> Linux Container Internals
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} /> 6 Namespaces &amp; Cgroups v2 Controllers
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            📦 Linux Namespaces &amp; Cgroups v2 Container Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Verstehe die Kernel-Grundlagen von Docker und containerd: PID-, NET-, MNT-, UTS-, IPC- und USER-Namespaces sowie Cgroups v2 CPU Bandbreiten (`cpu.max`) und OOM-Kill Limits (`memory.max`).
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> Container-Audit Bestätigen (+45 XP)
        </button>
      </div>

      {/* 6 Core Namespaces Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {LINUX_NAMESPACES.map(ns => (
          <button
            key={ns.type}
            onClick={() => { setSelectedNs(ns.type); triggerHaptic('SELECTION'); }}
            className={`btn ${selectedNs === ns.type ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '10px', textAlign: 'center' }}
          >
            <div style={{ fontWeight: 'bold' }}>{ns.type} Namespace</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{ns.syscall}</div>
          </button>
        ))}
      </div>

      {/* Active Namespace Inspector Card */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              {activeNsObj.name} (`{activeNsObj.syscall}`)
            </h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {activeNsObj.description}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '16px' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host OS Sicht (Unshared):</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '2px', fontFamily: 'monospace' }}>
              {activeNsObj.hostPid || activeNsObj.hostInterface || activeNsObj.hostMount || activeNsObj.hostName || (activeNsObj.hostUid !== undefined ? `UID ${activeNsObj.hostUid}` : 'Global IPC')}
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Container Namespace Sicht:</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#10b981', marginTop: '2px', fontFamily: 'monospace' }}>
              {activeNsObj.containerPid ? `PID ${activeNsObj.containerPid} (Init)` : (activeNsObj.containerInterface || activeNsObj.containerMount || activeNsObj.containerName || (activeNsObj.containerUid !== undefined ? `UID ${activeNsObj.containerUid} (root)` : 'Isolated IPC'))}
            </div>
          </div>
        </div>
      </div>

      {/* Cgroups v2 Controller Sliders & OOM Monitor */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: 'var(--accent-primary)', display: 'block', marginBottom: '14px' }}>
          Cgroups v2 Resource-Limits (`/sys/fs/cgroup/container-01/`):
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              CPU Quota Limit (`cpu.max`): {cpuLimit} Cores
            </label>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.5"
              value={cpuLimit}
              onChange={(e) => setCpuLimit(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />

            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>
              Memory Hard Limit (`memory.max`): {memMax} MB
            </label>
            <input
              type="range"
              min="128"
              max="1024"
              step="64"
              value={memMax}
              onChange={(e) => setMemMax(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Aktive Container-Threads: {activeThreads} Threads
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={activeThreads}
              onChange={(e) => setActiveThreads(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />

            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px', marginBottom: '4px' }}>
              Aktueller RAM-Verbrauch: {usedMem} MB
            </label>
            <input
              type="range"
              min="50"
              max="1200"
              step="25"
              value={usedMem}
              onChange={(e) => setUsedMem(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Container Status:</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: processState.oomKilled ? '#ef4444' : (processState.cpuThrottled || processState.memoryThrottled ? '#f59e0b' : '#10b981'), marginTop: '4px' }}>
              {processState.status}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              CPU-Limit: {processState.maxCores} Cores | RAM-Limit: {memMax} MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
