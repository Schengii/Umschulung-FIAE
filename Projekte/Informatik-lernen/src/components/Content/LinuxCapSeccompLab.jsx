import React, { useState } from 'react';
import { 
  ShieldCheck, Award, Check, Terminal, 
  Cpu, Lock, Play
} from 'lucide-react';
import { 
  DEFAULT_CAPABILITIES, 
  DEFAULT_SECCOMP_RULES, 
  executeSyscallSandbox 
} from '../../utils/linuxCapSeccompEngine';
import { useStore } from '../../store/useStore';

export default function LinuxCapSeccompLab() {
  const { awardXP } = useStore();
  const [caps, setCaps] = useState(DEFAULT_CAPABILITIES);
  const [seccompRules] = useState(DEFAULT_SECCOMP_RULES);
  const [selectedSyscall, setSelectedSyscall] = useState('bind');
  const [bindPort, setBindPort] = useState(80);
  const [execLog, setExecLog] = useState([]);
  const [xpAwarded, setXpAwarded] = useState(false);

  const toggleCap = (capName) => {
    setCaps((prev) => ({
      ...prev,
      [capName]: {
        ...prev[capName],
        active: !prev[capName].active
      }
    }));
  };

  const handleExecute = () => {
    const res = executeSyscallSandbox(selectedSyscall, bindPort, caps, seccompRules);
    setExecLog((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        syscall: selectedSyscall,
        targetPort: selectedSyscall === 'bind' ? bindPort : null,
        ...res
      },
      ...prev.slice(0, 7)
    ]);

    if (!xpAwarded) {
      setXpAwarded(true);
      awardXP(65, 'linux_cap_seccomp_master');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
          }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
              Linux Capabilities & Seccomp BPF Sandbox
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              POSIX Capabilities (Least Privilege) vs. Root (`UID 0`) und Syscall-Filtering im Kernel
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {xpAwarded ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(16, 185, 129, 0.2)', 
              color: '#10b981', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Check size={16} /> 65 XP erhalten!
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#10b981', 
              padding: '6px 14px', 
              borderRadius: '20px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Award size={16} /> 65 XP verfügbar
            </div>
          )}
        </div>
      </div>

      {/* Grid: Capabilities & Seccomp Config */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Capabilities Panel */}
        <div style={{
          background: 'var(--surface-card, #1e293b)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="#10b981" /> Aktive Linux Capabilities (Rechte-Tokens)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.values(caps).map((c) => (
              <div 
                key={c.name}
                onClick={() => toggleCap(c.name)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: c.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                  border: c.active ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: c.active ? '#10b981' : '#ffffff' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {c.description}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  background: c.active ? 'rgba(16, 185, 129, 0.25)' : 'rgba(148, 163, 184, 0.2)',
                  color: c.active ? '#10b981' : '#94a3b8'
                }}>
                  {c.active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Syscall Trigger & Seccomp Rules */}
        <div style={{
          background: 'var(--surface-card, #1e293b)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#3b82f6" /> Syscall Execution Trigger
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Systemaufruf (Syscall):
              </label>
              <select
                value={selectedSyscall}
                onChange={(e) => setSelectedSyscall(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="bind">bind() - Netzwerkport binden</option>
                <option value="execve">execve() - Neues Programm starten</option>
                <option value="mount">mount() - Dateisystem einhängen</option>
                <option value="socket_raw">socket_raw() - ICMP / Raw Socket</option>
                <option value="chown">chown() - Dateibesitzer ändern</option>
                <option value="ptrace">ptrace() - Prozess debuggen</option>
                <option value="read">read() - Daten lesen</option>
              </select>
            </div>

            {selectedSyscall === 'bind' && (
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Ziel-Port (Privilegiert falls &lt; 1024):
                </label>
                <input 
                  type="number"
                  value={bindPort}
                  onChange={(e) => setBindPort(parseInt(e.target.value, 10) || 80)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            )}

            <button
              onClick={handleExecute}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#10b981',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <Play size={16} /> Syscall ausführen
            </button>
          </div>

          <h3 style={{ fontSize: '0.9rem', margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Aktive Seccomp BPF Filterregeln:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
            {seccompRules.map((r) => (
              <div key={r.syscall} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                <code>{r.syscall}()</code>
                <span style={{ color: r.action === 'SECCOMP_RET_KILL_PROCESS' ? '#ef4444' : r.action === 'SECCOMP_RET_ERRNO' ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                  {r.action}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Terminal Output Log */}
      <div style={{
        background: 'var(--surface-card, #1e293b)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="#10b981" /> Kernel Syscall-Audit & Dmesg Log
        </h3>
        {execLog.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Noch keine Aufrufe protokolliert. Wähle einen Syscall und klicke auf "Syscall ausführen".
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {execLog.map((log) => (
              <div key={log.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.82rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>[{log.timestamp}]</span>
                <span style={{ fontWeight: 600, color: '#3b82f6' }}>{log.syscall}(){log.targetPort ? ` -> Port ${log.targetPort}` : ''}</span>
                <span style={{
                  fontWeight: 600,
                  color: log.status === 'SUCCESS' ? '#10b981' : log.status === 'KILLED' ? '#ef4444' : '#f59e0b'
                }}>
                  {log.status}
                </span>
                <span style={{ color: 'var(--text-muted)', flex: 1, marginLeft: '12px' }}>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
