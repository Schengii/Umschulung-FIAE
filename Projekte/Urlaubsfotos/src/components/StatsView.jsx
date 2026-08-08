import React from 'react';
import { 
  Map as MapIcon, 
  CheckCircle, 
  FileArchive, 
  MapPin, 
  Camera 
} from 'lucide-react';

export default function StatsView({ stats, storageQuota }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="view-header">
        <div>
          <h1 className="view-title">Reise-Statistiken</h1>
          <p className="view-subtitle">Deine Reiseabenteuer in Zahlen</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <MapIcon size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalDistance} km</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Reisestrecke gesamt</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <CheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.avgSharpness}</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ø Foto-Schärfegrad</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <FileArchive size={32} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalStorageMB} MB</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Speicherplatz belegt (max. {storageQuota.total} GB)</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}><MapPin size={18} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Beliebteste Orte</h3>
          {stats.topLocations.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.topLocations.map(([name, count]) => (
                <li key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                  <span>{name}</span>
                  <strong>{count} Fotos</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keine Orte in den Fotos erfasst.</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}><Camera size={18} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Kameras & Handys</h3>
          {stats.cameras.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.cameras.map(([name, count]) => (
                <li key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                  <span>{name}</span>
                  <strong>{count} Fotos</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keine Kamerainformationen in EXIF-Daten gefunden.</p>
          )}
        </div>
      </div>
    </div>
  );
}
