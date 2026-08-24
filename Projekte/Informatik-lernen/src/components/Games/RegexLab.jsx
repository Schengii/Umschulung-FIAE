import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, Award, Sparkles, Code } from 'lucide-react';

export default function RegexLab({ onCompleteGame }) {
  const challenges = [
    {
      id: 1,
      title: 'Level 1: E-Mail Adressen validieren',
      description: 'Erstelle ein RegEx-Muster, das gültige E-Mail-Adressen erkennt (z. B. user@example.com).',
      sampleText: 'Kontakt: dev@test.de oder info@company.com - Falsch: test@, @domain.com',
      expectedMatches: ['dev@test.de', 'info@company.com'],
      hint: 'Verwende `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}`'
    },
    {
      id: 2,
      title: 'Level 2: IPv4 Adressen extrahieren',
      description: 'Finde alle IPv4-Adressen im Text (z. B. 192.168.1.1).',
      sampleText: 'Server IPs: 192.168.1.1 und 10.0.0.254 - Kein Match: 999.999.999.999',
      expectedMatches: ['192.168.1.1', '10.0.0.254'],
      hint: 'Verwende `\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b`'
    }
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [patternInput, setPatternInput] = useState('');
  const [flagsInput, setFlagsInput] = useState('g');
  const [userMatches, setUserMatches] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const level = challenges[currentLevel];

  const handleTestRegex = () => {
    try {
      const regex = new RegExp(patternInput, flagsInput);
      const matches = level.sampleText.match(regex) || [];
      setUserMatches(matches);

      const success = level.expectedMatches.every(m => matches.includes(m)) && matches.length === level.expectedMatches.length;
      setIsSuccess(success);

      if (success) {
        onCompleteGame('regex_master', 60);
      }
    } catch (e) {
      setUserMatches(['Ungültiges RegEx-Muster!']);
      setIsSuccess(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', border: '2px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span className="badge badge-indigo">RegEx Lab & Pattern Tester</span>
        <span style={{ fontSize: '0.88rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
          {level.title}
        </span>
      </div>

      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
        🔍 Reguläre Ausdrücke (RegEx) Lab
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '1rem' }}>
        {level.description}
      </p>

      {/* Test Sample Text Box */}
      <div style={{ background: '#0f172a', color: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontFamily: 'var(--font-code)', fontSize: '0.92rem' }}>
        <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Test-Text:</strong>
        {level.sampleText}
      </div>

      {/* RegEx Input Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', border: '2px solid var(--accent-primary)', borderRadius: 'var(--radius-md)', flex: 1, padding: '0 12px' }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1.2rem' }}>/</span>
          <input
            type="text"
            placeholder="z. B. [a-z]+"
            value={patternInput}
            onChange={(e) => setPatternInput(e.target.value)}
            style={{
              flex: 1,
              minHeight: '44px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-code)',
              fontSize: '1rem',
              outline: 'none',
              padding: '0 8px'
            }}
          />
          <span style={{ color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1.2rem' }}>/</span>
          <input
            type="text"
            value={flagsInput}
            onChange={(e) => setFlagsInput(e.target.value)}
            style={{
              width: '40px',
              minHeight: '44px',
              border: 'none',
              background: 'transparent',
              color: 'var(--accent-amber)',
              fontFamily: 'var(--font-code)',
              fontSize: '1rem',
              outline: 'none',
              textAlign: 'center'
            }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleTestRegex} style={{ minHeight: '48px' }}>
          <Search size={18} /> Testen
        </button>
      </div>

      {/* Output Results */}
      <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <strong style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          Treffer (Matches):
        </strong>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {userMatches.length > 0 ? (
            userMatches.map((m, idx) => (
              <span key={idx} className="badge badge-teal" style={{ fontSize: '0.9rem' }}>
                {m}
              </span>
            ))
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keine Treffer gefunden.</span>
          )}
        </div>
      </div>

      {/* Status Feedback */}
      {isSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5, 150, 105, 0.15)', border: '2px solid var(--accent-emerald)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '1.1rem' }}>
            <CheckCircle2 size={24} /> Level erfolgreich gelöst! (+60 XP)
          </div>
          {currentLevel < challenges.length - 1 && (
            <button className="btn btn-success btn-sm" onClick={() => { setCurrentLevel(prev => prev + 1); setPatternInput(''); setIsSuccess(false); }}>
              Nächstes Level
            </button>
          )}
        </div>
      )}
    </div>
  );
}
