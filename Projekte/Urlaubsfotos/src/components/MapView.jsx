import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Map as MapIcon, Edit3, Trash2, Palette, Check } from 'lucide-react';

export default function MapView({ photos, activeAlbumId, groupPhotosIntoTrips }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [editMode, setEditMode] = useState(false);
  const [routeColor, setRouteColor] = useState(localStorage.getItem('map_route_color') || '#6366f1');
  const [customWaypoints, setCustomWaypoints] = useState(() => {
    try {
      const stored = localStorage.getItem(`map_waypoints_${activeAlbumId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Save waypoints to localStorage
  useEffect(() => {
    localStorage.setItem(`map_waypoints_${activeAlbumId}`, JSON.stringify(customWaypoints));
  }, [customWaypoints, activeAlbumId]);

  // Save routeColor to localStorage
  useEffect(() => {
    localStorage.setItem('map_route_color', routeColor);
  }, [routeColor]);

  // Map drawing effect
  useEffect(() => {
    const photosToDisplay = photos.filter(p => {
      if (activeAlbumId !== 'all' && p.albumId !== activeAlbumId) return false;
      return p.location && p.location.latitude && p.location.longitude;
    });

    // Small delay to ensure the container is mounted and has dimensions
    const timer = setTimeout(() => {
      if (!mapInstanceRef.current && mapContainerRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current).setView([48.0, 11.0], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current);
        markersGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;
      const group = markersGroupRef.current;

      if (group && map) {
        group.clearLayers();
        let bounds = [];
        
        // Render photo markers
        photosToDisplay.forEach(photo => {
          const { latitude, longitude, name } = photo.location;
          const imgUrl = URL.createObjectURL(photo.thumbnailBlob || photo.blob);
          
          const popupContent = `
            <div style="font-family: Outfit, sans-serif; text-align: center; width: 120px;">
              <img src="${imgUrl}" style="width: 100px; height: 75px; object-fit: cover; border-radius: 6px; margin-bottom: 5px;"/>
              <div style="font-weight:600; font-size:11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${photo.name}</div>
              <div style="color:var(--text-muted); font-size:10px;">${name || 'Ortsangabe'}</div>
            </div>
          `;
          
          const marker = L.marker([latitude, longitude]).bindPopup(popupContent);
          group.addLayer(marker);
          bounds.push([latitude, longitude]);
        });
        
        // Render photo route lines
        if (!editMode) {
          const mapTrips = groupPhotosIntoTrips(photosToDisplay);
          mapTrips.forEach(trip => {
            const tripCoords = trip.photos
              .filter(p => p.location && p.location.latitude && p.location.longitude)
              .map(p => [p.location.latitude, p.location.longitude]);
            
            if (tripCoords.length > 1) {
              L.polyline(tripCoords, {
                color: 'var(--primary)',
                weight: 3,
                opacity: 0.6,
                dashArray: '6, 8',
                lineJoin: 'round'
              }).addTo(group);
            }
          });
        }

        // Render Custom Waypoints (Interactive Route)
        if (customWaypoints.length > 0) {
          const customCoords = customWaypoints.map(wp => [wp.lat, wp.lng]);
          
          // Draw custom polyline
          L.polyline(customCoords, {
            color: routeColor,
            weight: 4,
            opacity: 0.85,
            lineJoin: 'round'
          }).addTo(group);

          // Draw draggable waypoint markers
          customWaypoints.forEach((wp, index) => {
            const marker = L.marker([wp.lat, wp.lng], {
              draggable: editMode,
              title: wp.name
            }).addTo(group);

            const popupDiv = document.createElement('div');
            popupDiv.style.fontFamily = 'Outfit, sans-serif';
            popupDiv.style.textAlign = 'center';
            popupDiv.innerHTML = `
              <div style="font-weight:600; font-size:12px; margin-bottom:4px;">${wp.name}</div>
              <div style="color:var(--text-muted); font-size:10px; margin-bottom:6px;">Wegpunkt #${index + 1}</div>
            `;

            if (editMode) {
              const renameBtn = document.createElement('button');
              renameBtn.className = 'btn btn-secondary';
              renameBtn.style.padding = '0.2rem 0.5rem';
              renameBtn.style.fontSize = '10px';
              renameBtn.style.marginRight = '4px';
              renameBtn.innerText = 'Umbenennen';
              renameBtn.onclick = () => {
                const newName = prompt('Name für diesen Wegpunkt:', wp.name);
                if (newName) {
                  setCustomWaypoints(prev => prev.map(item => item.id === wp.id ? { ...item, name: newName } : item));
                }
              };

              const deleteBtn = document.createElement('button');
              deleteBtn.className = 'btn btn-danger';
              deleteBtn.style.padding = '0.2rem 0.5rem';
              deleteBtn.style.fontSize = '10px';
              deleteBtn.innerText = 'Löschen';
              deleteBtn.onclick = () => {
                setCustomWaypoints(prev => prev.filter(item => item.id !== wp.id));
              };

              popupDiv.appendChild(renameBtn);
              popupDiv.appendChild(deleteBtn);
            }

            marker.bindPopup(popupDiv);

            if (editMode) {
              marker.on('dragend', (e) => {
                const newLatLng = e.target.getLatLng();
                setCustomWaypoints(prev => prev.map(item => 
                  item.id === wp.id ? { ...item, lat: newLatLng.lat, lng: newLatLng.lng } : item
                ));
              });
            }

            bounds.push([wp.lat, wp.lng]);
          });
        }

        // Fit bounds if we have elements
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Add map click listener for adding waypoints in editMode
        map.off('click');
        if (editMode) {
          map.on('click', (e) => {
            const newWp = {
              id: `wp-${Date.now()}`,
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              name: `Station ${customWaypoints.length + 1}`
            };
            setCustomWaypoints(prev => [...prev, newWp]);
          });
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [photos, activeAlbumId, groupPhotosIntoTrips, editMode, customWaypoints, routeColor]);

  // Cleanup Leaflet
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  const totalWithLocation = photos.filter(p => p.location?.latitude).length;

  return (
    <div className="animate-fade-in">
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="view-title">Deine Reise-Karte</h1>
          <p className="view-subtitle">Entdecke deine Urlaubsfotos visualisiert auf der Weltkarte</p>
        </div>

        {/* Route Editor Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${editMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setEditMode(!editMode)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {editMode ? <Check size={16} /> : <Edit3 size={16} />}
            {editMode ? 'Routen-Editor beenden' : 'Routen-Editor'}
          </button>

          {editMode && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--panel-border)' }}>
                <Palette size={14} style={{ color: routeColor }} />
                <input 
                  type="color" 
                  value={routeColor} 
                  onChange={(e) => setRouteColor(e.target.value)} 
                  style={{ width: '30px', height: '20px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }} 
                />
              </div>

              <button 
                className="btn btn-secondary"
                style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => {
                  if (confirm('Möchtest du die gesamte manuelle Route löschen?')) {
                    setCustomWaypoints([]);
                  }
                }}
              >
                <Trash2 size={16} /> Route leeren
              </button>
            </>
          )}
        </div>
      </div>

      {editMode && (
        <div className="card" style={{ padding: '0.75rem 1.5rem', marginBottom: '1.25rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
          💡 <strong>Routen-Editor aktiv</strong>: Klicke auf eine beliebige Stelle auf der Karte, um eine neue Station hinzuzufügen. Stationen können im Bearbeitungsmodus direkt gezogen oder angeklickt werden.
        </div>
      )}

      {totalWithLocation === 0 && customWaypoints.length === 0 ? (
        <div className="card empty-state">
          <MapIcon size={64} className="logo-icon" />
          <h2>Keine Fotos mit Standortdaten</h2>
          <p>Importiere Bilder, die GPS-Koordinaten enthalten, oder verwende den Routen-Editor, um eine manuelle Route zu zeichnen.</p>
        </div>
      ) : (
        <div className="map-view-container">
          <div id="map-element" ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
      )}
    </div>
  );
}
