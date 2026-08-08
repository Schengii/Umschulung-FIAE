import React, { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { getBestPostingTime } from '../gemini';

const PLATFORMS = ['Kleinanzeigen', 'eBay', 'Vinted'];

const MOCK_DATA = {
  Kleinanzeigen: {
    bestDay: 'Sonntag',
    bestTime: '18:00 – 21:00 Uhr',
    reason: 'Sonntag Abend zeigt die höchste Nutzeraktivität auf Kleinanzeigen, da viele Menschen nach einem Wochenende online shoppen.',
    seasonalTip: 'Elektronik verkauft sich besonders gut im Herbst (Schulanfang) und vor Weihnachten.',
    heatmap: [
      { day: 'Mo', score: 2 },
      { day: 'Di', score: 2 },
      { day: 'Mi', score: 3 },
      { day: 'Do', score: 3 },
      { day: 'Fr', score: 4 },
      { day: 'Sa', score: 4 },
      { day: 'So', score: 5 },
    ],
  },
  eBay: {
    bestDay: 'Sonntag',
    bestTime: '19:00 – 21:00 Uhr',
    reason: 'eBay-Auktionen enden idealerweise am Sonntagabend, wenn die meisten Bieter aktiv sind und Angebote in die Höhe treiben.',
    seasonalTip: null,
    heatmap: [
      { day: 'Mo', score: 2 },
      { day: 'Di', score: 3 },
      { day: 'Mi', score: 3 },
      { day: 'Do', score: 3 },
      { day: 'Fr', score: 3 },
      { day: 'Sa', score: 4 },
      { day: 'So', score: 5 },
    ],
  },
  Vinted: {
    bestDay: 'Donnerstag',
    bestTime: '12:00 – 14:00 Uhr',
    reason: 'Vinted-Nutzer sind besonders in der Mittagspause aktiv. Donnerstag und Freitag haben die höchsten Klickzahlen.',
    seasonalTip: 'Mode & Kleidung läuft im Herbst (Herbst/Winter-Kollektionen) und März/April (Frühjahr) am besten.',
    heatmap: [
      { day: 'Mo', score: 3 },
      { day: 'Di', score: 3 },
      { day: 'Mi', score: 3 },
      { day: 'Do', score: 5 },
      { day: 'Fr', score: 5 },
      { day: 'Sa', score: 3 },
      { day: 'So', score: 2 },
    ],
  },
};

const SCORE_COLORS = ['', '#f87171', '#ffb61e', '#ffb61e', '#00bc7e', '#00bc7e'];

export default function PostingTimeAdvisor({ currentItem, apiKey, showToast }) {
  const [advice, setAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('Kleinanzeigen');

  const handleGetAdvice = async () => {
    if (!currentItem.name) {
      showToast('Bitte gib zuerst einen Anzeigentitel ein.');
      return;
    }
    setIsLoading(true);
    showToast(`Analysiere besten Zeitpunkt für ${selectedPlatform}...`);
    try {
      let result;
      if (!apiKey) {
        result = MOCK_DATA[selectedPlatform];
        showToast('Mock-Modus: Zeitpunkt-Empfehlung simuliert.');
      } else {
        result = await getBestPostingTime(currentItem, selectedPlatform, apiKey);
      }
      setAdvice(result);
      showToast('Zeitpunkt-Empfehlung bereit!');
    } catch (err) {
      showToast(err.message || 'Fehler bei der Analyse.');
    } finally {
      setIsLoading(false);
    }
  };

  const maxScore = advice ? Math.max(...advice.heatmap.map((d) => d.score)) : 5;

  return (
    <div className="glass-panel" style={{ padding: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Bester Zeitpunkt (KI)</h3>
        </div>
      </div>

      {/* Platform selector + button */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <select
          className="input-field"
          style={{ margin: 0, fontSize: '0.85rem', flex: 1 }}
          value={selectedPlatform}
          onChange={(e) => { setSelectedPlatform(e.target.value); setAdvice(null); }}
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.8rem', gap: '5px', whiteSpace: 'nowrap' }}
          onClick={handleGetAdvice}
          disabled={isLoading}
        >
          <Calendar size={13} style={{ color: 'var(--primary)' }} />
          {isLoading ? 'Analysiere...' : advice ? 'Neu' : 'Analysieren'}
        </button>
      </div>

      {!advice && !isLoading && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          KI empfiehlt den besten Wochentag und die beste Uhrzeit zum Einstellen für maximale Sichtbarkeit.
        </p>
      )}

      {isLoading && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 0' }}>
          <div className="typing-dot" style={{ width: '8px', height: '8px' }} />
          <div className="typing-dot" style={{ width: '8px', height: '8px' }} />
          <div className="typing-dot" style={{ width: '8px', height: '8px' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>Analysiere Aktivitätsmuster...</span>
        </div>
      )}

      {advice && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Best time highlight */}
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '6px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bester Tag</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{advice.bestDay}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Beste Uhrzeit</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{advice.bestTime}</div>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{advice.reason}</p>
          </div>

          {/* Heatmap */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aktivitäts-Heatmap</div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '54px' }}>
              {advice.heatmap.map((d) => {
                const heightPct = (d.score / maxScore) * 100;
                const color = SCORE_COLORS[d.score] || '#6366f1';
                const isBest = d.score === maxScore;
                return (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <div style={{
                      width: '100%',
                      height: `${heightPct}%`,
                      background: isBest ? color : 'rgba(255,255,255,0.07)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.4s ease',
                      minHeight: '4px',
                      border: isBest ? `1px solid ${color}` : 'none',
                    }} />
                    <span style={{ fontSize: '0.65rem', color: isBest ? color : 'var(--text-muted)', fontWeight: isBest ? 700 : 400 }}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seasonal tip */}
          {advice.seasonalTip && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,182,30,0.06)', border: '1px solid rgba(255,182,30,0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              🍂 <strong style={{ color: '#ffb61e' }}>Saisonaler Tipp:</strong> {advice.seasonalTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
