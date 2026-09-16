import React, { useState } from 'react';
import { Swords, RefreshCw } from 'lucide-react';

export default function BossBattleGame({ onCompleteGame }) {
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const bossQuestions = [
    {
      q: '👾 Bugzilla nutzt eine unendliche Schleife! Welcher Befehl bricht eine Schleife in JavaScript sofort ab?',
      options: ['break', 'continue', 'stop', 'exit'],
      correct: 0,
      damage: 35
    },
    {
      q: '🛡️ Bugzilla greift mit SQL Injection an! Wie schützt du die Datenbank?',
      options: ['Ungeprüfte Strings einfügen', 'Prepared Statements nutzen', 'Server ausschalten', 'Passwort entfernen'],
      correct: 1,
      damage: 35
    },
    {
      q: '⚡ Bugzilla erzeugt ein Memory Leak! Wie verhinderst du ungenutzte Speicherbelegung?',
      options: ['Variablen deklarieren', 'Event Listener entfernen & Speicher freigeben', 'CPU übertakten', 'Bildschirm sperren'],
      correct: 1,
      damage: 30
    }
  ];

  const currentQ = bossQuestions[questionIdx];

  const handleAnswer = (optIdx) => {
    if (gameEnded) return;

    if (optIdx === currentQ.correct) {
      const nextBossHp = Math.max(0, bossHp - currentQ.damage);
      setBossHp(nextBossHp);
      if (nextBossHp <= 0) {
        setGameEnded(true);
        onCompleteGame('boss_slayer', 120);
        return;
      }
    } else {
      const nextPlayerHp = Math.max(0, playerHp - 34);
      setPlayerHp(nextPlayerHp);
      if (nextPlayerHp <= 0) {
        setGameEnded(true);
        return;
      }
    }

    if (questionIdx < bossQuestions.length - 1) {
      setQuestionIdx(prev => prev + 1);
    }
  };

  const handleRestart = () => {
    setBossHp(100);
    setPlayerHp(100);
    setQuestionIdx(0);
    setGameEnded(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', border: '2px solid var(--accent-rose)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span className="badge badge-rose" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Swords size={16} /> Boss Battle Mode
        </span>
        <span style={{ fontSize: '0.88rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
          Belohnung: +120 XP & Boss Badge
        </span>
      </div>

      <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        ⚔️ Code Duel: Kampf gegen "Bugzilla den Monolith"
      </h2>

      {/* Battle Status Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Player HP */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: '6px', color: 'var(--accent-primary)' }}>
            <span>👤 Developer HP</span>
            <span>{playerHp} / 100</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${playerHp}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Boss HP */}
        <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: '6px', color: 'var(--accent-rose)' }}>
            <span>👾 Bugzilla HP</span>
            <span>{bossHp} / 100</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${bossHp}%`, height: '100%', background: 'var(--accent-rose)', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Question / Battle Round */}
      {!gameEnded ? (
        <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>
            {currentQ.q}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                style={{
                  minHeight: '48px',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '2px solid var(--border-color)',
                  color: 'var(--text-main)',
                  textAlign: 'left',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 900, color: bossHp <= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginBottom: '8px' }}>
            {bossHp <= 0 ? '🎉 SIEG! Bugzilla wurde besiegt!' : '💀 NIEDERLAGE! Bugzilla hat gewonnen.'}
          </h3>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {bossHp <= 0 ? 'Du hast +120 XP und die "Boss Slayer" Auszeichnung erhalten.' : 'Versuche es noch einmal mit korrekten Code-Antworten.'}
          </p>
          <button className="btn btn-primary" onClick={handleRestart} style={{ minHeight: '44px' }}>
            <RefreshCw size={18} /> Revanche Kämpfen
          </button>
        </div>
      )}
    </div>
  );
}
