import React from 'react';
import { Sparkles, Layers, ShieldAlert, GraduationCap, Briefcase } from 'lucide-react';

export default function DifficultyFilterBar({ activeFilter, onSelectFilter }) {
  const filters = [
    { id: 'all', label: 'Alle Levels', icon: Layers, badgeClass: 'badge-indigo', description: 'Alle Themen & Vorwissen-Stufen' },
    { id: 'Einsteiger', label: '🟢 Einsteiger (Kein Vorwissen)', icon: Sparkles, badgeClass: 'badge-teal', description: 'Für Kinder, Senioren & alle ohne IT-Erfahrung' },
    { id: 'Azubi / IHK', label: '🔵 Azubi & IHK Prüfungslevel', icon: GraduationCap, badgeClass: 'badge-indigo', description: 'Berufsschule, Fachinformatiker & Prüfungen' },
    { id: 'Senior / Expert', label: '🟣 Fortgeschritten & Senior Dev', icon: Briefcase, badgeClass: 'badge-amber', description: 'Erfahrene Programmierer & Security Experts' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: '20px',
        background: 'var(--bg-card)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}
      role="region"
      aria-label="Schwierigkeitsgrad-Filter"
    >
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
        <Layers size={16} style={{ color: 'var(--accent-primary)' }} /> Zielgruppe & Level:
      </span>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f.id)}
              style={{
                minHeight: '38px',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: '700',
                background: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              title={f.description}
            >
              <Icon size={14} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
