import React, { useState } from 'react';
import { Cpu, Zap, Code, Layers, Sparkles, BarChart2 } from 'lucide-react';
import { 
  simdAddF32x4, 
  simdMulF32x4, 
  simdDotProductF32x4, 
  runSimdBenchmark, 
  generateWatSimdSnippet,
  applySimdConvolutionFilter
} from '../../utils/wasmSimdEngine';
import { useStore } from '../../store/useStore';

export default function WasmSimdStudioLab() {
  const { awardXP } = useStore();
  const [activeTab, setActiveTab] = useState('lanes'); // 'lanes' | 'benchmark' | 'wat' | 'convolution'
  const [selectedOp, setSelectedOp] = useState('add'); // 'add' | 'mul' | 'dot' | 'brightness'
  const [filterType, setFilterType] = useState('sobel'); // 'sobel' | 'sharpen' | 'gaussianBlur'
  const [itemCount, setItemCount] = useState(100000);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Vektorwerte für die Register-Visualisierung
  const [vecA, setVecA] = useState([1.5, 4.0, 7.25, 2.0]);
  const [vecB, setVecB] = useState([2.5, 3.0, 1.75, 5.0]);

  const handleVecAChange = (laneIdx, val) => {
    const parsed = parseFloat(val) || 0;
    setVecA(prev => {
      const next = [...prev];
      next[laneIdx] = parsed;
      return next;
    });
  };

  const handleVecBChange = (laneIdx, val) => {
    const parsed = parseFloat(val) || 0;
    setVecB(prev => {
      const next = [...prev];
      next[laneIdx] = parsed;
      return next;
    });
  };

  // Berechnung des aktuellen SIMD-Ergebnisses
  const currentResult = React.useMemo(() => {
    if (selectedOp === 'mul') return simdMulF32x4(vecA, vecB);
    if (selectedOp === 'dot') return [simdDotProductF32x4(vecA, vecB), 0, 0, 0];
    return simdAddF32x4(vecA, vecB);
  }, [vecA, vecB, selectedOp]);

  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      const res = runSimdBenchmark(itemCount, selectedOp === 'mul' ? 'mul' : 'add');
      setBenchmarkResult(res);
      setIsBenchmarking(false);

      if (!rewardClaimed) {
        awardXP(70, 'WebAssembly SIMD & Vector Processing');
        setRewardClaimed(true);
      }
    }, 150);
  };

  const watCode = generateWatSimdSnippet(selectedOp === 'mul' ? 'f32x4.mul' : 'f32x4.add');

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '20px', color: '#c084fc', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Cpu size={16} /> WebAssembly 128-Bit SIMD (v128) Architecture
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            WebAssembly SIMD & Vector Studio
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Untersuche parallele 128-Bit Vektor-Befehle (f32x4, i32x4, u8x16) und vergleiche skalaren JS-Code mit hardwarebeschleunigtem SIMD.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('lanes')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'lanes' ? '#9333ea' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={15} /> 128-Bit Register
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'benchmark' ? '#9333ea' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BarChart2 size={15} /> Speedup Benchmark
          </button>
          <button
            onClick={() => setActiveTab('wat')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'wat' ? '#9333ea' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Code size={15} /> WAT Bytecode
          </button>
          <button
            onClick={() => setActiveTab('convolution')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'convolution' ? '#9333ea' : 'transparent',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={15} /> 3x3 Faltung (Sobel)
          </button>
        </div>
      </div>

      {/* Operation Picker */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedOp('add')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: selectedOp === 'add' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
            background: selectedOp === 'add' ? 'rgba(168, 85, 247, 0.2)' : 'var(--card-bg, #1e293b)',
            color: selectedOp === 'add' ? '#c084fc' : '#94a3b8',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          f32x4.add (Vektor-Addition)
        </button>
        <button
          onClick={() => setSelectedOp('mul')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: selectedOp === 'mul' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
            background: selectedOp === 'mul' ? 'rgba(168, 85, 247, 0.2)' : 'var(--card-bg, #1e293b)',
            color: selectedOp === 'mul' ? '#c084fc' : '#94a3b8',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          f32x4.mul (Vektor-Multiplikation)
        </button>
        <button
          onClick={() => setSelectedOp('dot')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: selectedOp === 'dot' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
            background: selectedOp === 'dot' ? 'rgba(168, 85, 247, 0.2)' : 'var(--card-bg, #1e293b)',
            color: selectedOp === 'dot' ? '#c084fc' : '#94a3b8',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          f32x4.dot (Skalarprodukt)
        </button>
      </div>

      {activeTab === 'lanes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Register A */}
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 'bold', color: '#60a5fa', fontSize: '0.95rem' }}>
                SIMD Register %v0 (128-Bit Float32x4 Vektor A)
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>4x 32-Bit IEEE 754 Floating Point</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {vecA.map((val, idx) => (
                <div key={`a-${idx}`} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: '6px' }}>Lane {idx} (Bits {idx*32}..{idx*32+31})</div>
                  <input
                    type="number"
                    step="0.25"
                    value={val}
                    onChange={(e) => handleVecAChange(idx, e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textAlign: 'center',
                      padding: '6px'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Operation Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', color: '#a855f7', fontWeight: 'bold' }}>
            <div style={{ height: '1px', flex: 1, background: 'rgba(168, 85, 247, 0.3)' }} />
            <span style={{ padding: '6px 16px', background: 'rgba(168, 85, 247, 0.15)', borderRadius: '20px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              1 CPU Taktzyklus: {selectedOp === 'mul' ? '⊗ (f32x4.mul)' : selectedOp === 'dot' ? '• (Dot Product)' : '⊕ (f32x4.add)'}
            </span>
            <div style={{ height: '1px', flex: 1, background: 'rgba(168, 85, 247, 0.3)' }} />
          </div>

          {/* Register B */}
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 'bold', color: '#34d399', fontSize: '0.95rem' }}>
                SIMD Register %v1 (128-Bit Float32x4 Vektor B)
              </span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>4x 32-Bit IEEE 754 Floating Point</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {vecB.map((val, idx) => (
                <div key={`b-${idx}`} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginBottom: '6px' }}>Lane {idx} (Bits {idx*32}..{idx*32+31})</div>
                  <input
                    type="number"
                    step="0.25"
                    value={val}
                    onChange={(e) => handleVecBChange(idx, e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textAlign: 'center',
                      padding: '6px'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Result Register */}
          <div style={{ background: 'rgba(168, 85, 247, 0.12)', padding: '20px', borderRadius: '12px', border: '2px solid #a855f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 'bold', color: '#e9d5ff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#c084fc" /> Ergebnis SIMD Register %v_out
              </span>
              <span style={{ fontSize: '0.8rem', color: '#d8b4fe' }}>Parallele Ausführung auf SIMD Hardware-ALU</span>
            </div>

            {selectedOp === 'dot' ? (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#d8b4fe', marginBottom: '6px' }}>Skalarprodukt Σ(Lane[i] * Lane[i]):</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>{currentResult[0].toFixed(2)}</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {currentResult.map((val, idx) => (
                  <div key={`out-${idx}`} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#d8b4fe', marginBottom: '4px' }}>Result Lane {idx}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#38bdf8' }}>{val.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'benchmark' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 16px 0' }}>
              Benchmark-Konfiguration
            </h3>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>Datengröße (Float32 Elemente):</label>
                <select
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value={50000}>50.000 Elemente</option>
                  <option value={100000}>100.000 Elemente (Standard)</option>
                  <option value={500000}>500.000 Elemente (High-Load)</option>
                </select>
              </div>

              <button
                onClick={handleRunBenchmark}
                disabled={isBenchmarking}
                style={{
                  marginTop: '22px',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: isBenchmarking ? '#6b21a8' : '#9333ea',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: isBenchmarking ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Zap size={18} /> {isBenchmarking ? 'Berechne Durchsatz...' : 'Benchmark starten'}
              </button>
            </div>
          </div>

          {benchmarkResult && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: '#fca5a5', marginBottom: '6px' }}>Skalarer JavaScript Loop:</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f87171' }}>
                  {benchmarkResult.scalarDurationMs} ms
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                  Verarbeitet 1 Float pro Schleifendurchlauf (SISD)
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: '#6ee7b7', marginBottom: '6px' }}>WebAssembly SIMD (v128):</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399' }}>
                  {benchmarkResult.simdDurationMs} ms
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                  Parallele 4-Lane Vektor-Register (SIMD)
                </div>
              </div>

              <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '2px solid #a855f7', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: '#d8b4fe', marginBottom: '6px' }}>Hardware-Beschleunigung / Speedup:</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#c084fc' }}>
                  ~{benchmarkResult.speedup}x Schneller
                </div>
                <div style={{ fontSize: '0.75rem', color: '#e9d5ff', marginTop: '6px' }}>
                  Durchsatz: <strong>{benchmarkResult.throughputMflops} MFLOPS</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wat' && (
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontFamily: 'monospace' }}>
              WebAssembly Text Format (WAT) - SIMD Module
            </span>
          </div>
          <pre style={{ margin: 0, padding: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', color: '#38bdf8', fontSize: '0.9rem', lineHeight: '1.6', overflowX: 'auto' }}>
            <code>{watCode}</code>
          </pre>
        </div>
      )}

      {activeTab === 'convolution' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--card-bg, #1e293b)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 14px 0' }}>
              3x3 Bildfaltungs-Matrix (Convolution Kernel)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '0 0 16px 0' }}>
              In der Computergrafik und Bildverarbeitung werden 3x3 Faltungskerne (Sobel, Gauß) über Bildpixel geschoben. Mit 128-Bit SIMD werden 4 oder 16 Farbkanäle parallel berechnet.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button
                onClick={() => setFilterType('sobel')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: filterType === 'sobel' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                  background: filterType === 'sobel' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.3)',
                  color: filterType === 'sobel' ? '#c084fc' : '#94a3b8',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Sobel Filter (Kantendetektion)
              </button>
              <button
                onClick={() => setFilterType('gaussianBlur')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: filterType === 'gaussianBlur' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                  background: filterType === 'gaussianBlur' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.3)',
                  color: filterType === 'gaussianBlur' ? '#c084fc' : '#94a3b8',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Gaußscher Weichzeichner (Blur)
              </button>
              <button
                onClick={() => setFilterType('sharpen')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: filterType === 'sharpen' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                  background: filterType === 'sharpen' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.3)',
                  color: filterType === 'sharpen' ? '#c084fc' : '#94a3b8',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Scharfzeichnen (Sharpen)
              </button>
            </div>

            {/* Matrix & Performance Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>
                  Aktueller 3x3 Faltungskern ({filterType}):
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#38bdf8', lineHeight: '1.6' }}>
                  {filterType === 'sobel' && (
                    <>
                      <div>Sobel X: [-1, 0, 1; -2, 0, 2; -1, 0, 1]</div>
                      <div>Sobel Y: [-1, -2, -1; 0, 0, 0; 1, 2, 1]</div>
                    </>
                  )}
                  {filterType === 'gaussianBlur' && (
                    <>
                      <div>[1/16, 2/16, 1/16]</div>
                      <div>[2/16, 4/16, 2/16]</div>
                      <div>[1/16, 2/16, 1/16]</div>
                    </>
                  )}
                  {filterType === 'sharpen' && (
                    <>
                      <div>[ 0, -1,  0]</div>
                      <div>[-1,  5, -1]</div>
                      <div>[ 0, -1,  0]</div>
                    </>
                  )}
                </div>
              </div>

              <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.82rem', color: '#d8b4fe', marginBottom: '6px', fontWeight: 'bold' }}>
                  SIMD Vektorisierungs-Gewinn (3x3 Faltung):
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#c084fc', marginBottom: '4px' }}>
                  ~3.9x Hardware Speedup
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Berechnet 4 Float-Nachbarpixel oder 16 Farb-Bytes parallel in einem CPU-Zyklus via <code>v128</code> Vektor-Multiplikation und Fused Multiply-Add (FMA).
                </div>
              </div>
            </div>

            {/* Live-Faltungsfilter-Berechnung (SIMD Kern) */}
            <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold', marginBottom: '8px' }}>
                Live Test-Matrix (4x4 Pixel Sample) gefiltert mit <code>applySimdConvolutionFilter</code>:
              </div>
              {(() => {
                const samplePixels = [10, 20, 30, 40, 50, 200, 220, 70, 90, 210, 230, 80, 30, 40, 50, 60];
                const kernelKey = filterType === 'sobel' ? 'sobelX' : filterType;
                const result = applySimdConvolutionFilter(samplePixels, 4, 4, kernelKey);
                return (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Ausgewählter Filter-Kernel: <span style={{ color: '#c084fc', fontWeight: 'bold' }}>{kernelKey}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Zentrum-Pixel [1,1] (Vorher: 200) &rarr; Gefiltert: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{result[5]}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Zentrum-Pixel [2,2] (Vorher: 230) &rarr; Gefiltert: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{result[10]}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
