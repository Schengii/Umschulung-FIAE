import React, { useState } from 'react';
import {
  DEFAULT_NETWORK_TOPOLOGY,
  calculateDijkstra,
  calculateSpanningTree
} from '../../utils/routingDijkstraEngine';
import {
  Share2,
  Route,
  ShieldAlert,
  Play,
  Award,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function RoutingDijkstraLab({ onRewardXP }) {
  const [activeTab, setActiveTab] = useState('dijkstra'); // 'dijkstra' | 'stp'
  const [startNode, setStartNode] = useState('R1');
  const [targetNode, setTargetNode] = useState('R6');
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const { nodes, edges } = DEFAULT_NETWORK_TOPOLOGY;

  // Dijkstra Berechnung
  const dijkstraResult = calculateDijkstra(nodes, edges, startNode, targetNode);
  const currentStep = dijkstraResult.steps[Math.min(activeStepIdx, dijkstraResult.steps.length - 1)];

  // STP Berechnung
  const stpResult = calculateSpanningTree(nodes, edges);

  const handleFinish = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      if (onRewardXP) onRewardXP(60);
    }
  };

  return (
    <div className="lab-container animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Route size={14} /> OSPF & STP Simulator
            </span>
            <span className="badge badge-indigo">IEEE 802.1D / RFC 2328</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            Routing-Algorithmen: Dijkstra (SPF) & Spanning Tree Protocol (STP)
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Interaktive Schritt-für-Schritt-Simulation von OSPF Shortest Path First (Dijkstra) und Loop-Prävention durch Spanning Tree Protocol.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleFinish}
          disabled={isCompleted}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={18} />
          {isCompleted ? 'Abgeschlossen (+60 XP)' : 'Labor abschließen (+60 XP)'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'dijkstra' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dijkstra')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Route size={16} /> Dijkstra OSPF Shortest Path First
        </button>
        <button
          className={`btn ${activeTab === 'stp' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('stp')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ShieldAlert size={16} /> Spanning Tree Protocol (STP Loops)
        </button>
      </div>

      {/* SVG Canvas & Topologie */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', position: 'relative' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={18} color="var(--accent-teal)" />
          Netzwerk-Topologie & Live-Zustand
        </h3>

        <svg viewBox="0 0 700 320" style={{ width: '100%', height: 'auto', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Edges */}
          {edges.map(e => {
            const fromNode = nodes.find(n => n.id === e.from);
            const toNode = nodes.find(n => n.id === e.to);
            if (!fromNode || !toNode) return null;

            // Ist diese Kante Teil des Dijkstra-Pfades?
            const isPathEdge =
              activeTab === 'dijkstra' &&
              dijkstraResult.path.includes(e.from) &&
              dijkstraResult.path.includes(e.to) &&
              Math.abs(dijkstraResult.path.indexOf(e.from) - dijkstraResult.path.indexOf(e.to)) === 1;

            // STP Status
            const isBlockedStp = activeTab === 'stp' && stpResult.blockedEdges.includes(e.id);
            const isForwardingStp = activeTab === 'stp' && stpResult.forwardingEdges.includes(e.id);

            let strokeColor = '#475569';
            let strokeWidth = 2;
            let strokeDash = 'none';

            if (isPathEdge) {
              strokeColor = '#10b981';
              strokeWidth = 4;
            } else if (isBlockedStp) {
              strokeColor = '#f43f5e';
              strokeWidth = 3;
              strokeDash = '6,6';
            } else if (isForwardingStp) {
              strokeColor = '#3b82f6';
              strokeWidth = 3;
            }

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            return (
              <g key={e.id}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Cost Badge */}
                <rect
                  x={midX - 16}
                  y={midY - 12}
                  width={32}
                  height={20}
                  rx={4}
                  fill="#1e293b"
                  stroke={strokeColor}
                  strokeWidth={1}
                />
                <text
                  x={midX}
                  y={midY + 2}
                  fill="#f1f5f9"
                  fontSize="10"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontWeight="bold"
                >
                  {e.cost}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(n => {
            const isStart = n.id === startNode;
            const isTarget = n.id === targetNode;
            const isRootBridge = activeTab === 'stp' && stpResult.rootBridgeId === n.id;
            const isVisited = activeTab === 'dijkstra' && currentStep?.visited.includes(n.id);
            const isCurrent = activeTab === 'dijkstra' && currentStep?.current === n.id;

            let fill = '#1e293b';
            let stroke = '#64748b';

            if (isCurrent) {
              fill = '#f59e0b';
              stroke = '#fbbf24';
            } else if (isRootBridge) {
              fill = '#6366f1';
              stroke = '#a5b4fc';
            } else if (isVisited) {
              fill = '#059669';
              stroke = '#34d399';
            } else if (isStart) {
              fill = '#2563eb';
              stroke = '#60a5fa';
            } else if (isTarget) {
              fill = '#9333ea';
              stroke = '#c084fc';
            }

            return (
              <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => setTargetNode(n.id)}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={24}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={3}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={n.x}
                  y={n.y - 2}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {n.id}
                </text>
                <text
                  x={n.x}
                  y={n.y + 11}
                  fill="#94a3b8"
                  fontSize="8"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {activeTab === 'stp' ? `P:${n.priority}` : `SPF: ${dijkstraResult.distances[n.id] ?? '∞'}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Control Panel & Details */}
      {activeTab === 'dijkstra' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={18} color="var(--accent-amber)" /> Dijkstra Schritt-Steuerung
            </h3>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Startknoten:</label>
                <select
                  className="input-select"
                  value={startNode}
                  onChange={(e) => { setStartNode(e.target.value); setActiveStepIdx(0); }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                >
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.label} ({n.id})</option>)}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Zielknoten:</label>
                <select
                  className="input-select"
                  value={targetNode}
                  onChange={(e) => { setTargetNode(e.target.value); setActiveStepIdx(0); }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                >
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.label} ({n.id})</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
              <button
                className="btn btn-secondary"
                disabled={activeStepIdx <= 0}
                onClick={() => setActiveStepIdx(prev => Math.max(0, prev - 1))}
              >
                Zurück
              </button>
              <button
                className="btn btn-primary"
                disabled={activeStepIdx >= dijkstraResult.steps.length - 1}
                onClick={() => setActiveStepIdx(prev => Math.min(dijkstraResult.steps.length - 1, prev + 1))}
              >
                Nächster Schritt ({activeStepIdx + 1}/{dijkstraResult.steps.length})
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveStepIdx(0)}
                title="Zurücksetzen"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', margin: 0 }}>
              {currentStep?.note}
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-teal)" /> Berechneter SPF-Pfad
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {dijkstraResult.path.map((nodeId, idx) => (
                <React.Fragment key={nodeId}>
                  <span className="badge badge-teal" style={{ fontSize: '1rem', padding: '6px 12px' }}>
                    {nodeId}
                  </span>
                  {idx < dijkstraResult.path.length - 1 && <ArrowRight size={16} color="var(--text-muted)" />}
                </React.Fragment>
              ))}
            </div>

            <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Gesamtkosten (OSPF Metric):</strong> <span style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>{dijkstraResult.totalCost}</span></div>
              <div><strong>Besuchte Knoten:</strong> {currentStep?.visited.join(', ') || 'Keine'}</div>
              <div><strong>Unbesuchte Knoten:</strong> {currentStep?.unvisited.join(', ') || 'Keine'}</div>
            </div>
          </div>
        </div>
      ) : (
        /* STP View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--accent-rose)" /> Spanning Tree Status (IEEE 802.1D)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div>
                <strong>Root Bridge:</strong>{' '}
                <span className="badge badge-indigo">{stpResult.rootBridgeId} (Niedrigste Priorität: {nodes.find(n => n.id === stpResult.rootBridgeId)?.priority})</span>
              </div>
              <div>
                <strong>Aktive Forwarding Kanten:</strong>{' '}
                <span style={{ color: 'var(--accent-teal)' }}>{stpResult.forwardingEdges.join(', ')}</span> (Loop-frei)
              </div>
              <div>
                <strong>Geblockte Kanten (Discarding):</strong>{' '}
                <span style={{ color: 'var(--accent-rose)' }}>{stpResult.blockedEdges.join(', ')}</span> (Verhindert Broadcast Storms)
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--accent-amber)" /> IHK Prüfungs-Wissen
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              <li><strong>Root Bridge Wahl:</strong> Der Switch mit der niedrigsten Bridge-ID (Priorität + MAC-Adresse) wird Root Bridge.</li>
              <li><strong>Root Port:</strong> Jeder Nicht-Root-Switch wählt genau einen Port mit den geringsten Pfadkosten zur Root Bridge.</li>
              <li><strong>Designated Port:</strong> Pro Segment leitet genau ein Switch Pakete weiter.</li>
              <li><strong>Blocking / Discarding:</strong> Redundante Ports werden geblockt, um Switching Loops (Endlosschleifen) zu verhindern.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
