import React from 'react';
import { Eye, ArrowRight, ArrowLeft, Star, Send, Calendar, Archive, AlertTriangle } from 'lucide-react';

const COLUMNS = [
  { id: 'neu', title: 'Neu / Ungelesen', color: 'var(--primary)', icon: <AlertTriangle size={16} /> },
  { id: 'favorit', title: 'Favoriten', color: '#ecc94b', icon: <Star size={16} /> },
  { id: 'angeschrieben', title: 'Beworben', color: '#4fd1c5', icon: <Send size={16} /> },
  { id: 'besichtigung', title: 'Besichtigung', color: '#9f7aea', icon: <Calendar size={16} /> },
  { id: 'archiv', title: 'Archiv / Abgesagt', color: 'var(--text-muted)', icon: <Archive size={16} /> }
];

export default function PipelineView({ listings, onStatusChange, onOpenListing }) {
  // Sortierung der Inserate für die Spalten
  const getListingsForColumn = (colId) => {
    const validListings = listings;

    switch (colId) {
      case 'neu':
        return validListings.filter(l => l.status === 'neu' && !l.viewingDate);
      case 'favorit':
        return validListings.filter(l => l.status === 'favorit' && !l.viewingDate);
      case 'angeschrieben':
        return validListings.filter(l => l.status === 'angeschrieben' && !l.viewingDate);
      case 'besichtigung':
        return validListings.filter(l => l.viewingDate && l.status !== 'abgesagt' && l.status !== 'archiviert');
      case 'archiv':
        return validListings.filter(l => l.status === 'abgesagt' || l.status === 'archiviert');
      default:
        return [];
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '1rem',
      marginTop: '1.5rem',
      overflowX: 'auto',
      paddingBottom: '1rem',
      alignItems: 'start'
    }}>
      {COLUMNS.map(col => {
        const colListings = getListingsForColumn(col.id);

        return (
          <div 
            key={col.id} 
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
              minHeight: '450px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Spaltenkopf */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `2px solid ${col.color}`,
              paddingBottom: '0.5rem',
              marginBottom: '0.25rem'
            }}>
              <h3 style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                margin: 0
              }}>
                <span style={{ color: col.color, display: 'flex', alignItems: 'center' }}>{col.icon}</span>
                <span>{col.title}</span>
              </h3>
              <span style={{
                fontSize: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-muted)',
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                {colListings.length}
              </span>
            </div>

            {/* Inserate in der Spalte */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              overflowY: 'auto',
              maxHeight: '600px',
              paddingRight: '2px'
            }}>
              {colListings.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem 0.5rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border)',
                  borderRadius: '8px',
                  opacity: 0.5
                }}>
                  Keine Wohnungen
                </div>
              ) : (
                colListings.map(l => (
                  <div 
                    key={l.id}
                    style={{
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      position: 'relative',
                      transition: 'border-color 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = col.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <strong 
                        style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3, flex: 1 }}
                        title={l.title}
                      >
                        {l.title}
                      </strong>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: l.matchScore >= 80 ? '#10b981' : l.matchScore >= 60 ? '#ecc94b' : '#ef4444',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px'
                      }}>
                        {l.matchScore}%
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{l.priceWarm || l.priceKalt || '?'} € warm</span>
                      <span>{l.sqm || '?'} m²</span>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.25rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid rgba(255,255,255,0.03)'
                    }}>
                      <button
                        className="btn"
                        style={{ padding: '0.25rem 0.4rem', borderRadius: '6px' }}
                        onClick={() => onOpenListing(l)}
                        title="Details öffnen"
                      >
                        <Eye size={12} />
                      </button>

                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {/* Zurück-Pfeil (falls nicht Spalte Neu) */}
                        {col.id !== 'neu' && (
                          <button
                            className="btn"
                            style={{ padding: '0.25rem 0.4rem', borderRadius: '6px' }}
                            onClick={() => {
                              const prevStatuses = {
                                favorit: 'neu',
                                angeschrieben: 'favorit',
                                besichtigung: 'angeschrieben',
                                archiv: 'favorit'
                              };
                              const nextStatus = prevStatuses[col.id];
                              if (nextStatus) onStatusChange(l.id, nextStatus);
                            }}
                            title="Status zurücksetzen"
                          >
                            <ArrowLeft size={12} />
                          </button>
                        )}

                        {/* Weiter-Pfeil (falls nicht Spalte Archiv) */}
                        {col.id !== 'archiv' && col.id !== 'besichtigung' && (
                          <button
                            className="btn"
                            style={{ padding: '0.25rem 0.4rem', borderRadius: '6px' }}
                            onClick={() => {
                              const nextStatuses = {
                                neu: 'favorit',
                                favorit: 'angeschrieben',
                                angeschrieben: 'besichtigung' // (Für Besichtigung müssen sie eigentlich Termin setzen, aber als Fallback status)
                              };
                              let nextStatus = nextStatuses[col.id];
                              if (col.id === 'angeschrieben') {
                                // Status ändern, falls kein Besichtigungstermin vorhanden, sonst einfach beibehalten
                                nextStatus = 'favorit'; // Fallback
                              }
                              if (nextStatus) onStatusChange(l.id, nextStatus);
                            }}
                            title="In nächste Phase verschieben"
                          >
                            <ArrowRight size={12} />
                          </button>
                        )}
                        
                        {/* Direkt ins Archiv verschieben */}
                        {col.id !== 'archiv' && (
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.25rem 0.4rem', borderRadius: '6px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                            onClick={() => onStatusChange(l.id, 'abgesagt')}
                            title="Als abgesagt/Archiv markieren"
                          >
                            <Archive size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
