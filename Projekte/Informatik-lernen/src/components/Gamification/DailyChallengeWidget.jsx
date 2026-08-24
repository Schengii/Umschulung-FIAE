import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Flame, Award, Shield, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function DailyChallengeWidget({ onCompleteChallenge }) {
  const { userState, buyStreakFreeze } = useStore();
  const [answered, setAnswered] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);

  const quest = {
    title: '⚡ Tages-Quest: Subnetting & IP-Adressen',
    question: 'Welches Subnetz bietet genau 254 nutzbare Host-IPs?',
    options: ['/24 (255.255.255.0)', '/16 (255.255.0.0)', '/28 (255.255.255.240)', '/30 (255.255.255.252)'],
    correct: 0,
    xpReward: 35
  };

  const handleAnswer = (optIdx) => {
    if (!answered) {
      setSelectedOpt(optIdx);
      setAnswered(true);
      if (optIdx === quest.correct) {
        onCompleteChallenge(quest.xpReward);
      }
    }
  };

  const handleBuyFreeze = () => {
    if (userState.xp < 100) {
      alert('Du benötigst mindestens 100 XP für einen Streak-Freeze Schild.');
      return;
    }
    const success = buyStreakFreeze(100);
    if (success) {
      alert('🛡️ Streak-Freeze Schutzschild erfolgreich gekauft! Dein Lern-Streak ist nun für einen verpassten Tag geschützt.');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '2px solid var(--accent-amber)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={14} /> Tages-Challenge (+{quest.xpReward} XP)
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={16} /> Streak: {userState.streak || 1} Tage
          </span>
          <button
            onClick={handleBuyFreeze}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '4px 10px', gap: '4px', borderColor: 'var(--accent-primary)', color: 'var(--text-main)' }}
            title="Schütze deinen Streak für 100 XP"
          >
            <ShieldCheck size={14} color="var(--accent-primary)" />
            <span>Streak-Freeze ({userState.streakFreezes || 0})</span>
            <span style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>100 XP</span>
          </button>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
        {quest.title}
      </h3>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {quest.question}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {quest.options.map((opt, idx) => {
          const isSelected = selectedOpt === idx;
          const isCorrect = idx === quest.correct;
          let bg = 'var(--bg-tertiary)';
          let border = 'var(--border-color)';

          if (answered) {
            if (isCorrect) {
              bg = 'rgba(5, 150, 105, 0.15)';
              border = 'var(--accent-emerald)';
            } else if (isSelected && !isCorrect) {
              bg = 'rgba(225, 29, 72, 0.15)';
              border = 'var(--accent-rose)';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              style={{
                minHeight: '44px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: bg,
                border: `2px solid ${border}`,
                color: 'var(--text-main)',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: answered ? 'default' : 'pointer',
                textAlign: 'left'
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <div style={{ marginTop: '14px', fontSize: '0.9rem', color: selectedOpt === quest.correct ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={18} />
          {selectedOpt === quest.correct ? `Richtig! +${quest.xpReward} XP wurden gutgeschrieben.` : 'Falsch. Die richtige Antwort ist /24 (255.255.255.0).'}
        </div>
      )}
    </div>
  );
}
