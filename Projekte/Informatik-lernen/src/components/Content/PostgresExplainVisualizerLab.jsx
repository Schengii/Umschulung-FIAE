import React, { useState } from 'react';

import { Database, Layers, ChevronRight } from 'lucide-react';
import { POSTGRES_EXPLAIN_PLANS } from '../../data/advancedLabsData';
import { useStore } from '../../store/useStore';
import { onActivationKey } from '../Shared/keyActivation';

export default function PostgresExplainVisualizerLab() {
  const { awardXP } = useStore();
  const [selectedNode, setSelectedNode] = useState(null);
  const [isExplored, setIsExplored] = useState(false);

  const plan = POSTGRES_EXPLAIN_PLANS[0];

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    if (!isExplored) {
      setIsExplored(true);
      awardXP(70, 'DB Architect: PostgreSQL Query Tree Visualizer');
    }
  };

  const renderTreeNode = (node, depth = 0) => {
    const isSelected = selectedNode?.nodeType === node.nodeType;
    const isHeavy = node.nodeType.includes('Hash Join') || node.nodeType.includes('Bitmap Heap Scan');

    return (
      <div key={node.nodeType} style={{ marginLeft: depth ? `min(${depth * 20}px, ${depth * 3}vw)` : 0, marginTop: '8px' }}>
        <div role="button" tabIndex={0} onKeyDown={onActivationKey(() => handleSelectNode(node))}
          onClick={() => handleSelectNode(node)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: isSelected ? 'rgba(99, 102, 241, 0.25)' : isHeavy ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.04)',
            border: isSelected ? '1px solid #6366f1' : isHeavy ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <ChevronRight size={15} color={isHeavy ? '#f87171' : '#818cf8'} />
            <span style={{ fontWeight: 'bold', fontSize: '0.88rem', color: isHeavy ? 'var(--accent-rose)' : 'var(--text-main)', overflowWrap: 'anywhere' }}>
              {node.nodeType}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--accent-amber)', fontFamily: 'monospace' }}>Kosten: {node.cost}</span>
            <span style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>Rows: {node.actualRows}</span>
          </div>
        </div>

        {node.children && node.children.map(child => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '20px', color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Database size={16} /> PostgreSQL EXPLAIN ANALYZE Execution Tree
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Postgres Query Tree & Cost Visualizer
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Analysiere den Ausführungsplan deiner Abfragen: Identifiziere teure Joins, Bitmap Heap Scans und Optimierungspotenziale.
          </p>
        </div>

        {/* Query Stats */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color, var(--border-color))' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Gesamtlaufzeit:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-emerald)' }}>{plan.totalTimeMs} ms</div>
          </div>
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color, var(--border-color))' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Gesamtkosten:</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-amber)' }}>{plan.totalCost}</div>
          </div>
        </div>
      </div>

      {/* SQL Query Box */}
      <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '16px', marginBottom: '24px' }}>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold' }}>
          Ausgeführte SQL-Abfrage mit EXPLAIN ANALYZE:
        </div>
        <pre style={{ margin: 0, color: 'var(--accent-cyan)', fontFamily: 'Fira Code, monospace', fontSize: '0.88rem', lineHeight: '1.5', overflowX: 'auto' }}>
          {plan.query}
        </pre>
      </div>

      {/* Execution Tree & Node Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Interactive Tree */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, var(--border-color))', padding: '20px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={17} color="#818cf8" /> Hierarchischer Plan-Baum (Klicke Knoten für Details)
          </div>
          {renderTreeNode(plan.planTree)}
        </div>

        {/* Right: Node Details Inspector */}
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {selectedNode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                  Node Inspector
                </span>
                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.82rem', fontWeight: 'bold' }}>
                  Zeit: {selectedNode.actualTime} ms
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0 0 16px 0' }}>
                {selectedNode.nodeType}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Estimated Cost:</span>
                  <strong style={{ color: 'var(--accent-amber)', fontFamily: 'monospace' }}>{selectedNode.cost}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Actual Rows:</span>
                  <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{selectedNode.actualRows}</strong>
                </div>
                {selectedNode.sortMethod && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Sort Method:</span>
                    <strong style={{ color: 'var(--accent-purple)' }}>{selectedNode.sortMethod}</strong>
                  </div>
                )}
                {selectedNode.indexName && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Index Name:</span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>{selectedNode.indexName}</strong>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              Wähle einen Knoten im linken Baum aus, um Ausführungskosten und Buffer-Hits zu untersuchen.
            </div>
          )}

          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
            💡 <strong>Performance Tipp:</strong> Bei `Bitmap Heap Scan` werden Datenblöcke vorsortiert von der Festplatte gelesen, um Random I/O zu minimieren. Ein zusammengesetzter Index (`created_at, country`) könnte diesen Scan noch weiter beschleunigen.
          </div>
        </div>

      </div>
    </div>
  );
}
