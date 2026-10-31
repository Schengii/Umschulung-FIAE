import React, { useState } from 'react';
import { RED_BLUE_SCENARIOS } from '../../data/securityTeamData';
import { ShieldAlert, ShieldCheck, Bug } from 'lucide-react';

export default function RedBlueTeamLab() {
  const [selectedId, setSelectedId] = useState(RED_BLUE_SCENARIOS[0].id);

  const activeScenario = RED_BLUE_SCENARIOS.find(s => s.id === selectedId) || RED_BLUE_SCENARIOS[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-rose)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={32} style={{ color: 'var(--accent-rose)' }} /> Cybersecurity Red Team vs. Blue Team Challenge
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Verstehe Hacker-Angriffe (Red Team) und implementiere unknackbare Verteidigungslinien (Blue Team).
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {RED_BLUE_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedId === s.id ? 'var(--accent-rose)' : 'var(--bg-card)',
              color: selectedId === s.id ? '#ffffff' : 'var(--text-main)',
              border: selectedId === s.id ? '2px solid var(--accent-rose)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="grid-responsive" style={{ gap: '20px' }}>
        {/* Red Team Attack */}
        <div className="glass-panel" style={{ padding: '24px', border: '2px solid var(--accent-rose)' }}>
          <span className="badge badge-rose" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Bug size={14} /> Red Team (Attacker)
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
            Hacker Angriff: {activeScenario.title}
          </h3>
          <div className="code-window">
            <pre className="code-body">
              <code>{activeScenario.redAttack}</code>
            </pre>
          </div>
        </div>

        {/* Blue Team Defense */}
        <div className="glass-panel" style={{ padding: '24px', border: '2px solid var(--accent-emerald)' }}>
          <span className="badge badge-emerald" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Blue Team (Defender)
          </span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
            Verteidigung & Hardening
          </h3>
          <div className="code-window">
            <pre className="code-body">
              <code>{activeScenario.blueDefense}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
