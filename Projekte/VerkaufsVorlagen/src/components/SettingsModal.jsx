import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';

export default function SettingsModal({ 
  apiKey, 
  history, 
  onSaveApiKey, 
  onClose, 
  onImportHistory,
  showToast 
}) {
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const handleSave = () => {
    if (inputRef.current) {
      onSaveApiKey(inputRef.current.value);
    }
  };

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `listerai_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Historie erfolgreich exportiert!");
    } catch {
      showToast("Fehler beim Exportieren der Historie.");
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportHistory(parsed);
          showToast("Historie erfolgreich importiert!");
        } else {
          showToast("Fehler: Sicherung muss ein JSON-Array sein.");
        }
      } catch {
        showToast("Ungültige Sicherungsdatei.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>Gemini API & Backup Setup</h3>
          <button type="button" className="close-btn" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }} onClick={onClose}>✕</button>
        </div>
        
        {/* API Key settings */}
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Gemini API-Schlüssel</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="AIzaSy..." 
            defaultValue={apiKey}
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
          />
          <span className="key-help" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4 }}>
            Dein Schlüssel wird ausschließlich verschlüsselt im lokalen Speicher deines Browsers (localStorage) abgelegt.
          </span>
        </div>

        {/* Import/Export Backup settings */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600 }}>Daten sichern & wiederherstellen</label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
            Sichere deine Vorlagen und Statistiken lokal auf deinem Computer, um Datenverlust zu vermeiden.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', gap: '6px', justifyContent: 'center' }}
              onClick={handleExport}
            >
              <Download size={14} />
              Exportieren
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', gap: '6px', justifyContent: 'center' }}
              onClick={() => fileInputRef.current.click()}
            >
              <Upload size={14} />
              Importieren
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".json"
              onChange={handleImport}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
