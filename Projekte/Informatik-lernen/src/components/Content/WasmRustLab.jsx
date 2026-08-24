import React, { useState } from 'react';
import { WASM_MODULES } from '../../data/wasmRustData';
import { Cpu, Zap, Code2 } from 'lucide-react';

export default function WasmRustLab() {
  const [selectedId, setSelectedId] = useState(WASM_MODULES[0].id);

  const activeWasm = WASM_MODULES.find(w => w.id === selectedId) || WASM_MODULES[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-amber)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={32} style={{ color: 'var(--accent-amber)' }} /> WebAssembly (Wasm) & Rust Compiler Lab
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Verstehe Hochleistungs-Code im Webbrowser: Rust zu Wasm kompilieren und direkt ausführen.
        </p>
      </div>

      <div className="grid-responsive" style={{ gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span className="badge badge-amber" style={{ marginBottom: '10px' }}>Rust Source Code</span>
          <div className="code-window">
            <pre className="code-body">
              <code>{activeWasm.rustCode}</code>
            </pre>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>JavaScript Wasm Runner</span>
          <div className="code-window">
            <pre className="code-body">
              <code>{activeWasm.jsIntegration}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
