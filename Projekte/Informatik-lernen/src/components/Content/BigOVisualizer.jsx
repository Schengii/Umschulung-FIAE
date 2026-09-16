import React, { useState } from 'react';
import { Activity } from 'lucide-react';

export default function BigOVisualizer() {
  const [elementCount, setElementCount] = useState(10);

  const complexities = [
    { name: 'O(1)', title: 'Konstante Zeit', desc: 'Direkter Zugriff (z. B. Array-Index access). Benötigt immer 1 Schritt.', color: 'var(--accent-emerald)', steps: 1 },
    { name: 'O(log n)', title: 'Logarithmisch', desc: 'Binäre Suche (Binary Search). Teilt den Suchraum halbiert in jedem Schritt.', color: 'var(--accent-teal)', steps: Math.ceil(Math.log2(elementCount || 1)) },
    { name: 'O(n)', title: 'Linear', desc: 'Lineare Suche (Linear Search) & einfache Schleife. Skaliert proportional.', color: 'var(--accent-amber)', steps: elementCount },
    { name: 'O(n log n)', title: 'Log-Linear', desc: 'Effiziente Sortieralgorithmen (QuickSort, MergeSort).', color: 'var(--accent-primary)', steps: Math.ceil(elementCount * Math.log2(elementCount || 1)) },
    { name: 'O(n²)', title: 'Quadratisch', desc: 'Doppelt verschachtelte Schleifen (z. B. Bubble Sort). Skaliert quadratisch.', color: 'var(--accent-rose)', steps: elementCount * elementCount }
  ];

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={32} style={{ color: 'var(--accent-primary)' }} /> Big-O Notation & Algorithmen Komplexität
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Visualisiere wie sich die Laufzeit und Rechenschritte von Algorithmen bei wachsender Eingabegröße n verändern.
        </p>
      </div>

      {/* Input Slider */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <label style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
          Eingabegröße (Anzahl Elemente n): <span style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}>n = {elementCount}</span>
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={elementCount}
          onChange={(e) => setElementCount(Number(e.target.value))}
          style={{ width: '100%', height: '8px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
        />
      </div>

      {/* Visual Complexity Comparison Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {complexities.map((comp, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '20px', borderLeft: `6px solid ${comp.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <div>
                <span className="badge" style={{ background: `${comp.color}20`, color: comp.color, border: `1px solid ${comp.color}` }}>
                  {comp.name}
                </span>
                <strong style={{ marginLeft: '10px', fontSize: '1.1rem', color: 'var(--text-main)' }}>{comp.title}</strong>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: comp.color }}>
                {comp.steps} Schritte
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>
              {comp.desc}
            </p>

            {/* Visual Bar */}
            <div style={{ width: '100%', height: '12px', background: 'var(--bg-tertiary)', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (comp.steps / 2500) * 100 + 2)}%`,
                  height: '100%',
                  background: comp.color,
                  borderRadius: '6px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
