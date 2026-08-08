import React from 'react';
import { FileArchive, UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function UploadZone({
  activeAlbumId,
  albums,
  zipInputRef,
  fileInputRef,
  dragActive,
  syncStatus,
  uploadQueue,
  handleZipImport,
  handleDrag,
  handleDrop,
  handleFiles
}) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="view-header">
        <div>
          <h1 className="view-title">Fotos importieren</h1>
          <p className="view-subtitle">Zieh deine Urlaubsbilder per Drag & Drop hierhin</p>
        </div>
        <div>
          <button className="btn btn-secondary" onClick={() => zipInputRef.current.click()}>
            <FileArchive size={18} /> ZIP-Backup einlesen
          </button>
          <input 
            type="file" 
            ref={zipInputRef} 
            accept=".zip" 
            style={{ display: 'none' }} 
            onChange={handleZipImport} 
          />
        </div>
      </div>

      <div 
        className={`dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={(e) => { if (e.target.files.length) handleFiles(e.target.files); }}
        />
        <UploadCloud size={48} className="dropzone-icon" />
        <div>
          <h3>Bilder auswählen oder hineinziehen</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            EXIF-Daten, KI-Tags & Gesichter werden beim Import automatisch verarbeitet.
            {activeAlbumId !== 'all' && ` (Werden zu Album "${albums.find(a=>a.id===activeAlbumId)?.title}" hinzugefügt)`}
          </p>
        </div>
      </div>

      {syncStatus && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '0.9rem' }}>
          {syncStatus}
        </div>
      )}

      {uploadQueue.length > 0 && (
        <div className="upload-list animate-fade-in">
          <h3 style={{ marginBottom: '0.5rem' }}>Import-Status ({uploadQueue.length} Bilder)</h3>
          {uploadQueue.map(item => (
            <div key={item.id} className="upload-item">
              {item.thumbnail ? (
                <img src={item.thumbnail} className="upload-thumbnail" alt="" />
              ) : (
                <div className="upload-thumbnail-placeholder">
                  <ImageIcon size={20} />
                </div>
              )}
              <div className="upload-info">
                <div className="upload-filename">{item.name}</div>
                <div className="upload-status">
                  {item.status === 'pending' && <span className="badge badge-info">Warten</span>}
                  {item.status === 'converting' && <span className="badge badge-warning">Konvertiere HEIC...</span>}
                  {item.status === 'analyzing' && <span className="badge badge-warning">Qualitäts-, KI- & Gesichts-Analyse...</span>}
                  {item.status === 'saving' && <span className="badge badge-info">Speichern...</span>}
                  {item.status === 'done' && <span className="badge badge-success">Erfolgreich importiert</span>}
                  {item.status === 'error' && <span className="badge badge-danger">Fehler</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
