import React, { useState } from 'react';
import { Smartphone, ArrowRight, Award } from 'lucide-react';

export default function AppWorkshop({ onCompleteWorkshop }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Schritt 1: Projekt-Struktur & Komponenten planen',
      description: 'Definiere den Funktionsumfang der App (Task-Manager mit State, Kategorien und LocalStorage).',
      codeSnippet: `// Task Manager App Datenstruktur
const initialTask = {
  id: 1,
  title: "Informatik lernen",
  completed: false,
  category: "Lernen"
};`
    },
    {
      title: 'Schritt 2: State Management & Handler schreiben',
      description: 'Füge Funktionen zum Hinzufügen, Abhaken und Löschen von Tasks hinzu.',
      codeSnippet: `const [tasks, setTasks] = useState([]);

const addTask = (title) => {
  setTasks([...tasks, { id: Date.now(), title, completed: false }]);
};`
    },
    {
      title: 'Schritt 3: Web & App Deployment',
      description: 'Baue den Produktions-Build und erstelle ein PWA-Manifest für die App-Installation.',
      codeSnippet: `# Build Befehl
npm run build

# PWA manifest.json bereitstellen`
    }
  ];

  const step = steps[currentStep];

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <span className="badge badge-teal" style={{ marginBottom: '12px' }}>
          📱 Praxis-Workshop: App Entwickeln
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Smartphone size={32} style={{ color: 'var(--accent-primary)' }} /> Fullstack App-Entwicklungs Workshop
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Entwickle deine eigene interaktive Task-Manager Web & Mobile App Schritt für Schritt von A bis Z.
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            style={{
              flex: 1,
              minHeight: '44px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: currentStep === idx ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: currentStep === idx ? '#ffffff' : 'var(--text-main)',
              border: currentStep === idx ? 'none' : '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            {s.title.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-main)' }}>
          {step.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', marginBottom: '20px' }}>
          {step.description}
        </p>

        <div className="code-window" style={{ marginBottom: '24px' }}>
          <div className="code-header">
            <span>Workshop Code-Beispiel</span>
            <span>React App Logic</span>
          </div>
          <pre className="code-body">
            <code>{step.codeSnippet}</code>
          </pre>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentStep > 0 && (
            <button className="btn btn-secondary" onClick={() => setCurrentStep(prev => prev - 1)}>
              Zurück
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentStep(prev => prev + 1)} style={{ marginLeft: 'auto' }}>
              Nächster Schritt <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn btn-success" onClick={() => onCompleteWorkshop(100)} style={{ marginLeft: 'auto' }}>
              <Award size={20} /> Workshop Abschließen (+100 XP)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
