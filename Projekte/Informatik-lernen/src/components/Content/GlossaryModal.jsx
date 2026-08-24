import React, { useState } from 'react';
import { GLOSSARY_TERMS } from '../../data/glossaryData';
import { BookOpen, Search, X, Volume2, Play, Pause, Sparkles, Filter } from 'lucide-react';

export default function GlossaryModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTermId, setActiveTermId] = useState(GLOSSARY_TERMS[0].id);

  // Audio TTS state
  const [speakingId, setSpeakingId] = useState(null);

  if (!isOpen) return null;

  const categories = ['all', ...new Set(GLOSSARY_TERMS.map((t) => t.category))];

  const filteredTerms = GLOSSARY_TERMS.filter((t) => {
    const matchesSearch = t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.simpleExplanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeTerm = GLOSSARY_TERMS.find((t) => t.id === activeTermId) || GLOSSARY_TERMS[0];

  const handleSpeak = (termObj) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (speakingId === termObj.id) {
      setSpeakingId(null);
      return;
    }

    const textToRead = `${termObj.term}. Einfach erklärt: ${termObj.simpleExplanation}. Experten-Details: ${termObj.expertExplanation}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingId(termObj.id);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '960px',
          width: '100%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          border: '2px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
              <BookOpen size={28} style={{ color: 'var(--accent-primary)' }} /> Interaktives IT-Lexikon & Fachbegriffe
            </h2>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Einfache & Experten-Erklärungen für jedes Alter und Vorwissen
            </span>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'var(--bg-tertiary)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Schließen"
          >
            <X size={22} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Begriffe suchen (z. B. API, SQL, Hashes, Binär)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                minHeight: '44px',
                paddingLeft: '42px',
                paddingRight: '16px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  minHeight: '44px',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  background: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                  border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat === 'all' ? 'Alle Kategorien' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Main Grid (Sidebar List + Detail View) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
          {/* Terms List */}
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '6px' }}>
            {filteredTerms.map((t) => {
              const isSelected = activeTermId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTermId(t.id)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(79, 70, 229, 0.12)' : 'var(--bg-secondary)',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                    {t.term}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                    <span className="badge badge-indigo">{t.category}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Term Detail */}
          {activeTerm && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-color)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-teal">{activeTerm.difficulty}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSpeak(activeTerm)}
                  style={{ gap: '6px' }}
                  title="Begriff Vorlesen"
                >
                  {speakingId === activeTerm.id ? <Pause size={16} /> : <Volume2 size={16} />}
                  <span>{speakingId === activeTerm.id ? 'Stopp' : 'Vorlesen'}</span>
                </button>
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                {activeTerm.term}
              </h3>

              {/* Simple Explanation for Beginners */}
              <div style={{ background: 'rgba(13, 148, 136, 0.1)', borderLeft: '4px solid var(--accent-teal)', padding: '14px 18px', borderRadius: '4px' }}>
                <strong style={{ display: 'block', color: 'var(--accent-teal)', fontSize: '0.88rem', marginBottom: '4px' }}>
                  🌱 Einfach erklärt (Für Einsteiger):
                </strong>
                <p style={{ margin: 0, fontSize: '0.96rem', lineHeight: '1.6' }}>
                  {activeTerm.simpleExplanation}
                </p>
              </div>

              {/* Expert / Technical Explanation */}
              <div style={{ background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-primary)', padding: '14px 18px', borderRadius: '4px' }}>
                <strong style={{ display: 'block', color: 'var(--accent-primary)', fontSize: '0.88rem', marginBottom: '4px' }}>
                  ⚡ Experten-Details (Für Azubis & Devs):
                </strong>
                <p style={{ margin: 0, fontSize: '0.96rem', lineHeight: '1.6' }}>
                  {activeTerm.expertExplanation}
                </p>
              </div>

              {/* Example Code / Usage */}
              {activeTerm.example && (
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    💡 Praxis-Beispiel:
                  </strong>
                  <code style={{ width: '100%', display: 'block', padding: '12px', background: '#0f172a', color: '#f8fafc', borderRadius: '8px', fontSize: '0.9rem' }}>
                    {activeTerm.example}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
