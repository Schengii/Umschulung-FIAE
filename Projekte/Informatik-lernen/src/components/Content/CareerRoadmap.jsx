import React, { useState } from 'react';
import { CAREER_ROADMAPS } from '../../data/roadmapData';
import { Compass, CheckCircle2 } from 'lucide-react';

export default function CareerRoadmap({ userState }) {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(CAREER_ROADMAPS[0].id);

  const roadmap = CAREER_ROADMAPS.find(r => r.id === selectedRoadmapId) || CAREER_ROADMAPS[0];

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', border: '2px solid var(--accent-primary)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={32} style={{ color: 'var(--accent-primary)' }} /> Interaktive IT-Karriere Roadmaps
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Strukturierte Lernpfade für Fullstack-Entwicklung, Cybersecurity und AI Engineering.
        </p>
      </div>

      {/* Roadmap Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto' }}>
        {CAREER_ROADMAPS.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedRoadmapId(r.id)}
            style={{
              minHeight: '48px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: selectedRoadmapId === r.id ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: selectedRoadmapId === r.id ? '#ffffff' : 'var(--text-main)',
              border: selectedRoadmapId === r.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {r.title}
          </button>
        ))}
      </div>

      {/* Selected Roadmap Details */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>
          {roadmap.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.02rem' }}>
          {roadmap.subtitle}
        </p>

        {/* Steps Flow Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          {roadmap.steps.map((step) => {
            const isCompleted = userState.completedTopics.includes(step.id);
            return (
              <div
                key={step.id}
                style={{
                  background: isCompleted ? 'rgba(5, 150, 105, 0.12)' : 'var(--bg-secondary)',
                  border: isCompleted ? '2px solid var(--accent-emerald)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <span className="badge badge-indigo" style={{ marginBottom: '6px' }}>{step.category}</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
                    {step.label}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isCompleted ? (
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={20} /> Abgeschlossen
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.88rem' }}>
                      In Bearbeitung
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
