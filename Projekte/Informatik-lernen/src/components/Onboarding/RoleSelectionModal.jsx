import React from 'react';
import { USER_ROLES } from '../../data/userProfiles';
import { Check, Sparkles, X, HeartHandshake } from 'lucide-react';

export default function RoleSelectionModal({ isOpen, onClose, currentRole, onSelectRole }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '920px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '2px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}
      >
        {/* Close Button if role is already selected */}
        {currentRole && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'var(--bg-tertiary)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
            aria-label="Schließen"
          >
            <X size={22} />
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--accent-primary)',
              padding: '6px 18px',
              borderRadius: '9999px',
              fontSize: '0.88rem',
              fontWeight: '700',
              marginBottom: '12px'
            }}
          >
            <HeartHandshake size={18} /> Für jedes Alter & jedes Vorwissen geeignet
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            Wähle dein Lern-Level & Profil
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            Egal ob absoluter Einsteiger (ohne Vorkenntnisse), Azubi, Junior oder erfahrener Developer – finde genau dein Tempo.
          </p>
        </div>

        {/* Roles Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
          {Object.values(USER_ROLES).map((role) => {
            const isSelected = currentRole === role.id;
            return (
              <div
                key={role.id}
                onClick={() => {
                  onSelectRole(role.id);
                  onClose();
                }}
                className="glass-panel-hover"
                style={{
                  background: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                  border: isSelected ? `3px solid ${role.color}` : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: role.color,
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={16} color="#fff" />
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '2.6rem', marginBottom: '12px' }}>{role.icon}</div>
                  <span className="badge badge-indigo" style={{ marginBottom: '8px', fontSize: '0.75rem' }}>
                    {role.difficultyLevel}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>{role.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.45' }}>
                    {role.description}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: role.color, marginBottom: '8px', textTransform: 'uppercase' }}>
                    Fokus & Skills:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    {role.skills.map((skill, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ color: role.color, fontWeight: 800 }}>✓</span> {skill}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      fontSize: '0.9rem',
                      minHeight: '44px',
                      background: isSelected ? role.color : 'var(--bg-tertiary)',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      border: isSelected ? 'none' : '1px solid var(--border-color)'
                    }}
                  >
                    {isSelected ? 'Aktiv Ausgewählt' : 'Dieses Profil wählen'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
