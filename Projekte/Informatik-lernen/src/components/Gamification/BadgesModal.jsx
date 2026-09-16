import React from 'react';
import { BADGES } from '../../utils/storage';
import { Trophy, X } from 'lucide-react';

export default function BadgesModal({ isOpen, onClose, userState }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 14, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-highlight)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        position: 'relative'
      }}>
        
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-tertiary)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Trophy size={48} color="var(--accent-amber)" style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Deine Entwickler-Erfolge</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Gesammelte XP: <strong style={{ color: 'var(--accent-amber)' }}>{userState.xp} XP</strong> | Aktuelles Level: <strong style={{ color: 'var(--accent-cyan)' }}>Level {userState.level}</strong>
          </p>
        </div>

        {/* Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {BADGES.map(badge => {
            const isUnlocked = userState.unlockedBadges.includes(badge.id) || userState.xp > 100;

            return (
              <div
                key={badge.id}
                style={{
                  background: isUnlocked ? 'var(--bg-tertiary)' : 'rgba(255, 255, 255, 0.03)',
                  border: isUnlocked ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  textAlign: 'center',
                  opacity: isUnlocked ? 1 : 0.4
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{badge.icon}</div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>{badge.title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{badge.desc}</p>
                <span className={isUnlocked ? 'badge badge-amber' : 'badge'} style={{ marginTop: '10px' }}>
                  {isUnlocked ? 'Freigeschaltet' : 'Sperre'}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
