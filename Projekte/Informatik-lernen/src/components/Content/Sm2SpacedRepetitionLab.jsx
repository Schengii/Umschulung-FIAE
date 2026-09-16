import React, { useState, useMemo } from 'react';

import { Brain, Sparkles, TrendingUp, Bell } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useStore } from '../../store/useStore';
import { calculateSm2NextReview, calculateEbbinghausCurve } from '../../utils/sm2Algorithm';
import { scheduleDailyReminder } from '../../utils/pushNotificationManager';

export const SM2_SAMPLE_CARDS = [
  {
    id: 1,
    front: 'Was besagt das EVA-Prinzip in der Informatik?',
    back: 'Eingabe -> Verarbeitung -> Ausgabe (Grundlegendes Strukturprinzip der Datenverarbeitung).',
    category: 'Grundlagen',
    repetitions: 2,
    easeFactor: 2.5,
    interval: 6
  },
  {
    id: 2,
    front: 'Welcher HTTP-Statuscode signalisiert "101 Switching Protocols" (z.B. bei WebSockets)?',
    back: 'HTTP 101: Der Server wechselt das Protokoll gemäß dem Upgrade-Header des Clients (z.B. von HTTP/1.1 zu WebSocket).',
    category: 'Netzwerke',
    repetitions: 1,
    easeFactor: 2.4,
    interval: 1
  },
  {
    id: 3,
    front: 'Was ist der Unterschied zwischen 2. Normalform (2NF) und 3. Normalform (3NF)?',
    back: '2NF fordert keine partiellen Abhängigkeiten vom zusammengesetzten Primärschlüssel. 3NF fordert zusätzlich keine transitiven Abhängigkeiten zwischen Nichtschlüssel-Attributen.',
    category: 'Datenbanken',
    repetitions: 0,
    easeFactor: 2.5,
    interval: 0
  }
];

export default function Sm2SpacedRepetitionLab() {
  const { awardXP } = useStore();
  const [cards, setCards] = useState(SM2_SAMPLE_CARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIdx] || cards[0];

  // Ebbinghaus Forgetting Curve Data
  const ebbinghausData = useMemo(() => {
    return calculateEbbinghausCurve(Math.max(1, currentCard.interval || 2), 14);
  }, [currentCard]);

  const handleRateCard = (grade) => {
    const updated = calculateSm2NextReview({
      grade,
      repetitions: currentCard.repetitions,
      easeFactor: currentCard.easeFactor,
      interval: currentCard.interval
    });

    const nextCards = cards.map((c, i) => i === currentIdx ? { ...c, ...updated } : c);
    setCards(nextCards);
    setIsFlipped(false);
    setCurrentIdx((currentIdx + 1) % cards.length);
    awardXP(20, 'sm2_reviewed');
  };

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushXpClaimed, setPushXpClaimed] = useState(false);

  const handleTogglePush = async () => {
    if (!pushEnabled) {
      const success = await scheduleDailyReminder('🧠 Zeit für deine SM-2 Repetition!', { body: 'Wiederhole deine IT-Karteikarten, um die Ebbinghaus-Vergessenskurve zu besiegen.' });
      if (success) {
        setPushEnabled(true);
        if (!pushXpClaimed) {
          setPushXpClaimed(true);
          awardXP(10, 'Push Notifications Aktiviert');
        }
      }
    } else {
      setPushEnabled(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-indigo"><Brain size={14} /> Kognitive Didaktik &amp; Gedächtnis</span>
              <span className="badge badge-teal"><Sparkles size={14} /> SuperMemo SM-2 &amp; Ebbinghaus-Kurve</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              SuperMemo SM-2 Spaced Repetition Mastery
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px', maxWidth: '750px', fontSize: '0.95rem' }}>
              Lerne mit dem wissenschaftlichen SM-2 Spaced-Repetition-Algorithmus. Berechne dynamische Ease-Faktoren ($EF \ge 1.3$) und visualisiere die Ebbinghaus-Vergessenskurve für jedes Thema.
            </p>
          </div>
          <button 
            onClick={handleTogglePush}
            className={`action-button ${pushEnabled ? 'primary' : 'secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
          >
            <Bell size={18} />
            {pushEnabled ? 'Tägliche Push-Erinnerungen: An' : 'Push-Erinnerungen aktivieren'}
          </button>
        </div>
      </div>

      {/* 2-Pane: Flashcard Viewer + Ebbinghaus Memory Curve */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(320px, 1fr)', gap: '20px' }}>
        {/* Flashcard Component */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span className="badge badge-indigo">Karte {currentIdx + 1} von {cards.length} ({currentCard.category})</span>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Intervall: <strong>{currentCard.interval} Tage</strong> | EF: <strong>{currentCard.easeFactor}</strong>
            </div>
          </div>

          {/* Interactive Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              minHeight: '220px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border-color)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.25s ease'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
              {isFlipped ? 'Antwort / Rückseite' : 'Frage / Vorderseite (Klicken zum Umdrehen)'}
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {isFlipped ? currentCard.back : currentCard.front}
            </div>
          </div>

          {/* Rating Buttons */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
              Wie gut hast du dich erinnert? (SM-2 Bewertung)
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { grade: 1, label: '0-1: Blackout', color: 'var(--accent-rose)' },
                { grade: 3, label: '3: Schwer', color: 'var(--accent-amber)' },
                { grade: 4, label: '4: Gut', color: 'var(--accent-indigo)' },
                { grade: 5, label: '5: Perfekt', color: 'var(--accent-emerald)' }
              ].map(btn => (
                <button
                  key={btn.grade}
                  onClick={() => handleRateCard(btn.grade)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: btn.color, color: btn.color }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ebbinghaus Forgetting Curve Chart */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--accent-teal)" /> Ebbinghaus-Vergessenskurve $R(t) = e^{-t / S}$
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Erwartete Gedächtnis-Behaltensrate für diese Karte über 14 Tage:
          </p>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ebbinghausData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} unit="%" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="retentionPercent" stroke="var(--accent-teal)" strokeWidth={3} dot={{ r: 3 }} name="Behaltenskraft" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
