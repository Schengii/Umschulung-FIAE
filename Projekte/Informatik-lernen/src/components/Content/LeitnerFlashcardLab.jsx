import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

export const LEITNER_FLASHCARDS = [
  { id: 'l1', q: 'Was bedeutet die Abkürzung EVA im Grundprinzip der DV?', a: 'Eingabe, Verarbeitung, Ausgabe', box: 1 },
  { id: 'l2', q: 'Welche Schicht des OSI-Modells ist für das IP-Routing verantwortlich?', a: 'Schicht 3 (Network Layer / Vermittlungsschicht)', box: 1 },
  { id: 'l3', q: 'Was ist der Hauptunterschied zwischen symmetrischer und asymmetrischer Verschlüsselung?', a: 'Symmetrisch nutzt 1 gemeinsamen Schlüssel; Asymmetrisch nutzt ein Schlüsselpaar (Public/Private Key).', box: 1 },
  { id: 'l4', q: 'Was beschreibt die Normalisierung bis zur 3. Normalform (3NF)?', a: 'Freiheit von redundanten Attributen und transitiven Abhängigkeiten.', box: 1 }
];

export default function LeitnerFlashcardLab({ onRewardXP }) {
  const [cards, setCards] = useState(LEITNER_FLASHCARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ remembered: 0, failed: 0 });

  const currentCard = cards[currentIdx];

  const handleRate = (remembered) => {
    const updated = cards.map((card, idx) => {
      if (idx !== currentIdx) return card;
      return { ...card, box: remembered ? Math.min(5, card.box + 1) : 1 }; // Drop back to Box 1 on failure
    });

    if (remembered) {
      setStats({ ...stats, remembered: stats.remembered + 1 });
      if (onRewardXP) onRewardXP(15);
    } else {
      setStats({ ...stats, failed: stats.failed + 1 });
    }

    setCards(updated);
    setShowAnswer(false);
    setCurrentIdx((currentIdx + 1) % cards.length);
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <BookOpen size={14} /> Adaptives Spaced Repetition Lernen
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            🧠 Leitner Spaced Repetition Flashcard Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Wiederhole schwere IHK-Fragen in optimierten Zeitabständen (Box 1 - 5).
          </p>
        </div>
      </div>

      {/* Card Box Status Indicators */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[1, 2, 3, 4, 5].map((boxNum) => (
          <div key={boxNum} style={{ flex: 1, padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Box {boxNum}</span>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>
              {cards.filter(c => c.box === boxNum).length}
            </div>
          </div>
        ))}
      </div>

      {/* Flashcard Main View */}
      <div
        onClick={() => setShowAnswer(!showAnswer)}
        style={{
          background: 'var(--bg-primary)',
          padding: '40px 24px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify: 'center',
          cursor: 'pointer',
          border: '2px dashed var(--accent-indigo)',
          marginBottom: '24px'
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Karte {currentIdx + 1} von {cards.length} (Klick zum Umdrehen)
        </span>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', margin: '8px 0' }}>
          {showAnswer ? currentCard.a : currentCard.q}
        </h3>
        <span style={{ fontSize: '0.8rem', color: showAnswer ? 'var(--accent-emerald)' : 'var(--accent-indigo)', marginTop: '8px', fontWeight: '600' }}>
          {showAnswer ? '✅ Antwort' : '❓ Frage (Klicken für Antwort)'}
        </span>
      </div>

      {/* Rating Buttons */}
      {showAnswer && (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => handleRate(false)} style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }}>
            ❌ Nicht gewusst (Zurück in Box 1)
          </button>
          <button className="btn btn-primary" onClick={() => handleRate(true)}>
            ✅ Gewusst (+1 Box Höher)
          </button>
        </div>
      )}
    </div>
  );
}
