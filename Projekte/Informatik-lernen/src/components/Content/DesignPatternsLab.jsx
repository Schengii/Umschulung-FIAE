import React, { useState } from 'react';
import { Layers, CheckCircle2, Code2, Sparkles, RefreshCw } from 'lucide-react';

export default function DesignPatternsLab() {
  const patterns = [
    {
      id: 'singleton',
      name: 'Singleton Pattern',
      category: 'Erzeugungsmuster (Creational)',
      desc: 'Stellt sicher, dass eine Klasse genau eine einzige Instanz besitzt (z. B. Datenbankverbindung).',
      badCode: `// Bad: Erzeugt jedes Mal ein neues Objekt
class Database {
  constructor() {
    this.connection = "Verbindung 1";
  }
}`,
      goodCode: `// Good: Singleton Pattern
class Database {
  static instance;
  constructor() {
    if (Database.instance) return Database.instance;
    this.connection = "Einzige Verbindung";
    Database.instance = this;
  }
}`
    },
    {
      id: 'observer',
      name: 'Observer Pattern',
      category: 'Verhaltensmuster (Behavioral)',
      desc: 'Benachrichtigt Abonnenten automatisch über Zustandsänderungen (z. B. Event-Handling in React).',
      badCode: `// Bad: Manuelles Prüfen in Dauerschleife
while(true) {
  if (dataChanged) updateUI();
}`,
      goodCode: `// Good: Observer Pattern (Publish/Subscribe)
class Subject {
  constructor() { this.observers = []; }
  subscribe(fn) { this.observers.push(fn); }
  notify(data) { this.observers.forEach(fn => fn(data)); }
}`
    }
  ];

  const [activePatternId, setActivePatternId] = useState(patterns[0].id);
  const pattern = patterns.find(p => p.id === activePatternId) || patterns[0];

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={32} style={{ color: 'var(--accent-primary)' }} /> Software Design Patterns & Refactoring Lab
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Lerne bewährte Entwurfsmuster (Singleton, Observer, Factory, Strategy) für sauberen & skalierbaren Code.
        </p>
      </div>

      {/* Pattern Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {patterns.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePatternId(p.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: activePatternId === p.id ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activePatternId === p.id ? '#ffffff' : 'var(--text-main)',
              border: activePatternId === p.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Selected Pattern Details */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>{pattern.category}</span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
          {pattern.name}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', marginBottom: '24px' }}>
          {pattern.desc}
        </p>

        {/* Refactoring Comparison */}
        <div className="grid-responsive" style={{ gap: '16px' }}>
          <div className="code-window">
            <div className="code-header" style={{ color: 'var(--accent-rose)' }}>
              ❌ Vorher (Bad Practice)
            </div>
            <pre className="code-body">
              <code>{pattern.badCode}</code>
            </pre>
          </div>

          <div className="code-window">
            <div className="code-header" style={{ color: 'var(--accent-emerald)' }}>
              ✅ Nachher mit Design Pattern
            </div>
            <pre className="code-body">
              <code>{pattern.goodCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
