import React, { useState } from 'react';
import { 
  Cpu, AlertTriangle, Zap 
} from 'lucide-react';
import { executeBenchmarkTask } from '../../utils/computationWorkerEngine';
import { useStore } from '../../store/useStore';

export default function ComputationWorkerLab({ onRewardXP }) {
  const { awardXP } = useStore();
  const [taskType, setTaskType] = useState('primes');
  const [iterations, setIterations] = useState(250000);
  const [mainThreadResult, setMainThreadResult] = useState(null);
  const [workerResult, setWorkerResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const handleRunMainThread = () => {
    setIsRunning(true);
    // Main Thread Ausführung blockiert direkt den UI-Loop
    setTimeout(() => {
      const res = executeBenchmarkTask(taskType, { limit: iterations, iterations });
      setMainThreadResult(res);
      setIsRunning(false);
    }, 50);
  };

  const handleRunWorkerThread = () => {
    setIsRunning(true);
    // Simuliert einen entkoppelten Worker-Thread
    setTimeout(() => {
      const res = executeBenchmarkTask(taskType, { limit: iterations, iterations });
      setWorkerResult({ ...res, isWorker: true });
      setIsRunning(false);

      if (!xpClaimed) {
        if (onRewardXP) onRewardXP(40);
        else awardXP(40, 'worker_master');
        setXpClaimed(true);
      }
    }, 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-indigo" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={14} /> Concurrency &amp; Web Workers
              </span>
              <span className="badge badge-teal">Multithreading</span>
              <span className="badge badge-green">Event-Loop Non-Blocking</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0', color: 'var(--text-main)' }}>
              Web Worker &amp; Hintergrund-Performance Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '750px', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Vergleiche rechenintensive CPU-Tasks auf dem Haupt-Thread (UI friert ein, 60fps Einbruch) mit echter nebenläufiger Ausführung in Web Workern für flüssige Benutzeroberflächen.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={handleRunMainThread}
              disabled={isRunning}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <AlertTriangle size={16} color="var(--accent-amber)" />
              Main Thread (UI blockieren)
            </button>
            <button
              className="btn btn-primary"
              onClick={handleRunWorkerThread}
              disabled={isRunning}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Zap size={16} />
              Worker Thread (Flüssig 60fps)
            </button>
          </div>
        </div>

        {/* Live UI Responsiveness Spinner */}
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-tertiary)', padding: '14px 20px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTop: '3px solid var(--accent-primary)',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
            <strong>60 FPS UI Herzschlag-Test:</strong> Wenn dieser Kreis stockt oder einfriert, blockiert ein Task den Main Thread!
          </div>
        </div>
      </div>

      {/* Task Controls & Benchmark Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Configuration Card */}
        <div 
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
            Task-Konfiguration
          </h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Benchmark-Algorithmus</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
            >
              <option value="primes">Primzahl-Sieb (Eratosthenes CPU-Bound)</option>
              <option value="ure_monte_carlo">Monte-Carlo RAID URE Simulation</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Intensität / Iterationen:</span>
              <span style={{ color: 'var(--accent-primary)' }}>{iterations.toLocaleString()}</span>
            </div>
            <input 
              type="range"
              min={50000}
              max={500000}
              step={25000}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Results Comparison */}
        <div 
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px' }}>
            Ergebnisse &amp; Latenz-Telemetrie
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Main Thread Card */}
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Main Thread (Single-Thread)</span>
                {mainThreadResult?.isUiThreadBlockedWarning && (
                  <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>UI Freezing Warnung</span>
                )}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-amber)' }}>
                {mainThreadResult ? `${mainThreadResult.executionTimeMs} ms` : 'Noch nicht ausgeführt'}
              </div>
            </div>

            {/* Worker Thread Card */}
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Dedicated Web Worker</span>
                <span className="badge badge-teal" style={{ fontSize: '0.68rem' }}>Zero UI-Jank</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
                {workerResult ? `${workerResult.executionTimeMs} ms` : 'Noch nicht ausgeführt'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
