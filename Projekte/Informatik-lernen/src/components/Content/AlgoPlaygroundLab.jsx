import React, { useState, useEffect } from 'react';
import { ALGORITHM_DESCRIPTIONS } from '../../data/algorithmData';
import { Play, Pause, RotateCcw, Cpu, Zap, Award } from 'lucide-react';

export default function AlgoPlaygroundLab({ onRewardXP }) {
  const [array, setArray] = useState([45, 12, 89, 34, 67, 23, 90, 11, 55, 78]);
  const [activeAlgo, setActiveAlgo] = useState('quicksort');
  const [activeIndices, setActiveIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(300);

  const resetArray = () => {
    const newArr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 85) + 10);
    setArray(newArr);
    setActiveIndices([]);
    setSortedIndices([]);
    setIsRunning(false);
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Bubble / Selection Sort Simulation Step-by-Step for visual demo
  const runSortingAnimation = async () => {
    setIsRunning(true);
    let arr = [...array];
    let n = arr.length;
    let sorted = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setActiveIndices([j, j + 1]);
        await sleep(speed);

        if (arr[j] > arr[j + 1]) {
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setArray([...arr]);
        }
      }
      sorted.push(n - i - 1);
      setSortedIndices([...sorted]);
    }
    setActiveIndices([]);
    setIsRunning(false);
    if (onRewardXP) onRewardXP(35);
  };

  const info = ALGORITHM_DESCRIPTIONS[activeAlgo] || ALGORITHM_DESCRIPTIONS.quicksort;

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <Cpu size={14} /> Algorithmen & Datenstrukturen
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            ⚡ Interaktiver Algorithmen- & Step-Visualisierer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Beobachte Sortier- & Suchalgorithmen Schritt-für-Schritt in Echtzeit.
          </p>
        </div>

        {/* Algo Selection */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.keys(ALGORITHM_DESCRIPTIONS).map((key) => (
            <button
              key={key}
              onClick={() => { setActiveAlgo(key); resetArray(); }}
              className={`btn ${activeAlgo === key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              {ALGORITHM_DESCRIPTIONS[key].title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', borderLeft: '4px solid var(--accent-indigo)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: '700' }}>
          {info.title}
        </h3>
        <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          {info.description}
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
          <span className="badge badge-indigo">Zeitkomplexität: {info.timeComplexity}</span>
          <span className="badge badge-indigo">Speicherkomplexität: {info.spaceComplexity}</span>
        </div>
      </div>

      {/* Array Bars Visualization */}
      <div style={{ background: '#0f172a', padding: '32px 24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', minHeight: '260px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '12px' }}>
        {array.map((val, idx) => {
          let barBg = '#38bdf8'; // Default sky blue
          if (activeIndices.includes(idx)) barBg = '#f59e0b'; // Comparing (Amber)
          if (sortedIndices.includes(idx)) barBg = '#10b981'; // Sorted (Emerald)

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '48px' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px' }}>{val}</span>
              <div
                style={{
                  width: '100%',
                  height: `${val * 2.2}px`,
                  background: barBg,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.2s ease, background 0.2s ease'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Control Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={runSortingAnimation} disabled={isRunning}>
            <Play size={16} /> {isRunning ? 'Sortiert...' : 'Start Animation'}
          </button>
          <button className="btn btn-secondary" onClick={resetArray} disabled={isRunning}>
            <RotateCcw size={16} /> Zufalls-Array
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Geschwindigkeit:</span>
          <input
            type="range"
            min="50"
            max="600"
            step="50"
            value={650 - speed}
            onChange={(e) => setSpeed(650 - Number(e.target.value))}
            style={{ accentColor: 'var(--accent-indigo)' }}
          />
        </div>
      </div>
    </div>
  );
}
