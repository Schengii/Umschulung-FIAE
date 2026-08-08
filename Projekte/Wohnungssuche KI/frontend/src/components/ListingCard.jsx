import React from 'react';
import { MapPin, Home, Euro, Layers, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ListingCard({ listing, onClick, onStatusChange, onDelete, deviceLocation, preferences }) {
  const {
    id,
    title,
    priceKalt,
    priceWarm,
    sqm,
    rooms,
    location,
    portal,
    url,
    matchScore,
    status,
    images = [],
    distanceKm,
    travelTimeDrivingMin,
    travelTimeFootMin,
    travelTimeBicycleMin,
    lat,
    lon,
    isKauf,
    isTausch
  } = listing;

  const [currentImgIdx, setCurrentImgIdx] = React.useState(0);

  // Score Farbe bestimmen
  function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  // Deutsche Bezeichnungen für Portale
  function getPortalName(portal) {
    const names = {
      'kleinanzeigen': 'Kleinanzeigen',
      'immoscout24': 'ImmoScout24',
      'immowelt': 'Immowelt',
      'ohne-makler': 'Ohne Makler',
      'wg-gesucht': 'WG-Gesucht',
      'immonet': 'Immonet',
      'meinestadt': 'MeineStadt',
      'wohnungsboerse': 'Wohnungsbörse',
      'sonstige': 'Sonstiges'
    };
    return names[portal] || (portal ? portal.charAt(0).toUpperCase() + portal.slice(1) : 'Unbekannt');
  }

  const pricePerSqm = priceKalt && sqm ? (priceKalt / sqm).toFixed(2) : null;

  // Live-Entfernung zum aktuellen Standort berechnen
  let liveDistanceKm = null;
  if (deviceLocation && deviceLocation.lat && deviceLocation.lon && lat && lon) {
    const R = 6371;
    const dLat = (lat - deviceLocation.lat) * Math.PI / 180;
    const dLon = (lon - deviceLocation.lon) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deviceLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    liveDistanceKm = Math.round(R * c * 10) / 10;
  }

  const isKo = matchScore === 10;

  return (
    <div 
      className={`card ${status === 'neu' ? 'card-new' : ''} ${isKo ? 'card-ko' : ''}`}
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        opacity: isKo ? 0.75 : 1,
        borderColor: isKo ? 'rgba(239, 68, 68, 0.3)' : undefined,
        boxShadow: isKo ? '0 2px 8px rgba(239, 68, 68, 0.05)' : undefined,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => {
        if (isKo) {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.15)';
        }
      }}
      onMouseLeave={e => {
        if (isKo) {
          e.currentTarget.style.opacity = '0.75';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.05)';
        }
      }}
    >
      {/* Bild & "NEU"-Badge */}
      <div 
        className="card-image" 
        style={{ 
          width: '100%', 
          height: '180px', 
          borderRadius: 'var(--radius-md)', 
          overflow: 'hidden', 
          marginBottom: '1rem', 
          border: '1px solid var(--border)', 
          background: 'linear-gradient(135deg, rgba(13, 19, 39, 0.4) 0%, rgba(20, 28, 56, 0.4) 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {images && images.length > 0 ? (
          <img src={images[currentImgIdx]} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Home size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
        )}

        {/* Fotoalbum Navigation */}
        {images && images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImgIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(3, 7, 18, 0.6)',
                border: '1px solid var(--border)',
                color: 'white',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
                zIndex: 10
              }}
            >
              <ChevronLeft size={16} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImgIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(3, 7, 18, 0.6)',
                border: '1px solid var(--border)',
                color: 'white',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
                zIndex: 10
              }}
            >
              <ChevronRight size={16} />
            </button>

            {/* Foto-Vorschauen (Thumbnails) */}
            <div 
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                display: 'flex',
                gap: '4px',
                zIndex: 15,
                background: 'rgba(3, 7, 18, 0.6)',
                padding: '3px',
                borderRadius: '6px',
                backdropFilter: 'blur(4px)',
                maxWidth: '65%',
                overflowX: 'auto'
              }}
              onClick={e => e.stopPropagation()}
            >
              {images.slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImgIdx(idx);
                  }}
                  style={{
                    width: '28px',
                    height: '28px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: `1.5px solid ${currentImgIdx === idx ? 'var(--primary)' : 'transparent'}`,
                    cursor: 'pointer',
                    opacity: currentImgIdx === idx ? 1 : 0.6,
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => e.target.style.opacity = '1'}
                  onMouseLeave={e => {
                    if (currentImgIdx !== idx) e.target.style.opacity = '0.6';
                  }}
                />
              ))}
              {images.length > 4 && (
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    background: 'rgba(3, 7, 18, 0.8)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid transparent',
                    flexShrink: 0,
                    userSelect: 'none'
                  }}
                  title={`${images.length - 4} weitere Bilder`}
                >
                  +{images.length - 4}
                </div>
              )}
            </div>

            {/* Foto Zaehler */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(3, 7, 18, 0.7)',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              color: '#e5e7eb',
              fontWeight: 600,
              zIndex: 10
            }}>
              {currentImgIdx + 1} / {images.length}
            </div>
          </>
        )}

        {/* Badges */}
        {(() => {
          const cardBadges = [];
          if (status === 'neu') cardBadges.push({ text: 'NEU', bg: 'var(--primary)', color: '#030712', shadow: 'rgba(0, 242, 254, 0.4)' });
          if (isKo) cardBadges.push({ text: 'K.O.', bg: '#ef4444', color: 'white', shadow: 'rgba(239, 68, 68, 0.4)' });
          if (isTausch) cardBadges.push({ text: 'TAUSCH', bg: '#a855f7', color: 'white', shadow: 'rgba(168, 85, 247, 0.4)' });
          if (isKauf) cardBadges.push({ text: 'KAUF', bg: '#f59e0b', color: 'white', shadow: 'rgba(245, 158, 11, 0.4)' });
          
          return (
            <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', zIndex: 5 }}>
              {cardBadges.map((b, idx) => (
                <div key={idx} style={{
                  background: b.bg,
                  color: b.color,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  boxShadow: `0 4px 12px ${b.shadow}`,
                  letterSpacing: '0.5px'
                }}>
                  {b.text}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Kostenfalle Warnung */}
        {listing.hiddenCosts?.detected && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#ef4444',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.25rem 0.5rem',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title={listing.hiddenCosts.details || 'Achtung: Kostenfalle erkannt!'}
          >
            <span>⚠️ Kostenfalle</span>
          </div>
        )}
      </div>

      <div className="card-header">
        <h4 className="card-title" title={title}>{title}</h4>
        <div className={`score-badge ${getScoreClass(matchScore || 50)}`}>
          {matchScore ? `${matchScore}%` : '?'}
        </div>
      </div>

      <div className="card-location">
        <MapPin size={14} />
        <span>
          {location || 'Keine Ortsangabe'}
          {distanceKm !== undefined && distanceKm !== null && (
            <span style={{ color: 'var(--accent)', marginLeft: '0.5rem', fontWeight: 600 }} title="Entfernung zur Haupt-Zieladresse">
              ({distanceKm.toFixed(1)} km)
            </span>
          )}
          {liveDistanceKm !== null && (
            <span style={{ color: 'var(--primary)', marginLeft: '0.5rem', fontWeight: 600 }} title="Live-Entfernung zum aktuellen Standort">
              (📍 {liveDistanceKm.toFixed(1)} km)
            </span>
          )}
        </span>
      </div>

      {/* Pendelzeit-Anzeige */}
      {(travelTimeDrivingMin > 0 || travelTimeFootMin > 0 || travelTimeBicycleMin > 0) && (
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', marginTop: '-0.25rem', flexWrap: 'wrap' }}>
          {travelTimeDrivingMin > 0 && (
            <span>🚗 <strong style={{ color: 'var(--text-main)' }}>{travelTimeDrivingMin} Min</strong></span>
          )}
          {travelTimeBicycleMin > 0 && (
            <span>🚲 <strong style={{ color: 'var(--text-main)' }}>{travelTimeBicycleMin} Min</strong></span>
          )}
          {travelTimeFootMin > 0 && (
            <span>🚶 <strong style={{ color: 'var(--text-main)' }}>{travelTimeFootMin} Min</strong></span>
          )}
        </div>
      )}

      {/* Partner-Abstimmung (Badges) */}
      {preferences?.partnerModeEnabled && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          fontSize: '0.78rem',
          flexWrap: 'wrap',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1.5px dashed var(--border)',
          borderRadius: '8px',
          padding: '0.35rem 0.5rem',
          alignItems: 'center'
        }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            👥 Votum:
          </span>
          {(() => {
            const votes = listing.partnerVotes || {};
            const renderBadge = (name, vote) => {
              let voteText = '⏳';
              let color = 'var(--text-muted)';
              let bg = 'rgba(255, 255, 255, 0.05)';
              let border = '1px solid var(--border)';
              
              if (vote === 'like') {
                voteText = '👍';
                color = '#10b981';
                bg = 'rgba(16, 185, 129, 0.15)';
                border = '1px solid rgba(16, 185, 129, 0.3)';
              } else if (vote === 'dislike') {
                voteText = '👎';
                color = '#ef4444';
                bg = 'rgba(239, 68, 68, 0.15)';
                border = '1px solid rgba(239, 68, 68, 0.3)';
              }

              return (
                <span key={name} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: color,
                  background: bg,
                  border: border
                }}>
                  {name}: {voteText}
                </span>
              );
            };

            return (
              <>
                {renderBadge(preferences.partnerAName || 'Partner A', votes.partnerA)}
                {renderBadge(preferences.partnerBName || 'Partner B', votes.partnerB)}
              </>
            );
          })()}
        </div>
      )}

      <div className="card-details">
        <div className="detail-item">
          <Euro size={14} />
          <span>Warm: <span>{priceWarm ? `${priceWarm} €` : 'N/A'}</span></span>
        </div>
        <div className="detail-item">
          <Layers size={14} />
          <span>Fläche: <span>{sqm ? `${sqm} m²` : 'N/A'}</span></span>
        </div>
        <div className="detail-item">
          <Home size={14} />
          <span>Zimmer: <span>{rooms ? `${rooms}` : 'N/A'}</span></span>
        </div>
        <div className="detail-item">
          <Euro size={14} style={{ opacity: 0.5 }} />
          <span style={{ opacity: 0.8 }}>
            Kalt: <span>{priceKalt ? `${priceKalt} €` : 'N/A'}</span>
          </span>
        </div>
      </div>

      {pricePerSqm && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: '-0.5rem', paddingLeft: '0.2rem' }}>
          Mietpreis pro qm: <strong style={{ color: 'var(--text-main)' }}>{pricePerSqm} €/m²</strong>
        </div>
      )}

      <div className="card-footer" onClick={(e) => e.stopPropagation()}>
        <span className={`portal-tag ${portal}`}>
          {getPortalName(portal)}
        </span>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={status}
            onChange={(e) => onStatusChange(id, e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              width: 'auto'
            }}
          >
            <option value="neu">Neu</option>
            <option value="gelesen">Gelesen</option>
            <option value="favorit">Favorit</option>
            <option value="angeschrieben">Angeschrieben</option>
            <option value="abgesagt">Abgesagt</option>
            <option value="archiviert">Archiviert</option>
          </select>

          <button
            className="btn"
            style={{ padding: '0.35rem', borderRadius: '6px' }}
            onClick={onClick}
            title="Details ansehen"
          >
            <Eye size={14} />
          </button>

          <button
            className="btn btn-danger"
            style={{ padding: '0.35rem', borderRadius: '6px' }}
            onClick={() => onDelete(id)}
            title="Löschen"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
