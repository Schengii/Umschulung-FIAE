import React from 'react';
import { Lock, LogOut, Upload, RefreshCw, Download } from 'lucide-react';

export default function CloudConnection({
  accessToken,
  clientId,
  setClientId,
  googlePhotos,
  backups,
  cloudLoading,
  syncStatus,
  nextPageToken,
  photos,
  handleSaveClientId,
  handleGoogleLogin,
  handleGoogleLogout,
  handleCreateBackup,
  loadBackups,
  handleRestoreBackup,
  loadGooglePhotos,
  importGooglePhoto
}) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="view-header">
        <div>
          <h1 className="view-title">Cloud-Anbindung</h1>
          <p className="view-subtitle">Verbinde die App mit Google Drive und Google Fotos</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={20} style={{ color: 'var(--primary)' }} /> Google API Einrichtung
        </h3>
        
        {!accessToken ? (
          <form onSubmit={handleSaveClientId} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Gib deine **Google Client-ID** aus der Google Cloud Console ein, um die Cloud-Dienste freizuschalten.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Deine Client-ID (z.B. 12345-abc.apps.googleusercontent.com)" 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', outline: 'none' }}
                required
              />
              <button type="submit" className="btn btn-secondary">Speichern</button>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleGoogleLogin} style={{ alignSelf: 'flex-start' }}>
              Mit Google Konto anmelden
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-success">Angemeldet</span>
              <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Du bist erfolgreich mit deinem Google-Konto verbunden.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={handleGoogleLogout}>
              <LogOut size={16} /> Abmelden
            </button>
          </div>
        )}

        {syncStatus && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '0.9rem' }}>
            {syncStatus}
          </div>
        )}
      </div>

      {accessToken && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Google Drive Backups */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={20} style={{ color: 'var(--secondary)' }} /> Google Drive Backups
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Sichere deine gesamte lokale Datenbank (Bilder & Metadaten) in Google Drive oder stelle sie wieder her.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button className="btn btn-primary" onClick={handleCreateBackup} disabled={cloudLoading || photos.length === 0}>
                Backup erstellen
              </button>
              <button className="btn btn-secondary" onClick={loadBackups} disabled={cloudLoading}>
                <RefreshCw size={16} /> Liste aktualisieren
              </button>
            </div>

            {backups.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {backups.map(b => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Erstellt am: {new Date(b.createdTime).toLocaleString()}</div>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleRestoreBackup(b.id)} disabled={cloudLoading}>
                      Wiederherstellen
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                Keine Backups gefunden. Erstelle jetzt dein erstes Cloud-Backup!
              </div>
            )}
          </div>

          {/* Google Fotos Import */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={20} style={{ color: 'var(--accent)' }} /> Google Fotos Import
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Importiere Urlaubsbilder direkt aus deinem Google Fotos-Konto in diese Offline-Galerie.
            </p>

            <button className="btn btn-primary" onClick={() => loadGooglePhotos()} style={{ marginBottom: '1.5rem' }} disabled={cloudLoading}>
              Google Fotos durchsuchen
            </button>

            {googlePhotos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {googlePhotos.map(gp => (
                  <div key={gp.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => importGooglePhoto(gp)}>
                    <img src={`${gp.baseUrl}=w150-h150-c`} alt={gp.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, display: 'flex', alignItems: 'center', justify: 'center', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                      <Download size={20} style={{ color: '#fff' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {nextPageToken && (
              <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => loadGooglePhotos(nextPageToken)} disabled={cloudLoading}>
                Mehr laden...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
