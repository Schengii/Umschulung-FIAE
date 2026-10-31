import React, { useState, useMemo } from 'react';
import { 
  Layers, CheckCircle2, XCircle, 
  ArrowRight, Award, Plus, Trash2, Check, RefreshCw 
} from 'lucide-react';
import { 
  ARCH_LAYERS, 
  DEFAULT_COMPONENTS, 
  validateDependency, 
  auditArchitecture 
} from '../../utils/cleanArchEngine';
import { useStore } from '../../store/useStore';

export default function CleanArchLab() {
  const { awardXP } = useStore();
  const [connections, setConnections] = useState([
    { fromId: 'comp-adapter-rest', toId: 'comp-usecase-create-order' },
    { fromId: 'comp-usecase-create-order', toId: 'comp-entity-order' },
    { id: 'bad-1', fromId: 'comp-entity-order', toId: 'comp-driver-pg' } // Fehler zum Demonstrieren
  ]);

  const [fromSelect, setFromSelect] = useState('comp-usecase-create-order');
  const [toSelect, setToSelect] = useState('comp-port-repo');
  const [xpClaimed, setXpClaimed] = useState(false);

  const audit = useMemo(() => {
    return auditArchitecture(connections, DEFAULT_COMPONENTS);
  }, [connections]);

  const handleAddConnection = () => {
    if (fromSelect === toSelect) return;
    if (connections.some(c => c.fromId === fromSelect && c.toId === toSelect)) return;

    setConnections(prev => [...prev, { fromId: fromSelect, toId: toSelect }]);
  };

  const handleRemoveConnection = (idx) => {
    setConnections(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFixArchitecture = () => {
    // Entferne die verbotene Entity -> DB Verbindung und füge Port/Adapter Muster ein
    setConnections([
      { fromId: 'comp-adapter-rest', toId: 'comp-usecase-create-order' },
      { fromId: 'comp-usecase-create-order', toId: 'comp-entity-order' },
      { fromId: 'comp-usecase-create-order', toId: 'comp-port-repo' },
      { fromId: 'comp-adapter-repo-impl', toId: 'comp-port-repo' },
      { fromId: 'comp-adapter-repo-impl', toId: 'comp-driver-pg' }
    ]);
  };

  const handleClaimXP = () => {
    if (!xpClaimed && awardXP) {
      awardXP(65, 'Clean & Hexagonal Architecture Linter gemeistert!');
      setXpClaimed(true);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-color, #1e293b)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
              <Layers size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Clean Architecture & Hexagonal Ports/Adapters Linter
              </h1>
              <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #64748b)', fontSize: '0.95rem' }}>
                Dependency Inversion Rule nach Robert C. Martin & Alistair Cockburn (IHK FIAE AP1 & AP2)
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--card-bg, #ffffff)', padding: '10px 18px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Architektur-Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: audit.isClean ? '#10b981' : '#ef4444' }}>
              {audit.complianceScore}%
            </div>
          </div>
          <button
            onClick={handleClaimXP}
            disabled={xpClaimed}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: xpClaimed ? '#10b981' : 'linear-gradient(135deg, #06b6d4, #0284c7)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: xpClaimed ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {xpClaimed ? <Check size={16} /> : <Award size={16} />}
            {xpClaimed ? 'XP gutgeschrieben' : '+65 XP beanspruchen'}
          </button>
        </div>
      </div>

      {/* Layer Overview Visualizer */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 12px' }}>
          Konzentrische Schichten & Flussrichtung (Dependency Rule)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {Object.values(ARCH_LAYERS).map(layer => (
            <div key={layer.id} style={{ padding: '14px', borderRadius: '12px', borderLeft: `4px solid ${layer.color}`, background: layer.bg }}>
              <div style={{ fontWeight: 800, color: layer.color, fontSize: '0.9rem' }}>{layer.name}</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #475569)', margin: '6px 0 0' }}>{layer.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dependency Creator Bar */}
      <div style={{ background: 'var(--card-bg, #ffffff)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Abhängigkeit hinzufügen (import / call)
          </h2>
          <button
            onClick={handleFixArchitecture}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#059669',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} /> Saubere Ports/Adapters Architektur laden
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>Quelle (Importeur):</label>
            <select
              value={fromSelect}
              onChange={(e) => setFromSelect(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'var(--input-bg, #fff)' }}
            >
              {DEFAULT_COMPONENTS.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({ARCH_LAYERS[c.layer].name.split(' ')[1]})</option>
              ))}
            </select>
          </div>

          <div style={{ paddingTop: '20px' }}><ArrowRight size={20} color="#64748b" /></div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>Ziel (Importierte Komponente):</label>
            <select
              value={toSelect}
              onChange={(e) => setToSelect(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'var(--input-bg, #fff)' }}
            >
              {DEFAULT_COMPONENTS.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({ARCH_LAYERS[c.layer].name.split(' ')[1]})</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddConnection}
            style={{
              marginTop: '18px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#06b6d4',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> Verbinden
          </button>
        </div>
      </div>

      {/* Audit Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '8px 0' }}>
          Linter-Audit: Aktuelle Modul-Verbindungen ({connections.length})
        </h2>

        {connections.map((conn, idx) => {
          const fromComp = DEFAULT_COMPONENTS.find(c => c.id === conn.fromId);
          const toComp = DEFAULT_COMPONENTS.find(c => c.id === conn.toId);
          if (!fromComp || !toComp) return null;

          const validation = validateDependency(fromComp.layer, toComp.layer);

          return (
            <div
              key={idx}
              style={{
                background: 'var(--card-bg, #ffffff)',
                padding: '16px 20px',
                borderRadius: '14px',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderLeft: validation.isValid ? '6px solid #10b981' : '6px solid #ef4444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, color: ARCH_LAYERS[fromComp.layer].color }}>{fromComp.name}</span>
                  <ArrowRight size={14} color="#64748b" />
                  <span style={{ fontWeight: 800, color: ARCH_LAYERS[toComp.layer].color }}>{toComp.name}</span>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: validation.isValid ? '#dcfce7' : '#fee2e2',
                    color: validation.isValid ? '#15803d' : '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {validation.isValid ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {validation.isValid ? 'Konform' : 'Architektur-Verstoß'}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: validation.isValid ? '#64748b' : '#dc2626', marginTop: '6px' }}>
                  {validation.reason}
                </div>
              </div>

              <button
                onClick={() => handleRemoveConnection(idx)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
