import React, { useState } from 'react';
import { Trash2, CheckCircle, AlertTriangle, Layers, Image as ImageIcon } from 'lucide-react';

export default function QualityCheck({
  photos,
  deleteBlurryPhotos,
  setActiveView,
  setSelectedPhoto,
  handleDelete
}) {
  const [activeTab, setActiveTab] = useState('blurry');
  const blurryPhotos = photos.filter(p => p.isBlurry);

  // Group similar photos taken within 15 seconds and with similar file sizes
  const getDuplicateGroups = () => {
    const groups = [];
    const visited = new Set();
    const sorted = [...photos].sort((a, b) => new Date(a.date) - new Date(b.date));

    for (let i = 0; i < sorted.length; i++) {
      if (visited.has(sorted[i].id)) continue;
      
      const currentGroup = [sorted[i]];
      const p1 = sorted[i];
      
      for (let j = i + 1; j < sorted.length; j++) {
        if (visited.has(sorted[j].id)) continue;
        
        const p2 = sorted[j];
        const timeDiff = Math.abs(new Date(p1.date) - new Date(p2.date)) / 1000; // seconds
        
        if (timeDiff <= 15) {
          const sizeRatio = Math.max(p1.size, p2.size) / Math.min(p1.size, p2.size);
          // If size ratio is very close, we assume duplicates/bursts
          if (sizeRatio < 1.25) {
            currentGroup.push(p2);
            visited.add(p2.id);
          }
        } else {
          // Since it's sorted by date, we can break early
          break;
        }
      }
      
      if (currentGroup.length > 1) {
        visited.add(p1.id);
        groups.push(currentGroup);
      }
    }
    return groups;
  };

  const duplicateGroups = getDuplicateGroups();

  return (
    <div className="animate-fade-in">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="view-title">Qualitäts-Check</h1>
          <p className="view-subtitle">Aussortieren von unscharfen Bildern und Serienaufnahmen (Duplikaten)</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
        <button 
          className={`filter-btn ${activeTab === 'blurry' ? 'active' : ''}`}
          onClick={() => setActiveTab('blurry')}
          style={{ background: 'transparent', padding: '0.5rem 1rem' }}
        >
          Unscharfe Fotos ({blurryPhotos.length})
        </button>
        <button 
          className={`filter-btn ${activeTab === 'duplicates' ? 'active' : ''}`}
          onClick={() => setActiveTab('duplicates')}
          style={{ background: 'transparent', padding: '0.5rem 1rem' }}
        >
          Serienaufnahmen & Duplikate ({duplicateGroups.length})
        </button>
      </div>

      {activeTab === 'blurry' ? (
        blurryPhotos.length === 0 ? (
          <div className="card empty-state">
            <CheckCircle size={64} style={{ color: 'var(--success)' }} />
            <h2>Alles gestochen scharf!</h2>
            <p>Es wurden keine verwackelten oder unscharfen Fotos in deiner Galerie gefunden.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button className="btn btn-danger" onClick={deleteBlurryPhotos}>
                <Trash2 size={16} /> Alle unscharfen Bilder löschen ({blurryPhotos.length})
              </button>
            </div>
            <div className="photo-grid">
              {blurryPhotos.map(photo => {
                const imgUrl = URL.createObjectURL(photo.thumbnailBlob || photo.blob);
                const originalUrl = URL.createObjectURL(photo.blob);

                return (
                  <div 
                    key={photo.id} 
                    className="photo-card"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    onClick={() => setSelectedPhoto({ ...photo, url: originalUrl })}
                  >
                    <img src={imgUrl} alt={photo.name} className="photo-img" />
                    <div className="photo-overlay" style={{ opacity: 1 }}>
                      <div className="photo-top-actions">
                        <button 
                          className="action-icon-btn"
                          style={{ background: 'var(--danger)' }}
                          onClick={(e) => handleDelete(photo.id, e)}
                          title="Foto löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="photo-bottom-info">
                        <div className="photo-location" style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} />
                          Unscharf (Schärfe: {photo.sharpness})
                        </div>
                        <div className="photo-date" style={{ fontSize: '0.75rem' }}>{photo.name}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      ) : (
        /* DUPLICATES TAB */
        duplicateGroups.length === 0 ? (
          <div className="card empty-state">
            <CheckCircle size={64} style={{ color: 'var(--success)' }} />
            <h2>Keine Duplikate gefunden!</h2>
            <p>Es wurden keine aufeinanderfolgenden, fast identischen Fotos gefunden.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {duplicateGroups.map((group, groupIdx) => {
              // Recommend keeping the sharpest image
              const bestPhoto = [...group].sort((a, b) => b.sharpness - a.sharpness)[0];

              return (
                <div key={groupIdx} className="card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={18} style={{ color: 'var(--primary)' }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Serie #{groupIdx + 1} ({group.length} Fotos)</h3>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ color: 'var(--danger)', fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      onClick={async () => {
                        if (confirm('Möchtest du alle schlechteren Alternativen in dieser Gruppe löschen?')) {
                          for (const p of group) {
                            if (p.id !== bestPhoto.id) {
                              await handleDelete(p.id);
                            }
                          }
                        }
                      }}
                    >
                      Alternativen löschen (Beste behalten)
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                    {group.map(photo => {
                      const imgUrl = URL.createObjectURL(photo.thumbnailBlob || photo.blob);
                      const originalUrl = URL.createObjectURL(photo.blob);
                      const isBest = photo.id === bestPhoto.id;

                      return (
                        <div 
                          key={photo.id} 
                          className="photo-card" 
                          style={{ 
                            height: '180px', 
                            cursor: 'pointer',
                            borderColor: isBest ? 'var(--success)' : 'var(--panel-border)',
                            borderWidth: isBest ? '2px' : '1px'
                          }}
                          onClick={() => setSelectedPhoto({ ...photo, url: originalUrl })}
                        >
                          <img src={imgUrl} alt={photo.name} className="photo-img" />
                          <div className="photo-overlay" style={{ opacity: 1 }}>
                            {isBest && (
                              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--success)', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                                Beste Wahl (Schärfe: {photo.sharpness})
                              </div>
                            )}
                            <div className="photo-top-actions">
                              <button 
                                className="action-icon-btn"
                                style={{ background: 'var(--danger)' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(photo.id);
                                }}
                                title="Dieses Foto löschen"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="photo-bottom-info">
                              <div className="photo-date" style={{ fontSize: '0.7rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{photo.name}</div>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{(photo.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

