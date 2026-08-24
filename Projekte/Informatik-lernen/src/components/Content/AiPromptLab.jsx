import React, { useState } from 'react';
import { Bot, Sparkles, CheckCircle2, AlertTriangle, Code, Lightbulb } from 'lucide-react';

export default function AiPromptLab() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: '1. Effektive Prompts formulieren (System & Kontext)',
      badPrompt: 'Schreib mir Code für eine Webseite.',
      goodPrompt: 'Agiere als Senior React Entwickler. Erstelle eine barrierefreie Navbar Komponente in React mit TailwindCSS, Dark-Mode Toggle und ARIA-Labeling.',
      rule: 'Gib KI-Tools immer eine Rolle, genaue Technologien, Randbedingungen und das gewünschte Format vor.'
    },
    {
      title: '2. AI Code Review & Refactoring',
      badPrompt: 'Warum geht mein Code nicht?',
      goodPrompt: 'Prüfe diesen JavaScript-Code auf Speicherlecks (Memory Leaks), XSS-Sicherheitslücken und Performance-Engpässe. Erkläre jeden Bug Schritt für Schritt.',
      rule: 'Nutze KI gezielt zur Sicherheitsprüfung und zum Finden von Edge Cases.'
    },
    {
      title: '3. KI-Halluzinationen & Ethik beachten',
      badPrompt: 'Kopiere den generierten Code direkt ungeprüft in Produktion.',
      goodPrompt: 'Hinterfrage KI-generierte Code-Bibliotheken, überprüfe Import-Pfade und teste Funktionen immer mit eigenen Unit-Tests.',
      rule: 'Vertraue der KI nicht blind. Verifiziere immer alle Abhängigkeiten und API-Methoden.'
    }
  ];

  const current = steps[activeStep];

  return (
    <div className="glass-panel" style={{ padding: '32px', border: '2px solid var(--accent-primary)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span className="badge badge-indigo">KI & AI Engineering Workshop</span>
        <span style={{ fontSize: '0.88rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
          Lektion {activeStep + 1} von {steps.length}
        </span>
      </div>

      <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Bot size={30} style={{ color: 'var(--accent-primary)' }} /> KI-Nutzung & Prompt Engineering Lab
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.05rem' }}>
        Lerne wie du KI-Tools (ChatGPT, GitHub Copilot, Claude) professionell und sicher als Entwickler einsetzt.
      </p>

      {/* Step Selector Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {steps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            style={{
              minHeight: '40px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: activeStep === idx ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: activeStep === idx ? '#ffffff' : 'var(--text-main)',
              border: activeStep === idx ? 'none' : '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
          >
            Lektion {idx + 1}
          </button>
        ))}
      </div>

      {/* Comparison View (Bad vs Good Prompt) */}
      <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
        {current.title}
      </h3>

      <div className="grid-responsive" style={{ gap: '16px', marginBottom: '24px' }}>
        {/* Bad Prompt */}
        <div style={{ background: 'rgba(225, 29, 72, 0.1)', border: '2px solid var(--accent-rose)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', marginBottom: '8px' }}>
            <AlertTriangle size={18} /> Ungünstiger / Schlechter Prompt:
          </strong>
          <code style={{ background: '#0f172a', color: '#f8fafc', padding: '12px', borderRadius: '6px', display: 'block', fontSize: '0.9rem' }}>
            "{current.badPrompt}"
          </code>
        </div>

        {/* Good Prompt */}
        <div style={{ background: 'rgba(5, 150, 105, 0.1)', border: '2px solid var(--accent-emerald)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', marginBottom: '8px' }}>
            <CheckCircle2 size={18} /> Professioneller / Perfekter Prompt:
          </strong>
          <code style={{ background: '#0f172a', color: '#f8fafc', padding: '12px', borderRadius: '6px', display: 'block', fontSize: '0.9rem' }}>
            "{current.goodPrompt}"
          </code>
        </div>
      </div>

      {/* Gold Rule */}
      <div style={{ background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-amber)', padding: '16px 20px', borderRadius: '4px' }}>
        <strong style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Lightbulb size={18} /> Goldene KI-Regel:
        </strong>
        <p style={{ margin: 0, fontSize: '0.98rem', color: 'var(--text-main)' }}>
          {current.rule}
        </p>
      </div>
    </div>
  );
}
