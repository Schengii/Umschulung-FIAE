import React, { useState } from 'react';
import { Network, Play, RotateCcw, Award, CheckCircle2, ChevronRight, Binary, ArrowRight } from 'lucide-react';

// Sample tree node structure
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

// Build BST helper
const insertBST = (root, val) => {
  if (!root) return new TreeNode(val);
  if (val < root.val) {
    root.left = insertBST(root.left, val);
  } else if (val > root.val) {
    root.right = insertBST(root.right, val);
  }
  return root;
};

// Graph adjacency list for Dijkstra & BFS/DFS
const INITIAL_GRAPH = {
  A: [{ node: 'B', weight: 4 }, { node: 'C', weight: 2 }],
  B: [{ node: 'A', weight: 4 }, { node: 'C', weight: 1 }, { node: 'D', weight: 5 }],
  C: [{ node: 'A', weight: 2 }, { node: 'B', weight: 1 }, { node: 'D', weight: 8 }, { node: 'E', weight: 10 }],
  D: [{ node: 'B', weight: 5 }, { node: 'C', weight: 8 }, { node: 'E', weight: 2 }, { node: 'Z', weight: 6 }],
  E: [{ node: 'C', weight: 10 }, { node: 'D', weight: 2 }, { node: 'Z', weight: 3 }],
  Z: [{ node: 'D', weight: 6 }, { node: 'E', weight: 3 }]
};

export default function DataStructuresLab({ onRewardXP }) {
  const [activeTab, setActiveTab] = useState('bst'); // 'bst' | 'graph'
  
  // BST State
  const [treeValues, setTreeValues] = useState([50, 30, 70, 20, 40, 60, 80]);
  const [inputVal, setInputVal] = useState('');
  const [traversalResult, setTraversalResult] = useState([]);
  const [traversalType, setTraversalType] = useState('');
  const [activeVisitingNode, setActiveVisitingNode] = useState(null);

  // Graph State
  const [startNode, setStartNode] = useState('A');
  const [targetNode, setTargetNode] = useState('Z');
  const [graphPath, setGraphPath] = useState([]);
  const [visitedNodesOrder, setVisitedNodesOrder] = useState([]);
  const [graphLog, setGraphLog] = useState([]);

  // BST Traversal Algorithms
  const runInorder = () => {
    const result = [];
    const root = buildTree();
    const traverse = (node) => {
      if (!node) return;
      traverse(node.left);
      result.push(node.val);
      traverse(node.right);
    };
    traverse(root);
    animateTraversal(result, 'Inorder (Links -> Wurzel -> Rechts): Sortierte Reihenfolge');
  };

  const runPreorder = () => {
    const result = [];
    const root = buildTree();
    const traverse = (node) => {
      if (!node) return;
      result.push(node.val);
      traverse(node.left);
      traverse(node.right);
    };
    traverse(root);
    animateTraversal(result, 'Preorder (Wurzel -> Links -> Rechts): Ideal zum Klonen von Bäumen');
  };

  const runPostorder = () => {
    const result = [];
    const root = buildTree();
    const traverse = (node) => {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);
      result.push(node.val);
    };
    traverse(root);
    animateTraversal(result, 'Postorder (Links -> Rechts -> Wurzel): Ideal zum Löschen von Bäumen');
  };

  const buildTree = () => {
    if (treeValues.length === 0) return null;
    let root = null;
    for (const val of treeValues) {
      root = insertBST(root, val);
    }
    return root;
  };

  const animateTraversal = (nodes, type) => {
    setTraversalType(type);
    setTraversalResult([]);
    nodes.forEach((val, idx) => {
      setTimeout(() => {
        setActiveVisitingNode(val);
        setTraversalResult(prev => [...prev, val]);
        if (idx === nodes.length - 1) {
          setTimeout(() => setActiveVisitingNode(null), 800);
          if (onRewardXP) onRewardXP(25);
        }
      }, (idx + 1) * 500);
    });
  };

  const handleAddNode = (e) => {
    e.preventDefault();
    const num = parseInt(inputVal, 10);
    if (!isNaN(num) && !treeValues.includes(num)) {
      setTreeValues([...treeValues, num]);
      setInputVal('');
      if (onRewardXP) onRewardXP(10);
    }
  };

  const handleResetBST = () => {
    setTreeValues([50, 30, 70, 20, 40, 60, 80]);
    setTraversalResult([]);
    setTraversalType('');
    setActiveVisitingNode(null);
  };

  // Dijkstra Shortest Path Algorithm
  const runDijkstra = () => {
    const distances = {};
    const previous = {};
    const nodes = new Set(Object.keys(INITIAL_GRAPH));
    const visitedOrder = [];
    const logs = [];

    for (const node of nodes) {
      distances[node] = Infinity;
      previous[node] = null;
    }
    distances[startNode] = 0;

    while (nodes.size > 0) {
      // Find smallest unvisited distance
      let smallest = null;
      for (const node of nodes) {
        if (smallest === null || distances[node] < distances[smallest]) {
          smallest = node;
        }
      }

      if (distances[smallest] === Infinity) break;
      visitedOrder.push(smallest);
      nodes.delete(smallest);
      logs.push(`🔍 Untersuche Knoten '${smallest}' mit Distanz ${distances[smallest]}`);

      if (smallest === targetNode) {
        logs.push(`🎯 Zielknoten '${targetNode}' mit kürzester Gesamtdistanz ${distances[targetNode]} erreicht!`);
        break;
      }

      for (const neighbor of INITIAL_GRAPH[smallest]) {
        if (nodes.has(neighbor.node)) {
          const alt = distances[smallest] + neighbor.weight;
          if (alt < distances[neighbor.node]) {
            distances[neighbor.node] = alt;
            previous[neighbor.node] = smallest;
            logs.push(`   ⚡ Neuer kürzerer Weg zu '${neighbor.node}' über '${smallest}': ${alt}`);
          }
        }
      }
    }

    // Reconstruct path
    const path = [];
    let curr = targetNode;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }

    setVisitedNodesOrder(visitedOrder);
    setGraphPath(path);
    setGraphLog(logs);
    if (onRewardXP) onRewardXP(35);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Network size={14} /> Algorithmen & Datenstrukturen
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🌲 Data Structures Lab (Trees & Graphs)
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Interaktive Simulation von Binären Suchbäumen (BST), Baum-Traversierungen & Dijkstra Kürzeste-Wege-Algorithmus.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            className={`btn ${activeTab === 'bst' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('bst')}
            style={{ fontSize: '0.88rem', padding: '8px 16px' }}
          >
            <Binary size={16} /> Binary Search Tree (BST)
          </button>
          <button
            className={`btn ${activeTab === 'graph' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('graph')}
            style={{ fontSize: '0.88rem', padding: '8px 16px' }}
          >
            <Network size={16} /> Dijkstra Graph Solver
          </button>
        </div>
      </div>

      {/* BST TAB */}
      {activeTab === 'bst' && (
        <div>
          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
            <form onSubmit={handleAddNode} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Zahl (z.B. 45)"
                style={{
                  width: '130px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}
              />
              <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                + Node Einfügen
              </button>
            </form>

            <button className="btn btn-primary" onClick={runInorder} style={{ fontSize: '0.85rem', gap: '6px' }}>
              <Play size={14} /> Inorder
            </button>
            <button className="btn btn-secondary" onClick={runPreorder} style={{ fontSize: '0.85rem', gap: '6px' }}>
              <Play size={14} /> Preorder
            </button>
            <button className="btn btn-secondary" onClick={runPostorder} style={{ fontSize: '0.85rem', gap: '6px' }}>
              <Play size={14} /> Postorder
            </button>
            <button className="btn btn-ghost" onClick={handleResetBST} style={{ fontSize: '0.85rem', gap: '6px' }}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          {/* Visual Tree Display */}
          <div style={{ background: '#0f172a', padding: '32px', borderRadius: 'var(--radius-lg)', marginBottom: '20px', minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center', maxWidth: '650px' }}>
              {treeValues.map((val) => {
                const isVisiting = activeVisitingNode === val;
                const isTraversed = traversalResult.includes(val);
                return (
                  <div
                    key={val}
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '1.1rem',
                      background: isVisiting ? '#e11d48' : isTraversed ? 'var(--accent-emerald)' : '#1e293b',
                      color: '#ffffff',
                      border: isVisiting ? '3px solid #fda4af' : '2px solid #334155',
                      boxShadow: isVisiting ? '0 0 20px #e11d48' : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isVisiting ? 'scale(1.2)' : 'scale(1)'
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Traversal Output */}
          {traversalType && (
            <div style={{ background: 'var(--bg-primary)', padding: '16px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> {traversalType}
              </h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {traversalResult.map((val, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#0f172a',
                      color: '#38bdf8',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      border: '1px solid #1e293b'
                    }}
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GRAPH TAB */}
      {activeTab === 'graph' && (
        <div>
          {/* Controls */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Start:</span>
              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
              >
                {Object.keys(INITIAL_GRAPH).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Ziel:</span>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
              >
                {Object.keys(INITIAL_GRAPH).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <button className="btn btn-primary" onClick={runDijkstra} style={{ gap: '6px', fontSize: '0.88rem' }}>
              <Play size={14} /> Kürzesten Weg berechnen (Dijkstra)
            </button>
          </div>

          {/* Graph Adjacency / Nodes Visualization */}
          <div style={{ background: '#0f172a', padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
            <h4 style={{ color: '#94a3b8', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Graph Knotennetzwerk & Kantengewichte
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {Object.entries(INITIAL_GRAPH).map(([node, edges]) => {
                const isInPath = graphPath.includes(node);
                const isVisited = visitedNodesOrder.includes(node);
                return (
                  <div
                    key={node}
                    style={{
                      background: isInPath ? 'rgba(16,185,129,0.2)' : isVisited ? 'rgba(56,189,248,0.1)' : '#1e293b',
                      border: isInPath ? '2px solid var(--accent-emerald)' : isVisited ? '1px solid #38bdf8' : '1px solid #334155',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '800', color: isInPath ? 'var(--accent-emerald)' : '#f8fafc', fontSize: '1.1rem' }}>
                        Node {node}
                      </span>
                      {isInPath && <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>IM WEG</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {edges.map(e => `${e.node} (w: ${e.weight})`).join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Path Result & Log */}
          {graphPath.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} /> Optimaler Pfad ({startNode} &rarr; {targetNode})
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {graphPath.map((node, i) => (
                    <React.Fragment key={node}>
                      <span style={{ background: 'var(--accent-emerald)', color: '#ffffff', padding: '6px 14px', borderRadius: 'var(--radius-md)', fontWeight: '800' }}>
                        {node}
                      </span>
                      {i < graphPath.length - 1 && <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-lg)', maxHeight: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <div style={{ color: '#94a3b8', fontWeight: '700', marginBottom: '6px' }}>Algorithmus Trace:</div>
                {graphLog.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '4px' }}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
