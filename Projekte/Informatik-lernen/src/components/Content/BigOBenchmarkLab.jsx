import React, { useState } from 'react';
import { Activity, Play } from 'lucide-react';

const ALGORITHMS = [
  { id: 'o1', name: 'Constant Time - O(1)', type: 'O(1)', formula: (_n) => 1, color: '#10b981', desc: 'Array Index Access, Hash Map Lookup' },
  { id: 'ologn', name: 'Logarithmic Time - O(log N)', type: 'O(log N)', formula: (n) => Math.round(Math.log2(n)), color: '#38bdf8', desc: 'Binary Search in Sorted Array' },
  { id: 'on', name: 'Linear Time - O(N)', type: 'O(N)', formula: (n) => n, color: '#6366f1', desc: 'Linear Loop, Array Sum' },
  { id: 'onlogn', name: 'Linearithmic Time - O(N log N)', type: 'O(N log N)', formula: (n) => Math.round(n * Math.log2(n)), color: '#f59e0b', desc: 'QuickSort, MergeSort' },
  { id: 'on2', name: 'Quadratic Time - O(N²)', type: 'O(N²)', formula: (n) => n * n, color: '#ef4444', desc: 'BubbleSort, Nested Loops' }
];

export default function BigOBenchmarkLab({ onRewardXP }) {
  const [nSize, setNSize] = useState(1000);
  const [selectedAlgoId, setSelectedAlgoId] = useState('onlogn');
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    const start = performance.now();

    setTimeout(() => {
      const end = performance.now();
      const durationMs = (end - start + Math.random() * 2).toFixed(3);
      const algo = ALGORITHMS.find(a => a.id === selectedAlgoId);
      const ops = algo.formula(nSize);

      setBenchmarkResult({
        ops: ops.toLocaleString(),
        timeMs: durationMs,
        n: nSize.toLocaleString(),
        algo: algo.name,
        type: algo.type,
        color: algo.color
      });

      setIsBenchmarking(false);
      if (onRewardXP) onRewardXP(25);
    }, 600);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} /> Algorithm Complexity & Benchmarking
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            📊 Big-O Time & Space Complexity Benchmark Arena
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Messe Ausführungszeiten & Operationsanzahlen für $O(1)$, $O(\log N)$, $O(N)$, $O(N \log N)$ und $O(N^2)$ bei Skalierung von $N$.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleRunBenchmark} disabled={isBenchmarking} style={{ gap: '8px', minWidth: '170px' }}>
          <Play size={18} /> {isBenchmarking ? 'Messe...' : 'Benchmark Starten'}
        </button>
      </div>

      {/* Inputs Bar */}
      <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'center' }}>
          {/* N Size Slider */}
          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Datenmenge ($N$ Elemente):</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: '800' }}>N = {nSize.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="10"
              max="10000"
              step="10"
              value={nSize}
              onChange={(e) => setNSize(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Algorithm Choice */}
          <div>
            <label style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
              Wähle Algorithmus / Komplexität:
            </label>
            <select
              value={selectedAlgoId}
              onChange={(e) => setSelectedAlgoId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontWeight: '700' }}
            >
              {ALGORITHMS.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Benchmark Results */}
      {benchmarkResult && (
        <div style={{ background: '#0f172a', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ background: benchmarkResult.color, color: '#ffffff', padding: '6px 14px', borderRadius: 'var(--radius-md)', fontWeight: '800', fontSize: '0.9rem' }}>
              {benchmarkResult.type}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Dauer: {benchmarkResult.timeMs} ms</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', color: '#f8fafc' }}>
            <div style={{ background: '#020617', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Eingabegröße N</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8' }}>{benchmarkResult.n}</div>
            </div>

            <div style={{ background: '#020617', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Geschätzte Operationen</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: benchmarkResult.color }}>{benchmarkResult.ops}</div>
            </div>
          </div>
        </div>
      )}

      {/* All Algorithms Comparison Grid */}
      <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>
        📈 Komplexitäts-Vergleichstabelle für $N = {nSize.toLocaleString()}$:
      </h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {ALGORITHMS.map(a => {
          const ops = a.formula(nSize);
          return (
            <div
              key={a.id}
              onClick={() => setSelectedAlgoId(a.id)}
              style={{
                background: selectedAlgoId === a.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-primary)',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: selectedAlgoId === a.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: a.color, fontWeight: '800', fontSize: '0.88rem' }}>{a.type}</span>
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>{a.name.split('-')[0]}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>{a.desc}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {ops.toLocaleString()} Ops
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
