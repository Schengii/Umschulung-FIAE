import React from 'react';
import { Users, Filter } from 'lucide-react';

export default function PeopleDashboard({ 
  photos, 
  selectedPersonName, 
  setSelectedPersonName, 
  setActiveView, 
  handleNameFace 
}) {
  // Extract named people groups
  const namedGroups = {};
  // Extract all unnamed faces
  const unnamedFaces = [];

  photos.forEach(photo => {
    if (photo.faces) {
      photo.faces.forEach(face => {
        if (face.name && face.name.trim() !== '') {
          if (!namedGroups[face.name]) {
            namedGroups[face.name] = {
              name: face.name,
              thumbnail: face.thumbnail,
              count: 0,
              id: face.id
            };
          }
          namedGroups[face.name].count += 1;
        } else {
          unnamedFaces.push({
            id: face.id,
            thumbnail: face.thumbnail,
            photoName: photo.name,
            photoId: photo.id
          });
        }
      });
    }
  });

  const namedList = Object.values(namedGroups);

  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <div>
          <h1 className="view-title">Personen-Übersicht</h1>
          <p className="view-subtitle">Verwalte deine Reisebegleiter und benenne gefundene Gesichter</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Benannte Personen ({namedList.length})</h2>
      {namedList.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Noch keine benannten Personen vorhanden. Benenne untenstehende Gesichter!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {namedList.map(group => (
            <div 
              key={group.name} 
              className="card" 
              style={{ 
                textAlign: 'center', 
                cursor: 'pointer',
                borderColor: selectedPersonName === group.name ? 'var(--primary)' : 'var(--panel-border)'
              }}
              onClick={() => {
                if (selectedPersonName === group.name) {
                  setSelectedPersonName(''); // toggle off
                } else {
                  setSelectedPersonName(group.name);
                  setActiveView('gallery');
                }
              }}
            >
              <img 
                src={group.thumbnail} 
                alt="" 
                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--panel-border)', marginBottom: '1rem' }} 
              />
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{group.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{group.count} {group.count === 1 ? 'Foto' : 'Fotos'}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Filter size={12} /> Filtern
              </span>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Unbenannte Gesichter ({unnamedFaces.length})</h2>
      {unnamedFaces.length === 0 ? (
        <div className="card empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
          <Users size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
          <h3>Alle Gesichter benannt!</h3>
          <p>Super! Es wurden keine unbenannten Gesichter mehr in deiner Galerie gefunden.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1.5rem' }}>
          {unnamedFaces.map(face => (
            <div key={face.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
              <img 
                src={face.thumbnail} 
                alt="" 
                style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--panel-border)', marginBottom: '0.75rem' }} 
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {face.photoName}
              </div>
              <input 
                type="text" 
                placeholder="Name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNameFace(face.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: '#fff', fontSize: '0.8rem', textAlign: 'center', outline: 'none' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
