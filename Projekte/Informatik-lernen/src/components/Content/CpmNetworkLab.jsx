import React, { useState, useMemo } from 'react';
import { 
  GitCommit, Award, Copy, Plus, Trash2 
} from 'lucide-react';
import { 
  calculateCpmNetwork, 
  DEFAULT_CPM_PROJECT, 
  IHK_CPM_TEMPLATES 
} from '../../utils/cpmEngine';
import { useStore } from '../../store/useStore';

export default function CpmNetworkLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [nodes, setNodes] = useState(DEFAULT_CPM_PROJECT);
  const [activeTemplate, setActiveTemplate] = useState('custom');
  const [copied, setCopied] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Neuer Task State
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState(3);
  const [newPreds, setNewPreds] = useState('');

  const cpmData = useMemo(() => {
    return calculateCpmNetwork(nodes);
  }, [nodes]);

  const handleClaimXP = () => {
    if (!xpClaimed) {
      if (onRewardXP) onRewardXP(50);
      else awardXP(50, 'cpm_master');
      setXpClaimed(true);
    }
  };

  const handleLoadTemplate = (key) => {
    if (IHK_CPM_TEMPLATES[key]) {
      setNodes(IHK_CPM_TEMPLATES[key].nodes);
      setActiveTemplate(key);
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newId.trim() || !newName.trim()) return;

    const preds = newPreds
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    setNodes(prev => [
      ...prev,
      {
        id: newId.trim().toUpperCase(),
        name: newName.trim(),
        duration: Math.max(1, Number(newDuration) || 1),
        predecessors: preds
      }
    ]);

    setNewId('');
    setNewName('');
    setNewDuration(3);
    setNewPreds('');
  };

  const handleDeleteTask = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const handleCopySummary = () => {
    const summary = [
      `=== IHK NETZPLAN ANALYSE (DIN 69900) ===`,
      `Projektdauer: ${cpmData.projectDuration} Zeiteinheiten`,
      `Kritischer Pfad: ${cpmData.criticalPath.join(' -> ')}`,
      `Anzahl Vorgänge: ${cpmData.nodes.length}`,
      ``,
      `Vorgangsübersicht:`,
      ...cpmData.nodes.map(n => 
        `[${n.id}] ${n.name} | Dauer: ${n.duration} | FAZ: ${n.faz} | FEZ: ${n.fez} | SAZ: ${n.saz} | SEZ: ${n.sez} | GP: ${n.gp} | FP: ${n.fp} | ${n.isCritical ? 'KRITISCH' : 'Puffer'}`
      )
    ].join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                <GitCommit size={14} /> IHK Projektmanagement (DIN 69900)
              </span>
              <span className="badge badge-teal">AP1 &amp; AP2 Standard</span>
              <span className="badge badge-green">Vorgangsknotennetzplan</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              IHK Netzplan Studio (CPM / Critical Path Method)
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Berechne Vorwärts- &amp; Rückwärtsrechnung, ermittle Frühest-/Spätest-Zeitpunkte (FAZ, FEZ, SAZ, SEZ), Gesamt- und Freie Puffer (GP, FP) sowie den kritischen Pfad für fehlerfreie IHK-Prüfungsaufgaben.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handleCopySummary}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Copy size={16} />
              {copied ? 'Kopiert!' : 'Ergebnis kopieren'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleClaimXP}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Award size={18} />
              {xpClaimed ? 'XP erhalten!' : 'Netzplan-Meister (+50 XP)'}
            </button>
          </div>
        </div>

        {/* Templates Bar */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Prüfungsszenarien:</span>
          <button
            className={`btn ${activeTemplate === 'software_project' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => handleLoadTemplate('software_project')}
          >
            💻 FIAE: Software-Projekt (80h)
          </button>
          <button
            className={`btn ${activeTemplate === 'datacenter_migration' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => handleLoadTemplate('datacenter_migration')}
          >
            🏢 FISI: RZ-Migration (40h)
          </button>
          <button
            className={`btn ${activeTemplate === 'custom' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => { setNodes(DEFAULT_CPM_PROJECT); setActiveTemplate('custom'); }}
          >
            🔄 Standard-Netzplan
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>Projektdauer (Gesamt)</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', margin: '4px 0' }}>
            {cpmData.projectDuration} Tage / h
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entspricht dem FEZ des Projektendes</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>Kritischer Pfad</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-rose)', margin: '8px 0', wordBreak: 'break-all' }}>
            {cpmData.criticalPath.join(' ➔ ') || 'Kein Pfad'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vorgänge mit Gesamtpuffer GP = 0</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status &amp; Topologie</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: cpmData.hasCycle ? 'var(--accent-rose)' : 'var(--accent-emerald)', margin: '8px 0' }}>
            {cpmData.hasCycle ? '⚠️ Zyklus erkannt!' : '✓ Zyklenfrei (DAG)'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cpmData.totalNodes} Vorgänge im Netzwerk</div>
        </div>
      </div>

      {/* Interactive CPM Node Grid (DIN 69900 6-Field Nodes) */}
      <div 
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCommit size={20} color="var(--accent-primary)" />
          Vorgangsknoten nach DIN 69900 (Metra-Potenzial-Methode)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
          {cpmData.nodes.map((node) => (
            <div
              key={node.id}
              style={{
                borderRadius: 'var(--radius-md)',
                background: node.isCritical ? 'rgba(244, 63, 94, 0.08)' : 'var(--bg-tertiary)',
                border: node.isCritical ? '2px solid var(--accent-rose)' : '1px solid var(--border-color)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: node.isCritical ? '0 0 16px rgba(244, 63, 94, 0.2)' : 'none',
                position: 'relative'
              }}
            >
              {/* Node Header Row: FAZ | Dauer | FEZ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)', padding: '6px 0', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>FAZ</div>
                  <div style={{ fontWeight: 900, color: 'var(--accent-primary)' }}>{node.faz}</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>D (Dauer)</div>
                  <div style={{ fontWeight: 900, color: 'var(--accent-amber)' }}>{node.duration}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>FEZ</div>
                  <div style={{ fontWeight: 900, color: 'var(--accent-teal)' }}>{node.fez}</div>
                </div>
              </div>

              {/* Node Center: ID & Name */}
              <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.1rem', color: node.isCritical ? 'var(--accent-rose)' : 'var(--accent-primary)' }}>
                    [{node.id}]
                  </span>
                  {node.isCritical && (
                    <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>Kritisch</span>
                  )}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.4' }}>
                  {node.name}
                </div>
                {node.predecessors.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Vorgänger: {node.predecessors.join(', ')}
                  </div>
                )}
              </div>

              {/* Node Footer Row: SAZ | GP / FP | SEZ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)', padding: '6px 0', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>SAZ</div>
                  <div style={{ fontWeight: 900, color: 'var(--accent-purple)' }}>{node.saz}</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>GP / FP</div>
                  <div style={{ fontWeight: 900, color: node.gp === 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    {node.gp} / {node.fp}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>SEZ</div>
                  <div style={{ fontWeight: 900, color: 'var(--accent-indigo)' }}>{node.sez}</div>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDeleteTask(node.id)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Vorgang löschen"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Task Creator Form */}
      <div 
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} color="var(--accent-teal)" />
          Neuen Vorgang hinzufügen
        </h2>

        <form onSubmit={handleAddTask} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Vorgangs-ID (z. B. H)</label>
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="H"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Bezeichnung / Tätigkeit</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Sicherheitsaudit & Pen-Testing"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Dauer (Zeiteinheiten)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Vorgänger (z. B. F, G)</label>
            <input
              type="text"
              value={newPreds}
              onChange={(e) => setNewPreds(e.target.value)}
              placeholder="F"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '40px' }}
          >
            <Plus size={16} /> Hinzufügen
          </button>
        </form>
      </div>
    </div>
  );
}
