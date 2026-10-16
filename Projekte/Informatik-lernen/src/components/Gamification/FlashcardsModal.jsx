import React, { useState, useMemo, useEffect } from 'react';
import { FLASHCARDS_DATA } from '../../data/flashcardsData';
import { Layers, CheckCircle2, XCircle, X, Brain, Clock, Download } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { calculateSM2 } from '../../utils/srsAlgorithm';
import { exportToAnkiTsv, exportToCsv } from '../../utils/flashcardIoEngine';
import { getTodayDateKey } from '../../utils/storage';

export default function FlashcardsModal({ isOpen, onClose, onRewardXP }) {
  const { userState, updateSrsCard } = useStore();
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // M18: Due-Date Filter & Priorisierung
  // Fällige Karten (dueDate <= today oder noch nie gelernt) zuerst sortieren
  const todayKey = getTodayDateKey();
  const sortedCards = useMemo(() => {
    const srsData = userState.srsFlashcards || {};
    return [...FLASHCARDS_DATA].sort((a, b) => {
      const srsA = srsData[a.id];
      const srsB = srsData[b.id];

      const dueA = !srsA || !srsA.dueDate || srsA.dueDate <= todayKey;
      const dueB = !srsB || !srsB.dueDate || srsB.dueDate <= todayKey;

      if (dueA && !dueB) return -1;
      if (!dueA && dueB) return 1;

      // Wenn beide noch nicht fällig sind, nach frühestem Fälligkeitsdatum sortieren
      const dateA = srsA?.dueDate || '9999-99-99';
      const dateB = srsB?.dueDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    });
  }, [userState.srsFlashcards, todayKey]);

  if (!isOpen) return null;

  const currentCard = sortedCards[cardIdx] || sortedCards[0];
  const cardSrs = (userState.srsFlashcards && userState.srsFlashcards[currentCard.id]) || { repetitions: 0, interval: 1, easeFactor: 2.5 };
  const isDue = !cardSrs.dueDate || cardSrs.dueDate <= todayKey;

  const handleDownload = (format) => {
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (format === 'anki') {
      content = exportToAnkiTsv(FLASHCARDS_DATA);
      filename = 'IHK_Lernkarten_Anki.txt';
    } else {
      content = exportToCsv(FLASHCARDS_DATA);
      filename = 'IHK_Lernkarten.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleQualityAnswer = (quality) => {
    setIsFlipped(false);
    const srsResult = calculateSM2({
      quality,
      repetitions: cardSrs.repetitions,
      interval: cardSrs.interval,
      easeFactor: cardSrs.easeFactor
    });

    updateSrsCard(currentCard.id, srsResult);

    if (quality >= 3) {
      setCompletedCount((prev) => prev + 1);
      if (onRewardXP) onRewardXP(quality === 5 ? 20 : 15);
    }

    setCardIdx((prev) => (prev + 1) % sortedCards.length);
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="flashcards-modal-title"
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '650px',
          width: '100%',
          maxHeight: '88vh',
          background: 'var(--bg-card)',
          border: '2px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          aria-label="Schließen"
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>
            <Layers size={14} /> Karteikarten ({cardIdx + 1} von {sortedCards.length}) • {completedCount} gemeistert
          </span>
          <h2 id="flashcards-modal-title" style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            IT-Karteikarten Trainer
          </h2>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Klicke auf die Karte zum Umdrehen
          </span>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleDownload('anki')}
              style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={13} /> Anki Deck (.txt)
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleDownload('csv')}
              style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={13} /> Excel / CSV Export
            </button>
          </div>
        </div>

        {/* Flip Card Area */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            width: '100%',
            minHeight: '220px',
            background: isFlipped ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
            border: isFlipped ? '2px solid var(--accent-teal)' : '2px solid var(--accent-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s ease',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
            <span className="badge badge-teal">
              {currentCard.category} • {currentCard.difficulty}
            </span>
            {isDue && (
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                Heute fällig
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 10px' }}>
            {isFlipped ? '💡 Lösung / Erklärung:' : currentCard.front}
          </h3>
          {isFlipped && (
            <p style={{ fontSize: '1.02rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>
              {currentCard.back}
            </p>
          )}
        </div>

        {/* Rating Buttons */}
        {isFlipped ? (
          <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleQualityAnswer(1)}
              style={{ flex: 1, borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)', minHeight: '44px', fontSize: '0.85rem' }}
            >
              <XCircle size={16} /> Wiederholen (1 Tag)
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleQualityAnswer(3)}
              style={{ flex: 1, borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)', minHeight: '44px', fontSize: '0.85rem' }}
            >
              <Brain size={16} /> Schwer
            </button>
            <button
              className="btn btn-success"
              onClick={() => handleQualityAnswer(5)}
              style={{ flex: 1, minHeight: '44px', fontSize: '0.85rem' }}
            >
              <CheckCircle2 size={16} /> Perfekt Gewusst (+20 XP)
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <Clock size={15} />
            <span>Aktuelles Wiederholungs-Intervall: {cardSrs.interval || 1} Tage (Faktor {cardSrs.easeFactor || 2.5})</span>
          </div>
        )}
      </div>
    </div>
  );
}
