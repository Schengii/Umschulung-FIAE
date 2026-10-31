import React, { useState, useMemo } from 'react';
import { Activity, Award, Terminal } from 'lucide-react';
import { BpftraceSimulator } from '../../utils/bpftraceEngine';
import { useStore } from '../../store/useStore';
import { triggerHaptic } from '../../utils/haptics';

export default function BpftraceLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [selectedScript, setSelectedScript] = useState('vfs_read_hist');
  const [solved, setSolved] = useState(false);

  const sim = useMemo(() => new BpftraceSimulator(), []);
  const traceData = useMemo(() => sim.runScript(selectedScript), [sim, selectedScript]);

  const handleClaim = () => {
    triggerHaptic('LEVEL_UP');
    if (!solved) {
      setSolved(true);
      if (onRewardXP) {
        onRewardXP(45);
      } else {
        awardXP(45, 'bpftrace_master');
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
              <Terminal size={14} /> Linux Dynamic Tracing
            </span>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} /> BPFtrace &amp; Kernel Kprobes
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            🔬 Linux BPFtrace Dynamic Tracing Studio
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px', maxWidth: '750px' }}>
            Analysiere Linux-Kernel-Latenzen, Syscalls und User-Space Funktionsaufrufe mit modernen `kprobe`, `tracepoint` und `uprobe` BPFtrace-Skripten.
          </p>
        </div>

        <button
          onClick={handleClaim}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
        >
          <Award size={16} /> BPFtrace-Lauf Bestätigen (+45 XP)
        </button>
      </div>

      {/* Script Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => { setSelectedScript('vfs_read_hist'); triggerHaptic('SELECTION'); }}
          className={`btn ${selectedScript === 'vfs_read_hist' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>1. VFS Read Latency</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>kprobe:vfs_read &amp; hist()</div>
        </button>

        <button
          onClick={() => { setSelectedScript('openat_syscalls'); triggerHaptic('SELECTION'); }}
          className={`btn ${selectedScript === 'openat_syscalls' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>2. Openat Syscall Snoop</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>tracepoint:syscalls:sys_enter_openat</div>
        </button>

        <button
          onClick={() => { setSelectedScript('bash_readline'); triggerHaptic('SELECTION'); }}
          className={`btn ${selectedScript === 'bash_readline' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '12px', textAlign: 'center' }}
        >
          <div style={{ fontWeight: 'bold' }}>3. Bash Command Snoop</div>
          <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>uprobe:/bin/bash:readline</div>
        </button>
      </div>

      {/* Editor & Trace Terminal Output Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            BPFtrace Programm-Code:
          </span>
          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#38bdf8', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.4', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {traceData.code}
          </pre>
          <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
            Aktive Kernel-Probes: {traceData.probeCount} | Registrierte Events: {traceData.attachedEvents}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
            Live BPFtrace Terminal Trace Output:
          </span>
          <pre style={{ margin: 0, padding: '14px', background: '#090d16', color: '#10b981', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.4', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
            {traceData.output}
          </pre>
        </div>
      </div>
    </div>
  );
}
