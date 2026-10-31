import React, { useState } from 'react';

import { Terminal, CheckCircle2, Lock } from 'lucide-react';
import { LINUX_PERMISSION_MODES } from '../../data/expertLabsData';
import { useStore } from '../../store/useStore';

export default function LinuxPermissionsLab() {
  const { awardXP } = useStore();
  const [owner, setOwner] = useState({ r: true, w: true, x: true }); // 7
  const [group, setGroup] = useState({ r: true, w: false, x: true }); // 5
  const [others, setOthers] = useState({ r: true, w: false, x: true }); // 5
  const [isSuid, setIsSuid] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const calcDigit = (perms) => (perms.r ? 4 : 0) + (perms.w ? 2 : 0) + (perms.x ? 1 : 0);
  const octalString = `${isSuid ? '4' : ''}${calcDigit(owner)}${calcDigit(group)}${calcDigit(others)}`;

  const symbolicString = `${isSuid ? (owner.x ? 'rws' : 'rwS') : `${owner.r ? 'r' : '-'}${owner.w ? 'w' : '-'}${owner.x ? 'x' : '-'}`}${group.r ? 'r' : '-'}${group.w ? 'w' : '-'}${group.x ? 'x' : '-'}${others.r ? 'r' : '-'}${others.w ? 'w' : '-'}${others.x ? 'x' : '-'}`;

  const handleApply = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      awardXP(70, 'Linux Master: chmod & Inode Permissions');
    }
  };

  const handlePreset = (mode) => {
    setOwner({ r: mode.owner.read, w: mode.owner.write, x: mode.owner.execute });
    setGroup({ r: mode.group.read, w: mode.group.write, x: mode.group.execute });
    setOthers({ r: mode.others.read, w: mode.others.write, x: mode.others.execute });
    setIsSuid(!!mode.special);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(234, 179, 8, 0.15)', borderRadius: '20px', color: 'var(--accent-amber)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Terminal size={16} /> Linux Dateisystem & Zugriffsrechte Rechner
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Linux Permissions, Inodes & chmod Rechner
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Berechne Dateirechte in Oktal- und Symbolischer Notation, verstehe SUID/SGID/Sticky-Bits und Inode-Strukturen.
          </p>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {LINUX_PERMISSION_MODES.map(m => (
            <button
              key={m.octal}
              onClick={() => handlePreset(m)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'var(--card-bg, #1e293b)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              chmod {m.octal}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Checkboxes & Terminal Output */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Permission Checkbox Matrix */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, var(--border-color))', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={17} color="#facc15" /> Berechtigungs-Matrix (r=4, w=2, x=1)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            {/* Owner */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-cyan)', fontSize: '0.88rem', marginBottom: '8px' }}>Eigentümer (User)</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                <input type="checkbox" checked={owner.r} onChange={e => setOwner({ ...owner, r: e.target.checked })} /> Read (r) [4]
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                <input type="checkbox" checked={owner.w} onChange={e => setOwner({ ...owner, w: e.target.checked })} /> Write (w) [2]
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                <input type="checkbox" checked={owner.x} onChange={e => setOwner({ ...owner, x: e.target.checked })} /> Execute (x) [1]
              </label>
            </div>

            {/* Group */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-purple)', fontSize: '0.88rem', marginBottom: '8px' }}>Gruppe (Group)</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                <input type="checkbox" checked={group.r} onChange={e => setGroup({ ...group, r: e.target.checked })} /> Read (r) [4]
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                <input type="checkbox" checked={group.w} onChange={e => setGroup({ ...group, w: e.target.checked })} /> Write (w) [2]
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                <input type="checkbox" checked={group.x} onChange={e => setGroup({ ...group, x: e.target.checked })} /> Execute (x) [1]
              </label>
            </div>

            {/* Others */}
            <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-rose)', fontSize: '0.88rem', marginBottom: '8px' }}>Andere (Others)</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                <input type="checkbox" checked={others.r} onChange={e => setOthers({ ...others, r: e.target.checked })} /> Read (r) [4]
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                <input type="checkbox" checked={others.w} onChange={e => setOthers({ ...others, w: e.target.checked })} /> Write (w) [2]
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                <input type="checkbox" checked={others.x} onChange={e => setOthers({ ...others, x: e.target.checked })} /> Execute (x) [1]
              </label>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--accent-amber)', background: 'rgba(251, 191, 36, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>
            <input type="checkbox" checked={isSuid} onChange={e => setIsSuid(e.target.checked)} />
            <span>Special Bit aktivieren: SUID (Set User ID: 4000)</span>
          </label>
        </div>

        {/* Right: Terminal Command Output & Inode Stats */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontFamily: 'monospace' }}>Linux Shell (Bash)</span>
              <span style={{ fontSize: '0.78rem', background: 'var(--accent-amber)', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                OKTAL: {octalString}
              </span>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '8px', fontFamily: 'Fira Code, monospace', fontSize: '0.9rem', marginBottom: '16px' }}>
              <div style={{ color: 'var(--text-dim)' }}>$ chmod {octalString} server_deploy.sh</div>
              <div style={{ color: 'var(--text-dim)' }}>$ ls -l server_deploy.sh</div>
              <div style={{ color: 'var(--accent-emerald)', marginTop: '6px' }}>
                -{symbolicString} 1 devops staff 4096 Aug 15 12:00 server_deploy.sh
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '6px' }}>
                📌 <strong>Inode #1489201:</strong> 12 Direct Data Blocks, 1 Hardlink, UID: 1000 (devops), GID: 1000
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '6px' }}>
                💡 <strong>Hardlink vs. Softlink:</strong> Ein Hardlink zeigt direkt auf die selbe Inode-Nummer; ein Softlink (`ln -s`) ist eine eigene Inode mit Pfadverweis.
              </div>
            </div>
          </div>

          <button
            onClick={handleApply}
            style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: '8px',
              background: isCompleted ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              color: isCompleted ? 'var(--text-main)' : '#000',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isCompleted ? <CheckCircle2 size={16} /> : <Terminal size={16} />}
            {isCompleted ? 'Berechtigungen angewendet (+70 XP)' : 'Rechte im System anwenden'}
          </button>
        </div>

      </div>
    </div>
  );
}
