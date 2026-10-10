import React, { useState } from 'react';
import {
  Terminal,
  ShieldAlert,
  FileCode,
  Award,
  Activity,
  Filter
} from 'lucide-react';
import {
  STANDARD_AUDITD_RULES,
  SAMPLE_SYSCALL_LOGS,
  matchEventToRules,
  filterSecurityEvents
} from '../../utils/linuxAuditdEbpfEngine';
import { useStore } from '../../store/useStore';

export default function LinuxAuditdEbpfLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [completed, setCompleted] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedEventId, setSelectedEventId] = useState(SAMPLE_SYSCALL_LOGS[0].id);

  const filteredLogs = filterSecurityEvents(SAMPLE_SYSCALL_LOGS, severityFilter);
  const selectedEvent = SAMPLE_SYSCALL_LOGS.find(e => e.id === selectedEventId) || SAMPLE_SYSCALL_LOGS[0];
  const matchedRules = matchEventToRules(selectedEvent, STANDARD_AUDITD_RULES);

  const handleClaimXP = () => {
    if (!completed) {
      setCompleted(true);
      if (onRewardXP) onRewardXP(65);
      else awardXP(65, 'linux_auditd_ebpf_master');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px', border: '2px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={14} /> Linux Kernel Security
              </span>
              <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Terminal size={14} /> Auditd &amp; eBPF Tracepoints
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={28} style={{ color: 'var(--accent-rose)' }} />
              Linux Auditd &amp; eBPF Syscall Tracepoint Security Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '820px' }}>
              Kernel-Level Auditing: Überwachung sensitiver Systemaufrufe (<code>execve</code>, <code>connect</code>, <code>openat</code>, <code>setuid</code>), 
              Erkennung von RCE-Shell-Spawns, Privilege Escalation und automatische Regelauswertung nach BSI- und IHK-Sicherheitsstandards.
            </p>
          </div>

          <div>
            <button
              onClick={handleClaimXP}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: 'bold' }}
            >
              <Award size={18} /> {completed ? 'XP bereits erhalten' : 'Audit-Analyse Bestätigen (+65 XP)'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Events Table & Rule Inspector */}
      <div className="grid-responsive" style={{ gap: '20px', marginBottom: '24px' }}>
        {/* Left: Syscall Audit Event Stream */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={18} style={{ color: 'var(--accent-rose)' }} /> Kernel Syscall Event Log
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="input-select"
                style={{ padding: '4px 8px', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                <option value="ALL">Alle Events</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="MEDIUM">Medium Only</option>
                <option value="LOW">Low Only</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredLogs.map(ev => (
              <div
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: ev.id === selectedEventId ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-secondary)',
                  border: `1px solid ${ev.id === selectedEventId ? 'var(--accent-rose)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    [{ev.syscall}] PID {ev.pid} ({ev.comm})
                  </span>
                  <span className={`badge ${ev.severity === 'CRITICAL' ? 'badge-rose' : ev.severity === 'MEDIUM' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.68rem' }}>
                    {ev.severity}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  target: {ev.target}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Event Analysis & Matched Rules */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--accent-amber)' }} /> Bedrohungsanalyse &amp; Auditd Regel-Treffer
          </h2>

          <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Erkannte Bedrohung:</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: selectedEvent.severity === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)', marginBottom: '10px' }}>
              {selectedEvent.threatDescription}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
              <strong>Status:</strong> <span className="badge badge-neutral">{selectedEvent.status}</span> &nbsp;|&nbsp; <strong>User:</strong> {selectedEvent.user}
            </div>
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px' }}>Ausgelöste Auditd Regeln:</h3>
          {matchedRules.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {matchedRules.map(r => (
                <div key={r.id} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-rose)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Key: -k {r.key}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', fontFamily: 'monospace', marginBottom: '4px' }}>
                    {r.syntax}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {r.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Keine spezifische Auditd-Filterregel für dieses Event konfiguriert.
            </div>
          )}
        </div>
      </div>

      {/* Production Auditd Rules List */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCode size={18} style={{ color: 'var(--accent-teal)' }} /> Standard /etc/audit/rules.d/audit.rules Hardening Template
        </h2>

        <div className="code-window">
          <pre className="code-body" style={{ maxHeight: '180px', overflowY: 'auto', fontSize: '0.8rem' }}>
            <code>
{`# Kernel Audit Rules nach BSI IT-Grundschutz & CIS Benchmark
${STANDARD_AUDITD_RULES.map(r => `${r.syntax}  # ${r.description}`).join('\n')}
`}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
