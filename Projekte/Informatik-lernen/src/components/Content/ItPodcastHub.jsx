import React, { useState } from 'react';
import { PODCAST_EPISODES } from '../../data/podcastData';
import { Headphones, CheckCircle2 } from 'lucide-react';

export default function ItPodcastHub() {
  const [selectedEpId, setSelectedEpId] = useState(PODCAST_EPISODES[0].id);

  const activeEp = PODCAST_EPISODES.find(e => e.id === selectedEpId) || PODCAST_EPISODES[0];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-amber)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Headphones size={32} style={{ color: 'var(--accent-amber)' }} /> IT-Berufe & IHK Prüfungspodcast Hub
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Inspirierende Prüfer-Tipps für deine IHK Projektdokumentation, das Fachgespräch & AP Teil 2.
        </p>
      </div>

      {/* Episode Selection */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {PODCAST_EPISODES.map((ep) => (
          <button
            key={ep.id}
            onClick={() => setSelectedEpId(ep.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedEpId === ep.id ? 'var(--accent-amber)' : 'var(--bg-card)',
              color: selectedEpId === ep.id ? '#ffffff' : 'var(--text-main)',
              border: selectedEpId === ep.id ? '2px solid var(--accent-amber)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {ep.title}
          </button>
        ))}
      </div>

      {/* Episode Content */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className="badge badge-amber">{activeEp.category}</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>⏱️ {activeEp.duration}</span>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
          {activeEp.title}
        </h2>
        <span style={{ fontSize: '0.9rem', color: 'var(--accent-teal)', fontWeight: 700, display: 'block', marginBottom: '16px' }}>
          Von: {activeEp.author}
        </span>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px' }}>
          {activeEp.summary}
        </p>

        <div>
          <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'block', marginBottom: '12px' }}>
            🎯 Wichtige Prüfer-Tipps für die Praxis:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeEp.tips.map((tip, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)', shrink: 0 }} />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
