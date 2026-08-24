import React, { useState } from 'react';
import { PROGRAMMING_LANGUAGES } from '../../data/languageData';
import { Code2, CheckCircle2, ArrowRight, Sparkles, BookOpen, Terminal, Copy, Check } from 'lucide-react';

export default function LanguageAcademy() {
  const [selectedLangId, setSelectedLangId] = useState(PROGRAMMING_LANGUAGES[0].id);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const activeLang = PROGRAMMING_LANGUAGES.find(l => l.id === selectedLangId) || PROGRAMMING_LANGUAGES[0];

  const handleCopyCode = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--gradient-cyber)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Code2 size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
              Programmiersprachen &amp; Frameworks Academy
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, marginTop: '2px' }}>
              Praxisorientierte Leitfäden im W3Schools-Stil für Python, JavaScript, TypeScript, Java, C#, Go und Rust.
            </p>
          </div>
        </div>
      </div>

      {/* Language Selector Pills */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '6px' }}>
        {PROGRAMMING_LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setSelectedLangId(lang.id)}
            style={{
              minHeight: '44px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.92rem',
              background: selectedLangId === lang.id ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: selectedLangId === lang.id ? '#ffffff' : 'var(--text-main)',
              border: selectedLangId === lang.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              boxShadow: selectedLangId === lang.id ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{lang.icon}</span>
            <span>{lang.name.split('(')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Selected Language Details */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <span className="badge badge-teal" style={{ fontSize: '0.82rem', fontWeight: 800 }}>
            {activeLang.badge || 'Enterprise Standard'}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {activeLang.topics?.length || 0} didaktische Kernmodule
          </span>
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '8px', color: 'var(--text-main)' }}>
          {activeLang.icon} {activeLang.name}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: '1.6', marginBottom: '28px' }}>
          {activeLang.summary || activeLang.description}
        </p>

        {/* Modular Topic Cards (W3Schools Style) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeLang.topics && activeLang.topics.map((topic, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                  {topic.title}
                </h3>
                <button
                  onClick={() => handleCopyCode(topic.code, idx)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: copiedIndex === idx ? 'var(--accent-teal)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Code kopieren"
                >
                  {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                  {copiedIndex === idx ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '16px' }}>
                {topic.desc}
              </p>

              {/* Code Snippet Box */}
              <div className="code-window" style={{ margin: 0 }}>
                <div className="code-header" style={{ padding: '8px 14px', fontSize: '0.78rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={14} color="var(--accent-primary)" /> Syntax &amp; Ausführung
                  </span>
                  <span>{activeLang.name.split(' ')[0]}</span>
                </div>
                <pre className="code-body" style={{ margin: 0, padding: '16px', fontSize: '0.88rem', lineHeight: '1.5' }}>
                  <code>{topic.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
