import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, ExternalLink } from 'lucide-react';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

export default function CalendarView({ listings, onOpenListing }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Kalender-Berechnung (Woche startet Montag)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Anpassen: getDay() liefert 0 für Sonntag. In DE startet die Woche montags.
  const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Termine für einen Tag ermitteln
  const getAppointmentsForDay = (day) => {
    return listings.filter(l => {
      if (!l.viewingDate) return false;
      const d = new Date(l.viewingDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  // Kalender-Tage generieren
  const days = [];
  // Platzhalter für vorherigen Monat
  for (let i = 0; i < startOffset; i++) {
    days.push({ day: null, appointments: [] });
  }
  // Tage des aktuellen Monats
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      appointments: getAppointmentsForDay(i)
    });
  }

  // Ausgewählter Tag Details
  const selectedDateAppointments = selectedDay ? getAppointmentsForDay(selectedDay) : [];

  // Alle Termine des Monats für eine Gesamtliste daneben/darunter
  const monthlyAppointments = listings
    .filter(l => {
      if (!l.viewingDate) return false;
      const d = new Date(l.viewingDate);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .sort((a, b) => new Date(a.viewingDate) - new Date(b.viewingDate));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginTop: '1.5rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Linke Spalte: Monats-Kalender */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <CalendarIcon size={18} style={{ color: 'var(--primary)' }} />
            <span>{MONTHS[month]} {year}</span>
          </h3>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="btn" style={{ padding: '0.35rem' }} onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn" style={{ padding: '0.35rem' }} onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Wochentage */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginBottom: '0.75rem'
        }}>
          {WEEKDAYS.map(w => <div key={w}>{w}</div>)}
        </div>

        {/* Tage Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px'
        }}>
          {days.map((item, idx) => {
            if (item.day === null) {
              return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />;
            }

            const hasAppointments = item.appointments.length > 0;
            const isSelected = selectedDay === item.day;
            const isToday = new Date().getDate() === item.day && new Date().getMonth() === month && new Date().getFullYear() === year;

            return (
              <button
                key={`day-${item.day}`}
                onClick={() => setSelectedDay(item.day)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  background: isSelected 
                    ? 'var(--primary)' 
                    : isToday 
                      ? 'rgba(0, 242, 254, 0.08)' 
                      : 'rgba(255,255,255,0.02)',
                  border: isToday
                    ? '1px solid var(--primary)'
                    : isSelected
                      ? '1px solid var(--primary)'
                      : '1px solid var(--border)',
                  color: isSelected ? 'black' : 'var(--text-main)',
                  fontWeight: isToday || isSelected ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.2s',
                  padding: 0
                }}
              >
                <span>{item.day}</span>
                {hasAppointments && (
                  <span style={{
                    position: 'absolute',
                    bottom: '6px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: isSelected ? 'black' : 'var(--primary)'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rechte Spalte: Termine */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Termine für den ausgewählten Tag */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          flex: 1
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            {selectedDay 
              ? `Termine am ${selectedDay}. ${MONTHS[month]} ${year}` 
              : 'Wähle einen Tag im Kalender'}
          </h3>

          {selectedDay && selectedDateAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Clock size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Keine Besichtigungstermine für diesen Tag eingetragen.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedDateAppointments.map(app => {
                const time = new Date(app.viewingDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div 
                    key={app.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(0, 242, 254, 0.1)',
                        color: 'var(--primary)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={11} /> {time} Uhr
                      </span>
                      <button
                        className="btn"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => onOpenListing(app)}
                      >
                        <span>Details</span>
                        <ExternalLink size={11} />
                      </button>
                    </div>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{app.title}</strong>
                    {app.location && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {app.location}
                      </span>
                    )}
                    {app.viewingNotes && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border)', fontStyle: 'italic' }}>
                        {app.viewingNotes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alle Monats-Termine Übersicht */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
            Alle Termine im {MONTHS[month]} ({monthlyAppointments.length})
          </h3>
          {monthlyAppointments.length === 0 ? (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Keine Termine in diesem Monat.</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
              {monthlyAppointments.map(app => {
                const date = new Date(app.viewingDate);
                const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div 
                    key={app.id} 
                    onClick={() => onOpenListing(app)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.4rem 0.6rem',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{dateStr} - {timeStr} Uhr</span>
                    <span style={{ flex: 1, marginLeft: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {app.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
