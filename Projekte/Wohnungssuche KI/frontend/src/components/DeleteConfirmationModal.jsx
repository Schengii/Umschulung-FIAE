import React, { useState } from 'react';
import { X, Trash2, Brain } from 'lucide-react';

const COMMON_REASONS = [
  'Preis zu hoch / Miete unpassend',
  'Lage unpassend (z.B. falscher Stadtteil, Hauptstraße, laute Gegend)',
  'Zu klein / Zu wenige Zimmer',
  'Kein Balkon / Keine Terrasse',
  'Keine Einbauküche (EBK)',
  'Erdgeschosswohnung',
  'Haustiere verboten',
  'WBS erforderlich (Wohnberechtigungsschein)',
  'Tauschwohnung / Zwischenmiete / Untermiete',
  'Ausstattung veraltet / Renovierungsbedürftig'
];

export default function DeleteConfirmationModal({ listing, onClose, onConfirm }) {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [customReason, setCustomReason] = useState('');

  const handleCheckboxChange = (reason) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(selectedReasons, customReason);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trash2 size={20} style={{ color: 'var(--accent)' }} />
            <h2>Angebot löschen?</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ marginBottom: '1.25rem', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Möchtest du das Inserat <strong style={{ color: 'var(--text-main)' }}>"{listing.title}"</strong> wirklich aus deiner Liste löschen?
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>
                Warum möchtest du diese Wohnung löschen?
              </label>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Wähle einen oder mehrere Gründe aus, damit die KI dein Suchprofil optimieren kann.
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '0.5rem', 
                maxHeight: '220px', 
                overflowY: 'auto', 
                padding: '0.5rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.1)'
              }}>
                {COMMON_REASONS.map((reason) => (
                  <label 
                    key={reason} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.6rem', 
                      fontSize: '0.85rem', 
                      cursor: 'pointer',
                      padding: '0.25rem 0',
                      color: 'var(--text-main)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(reason)}
                      onChange={() => handleCheckboxChange(reason)}
                      style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customReason" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>
                Anderer Grund / Zusätzliche Details (Freitext):
              </label>
              <textarea
                id="customReason"
                placeholder="z.B. Wohnung liegt im Souterrain, Heizung veraltet, Haustiere verboten, etc."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{ minHeight: '80px', fontSize: '0.88rem' }}
              />
            </div>

            {/* AI Info Box */}
            <div style={{
              background: 'rgba(0, 242, 254, 0.05)',
              border: '1px solid rgba(0, 242, 254, 0.15)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <Brain size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '0.1rem' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                <strong>KI-Selbstoptimierung:</strong> Deine Antworten werden an die Gemini-Modelle gesendet. Die KI lernt daraus Ausschlusskriterien und filtert künftige Angebote genauer.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn" onClick={onClose}>
                Abbrechen
              </button>
              <button 
                type="submit" 
                className="btn btn-danger" 
                style={{ 
                  background: 'var(--accent)', 
                  borderColor: 'var(--accent)',
                  color: 'white'
                }}
              >
                <span>Entfernen & KI trainieren</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
