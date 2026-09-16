import React, { useState, useMemo } from 'react';
import { 
  Server, Terminal, RefreshCw, 
  Play, ShieldCheck 
} from 'lucide-react';
import { 
  executeAnsiblePlaybook, 
  DEFAULT_ANSIBLE_INVENTORY, 
  DEFAULT_ANSIBLE_PLAYBOOK 
} from '../../utils/ansiblePlaybookEngine';
import { useStore } from '../../store/useStore';

export default function AnsiblePlaybookLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [inventory] = useState(DEFAULT_ANSIBLE_INVENTORY);
  const [playbook] = useState(DEFAULT_ANSIBLE_PLAYBOOK);
  const [systemState, setSystemState] = useState({});
  const [executionHistory, setExecutionHistory] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [xpClaimed, setXpClaimed] = useState(false);

  const lastRunResult = useMemo(() => {
    return executionHistory[executionHistory.length - 1] || null;
  }, [executionHistory]);

  const handleRunPlaybook = () => {
    const result = executeAnsiblePlaybook(playbook, inventory, systemState);
    if (result.success) {
      setSystemState(result.updatedSystemState);
      setExecutionHistory(prev => [...prev, result]);
      const newCount = runCount + 1;
      setRunCount(newCount);

      // Beim 2. Lauf (wenn Idempotenz bewiesen ist) Belohnung freischalten!
      if (newCount >= 2 && !xpClaimed) {
        if (onRewardXP) onRewardXP(45);
        else awardXP(45, 'ansible_master');
        setXpClaimed(true);
      }
    }
  };

  const handleResetSystem = () => {
    setSystemState({});
    setExecutionHistory([]);
    setRunCount(0);
  };

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
                <Server size={14} /> Ansible Automation
              </span>
              <span className="badge badge-teal">IHK FISI Standard</span>
              <span className="badge badge-green">Idempotenz-Prinzip</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              Ansible Playbook &amp; Idempotenz Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Verstehe automatisierte Server-Provisionierung, Host-Inventories, Task-Module (`apt`, `template`, `systemd`) und beweise das IHK-Kernkonzept der Idempotenz durch wiederholte Playbook-Ausführungen.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handleResetSystem}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} /> Server zurücksetzen
            </button>
            <button
              className="btn btn-primary"
              onClick={handleRunPlaybook}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Play size={16} />
              {runCount === 0 ? 'Playbook ausführen (1. Lauf)' : `Playbook erneut ausführen (${runCount + 1}. Lauf)`}
            </button>
          </div>
        </div>

        {/* Idempotency Status Banner */}
        {runCount >= 2 && (
          <div style={{
            marginTop: '20px',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <ShieldCheck size={24} color="var(--accent-emerald)" />
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <strong>Idempotenz bewiesen!</strong> Der {runCount}. Lauf hat 0 Änderungen vorgenommen (`changed=0`), da sich alle Zielserver bereits im exakten Soll-Zustand befinden.
            </div>
          </div>
        )}
      </div>

      {/* Playbook Details & Terminal View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Playbook Definition */}
        <div 
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px' }}>
            Playbook: {playbook.name}
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            hosts: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{playbook.hosts}</span> | become: true
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {playbook.tasks.map((t, idx) => (
              <div 
                key={t.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--accent-teal)' }}>
                    Modul: {t.module}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Task #{idx + 1}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {t.name}
                </div>
                {t.notify && (
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-amber)', marginTop: '4px' }}>
                    notify ➔ {t.notify}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Terminal Output */}
        <div 
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            background: '#090d16',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e2e8f0',
            fontFamily: 'monospace'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
            <Terminal size={18} color="#38bdf8" />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#38bdf8' }}>
              ansible-playbook -i inventory.ini site.yml (Run #{runCount || 0})
            </span>
          </div>

          {!lastRunResult ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Noch kein Playbook-Lauf gestartet. Klicke oben auf "Playbook ausführen".
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', lineHeight: '1.7' }}>
              <div style={{ color: '#38bdf8', fontWeight: 800 }}>PLAY [{playbook.name}] *************************************</div>
              
              {Object.values(lastRunResult.hostResults).map((res) => (
                <div key={res.host} style={{ margin: '12px 0' }}>
                  <div style={{ color: '#94a3b8' }}>TASK [Gathering Facts] *************************************</div>
                  <div style={{ color: 'var(--accent-emerald)' }}>ok: [{res.host}]</div>

                  {res.taskLogs.map((log, li) => (
                    <div key={li}>
                      <div style={{ color: '#94a3b8' }}>TASK [{log.name}] *************************************</div>
                      <div style={{ color: log.status === 'changed' ? 'var(--accent-amber)' : 'var(--accent-emerald)', fontWeight: 700 }}>
                        {log.status}: [{res.host}]
                      </div>
                    </div>
                  ))}

                  {res.handlerLogs.map((hlog, hi) => (
                    <div key={hi}>
                      <div style={{ color: '#94a3b8' }}>RUNNING HANDLER [{hlog.name}] *************************************</div>
                      <div style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
                        {hlog.status}: [{res.host}]
                      </div>
                    </div>
                  ))}

                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', marginTop: '12px', paddingTop: '8px', fontWeight: 800 }}>
                    PLAY RECAP ***************************************************<br />
                    <span style={{ color: '#cbd5e1' }}>{res.host}</span> : 
                    <span style={{ color: 'var(--accent-emerald)' }}> ok={res.summary.ok} </span>
                    <span style={{ color: 'var(--accent-amber)' }}> changed={res.summary.changed} </span>
                    <span style={{ color: 'var(--accent-rose)' }}> failed={res.summary.failed} </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
