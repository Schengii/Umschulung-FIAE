import React, { useState } from 'react';
import { Cpu, Zap, CheckCircle2, RefreshCw } from 'lucide-react';

export default function LogicGatesGame({ onCompleteGame }) {
  const [inputA, setInputA] = useState(0);
  const [inputB, setInputB] = useState(0);
  const [gateType, setGateType] = useState('AND');
  const [isSuccess, setIsSuccess] = useState(false);

  // Compute logic gate output
  const computeOutput = (a, b, gate) => {
    switch (gate) {
      case 'AND': return a && b ? 1 : 0;
      case 'OR': return a || b ? 1 : 0;
      case 'XOR': return (a || b) && !(a && b) ? 1 : 0;
      case 'NAND': return !(a && b) ? 1 : 0;
      case 'NOR': return !(a || b) ? 1 : 0;
      default: return 0;
    }
  };

  const outputSignal = computeOutput(inputA, inputB, gateType);

  const handleTestChallenge = () => {
    setIsSuccess(true);
    onCompleteGame(`logic_gate_${gateType}`, 50);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={28} color="var(--accent-green)" /> Logikgatter & Hardware Simulator
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Schalte Eingänge (0/1) um und beobachte wie digitale Schaltungen Signale verarbeiten.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        
        {/* Gate Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['AND', 'OR', 'XOR', 'NAND', 'NOR'].map(gate => (
            <button
              key={gate}
              onClick={() => {
                setGateType(gate);
                setIsSuccess(false);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: gateType === gate ? 'var(--gradient-emerald)' : 'var(--bg-tertiary)',
                color: '#fff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {gate}-Gatter
            </button>
          ))}
        </div>

        {/* Visual Circuit Diagram */}
        <div style={{
          background: '#090d16',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          
          {/* Inputs Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Input A Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>Eingang A:</span>
              <button
                onClick={() => setInputA(inputA === 1 ? 0 : 1)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: inputA ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  boxShadow: inputA ? '0 0 15px rgba(16, 185, 129, 0.5)' : 'none'
                }}
              >
                {inputA}
              </button>
            </div>

            {/* Input B Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>Eingang B:</span>
              <button
                onClick={() => setInputB(inputB === 1 ? 0 : 1)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: inputB ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  boxShadow: inputB ? '0 0 15px rgba(16, 185, 129, 0.5)' : 'none'
                }}
              >
                {inputB}
              </button>
            </div>
          </div>

          {/* Logic Gate Box */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '2px solid var(--accent-cyan)',
            padding: '24px 36px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Cpu size={32} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{gateType}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Digitale Schaltung</span>
          </div>

          {/* Output LED */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Ausgang Signal:</span>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: outputSignal ? 'var(--accent-green)' : '#222',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: outputSignal ? '0 0 30px rgba(16, 185, 129, 0.8)' : 'none',
              fontSize: '1.4rem',
              fontWeight: '800',
              color: '#fff'
            }}>
              {outputSignal}
            </div>
          </div>

        </div>

        {/* Gate Truth Table */}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-muted)' }}>
            Wahrheitstabelle für {gateType}:
          </h4>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
            • Wenn A={inputA} und B={inputB} → Ausgang ist <strong>{outputSignal}</strong>.
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleTestChallenge} style={{ marginTop: '20px' }}>
          <Zap size={16} /> Schaltung Absolvieren (+50 XP)
        </button>

      </div>

    </div>
  );
}
