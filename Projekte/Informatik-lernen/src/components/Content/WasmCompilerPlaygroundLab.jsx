import React, { useState, useMemo } from 'react';

import { FileCode, Play, Hexagon, Layers, Zap, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { parseWasm, generateHexDump } from '../../utils/wasmParserEngine';

const MOCK_WASM_BINARY = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 
  0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 
  0x03, 0x02, 0x01, 0x00, 
  0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00, 
  0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
]);

const MOCK_C_CODE = `// Simple C function to add two integers
// This will be compiled to WebAssembly (WASM)

__attribute__((export_name("add")))
int add(int a, int b) {
    return a + b;
}
`;

export default function WasmCompilerPlaygroundLab() {
  const { awardXP } = useStore();
  const [code] = useState(MOCK_C_CODE);
  const [isCompiling, setIsCompiling] = useState(false);
  const [wasmBuffer, setWasmBuffer] = useState(null);
  const [hoveredByte, setHoveredByte] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [xpClaimed, setXpClaimed] = useState(false);

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setWasmBuffer(MOCK_WASM_BINARY);
      setIsCompiling(false);
      if (!xpClaimed) {
        setXpClaimed(true);
        awardXP(40, 'WASM Compiler Engineer');
      }
    }, 1500);
  };

  const wasmData = useMemo(() => {
    if (!wasmBuffer) return null;
    return parseWasm(wasmBuffer);
  }, [wasmBuffer]);

  const hexLines = useMemo(() => {
    if (!wasmBuffer) return [];
    return generateHexDump(wasmBuffer);
  }, [wasmBuffer]);

  const getSectionForOffset = (offset) => {
    if (!wasmData?.sections) return null;
    return wasmData.sections.find(s => offset >= s.start && offset < s.end);
  };

  const getByteColor = (offset) => {
    const sec = getSectionForOffset(offset);
    if (!sec) return 'var(--text-primary)';
    if (selectedSection && sec.id !== selectedSection.id) return 'var(--text-muted)';
    if (sec.name.includes('Type')) return '#f59e0b'; // amber
    if (sec.name.includes('Function')) return '#3b82f6'; // blue
    if (sec.name.includes('Export')) return '#10b981'; // green
    if (sec.name.includes('Code')) return '#ec4899'; // pink
    return '#8b5cf6'; // purple for header
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Hexagon size={28} color="var(--accent-purple)" />
          WebAssembly Compiler Playground & Hex Inspector
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Kompiliere C/Rust Code im Browser zu WebAssembly (.wasm) und analysiere die binären Sektionen im Hex-Dump.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Editor */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
              <FileCode size={18} color="var(--accent-blue)" /> main.c
            </div>
            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className="action-button primary"
              style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isCompiling ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
              {isCompiling ? 'Kompiliert (Clang/LLVM)...' : 'Zu WASM kompilieren'}
            </button>
          </div>
          <pre style={{ margin: 0, padding: '24px', background: 'var(--bg-tertiary)', flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', color: '#e2e8f0' }}>
            {code}
          </pre>
        </div>

        {/* Right Column: Hex Inspector */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
              <Layers size={18} color="var(--accent-purple)" /> Binary WASM Bytecode (.wasm)
            </div>
            {wasmBuffer && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{wasmBuffer.length} Bytes</div>}
          </div>

          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {!wasmBuffer ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                <Zap size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>Kompiliere den Code, um den generierten Bytecode zu sehen.</p>
              </div>
            ) : (
              <>
                {/* Sections Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {wasmData?.sections.map((sec, idx) => (
                    <div 
                      key={idx}
                      onMouseEnter={() => setSelectedSection(sec)}
                      onMouseLeave={() => setSelectedSection(null)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: selectedSection?.id === sec.id ? 'var(--bg-tertiary)' : 'transparent',
                        border: `1px solid ${selectedSection?.id === sec.id ? 'var(--accent-primary)' : 'var(--border-color)'}`
                      }}
                    >
                      {sec.name} ({sec.end - sec.start}B)
                    </div>
                  ))}
                </div>

                {/* Hex Dump */}
                <div style={{ fontFamily: 'monospace', fontSize: '1rem', background: '#0f172a', padding: '16px', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
                  {hexLines.map((line, lIdx) => (
                    <div key={lIdx} style={{ display: 'flex', gap: '16px', lineHeight: '1.6' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{line.address}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {line.hex.map((h, hIdx) => {
                          const offset = line.startOffset + hIdx;
                          if (offset >= wasmBuffer.length) return <span key={hIdx} style={{ width: '2ch' }}></span>;
                          return (
                            <span 
                              key={hIdx} 
                              onMouseEnter={() => setHoveredByte(offset)}
                              onMouseLeave={() => setHoveredByte(null)}
                              style={{ 
                                width: '2ch',
                                color: getByteColor(offset),
                                background: hoveredByte === offset ? 'var(--bg-secondary)' : 'transparent',
                                cursor: 'crosshair'
                              }}
                            >
                              {h}
                            </span>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', color: 'var(--text-muted)' }}>
                        {line.ascii.map((a, aIdx) => {
                           const offset = line.startOffset + aIdx;
                           if (offset >= wasmBuffer.length) return <span key={aIdx}></span>;
                           return (
                             <span 
                               key={aIdx}
                               style={{ 
                                 background: hoveredByte === offset ? 'var(--bg-secondary)' : 'transparent',
                                 color: getByteColor(offset)
                               }}
                             >
                               {a}
                             </span>
                           );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inspector Detail */}
                <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--accent-purple)' }}>Byte-Inspektor</div>
                  {hoveredByte !== null ? (
                    <div>
                      <div>Offset: <span style={{ fontFamily: 'monospace' }}>0x{hoveredByte.toString(16).padStart(4, '0')}</span></div>
                      <div>Sektion: {getSectionForOffset(hoveredByte)?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{getSectionForOffset(hoveredByte)?.details}</div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>Fahre mit der Maus über den Hex-Dump, um Details zu sehen.</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
