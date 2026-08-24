import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Layers, Cpu, Database, Award, Info, Code2 } from 'lucide-react';
import { DEBUGGER_SCENARIOS } from '../../data/nextGenLabsData';
import { useStore } from '../../store/useStore';

export default function CodeExecutionDebuggerLab() {
  const { awardXP } = useStore();
  const [selectedScenarioId, setSelectedScenarioId] = useState(DEBUGGER_SCENARIOS[0].id);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const scenario = DEBUGGER_SCENARIOS.find(s => s.id === selectedScenarioId) || DEBUGGER_SCENARIOS[0];
  const step = scenario.steps[currentStepIdx] || scenario.steps[0];
  const codeLines = scenario.code.split('\n');

  const handleNextStep = () => {
    if (currentStepIdx < scenario.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else if (!isCompleted) {
      setIsCompleted(true);
      awardXP(60, 'Lab Meister: Code Debugger');
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsCompleted(false);
  };

  const handleSelectScenario = (id) => {
    setSelectedScenarioId(id);
    setCurrentStepIdx(0);
    setIsCompleted(false);
  };

  return (
    <div className="lab-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '20px', color: '#818cf8', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
            <Cpu size={16} /> V8 Engine Step-by-Step Runtime Inspector
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Code Execution & Memory Debugger
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Verstehe die V8 Engine: Beobachte Call Stack, Closure Scopes und Heap-Mutationen Zeile für Zeile.
          </p>
        </div>

        {/* Scenario Picker */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {DEBUGGER_SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: selectedScenarioId === s.id ? '2px solid #6366f1' : '1px solid var(--border-color, rgba(255,255,255,0.1))',
                background: selectedScenarioId === s.id ? 'rgba(99, 102, 241, 0.2)' : 'var(--card-bg, #1e293b)',
                color: selectedScenarioId === s.id ? '#a5b4fc' : 'var(--text-secondary, #94a3b8)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.88rem',
                transition: 'all 0.2s ease'
              }}
            >
              {s.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Code Editor & Execution State */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left: Code Viewer with Highlighted Active Line */}
        <div style={{ background: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 'bold' }}>
              <Code2 size={18} color="#60a5fa" />
              <span>{scenario.title}</span>
            </div>
            <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#94a3b8' }}>
              Zeile {step.line}
            </span>
          </div>

          <div style={{ padding: '16px 0', fontFamily: 'Fira Code, monospace', fontSize: '0.92rem', lineHeight: '1.6', overflowX: 'auto', flex: 1 }}>
            {codeLines.map((lineText, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === step.line;
              return (
                <div
                  key={lineNum}
                  style={{
                    display: 'flex',
                    padding: '2px 16px',
                    background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    borderLeft: isActive ? '4px solid #6366f1' : '4px solid transparent',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <span style={{ width: '32px', color: isActive ? '#818cf8' : '#475569', userSelect: 'none', textAlign: 'right', marginRight: '16px', fontWeight: isActive ? 'bold' : 'normal' }}>
                    {lineNum}
                  </span>
                  <span style={{ color: isActive ? '#f8fafc' : '#cbd5e1', whiteSpace: 'pre' }}>
                    {lineText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stepper Controls */}
          <div style={{ padding: '14px 16px', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <button
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={15} /> Neustart
            </button>

            <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold' }}>
              Schritt {currentStepIdx + 1} von {scenario.steps.length}
            </div>

            <button
              onClick={handleNextStep}
              disabled={isCompleted}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '8px',
                background: isCompleted ? '#22c55e' : '#6366f1',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                border: 'none',
                cursor: isCompleted ? 'default' : 'pointer',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 size={16} /> Abgeschlossen (+60 XP)
                </>
              ) : (
                <>
                  <Play size={16} /> Nächster Schritt ({currentStepIdx + 1}/{scenario.steps.length}) <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Runtime State (Call Stack, Memory Heap, Scope Variables) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Explanation Alert */}
          <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: 'bold', marginBottom: '6px' }}>
              <Info size={18} />
              <span>Was passiert in diesem Schritt?</span>
            </div>
            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.5' }}>
              {step.explanation}
            </p>
          </div>

          {/* Call Stack Visualizer */}
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.92rem', fontWeight: 'bold', marginBottom: '12px' }}>
              <Layers size={18} color="#38bdf8" />
              <span>Call Stack (LIFO: Last In, First Out)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '6px', minHeight: '90px' }}>
              <AnimatePresence>
                {step.stack.map((frame, index) => (
                  <motion.div
                    key={`${frame}-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      padding: '8px 12px',
                      background: index === step.stack.length - 1 ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{frame}</span>
                    {index === step.stack.length - 1 && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                        Active Top Frame
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Variables & Heap Inspector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Local Variables */}
            <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '14px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={15} /> Local Scope
              </div>
              {Object.keys(step.vars).length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>Keine lokalen Variablen</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(step.vars).map(([k, v]) => (
                    <div key={k} style={{ fontSize: '0.82rem', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      <span style={{ color: '#93c5fd' }}>{k}</span>: <span style={{ color: '#86efac' }}>{JSON.stringify(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Heap Objects */}
            <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '14px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#c084fc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} /> Heap Memory
              </div>
              {Object.keys(step.heap).length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>Keine dynamischen Heap-Objekte</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(step.heap).map(([ptr, obj]) => (
                    <div key={ptr} style={{ fontSize: '0.82rem', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      <span style={{ color: '#f472b6' }}>{ptr}</span>: <span style={{ color: '#e2e8f0' }}>{JSON.stringify(obj)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
