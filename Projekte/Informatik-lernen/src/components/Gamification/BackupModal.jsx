import React, { useState } from 'react';
import { Download, Upload, ShieldCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { exportUserDataJSON, importUserDataJSON } from '../../utils/storage';

export default function BackupModal({ isOpen, onClose, onStateRestored }) {
  const [importStatus, setImportStatus] = useState(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportUserDataJSON();
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonString = event.target.result;
      const success = importUserDataJSON(jsonString);
      if (success) {
        setImportStatus({ success: true, text: 'Lernfortschritt erfolgreich wiederhergestellt!' });
        setTimeout(() => {
          onStateRestored();
          onClose();
        }, 1500);
      } else {
        setImportStatus({ success: false, text: 'Ungültiges Backup-Dateiformat!' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '550px',
          width: '100%',
          background: 'var(--bg-card)',
          border: '2px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: 'var(--shadow-card)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          aria-label="Schließen"
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <ShieldCheck size={36} style={{ color: 'var(--accent-teal)', marginBottom: '8px' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
            Daten-Backup & Wiederherstellung
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Exportiere deinen Lernfortschritt (XP, Level, Badges) als JSON-Datei oder lade ein bestehendes Backup hoch.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Export Button */}
          <button
            className="btn btn-primary"
            onClick={handleExport}
            style={{ width: '100%', minHeight: '48px', gap: '8px', fontSize: '1rem' }}
          >
            <Download size={20} /> Fortschritt als Backup herunterladen (JSON)
          </button>

          {/* Import Button */}
          <label
            className="btn btn-secondary"
            style={{ width: '100%', minHeight: '48px', gap: '8px', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Upload size={20} /> Backup-Datei hochladen & wiederherstellen
            <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
          </label>
        </div>

        {importStatus && (
          <div style={{ marginTop: '20px', padding: '12px', borderRadius: 'var(--radius-md)', background: importStatus.success ? 'rgba(5, 150, 105, 0.15)' : 'rgba(225, 29, 72, 0.15)', color: importStatus.success ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
            {importStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{importStatus.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
