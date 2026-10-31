import React, { useState } from 'react';
import { VOCABULARY_LIST } from '../../data/vocabularyData';
import { BookMarked, Search, Volume2, X } from 'lucide-react';

export default function VocabularyTrainerModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVocabId, setActiveVocabId] = useState(VOCABULARY_LIST[0].id);

  if (!isOpen) return null;

  const filteredVocab = VOCABULARY_LIST.filter(v =>
    v.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.german.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeVocab = VOCABULARY_LIST.find(v => v.id === activeVocabId) || VOCABULARY_LIST[0];

  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.85)',
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
          maxWidth: '900px',
          width: '100%',
          maxHeight: '88vh',
          background: 'var(--bg-card)',
          border: '2px solid var(--accent-teal)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
              <BookMarked size={28} style={{ color: 'var(--accent-teal)' }} /> IT-Vokabeltrainer & Fachbegriffe
            </h2>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Englische & deutsche IT-Fachausdrücke verstehen und lernen
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

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Vokabeln durchsuchen (z. B. RAG, Zero Trust, ORM)..."
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

        {/* Grid List & Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 2fr', gap: '20px', flex: 1, overflow: 'hidden' }}>
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredVocab.map((v) => (
              <div
                key={v.id}
                onClick={() => setActiveVocabId(v.id)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: activeVocabId === v.id ? 'rgba(13, 148, 136, 0.15)' : 'var(--bg-secondary)',
                  border: activeVocabId === v.id ? '2px solid var(--accent-teal)' : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)' }}>{v.term}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.german}</div>
              </div>
            ))}
          </div>

          {activeVocab && (
            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-teal">{activeVocab.category}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => handleSpeak(activeVocab.term)} style={{ gap: '6px' }}>
                  <Volume2 size={16} /> Aussprache (US)
                </button>
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                {activeVocab.term}
              </h3>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--accent-teal)', marginBottom: '16px' }}>
                🇩🇪 {activeVocab.german}
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Definition & Bedeutung:</strong>
                <p style={{ margin: 0, fontSize: '0.96rem', lineHeight: '1.6' }}>{activeVocab.definition}</p>
              </div>

              <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)' }}>
                <strong style={{ fontSize: '0.88rem', color: 'var(--accent-primary)', display: 'block', marginBottom: '4px' }}>💡 Beispielsatz:</strong>
                <p style={{ margin: 0, fontSize: '0.95rem', fontStyle: 'italic' }}>"{activeVocab.example}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
