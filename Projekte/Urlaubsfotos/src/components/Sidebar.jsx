import React from 'react';
import { 
  Sparkles, 
  FolderOpen, 
  Plus, 
  Image as ImageIcon, 
  Map as MapIcon, 
  Users, 
  BarChart3, 
  UploadCloud, 
  AlertTriangle, 
  Layers, 
  Cloud,
  Mail 
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  activeAlbumId,
  setActiveAlbumId,
  albums,
  photos,
  storageQuota,
  setShowNewAlbumModal,
  setSlideshowIndex,
  accessToken,
  loadGooglePhotos,
  loadBackups,
  currentProfile,
  handleProfileChange,
  onLockProfile,
  onSetupPIN
}) {
  const isPrivateLocked = localStorage.getItem(`profile_pin_${currentProfile}`);

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <Sparkles className="logo-icon" size={28} />
        <span className="logo-text">UrlaubsMomente</span>
      </div>

      {/* Profile Selector Panel */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> Profil</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isPrivateLocked ? (
              <button onClick={onLockProfile} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }} title="Sperren">🔒</button>
            ) : (
              <button onClick={onSetupPIN} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }} title="PIN einrichten">🔑 PIN</button>
            )}
          </div>
        </div>
        <select 
          value={currentProfile} 
          onChange={(e) => handleProfileChange(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', outline: 'none', color: '#fff' }}
        >
          <option value="default">Standard-Profil</option>
          <option value="private">Privates Profil</option>
          <option value="family">Familien-Profil</option>
        </select>
      </div>
      
      {/* Album Selector Panel */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FolderOpen size={14} /> Album</span>
          <button 
            onClick={() => setShowNewAlbumModal(true)} 
            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            <Plus size={16} />
          </button>
        </div>
        <select 
          value={activeAlbumId} 
          onChange={(e) => { setActiveAlbumId(e.target.value); setActiveView('gallery'); }}
          style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', outline: 'none' }}
        >
          <option value="all">Alle Alben (Gesamt)</option>
          {albums.map(a => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>

      <ul className="nav-links">
        <li>
          <button 
            className={`nav-btn ${activeView === 'gallery' ? 'active' : ''}`}
            onClick={() => { setActiveView('gallery'); }}
          >
            <ImageIcon className="icon-element" size={20} />
            Deine Fotos
          </button>
        </li>
        <li>
          <button 
            className={`nav-btn ${activeView === 'albums' ? 'active' : ''}`}
            onClick={() => { setActiveView('albums'); }}
          >
            <FolderOpen className="icon-element" size={20} />
            Deine Alben
          </button>
        </li>
        <li>
          <button 
            className={`nav-btn ${activeView === 'map' ? 'active' : ''}`}
            onClick={() => { setActiveView('map'); }}
          >
            <MapIcon className="icon-element" size={20} />
            Reise-Karte
          </button>
        </li>
        <li>
          <button 
            className={`nav-btn ${activeView === 'people' ? 'active' : ''}`}
            onClick={() => { setActiveView('people'); }}
          >
            <Users className="icon-element" size={20} />
            Personen
          </button>
        </li>
        <li>
          <button 
            className={`nav-btn ${activeView === 'stats' ? 'active' : ''}`}
            onClick={() => { setActiveView('stats'); }}
          >
            <BarChart3 className="icon-element" size={20} />
            Statistiken
          </button>
        </li>
        <li>
          <button 
            className={`nav-btn ${activeView === 'upload' ? 'active' : ''}`}
            onClick={() => { setActiveView('upload'); }}
          >
            <UploadCloud className="icon-element" size={20} />
            Importieren
          </button>
        </li>
        <li>
          <button 
            className={`nav-btn ${activeView === 'review' ? 'active' : ''}`}
            onClick={() => { setActiveView('review'); }}
          >
            <AlertTriangle className="icon-element" size={20} />
            Qualitäts-Check
            {photos.filter(p => p.isBlurry).length > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto', borderRadius: '10px' }}>
                {photos.filter(p => p.isBlurry).length}
              </span>
            )}
          </button>
        </li>
        <li>
          <button 
            className={`nav-btn ${activeView === 'throwback' ? 'active' : ''}`}
            onClick={() => { setActiveView('throwback'); setSlideshowIndex(0); }}
          >
            <Layers className="icon-element" size={20} />
            Rückblick
          </button>
        </li>
        <li>
          <button 
            className={`nav-btn ${activeView === 'postcard' ? 'active' : ''}`}
            onClick={() => { setActiveView('postcard'); }}
          >
            <Mail className="icon-element" size={20} />
            Postkarte
          </button>
        </li>
        <li>
          <button 
            className={`nav-btn ${activeView === 'cloud' ? 'active' : ''}`}
            onClick={() => { 
              setActiveView('cloud'); 
              if (accessToken) { 
                loadGooglePhotos(); 
                loadBackups(); 
              } 
            }}
          >
            <Cloud className="icon-element" size={20} />
            Cloud-Anbindung
          </button>
        </li>
      </ul>

      <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Speicherbelegung:</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{storageQuota.used} MB von {storageQuota.total} GB</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Fotos gesamt: {photos.length}</div>
      </div>
    </aside>
  );
}
