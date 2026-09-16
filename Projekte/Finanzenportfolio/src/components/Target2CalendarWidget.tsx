import React from 'react';
import { Calendar } from 'lucide-react';
import { calculateNextTarget2ExecutionDates } from './performanceUtils';

export const Target2CalendarWidget: React.FC = () => {
  const dates = calculateNextTarget2ExecutionDates(1, 4);

  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar className="text-cyan-400" size={18} /> Target2-Bankfeiertage & Sparplan-Ausführungskalender
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Automatische Erkennung von Ausführungsverschiebungen durch Wochenenden und europäische Bankfeiertage.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {dates.map((d, idx) => (
          <div
            key={idx}
            style={{
              background: d.isDelayedByWeekendOrHoliday ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${d.isDelayedByWeekendOrHoliday ? 'rgba(245, 158, 11, 0.2)' : 'var(--border-color)'}`,
              padding: '0.75rem',
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Regulär: {d.intendedDate}</span>
              {d.isDelayedByWeekendOrHoliday && (
                <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.35rem', borderRadius: '4px', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontWeight: 'bold' }}>
                  {d.reason}
                </span>
              )}
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '0.3rem', color: d.isDelayedByWeekendOrHoliday ? '#f59e0b' : '#10b981' }}>
              Ausführung: {d.actualExecutionDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
