import React from 'react';
import { CAMPAIGN_CHAPTERS } from '../../data/campaignData';
import { Compass, CheckCircle2, Circle, ArrowRight, Award, Sparkles, Flame } from 'lucide-react';

export default function CampaignQuestHub({ userState, onNavigateTab, onRewardXP }) {
  const completedTopics = userState.completedTopics || [];

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={14} /> Story-Modus & Kampagne
        </span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
          🗺️ IT-Entwickler Kampagne: Vom Noob zum Lead Architect
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Folge dem roten Faden durch alle 5 Entwicklungsstufen, schließe Quests ab und steige vom IT-Einsteiger zum Systemarchitekten auf.
        </p>
      </div>

      {/* Chapters Timeline */}
      <div style={{ display: 'grid', gap: '24px' }}>
        {CAMPAIGN_CHAPTERS.map((ch, idx) => {
          const totalQuests = ch.quests.length;
          // Calculate arbitrary progress based on completed status or let user trigger
          return (
            <div
              key={ch.id}
              style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-color)',
                position: 'relative'
              }}
            >
              {/* Chapter Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '2.2rem' }}>{ch.icon}</span>
                  <div>
                    <span className="badge badge-indigo" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>
                      {ch.badge}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                      {ch.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: 1.5 }}>
                {ch.desc}
              </p>

              {/* Quests List */}
              <div style={{ display: 'grid', gap: '10px' }}>
                {ch.quests.map((q) => {
                  return (
                    <div
                      key={q.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--bg-card)',
                        padding: '12px 18px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Circle size={18} color="var(--accent-primary)" />
                        <span style={{ fontWeight: '600', fontSize: '0.92rem', color: 'var(--text-main)' }}>
                          {q.title}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                          +{q.xp} XP
                        </span>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab(q.actionTab);
                          if (onRewardXP) onRewardXP(15);
                        }}
                        style={{ gap: '6px' }}
                      >
                        Quest Starten <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
