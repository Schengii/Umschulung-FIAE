import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, Loader2, Link, FileText } from 'lucide-react';

export default function LinkImporter({ backendUrl, onClose, onImportSuccess }) {
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Automatischer Import per Link
  async function handleLinkImport(e) {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${backendUrl}/api/listings/import-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();

      if (data.success) {
        onImportSuccess(data.listing);
        onClose();
      } else if (data.fallback) {
        // Portal hat uns geblockt -> Fallback einblenden
        setShowFallback(true);
        setErrorMsg(data.message || 'Das Portal blockiert automatisches Auslesen. Bitte kopiere den Text manuell.');
      } else {
        setErrorMsg(data.error || 'Fehler beim Laden des Links.');
      }
    } catch (error) {
      setErrorMsg('Netzwerkfehler beim Importieren des Links.');
    } finally {
      setLoading(false);
    }
  }

  // 2. Manueller Import per Text-Copy-Paste
  async function handleTextImport(e) {
    e.preventDefault();
    if (!rawText) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${backendUrl}/api/listings/import-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, url })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Fehler beim Parsen des Texts.');
      }
      
      const data = await res.json();
      if (data.success) {
        onImportSuccess(data.listing);
        onClose();
      }
    } catch (error) {
      setErrorMsg(error.message || 'Fehler beim Importieren des Texts.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Wohnung importieren</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {!showFallback ? (
            <form onSubmit={handleLinkImport} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Inserat-Link (z. B. Immobilienscout24, Kleinanzeigen, WG-Gesucht)</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ position: 'relative', flexGrow: 1 }}>
                    <Link size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="https://www.immobilienscout24.de/expose/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <Loader2 size={18} className="spinner" /> : <Sparkles size={18} />}
                    <span>AI Analysieren</span>
                  </button>
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                position: 'relative',
                margin: '0.5rem 0'
              }}>
                <span style={{ background: 'var(--bg-surface)', padding: '0 10px', zIndex: 1, position: 'relative' }}>ODER</span>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', position: 'absolute', top: '50%', left: 0, right: 0, margin: 0 }} />
              </div>

              <button
                type="button"
                className="btn"
                style={{ justifyContent: 'center' }}
                onClick={() => setShowFallback(true)}
                disabled={loading}
              >
                <FileText size={18} />
                <span>Text manuell einfügen</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleTextImport} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label>Optionale URL der Wohnung</label>
                <input
                  type="text"
                  placeholder="https://www.immobilienscout24.de/expose/... (Hilft für Verlinkung)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Text oder HTML-Inhalt kopieren und hier einfügen</label>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Tipp: Drücke auf der Wohnungsseite <kbd>Strg + A</kbd> (alles markieren) und dann <kbd>Strg + C</kbd> (kopieren) und füge es einfach komplett hier ein.
                </p>
                <textarea
                  placeholder="Füge hier den gesamten Text der Anzeige ein..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  disabled={loading}
                  style={{ minHeight: '200px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setShowFallback(false)} disabled={loading}>
                  Zurück
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || !rawText}>
                  {loading ? <Loader2 size={18} className="spinner" /> : <Sparkles size={18} />}
                  <span>Text mit AI parsen & bewerten</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
