import React, { useState } from 'react';
import { TrendingUp, CheckCircle, Star } from 'lucide-react';
import { recommendPlatform } from '../gemini';

const PLATFORM_COLORS = {
  kleinanzeigen: { bg: 'rgba(0, 188, 126, 0.12)', border: 'rgba(0, 188, 126, 0.3)', text: '#00bc7e' },
  ebay: { bg: 'rgba(255, 182, 30, 0.12)', border: 'rgba(255, 182, 30, 0.3)', text: '#ffb61e' },
  vinted: { bg: 'rgba(9, 182, 109, 0.12)', border: 'rgba(9, 182, 109, 0.3)', text: '#09b66d' },
};

const PLATFORM_LABELS = {
  kleinanzeigen: 'Kleinanzeigen',
  ebay: 'eBay',
  vinted: 'Vinted',
};

const MOCK_DATA = {
  iphone: { best: 'ebay', reason: 'eBay erreicht technisch versierte Käufer mit höherer Zahlungsbereitschaft für Smartphones.', platforms: [{ name: 'ebay', score: 9, hint: 'Große Käuferschaft für Elektronik, Auktionen erzielen oft Höchstpreise' }, { name: 'kleinanzeigen', score: 7, hint: 'Lokal, kein Versandaufwand, direkte Abholung möglich' }, { name: 'vinted', score: 3, hint: 'Primär Kleidungsplattform, Elektronik weniger gefragt' }] },
  default: { best: 'kleinanzeigen', reason: 'Kleinanzeigen ist für die meisten Gebrauchtwaren in Deutschland die erste Wahl.', platforms: [{ name: 'kleinanzeigen', score: 8, hint: 'Größte Reichweite in Deutschland, keine Verkaufsgebühren' }, { name: 'ebay', score: 6, hint: 'Gut für bundesweiten Versandverkauf und bekannte Marken' }, { name: 'vinted', score: 4, hint: 'Empfohlen für Kleidung, Schuhe und Mode-Accessoires' }] },
};

export default function PlatformRecommender({ currentItem, apiKey, showToast }) {
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRecommend = async () => {
    if (!currentItem.name) {
      showToast('Bitte gib zuerst einen Anzeigentitel ein.');
      return;
    }
    setIsLoading(true);
    showToast('Analysiere beste Plattform...');

    try {
      let result;
      if (!apiKey) {
        // Mock mode
        const isPhone = currentItem.name.toLowerCase().includes('iphone') || currentItem.name.toLowerCase().includes('samsung') || currentItem.name.toLowerCase().includes('pixel');
        result = isPhone ? MOCK_DATA.iphone : MOCK_DATA.default;
      } else {
        result = await recommendPlatform(currentItem, apiKey);
      }
      setRecommendation(result);
      showToast('Plattform-Empfehlung bereit!');
    } catch (err) {
      showToast(err.message || 'Fehler bei der Analyse.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreBar = (score) => {
    const pct = (score / 10) * 100;
    const color = score >= 8 ? '#00bc7e' : score >= 5 ? '#ffb61e' : '#f87171';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color, minWidth: '24px' }}>{score}/10</span>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Plattform-Empfehlung (KI)</h3>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.8rem', gap: '5px' }}
          onClick={handleRecommend}
          disabled={isLoading}
        >
          <Star size={13} style={{ color: 'var(--primary)' }} />
          {isLoading ? 'Analysiere...' : recommendation ? 'Neu analysieren' : 'Analysieren'}
        </button>
      </div>

      {!recommendation && !isLoading && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          KI analysiert deinen Artikel und empfiehlt die passendste Plattform (Kleinanzeigen, eBay oder Vinted).
        </p>
      )}

      {isLoading && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '12px 0' }}>
          <div className="typing-dot" style={{ width: '8px', height: '8px' }} />
          <div className="typing-dot" style={{ width: '8px', height: '8px' }} />
          <div className="typing-dot" style={{ width: '8px', height: '8px' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>Analysiere Plattformen...</span>
        </div>
      )}

      {recommendation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Best platform highlight */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: PLATFORM_COLORS[recommendation.best]?.bg || 'rgba(255,255,255,0.03)',
            border: `1px solid ${PLATFORM_COLORS[recommendation.best]?.border || 'var(--border-color)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <CheckCircle size={18} style={{ color: PLATFORM_COLORS[recommendation.best]?.text || '#fff', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                ✅ Empfehlung: <span style={{ color: PLATFORM_COLORS[recommendation.best]?.text }}>{PLATFORM_LABELS[recommendation.best] || recommendation.best}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{recommendation.reason}</div>
            </div>
          </div>

          {/* Platform comparison */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendation.platforms.map((p) => (
              <div key={p.name} style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${p.name === recommendation.best ? (PLATFORM_COLORS[p.name]?.border || 'var(--border-color)') : 'var(--border-color)'}`,
                background: p.name === recommendation.best ? (PLATFORM_COLORS[p.name]?.bg || 'rgba(255,255,255,0.02)') : 'rgba(255,255,255,0.01)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: p.name === recommendation.best ? (PLATFORM_COLORS[p.name]?.text || '#fff') : 'var(--text-secondary)' }}>
                    {p.name === recommendation.best && '⭐ '}{PLATFORM_LABELS[p.name] || p.name}
                  </span>
                </div>
                {getScoreBar(p.score)}
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>{p.hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
