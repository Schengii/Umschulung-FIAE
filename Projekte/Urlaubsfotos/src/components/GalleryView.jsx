import React, { useState } from 'react';
import { 
  Plus, 
  FolderOpen, 
  Trash2, 
  Share2, 
  FileArchive, 
  UploadCloud, 
  Calendar, 
  Heart, 
  MapPin, 
  Tag,
  ImageIcon 
} from 'lucide-react';

export default function GalleryView({
  activeView,
  setActiveView,
  activeAlbumId,
  setActiveAlbumId,
  albums,
  photos,
  selectedPersonName,
  setSelectedPersonName,
  batchMode,
  setBatchMode,
  selectedPhotoIds,
  setSelectedPhotoIds,
  batchTagName,
  setBatchTagName,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
  trips,
  handleDeleteAlbum,
  handleShareGallery,
  exportLocalZip,
  handleToggleSelectPhoto,
  setSelectedPhoto,
  toggleFavorite,
  handleDelete,
  handleBatchDelete,
  handleBatchAssignAlbum,
  handleBatchAddTag,
  setShowNewAlbumModal
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getSuggestions = () => {
    const tags = new Set();
    const locations = new Set();
    const cameras = new Set();

    photos.forEach(p => {
      if (p.tags) p.tags.forEach(t => tags.add(t));
      if (p.location?.name) locations.add(p.location.name);
      if (p.camera) cameras.add(p.camera);
    });

    const list = [];
    tags.forEach(t => list.push({ label: `tag:${t}`, type: 'Tag' }));
    locations.forEach(l => list.push({ label: `ort:${l}`, type: 'Ort' }));
    cameras.forEach(c => list.push({ label: `kamera:${c}`, type: 'Kamera' }));
    
    if (!searchQuery) return list.slice(0, 8);
    
    const query = searchQuery.toLowerCase();
    return list.filter(item => 
      item.label.toLowerCase().includes(query)
    ).slice(0, 8);
  };

  const suggestions = getSuggestions();

  if (activeView === 'albums') {
    return (
      <div className="animate-fade-in">
        <div className="view-header">
          <div>
            <h1 className="view-title">Deine Alben</h1>
            <p className="view-subtitle">Organisiere deine Fotos in Sammlungen</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNewAlbumModal(true)}>
            <Plus size={18} /> Album erstellen
          </button>
        </div>

        {albums.length === 0 && photos.length === 0 ? (
          <div className="card empty-state">
            <FolderOpen size={64} className="logo-icon" />
            <h2>Noch keine Alben vorhanden</h2>
            <p>Erstelle ein neues Album oder importiere Fotos, um Sammlungen anzulegen.</p>
            <button className="btn btn-primary" onClick={() => setShowNewAlbumModal(true)}>
              Neues Album erstellen
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
            {/* Pseudo-album: All Photos */}
            <div 
              className="card" 
              style={{ cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '300px', padding: '1rem' }}
              onClick={() => { setActiveAlbumId('all'); setActiveView('gallery'); }}
            >
              <div 
                style={{ 
                  flex: 1, 
                  background: photos[0] ? `url(${URL.createObjectURL(photos[0].thumbnailBlob || photos[0].blob)}) center/cover` : '#0f121d', 
                  minHeight: '160px', 
                  borderRadius: 'var(--radius-md)' 
                }} 
              />
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Alle Fotos</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{photos.length} Fotos</p>
              </div>
            </div>

            {/* Actual albums */}
            {albums.map(album => {
              const albumPhotos = photos.filter(p => p.albumId === album.id);
              const coverPhoto = albumPhotos[0];
              const coverUrl = coverPhoto ? URL.createObjectURL(coverPhoto.thumbnailBlob || coverPhoto.blob) : null;
              
              return (
                <div 
                  key={album.id} 
                  className="card" 
                  style={{ cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '300px', padding: '1rem', position: 'relative' }}
                  onClick={() => { setActiveAlbumId(album.id); setActiveView('gallery'); }}
                >
                  <div 
                    style={{ 
                      flex: 1, 
                      background: coverUrl ? `url(${coverUrl}) center/cover` : '#0f121d', 
                      minHeight: '160px', 
                      borderRadius: 'var(--radius-md)' 
                    }} 
                  />
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{album.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{albumPhotos.length} Fotos</p>
                    </div>
                    <button 
                      className="action-icon-btn" 
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: 'var(--danger)', 
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        width: '32px',
                        height: '32px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAlbum(album.id, e);
                      }}
                      title="Album löschen"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Gallery View
  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <div>
          <h1 className="view-title">
            {activeAlbumId !== 'all' ? albums.find(a => a.id === activeAlbumId)?.title : 'Deine Urlaubsfotos'}
          </h1>
          <p className="view-subtitle">Übersichtlich sortiert nach Reisen, Datum und Orten</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {activeAlbumId !== 'all' && (
            <button className="btn btn-danger" onClick={(e) => handleDeleteAlbum(activeAlbumId, e)} style={{ padding: '0.5rem 1rem' }}>
              Album löschen
            </button>
          )}
          <button 
            className={`btn ${batchMode ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => {
              setBatchMode(!batchMode);
              setSelectedPhotoIds([]);
            }}
            title="Mehrere Fotos auswählen"
          >
            {batchMode ? 'Auswahl abbrechen' : 'Auswählen'}
          </button>
          <button className="btn btn-secondary" onClick={handleShareGallery} title="Online-Galerie exportieren">
            <Share2 size={18} /> Web-Export
          </button>
          <button className="btn btn-secondary" onClick={exportLocalZip} title="Daten als ZIP herunterladen">
            <FileArchive size={18} /> ZIP-Export
          </button>
          <button className="btn btn-primary" onClick={() => setActiveView('upload')}>
            <UploadCloud size={18} /> Fotos hinzufügen
          </button>
        </div>
      </div>

      {/* Selected Person filter indicator */}
      {selectedPersonName && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.1)' }}>
          <span style={{ fontSize: '0.95rem' }}>Gefiltert nach Person: <strong>{selectedPersonName}</strong></span>
          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setSelectedPersonName('')}>Filter aufheben</button>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="card empty-state">
          <ImageIcon size={64} className="logo-icon" />
          <h2>Noch keine Fotos hochgeladen</h2>
          <p>Importiere deine ersten Urlaubsbilder, um Highlights zu markieren, Unschärfen auszusortieren und Rückblicke zu generieren.</p>
          <button className="btn btn-primary" onClick={() => setActiveView('upload')}>
            Jetzt Fotos importieren
          </button>
        </div>
      ) : (
        <>
          <div className="gallery-controls">
            <div className="filter-group">
              <button 
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                Alle Bilder
              </button>
              <button 
                className={`filter-btn ${filterType === 'highlights' ? 'active' : ''}`}
                onClick={() => setFilterType('highlights')}
              >
                Highlights ★
              </button>
            </div>
            
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Suche nach Ort, Kamera, Tag..." 
                className="card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{ 
                  padding: '0.6rem 1.2rem', 
                  borderRadius: 'var(--radius-md)', 
                  width: '320px', 
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  className="card" 
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    zIndex: 100, 
                    marginTop: '0.5rem', 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem 0'
                  }}
                >
                  {suggestions.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSearchQuery(item.label);
                        setShowSuggestions(false);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem'
                      }}
                      className="suggestion-item"
                    >
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="empty-state">
              <h3>Keine passenden Fotos gefunden.</h3>
            </div>
          ) : (
            trips.map(trip => (
              <section key={trip.id} className="trip-section">
                <div className="trip-header">
                  <h2 className="trip-title">{trip.title}</h2>
                  <span className="trip-meta">
                    <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    {new Date(trip.startDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                    {trip.startDate !== trip.endDate && ` - ${new Date(trip.endDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    {` • ${trip.photos.length} Fotos`}
                  </span>
                </div>

                <div className="photo-grid">
                  {trip.photos.map(photo => {
                    const thumbUrl = URL.createObjectURL(photo.thumbnailBlob || photo.blob);
                    const originalUrl = URL.createObjectURL(photo.blob);
                    return (
                      <div 
                        key={photo.id} 
                        className="photo-card"
                        style={{ 
                          borderColor: selectedPhotoIds.includes(photo.id) ? 'var(--primary)' : 'var(--panel-border)',
                          borderWidth: selectedPhotoIds.includes(photo.id) ? '2px' : '1px'
                        }}
                        onClick={() => {
                          if (batchMode) {
                            handleToggleSelectPhoto(photo.id);
                          } else {
                            setSelectedPhoto({ ...photo, url: originalUrl });
                          }
                        }}
                      >
                        {batchMode && (
                          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
                            <input 
                              type="checkbox" 
                              checked={selectedPhotoIds.includes(photo.id)}
                              readOnly
                              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                          </div>
                        )}
                        <img src={thumbUrl} alt={photo.name} className="photo-img" loading="lazy" />
                        <div className="photo-overlay" style={batchMode ? { opacity: 0.85 } : {}}>
                          {!batchMode && (
                            <div className="photo-top-actions">
                              <button 
                                className={`action-icon-btn ${photo.isFavorite ? 'active' : ''}`}
                                onClick={(e) => toggleFavorite(photo, e)}
                                title="Highlight priorisieren"
                              >
                                <Heart size={16} fill={photo.isFavorite ? 'currentColor' : 'none'} />
                              </button>
                              <button 
                                className="action-icon-btn"
                                onClick={(e) => handleDelete(photo.id, e)}
                                title="Foto löschen"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}

                          <div className="photo-bottom-info">
                            <div className="photo-location">
                              <MapPin size={14} />
                              {photo.location?.name || 'Lokale Datei'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                              <div className="photo-date">
                                {new Date(photo.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </div>
                              {photo.tags && photo.tags.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <Tag size={10} /> {photo.tags[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </>
      )}

      {/* Batch Mode floating actions bar */}
      {batchMode && selectedPhotoIds.length > 0 && (
        <div 
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 12, 22, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--panel-border)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
          className="animate-fade-in"
        >
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            {selectedPhotoIds.length} Foto{selectedPhotoIds.length === 1 ? '' : 's'} ausgewählt
          </span>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={handleBatchDelete}>
              Löschen
            </button>
            
            <select 
              onChange={(e) => {
                handleBatchAssignAlbum(e.target.value);
                e.target.value = '';
              }}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
            >
              <option value="">Album zuweisen...</option>
              <option value="">Aus Album entfernen</option>
              {albums.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>

            <form onSubmit={handleBatchAddTag} style={{ display: 'flex', gap: '0.25rem' }}>
              <input 
                type="text" 
                placeholder="Tag hinzufügen..."
                value={batchTagName}
                onChange={(e) => setBatchTagName(e.target.value)}
                style={{ padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: '#fff', fontSize: '0.85rem', outline: 'none', width: '130px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                +
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
