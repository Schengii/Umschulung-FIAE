import React, { useState } from 'react';
import IhkDrillPanel from './IhkDrillPanel';

/**
 * Einklappbarer IHK-Drill am Ende eines Labs, dessen XP anderweitig vergeben werden
 * (keine XP-Hinweise). Das Panel wird erst beim Aufklappen gerendert, damit Fragen und
 * Antworten nicht neben den Rechenergebnissen des Labs im DOM stehen.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {Array<{id: string, frage: string, optionen: string[], korrektIndex: number, erklaerung: string}>} props.questions
 * @param {string} [props.accentColor]
 * @param {number} [props.xpReward] Optionale XP, einmalig bei mindestens 3 richtigen Antworten
 * @param {(xp: number) => void} [props.onRewardXP] Wird mit `xpReward` aufgerufen
 */
export default function LabDrillSection({ title, questions, accentColor = '#6366f1', xpReward, onRewardXP }) {
  const [open, setOpen] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);
  const withXp = typeof xpReward === 'number' && typeof onRewardXP === 'function';

  const handleEvaluate = (correctCount) => {
    if (withXp && !xpClaimed && correctCount >= 3) {
      onRewardXP(xpReward);
      setXpClaimed(true);
    }
  };
  return (
    <details style={{ marginTop: '24px' }} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary style={{ cursor: 'pointer', fontWeight: 700, padding: '8px 0' }}>
        IHK-Prüfungsdrill zum Thema ({questions.length} Fragen)
      </summary>
      {open && (
        <IhkDrillPanel
          title={title}
          questions={questions}
          accentColor={accentColor}
          selectedBg="rgba(99, 102, 241, 0.2)"
          selectedBorderColor="#6366f1"
          xpClaimed={xpClaimed}
          xpAmount={withXp ? xpReward : null}
          onEvaluate={handleEvaluate}
        />
      )}
    </details>
  );
}
