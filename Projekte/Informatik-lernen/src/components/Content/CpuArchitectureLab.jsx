import React, { useState, useEffect, useCallback } from 'react';
import { Cpu, Play, Pause, RotateCcw, Zap, Database, Terminal } from 'lucide-react';

export default function CpuArchitectureLab({ onRewardXP }) {
  // RAM Memory: 8 addresses
  const initialRam = [
    { address: '0x00', code: 'LOAD 0x05', value: 0 },
    { address: '0x01', code: 'ADD 0x06', value: 0 },
    { address: '0x02', code: 'STORE 0x07', value: 0 },
    { address: '0x03', code: 'HLT', value: 0 },
    { address: '0x04', code: 'NOP', value: 0 },
    { address: '0x05', code: 'DATA 12', value: 12 },
    { address: '0x06', code: 'DATA 8', value: 8 },
    { address: '0x07', code: 'DATA 0', value: 0 }
  ];

  const [ram, setRam] = useState(initialRam);
  const [pc, setPc] = useState(0); // Program Counter
  const [ac, setAc] = useState(0); // Accumulator
  const [ir, setIr] = useState('NOP'); // Instruction Register
  const [mar, setMar] = useState('0x00'); // Memory Address Register
  const [phase, setPhase] = useState('FETCH'); // 'FETCH' | 'DECODE' | 'EXECUTE' | 'HALTED'
  const [activeBus, setActiveBus] = useState(null); // 'address' | 'data' | 'control' | null
  const clockSpeed = 1000;
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState(['Von-Neumann CPU initialisiert. Klicke auf "Takt-Schritt (Clock Step)" oder "Auto-Run".']);
  const [solved, setSolved] = useState(false);

  const addLog = (msg) => {
    setLogs(prev => [msg, ...prev.slice(0, 10)]);
  };

  const stepClock = useCallback(() => {
    if (phase === 'HALTED') {
      addLog('CPU ist angehalten (HLT erreicht). Drücke Reset für Neustart.');
      setIsRunning(false);
      return;
    }

    if (phase === 'FETCH') {
      const currentAddress = `0x0${pc}`;
      setMar(currentAddress);
      setActiveBus('address');
      const instruction = ram[pc]?.code || 'HLT';
      setIr(instruction);
      addLog(`[FETCH]: Lese Befehl '${instruction}' von Adresse ${currentAddress} in IR. PC=0x0${pc}`);
      setPhase('DECODE');
    } else if (phase === 'DECODE') {
      setActiveBus('control');
      addLog(`[DECODE]: Steuerwerk decodiert Befehl '${ir}'...`);
      setPhase('EXECUTE');
    } else if (phase === 'EXECUTE') {
      setActiveBus('data');
      const parts = ir.split(' ');
      const op = parts[0];
      const targetAddrStr = parts[1];
      const targetIdx = targetAddrStr ? parseInt(targetAddrStr.replace('0x', ''), 16) : null;

      if (op === 'LOAD') {
        const val = ram[targetIdx]?.value ?? 0;
        setAc(val);
        addLog(`[EXECUTE - LOAD]: Lade Wert ${val} aus Adresse ${targetAddrStr} in Akkumulator (AC).`);
        setPc(prev => prev + 1);
        setPhase('FETCH');
      } else if (op === 'ADD') {
        const val = ram[targetIdx]?.value ?? 0;
        const result = ac + val;
        setAc(result);
        addLog(`[EXECUTE - ADD]: ALU addiert AC (${ac}) + RAM[${targetAddrStr}] (${val}) = ${result}.`);
        setPc(prev => prev + 1);
        setPhase('FETCH');
      } else if (op === 'SUB') {
        const val = ram[targetIdx]?.value ?? 0;
        const result = ac - val;
        setAc(result);
        addLog(`[EXECUTE - SUB]: ALU subtrahiert AC (${ac}) - RAM[${targetAddrStr}] (${val}) = ${result}.`);
        setPc(prev => prev + 1);
        setPhase('FETCH');
      } else if (op === 'STORE') {
        setRam(prev => prev.map((cell, idx) => idx === targetIdx ? { ...cell, value: ac, code: `DATA ${ac}` } : cell));
        addLog(`[EXECUTE - STORE]: Speichere Akkumulator AC (${ac}) in RAM-Zelle ${targetAddrStr}.`);
        setPc(prev => prev + 1);
        setPhase('FETCH');
      } else if (op === 'HLT') {
        addLog(`[EXECUTE - HLT]: CPU Taktzyklus abgeschlossen. Ergebnis in RAM[0x07] = ${ac}.`);
        setPhase('HALTED');
        setIsRunning(false);
        if (!solved) {
          setSolved(true);
          if (onRewardXP) onRewardXP(50);
        }
      } else {
        setPc(prev => prev + 1);
        setPhase('FETCH');
      }
    }
  }, [phase, pc, ram, ir, ac, solved, onRewardXP]);

  useEffect(() => {
    let timer = null;
    if (isRunning && phase !== 'HALTED') {
      timer = setTimeout(() => {
        stepClock();
      }, clockSpeed);
    }
    return () => clearTimeout(timer);
  }, [isRunning, phase, pc, ac, ir, ram, clockSpeed, stepClock]);

  const resetCpu = () => {
    setRam(initialRam);
    setPc(0);
    setAc(0);
    setIr('NOP');
    setMar('0x00');
    setPhase('FETCH');
    setActiveBus(null);
    setIsRunning(false);
    setLogs(['CPU zurückgesetzt.']);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <Cpu size={14} /> Rechnerarchitektur & Hardware
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🔬 Von-Neumann CPU & Register-Simulator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Verstehe die Taktzyklen (Fetch, Decode, Execute), Register (PC, AC, IR, MAR) und den Bus-Datentransfer live.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setIsRunning(!isRunning)} 
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />} {isRunning ? 'Auto Pause' : 'Auto Run'}
          </button>
          <button 
            onClick={stepClock} 
            disabled={isRunning || phase === 'HALTED'}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <Zap size={14} /> Takt-Schritt (Clock Step)
          </button>
          <button onClick={resetCpu} className="btn btn-secondary btn-sm">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Visual Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* CPU DIE & REGISTERS */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '2px solid #3b82f6', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={16} /> CENTRAL PROCESSING UNIT (CPU)
            </span>
            <span style={{ 
              background: phase === 'FETCH' ? 'var(--accent-primary)' : phase === 'DECODE' ? 'var(--accent-amber)' : phase === 'EXECUTE' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              color: 'var(--text-on-accent)',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '9999px'
            }}>
              PHASE: {phase}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            {/* Program Counter PC */}
            <div style={{ background: 'var(--bg-card-hover)', padding: '12px', borderRadius: '10px', border: activeBus === 'address' ? '2px solid #38bdf8' : '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>PROGRAM COUNTER (PC)</div>
              <div style={{ fontSize: '1.25rem', color: 'var(--accent-cyan)', fontWeight: 900, fontFamily: 'monospace' }}>0x0{pc}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Zeigt auf nächsten Befehl</div>
            </div>

            {/* Instruction Register IR */}
            <div style={{ background: 'var(--bg-card-hover)', padding: '12px', borderRadius: '10px', border: activeBus === 'control' ? '2px solid #f59e0b' : '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>INSTRUCTION REG (IR)</div>
              <div style={{ fontSize: '1.1rem', color: 'var(--accent-amber)', fontWeight: 900, fontFamily: 'monospace' }}>{ir}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Aktueller OP-Code</div>
            </div>

            {/* Accumulator AC */}
            <div style={{ background: 'var(--bg-card-hover)', padding: '12px', borderRadius: '10px', border: activeBus === 'data' ? '2px solid #10b981' : '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>ACCUMULATOR (AC)</div>
              <div style={{ fontSize: '1.25rem', color: 'var(--accent-emerald)', fontWeight: 900, fontFamily: 'monospace' }}>{ac} (Dec)</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>ALU Rechenergebnis</div>
            </div>

            {/* Memory Address Register MAR */}
            <div style={{ background: 'var(--bg-card-hover)', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>MEM ADDR REG (MAR)</div>
              <div style={{ fontSize: '1.25rem', color: 'var(--accent-purple)', fontWeight: 900, fontFamily: 'monospace' }}>{mar}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Bus-Zieladresse</div>
            </div>
          </div>

          {/* ALU Block */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e1b4b, #311042)', 
            border: '1px solid #818cf8', 
            borderRadius: '10px', 
            padding: '12px', 
            textAlign: 'center' 
          }}>
            <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 800 }}>⚡ ARITHMETIC LOGIC UNIT (ALU)</span>
            <div style={{ fontSize: '0.85rem', color: '#e0e7ff', marginTop: '4px' }}>
              Operation: {ir.startsWith('ADD') ? '➕ ADDITION' : ir.startsWith('SUB') ? '➖ SUBTRAKTION' : '💤 IDLE / PASS-THROUGH'}
            </div>
          </div>
        </div>

        {/* RAM MATRIX */}
        <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '2px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={16} /> PRIMARY STORAGE (RAM 8-BYTE)
            </span>
            <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace' }}>Matrix: 0x00 - 0x07</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ram.map((cell, idx) => {
              const isCurrentPc = pc === idx;
              const isTargetMar = mar === cell.address;
              return (
                <div 
                  key={cell.address}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: isCurrentPc ? 'rgba(99, 102, 241, 0.25)' : isTargetMar ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card-hover)',
                    border: isCurrentPc ? '1px solid #6366f1' : isTargetMar ? '1px solid #38bdf8' : '1px solid #334155',
                    fontSize: '0.82rem',
                    fontFamily: 'monospace'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{cell.address}</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{cell.code}</span>
                  </div>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>Val: {cell.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bus Activity & Terminal Log Output */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid #1e293b', padding: '16px', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', marginBottom: '10px' }}>
          <Terminal size={14} /> CPU Instruction Execution Log Stream
        </div>

        <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.84rem' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ color: log.includes('HLT') ? 'var(--accent-emerald)' : log.includes('EXECUTE') ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>
              &gt; {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
