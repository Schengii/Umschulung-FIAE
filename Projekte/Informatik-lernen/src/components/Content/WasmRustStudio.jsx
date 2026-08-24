import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, FileCode, Zap, Sparkles, RefreshCw, Layers } from 'lucide-react';

const RUST_PRESETS = {
  fibonacci: `#[no_mangle]
pub extern "C" fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}`,
  matrix: `#[no_mangle]
pub extern "C" fn multiply_add(a: f64, b: f64, c: f64) -> f64 {
    (a * b) + c
}`
};

export default function WasmRustStudio({ onRewardXP }) {
  const [rustCode, setRustCode] = useState(RUST_PRESETS.fibonacci);
  const [isCompiling, setIsCompiling] = useState(false);
  const [wasmCompiled, setWasmCompiled] = useState(false);
  const [benchmark, setBenchmark] = useState(null);

  const handleCompileWasm = () => {
    setIsCompiling(true);
    setWasmCompiled(false);

    setTimeout(() => {
      setIsCompiling(false);
      setWasmCompiled(true);
      if (onRewardXP) onRewardXP(35);
    }, 1200);
  };

  const handleRunBenchmark = () => {
    if (!wasmCompiled) return;

    // Simulate performance comparison
    const jsTime = (Math.random() * 12 + 18).toFixed(2);
    const wasmTime = (Math.random() * 2 + 3).toFixed(2);
    const speedup = (jsTime / wasmTime).toFixed(1);

    setBenchmark({
      jsTime,
      wasmTime,
      speedup
    });
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} /> WebAssembly & High-Performance Native Code
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            ⚡ WebAssembly (WASM) & Rust Compilation Playground
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Schreibe Rust-Quellcode, kompiliere in in-Browser WASM Bytecode und vergleiche die Performance mit JavaScript.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleCompileWasm} disabled={isCompiling} style={{ gap: '8px', minWidth: '180px' }}>
          <Zap size={18} /> {isCompiling ? 'rustc target wasm...' : 'WASM Kompilieren'}
        </button>
      </div>

      {/* Editor & WASM Output Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Rust Code Input */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={16} style={{ color: '#f97316' }} /> Rust Quellcode (`lib.rs`)
          </h4>
          <textarea
            rows={8}
            value={rustCode}
            onChange={(e) => setRustCode(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: '#020617',
              color: '#f8fafc',
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              border: '1px solid #0f172a',
              resize: 'vertical'
            }}
          />
        </div>

        {/* WASM Bytecode View */}
        <div style={{ background: '#0f172a', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid #1e293b' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} style={{ color: '#38bdf8' }} /> WebAssembly Binary (`module.wasm`)
          </h4>

          <div style={{
            background: '#020617',
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            color: '#38bdf8',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            minHeight: '180px',
            border: '1px solid #0f172a'
          }}>
            {!wasmCompiled ? (
              <span style={{ color: '#64748b' }}>Klicke oben auf "WASM Kompilieren"...</span>
            ) : (
              <div>
                <div style={{ color: '#10b981', fontWeight: '800', marginBottom: '8px' }}>
                  ✓ WASM Module Compiled (Size: 1.4 KB)
                </div>
                <div style={{ color: '#94a3b8' }}>
                  00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01 7f<br />
                  03 02 01 00 07 0d 01 09 66 69 62 6f 6e 61 63 63 69<br />
                  00 00 0a 1f 01 1d 00 20 00 41 02 49 04 40 20 00 0f<br />
                  0b 20 00 41 01 70 10 00 20 00 41 02 70 10 00 7a 0f
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benchmark Execution Card */}
      {wasmCompiled && (
        <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
                ⚡ WASM vs JavaScript Execution Speed Benchmark
              </h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Führe `fibonacci(38)` 10.000 Mal aus und vergleiche die Performance.
              </p>
            </div>

            <button className="btn btn-primary" onClick={handleRunBenchmark} style={{ gap: '8px' }}>
              <Play size={16} /> Performance Benchmark Starten
            </button>
          </div>

          {benchmark && (
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>JavaScript (V8 JIT)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-rose)' }}>{benchmark.jsTime} ms</div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WebAssembly (WASM)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>{benchmark.wasmTime} ms</div>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WASM Beschleunigung</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>{benchmark.speedup}x Schneller!</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
