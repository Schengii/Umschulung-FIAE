import React, { useState, useMemo } from 'react';

import { Cloud, ShieldAlert, Sparkles, Trash2, CheckCircle2, Layers } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { INITIAL_CLOUD_TOPOLOGY, calculateSystemSla, auditSpofRisks } from '../../utils/cloudArchitectureEngine';

export default function CloudArchitectureCanvasLab() {
  const { awardXP } = useStore();
  const [nodes, setNodes] = useState(INITIAL_CLOUD_TOPOLOGY);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Compute SLA & Cost
  const slaMetrics = useMemo(() => {
    return calculateSystemSla(nodes);
  }, [nodes]);

  // Compute SPOF Risks
  const spofWarnings = useMemo(() => {
    return auditSpofRisks(nodes);
  }, [nodes]);

  const handleToggleRedundancy = (id) => {
    setNodes(nodes.map(n => {
      if (n.id === id) {
        const nextRedundant = !n.isRedundant;
        return {
          ...n,
          isRedundant: nextRedundant,
          sla: nextRedundant ? 0.9999 : 0.9990,
          cost: nextRedundant ? n.cost * 1.8 : Math.round(n.cost / 1.8)
        };
      }
      return n;
    }));
    if (!xpClaimed) {
      setXpClaimed(true);
      awardXP(15, 'cloud_arch_modified');
    }
  };

  const handleRemoveNode = (id) => {
    if (nodes.length <= 1) return;
    setNodes(nodes.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Cloud size={14} /> Cloud &amp; DevOps</span>
              <span className="badge badge-teal"><Sparkles size={14} /> High Availability &amp; SPOF Studio</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Cloud Architecture, SLA &amp; SPOF Canvas
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Gestalte resiliente Multi-Tier Cloud-Topologien, berechne die kumulierte SLA-Verfügbarkeit (A_ges) mit jährlicher Ausfallzeit und identifiziere Single Points of Failure.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>System SLA Verfügbarkeit</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '6px' }}>
            {slaMetrics.slaPercent}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Erwartete Ausfallzeit / Jahr</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '6px' }}>
            {slaMetrics.annualDowntimeText}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Monatliche Infrastruktur-Kosten</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-teal)', marginTop: '6px' }}>
            ~${slaMetrics.totalBaseCostMonthly} / Mo
          </div>
        </div>
      </div>

      {/* SPOF Linter Warning Banner */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="var(--accent-amber)" /> Single Point of Failure (SPOF) Audit
        </h2>

        {spofWarnings.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontSize: '0.92rem' }}>
            <CheckCircle2 size={16} /> Exzellent! Keine Single Points of Failure in der aktuellen Topologie gefunden.
          </div>
        ) : (
          <div className="space-y-2">
            {spofWarnings.map((w, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${w.severity === 'CRITICAL' ? 'var(--accent-rose)' : w.severity === 'HIGH' ? 'var(--accent-amber)' : 'var(--accent-cyan)'}`
                }}
              >
                <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.92rem' }}>{w.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{w.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Architecture Node Cards */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--accent-indigo)" /> Konfigurierte Topologie-Knoten (Tiers 1 - 4)
        </h2>

        <div className="space-y-3">
          {nodes.map(node => (
            <div
              key={node.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.78rem' }}>Tier {node.tier}</span>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{node.name}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Einzel-SLA: {(node.sla * 100).toFixed(2)}% | Typ: {node.type}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => handleToggleRedundancy(node.id)}
                  className={`btn ${node.isRedundant ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  {node.isRedundant ? '✓ Redundant / Multi-AZ' : '⚠ Single Node (Kein Failover)'}
                </button>

                <span style={{ fontWeight: '800', color: 'var(--accent-teal)', fontSize: '0.92rem', minWidth: '70px', textAlign: 'right' }}>
                  ${node.cost}/mo
                </span>

                <button
                  onClick={() => handleRemoveNode(node.id)}
                  className="btn btn-ghost"
                  style={{ padding: '4px', color: 'var(--accent-rose)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
