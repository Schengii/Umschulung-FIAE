import React, { useState, useRef, useEffect } from 'react';
import { X, MapPin, Tag, Sliders, RotateCw, Save, Heart, Trash2, Edit3, Crop } from 'lucide-react';

export default function ImageEditor({
  selectedPhoto,
  setSelectedPhoto,
  editorRotation,
  setEditorRotation,
  editorMirrorHorizontal,
  setEditorMirrorHorizontal,
  editorMirrorVertical,
  setEditorMirrorVertical,
  editorBrightness,
  setEditorBrightness,
  editorContrast,
  setEditorContrast,
  editorGrayscale,
  setEditorGrayscale,
  editorSepia,
  setEditorSepia,
  editorPreset,
  setEditorPreset,
  editorSaving,
  isEditingLocation,
  setIsEditingLocation,
  locationSearchQuery,
  setLocationSearchQuery,
  locationSearchLoading,
  locationSearchError,
  showExifDetails,
  setShowExifDetails,
  albums,
  savePhoto,
  loadPhotos,
  handleSearchLocation,
  handleRemoveLocation,
  handleSaveLocation,
  handleRemoveTag,
  handleAddTag,
  toggleFavorite,
  handleDelete,
  handleSaveEdits,
  getEditorFilterCSS
}) {
  // Crop & Draw states
  const [drawMode, setDrawMode] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444');
  const [drawWidth, setDrawWidth] = useState(5);
  const [editorSaturate, setEditorSaturate] = useState(100);

  // Crop values in percentage from edge (0 - 50%)
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Initialize and resize drawing canvas to match displayed image
  useEffect(() => {
    if (drawMode && canvasRef.current && imgRef.current) {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [drawMode, editorRotation, editorMirrorHorizontal, editorMirrorVertical]);

  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Support both Touch and Mouse
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawWidth;
    isDrawingRef.current = true;
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearDrawing = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const onSaveClick = () => {
    let drawingDataUrl = null;
    if (canvasRef.current) {
      // Create a temporary canvas of the high-res rotated size to draw paths proportionally
      // But to keep it simple and clean, we scale the overlay canvas up to match the original image size.
      // To export, we pass the drawing data URL of the canvas overlay
      drawingDataUrl = canvasRef.current.toDataURL();
    }

    let cropArea = null;
    if (cropMode && (cropLeft > 0 || cropRight > 0 || cropTop > 0 || cropBottom > 0)) {
      cropArea = {
        x: cropLeft / 100,
        y: cropTop / 100,
        width: (100 - cropLeft - cropRight) / 100,
        height: (100 - cropTop - cropBottom) / 100
      };
    }

    handleSaveEdits(drawingDataUrl, cropArea, editorSaturate);
  };

  // Custom filter string including the new saturation slider
  const getFullFilterCSS = () => {
    let base = getEditorFilterCSS();
    if (editorSaturate !== 100) {
      base += ` saturate(${editorSaturate}%)`;
    }
    return base;
  };

  return (
    <div className="lightbox" onClick={() => setSelectedPhoto(null)}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>
          <X size={32} />
        </button>
        
        <div className="lightbox-media-container" style={{ position: 'relative' }}>
          <img 
            ref={imgRef}
            src={selectedPhoto.url} 
            alt={selectedPhoto.name} 
            className="lightbox-img" 
            style={{
              transform: `rotate(${editorRotation}deg) scale(${editorMirrorHorizontal ? -1 : 1}, ${editorMirrorVertical ? -1 : 1})`,
              filter: getFullFilterCSS(),
              transition: 'transform 0.2s ease',
              clipPath: cropMode 
                ? `inset(${cropTop}% ${cropRight}% ${cropBottom}% ${cropLeft}%)` 
                : 'none'
            }}
          />

          {/* Drawing Canvas Overlay */}
          {drawMode && (
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10,
                cursor: 'crosshair'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          )}

          {/* Cropping Guideline Grid */}
          {cropMode && (
            <div 
              style={{
                position: 'absolute',
                top: `${cropTop}%`,
                left: `${cropLeft}%`,
                right: `${cropRight}%`,
                bottom: `${cropBottom}%`,
                border: '2px dashed var(--primary)',
                pointerEvents: 'none',
                zIndex: 9
              }}
            >
              {/* Rule of thirds grid lines */}
              <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, borderLeft: '1px rgba(255,255,255,0.4) dashed' }} />
              <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, borderLeft: '1px rgba(255,255,255,0.4) dashed' }} />
              <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, borderTop: '1px rgba(255,255,255,0.4) dashed' }} />
              <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, borderTop: '1px rgba(255,255,255,0.4) dashed' }} />
            </div>
          )}
        </div>
        
        <div className="lightbox-info-sidebar card">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <MapPin size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.25rem', flex: 1, minWidth: '150px' }}>
                {selectedPhoto.location?.name || 'Kein Standort'}
              </h3>
              <button 
                onClick={() => {
                  setIsEditingLocation(!isEditingLocation);
                  setLocationSearchQuery(selectedPhoto.location?.name || '');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
              >
                {isEditingLocation ? 'Abbrechen' : 'Bearbeiten'}
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{selectedPhoto.name}</div>
            
            {isEditingLocation && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--panel-border)', marginTop: '0.5rem' }}>
                <form onSubmit={handleSearchLocation} style={{ display: 'flex', gap: '0.4rem' }}>
                  <input 
                    type="text" 
                    placeholder="Ort suchen (z.B. Rom)..."
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '0.35rem 0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} disabled={locationSearchLoading}>
                    {locationSearchLoading ? '...' : 'Suchen'}
                  </button>
                </form>
                {locationSearchError && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{locationSearchError}</div>
                )}
                
                <div id="mini-map-element" style={{ width: '100%', height: '150px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--panel-border)', marginTop: '0.25rem' }}></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>Marker ziehen zum Justieren</div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.35rem', flex: 1, fontSize: '0.75rem', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={handleRemoveLocation}>
                    Entfernen
                  </button>
                  <button className="btn btn-primary" style={{ padding: '0.35rem', flex: 1, fontSize: '0.75rem' }} onClick={handleSaveLocation}>
                    Speichern
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Move to Album Selector inside lightbox */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Album zuweisen</span>
            <select 
              value={selectedPhoto.albumId || ''} 
              onChange={async (e) => {
                const albumId = e.target.value || null;
                const updated = { ...selectedPhoto, albumId };
                await savePhoto(updated);
                loadPhotos();
                setSelectedPhoto(updated);
              }}
              style={{ padding: '0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', outline: 'none' }}
            >
              <option value="">Kein Album (Hauptgalerie)</option>
              {albums.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>

          {/* Tags panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tags</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {selectedPhoto.tags && selectedPhoto.tags.map(tag => (
                <span 
                  key={tag} 
                  className="badge badge-info" 
                  style={{ 
                    background: 'rgba(99, 102, 241, 0.15)', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    textTransform: 'none'
                  }}
                >
                  <Tag size={10} /> 
                  <span>{tag}</span>
                  <button 
                    onClick={() => handleRemoveTag(selectedPhoto, tag)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--text-muted)', 
                      cursor: 'pointer', 
                      display: 'inline-flex', 
                      padding: 0,
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Tag entfernen"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              placeholder="Tag hinzufügen + Enter..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag(selectedPhoto, e.target.value);
                  e.target.value = '';
                }
              }}
              style={{ 
                width: '100%', 
                padding: '0.4rem 0.6rem', 
                borderRadius: 'var(--radius-sm)', 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--panel-border)', 
                color: '#fff', 
                fontSize: '0.85rem', 
                outline: 'none',
                marginTop: '0.25rem'
              }}
            />
          </div>

          {/* Editor controls */}
          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={16} style={{ color: 'var(--secondary)' }} /> Bild-Filter & Drehen
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="editor-control-group">
                <div className="editor-label">
                  <span>Helligkeit</span>
                  <span>{editorBrightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={editorBrightness} 
                  onChange={(e) => setEditorBrightness(parseInt(e.target.value))}
                  className="editor-slider"
                />
              </div>

              <div className="editor-control-group">
                <div className="editor-label">
                  <span>Kontrast</span>
                  <span>{editorContrast}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={editorContrast} 
                  onChange={(e) => setEditorContrast(parseInt(e.target.value))}
                  className="editor-slider"
                />
              </div>

              <div className="editor-control-group">
                <div className="editor-label">
                  <span>Sättigung</span>
                  <span>{editorSaturate}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={editorSaturate} 
                  onChange={(e) => setEditorSaturate(parseInt(e.target.value))}
                  className="editor-slider"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={() => { setDrawMode(!drawMode); setCropMode(false); }}
                  className={`btn ${drawMode ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', flex: 1 }}
                >
                  <Edit3 size={14} /> Zeichnen
                </button>
                <button 
                  onClick={() => { setCropMode(!cropMode); setDrawMode(false); }}
                  className={`btn ${cropMode ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', flex: 1 }}
                >
                  <Crop size={14} /> Zuschneiden
                </button>
              </div>

              {drawMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span>Pinsel:</span>
                    <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} style={{ width: '32px', height: '20px', padding: 0, border: 'none', background: 'transparent' }} />
                    <input type="range" min="1" max="20" value={drawWidth} onChange={(e) => setDrawWidth(parseInt(e.target.value))} style={{ flex: 1 }} />
                  </div>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem', fontSize: '0.75rem' }} onClick={clearDrawing}>Zeichnung löschen</button>
                </div>
              )}

              {cropMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                  <div>Links abschneiden: {cropLeft}%</div>
                  <input type="range" min="0" max="40" value={cropLeft} onChange={(e) => setCropLeft(parseInt(e.target.value))} />
                  <div>Rechts abschneiden: {cropRight}%</div>
                  <input type="range" min="0" max="40" value={cropRight} onChange={(e) => setCropRight(parseInt(e.target.value))} />
                  <div>Oben abschneiden: {cropTop}%</div>
                  <input type="range" min="0" max="40" value={cropTop} onChange={(e) => setCropTop(parseInt(e.target.value))} />
                  <div>Unten abschneiden: {cropBottom}%</div>
                  <input type="range" min="0" max="40" value={cropBottom} onChange={(e) => setCropBottom(parseInt(e.target.value))} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={editorGrayscale} 
                    onChange={(e) => setEditorGrayscale(e.target.checked)} 
                  />
                  S/W
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={editorSepia} 
                    onChange={(e) => setEditorSepia(e.target.checked)} 
                  />
                  Sepia
                </label>
              </div>

              <div className="editor-control-group">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Vordefinierte Filter</span>
                <select
                  value={editorPreset}
                  onChange={(e) => setEditorPreset(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', color: '#fff', outline: 'none' }}
                >
                  <option value="none">Kein Filter</option>
                  <option value="vintage">Vintage (Sepia-Warm)</option>
                  <option value="cool">Cool (Bläulich-Kalt)</option>
                  <option value="warm">Warm (Satt-Warm)</option>
                  <option value="dramatic">Dramatic (Kontrastreich)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={editorMirrorHorizontal} 
                    onChange={(e) => setEditorMirrorHorizontal(e.target.checked)} 
                  />
                  H. spiegeln
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={editorMirrorVertical} 
                    onChange={(e) => setEditorMirrorVertical(e.target.checked)} 
                  />
                  V. spiegeln
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.5rem', flex: 1, fontSize: '0.85rem' }} 
                  onClick={() => setEditorRotation(prev => (prev + 90) % 360)}
                >
                  <RotateCw size={14} style={{ marginRight: '4px' }} /> Drehen
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.5rem', flex: 1, fontSize: '0.85rem' }} 
                  onClick={() => {
                    setEditorRotation(0);
                    setEditorBrightness(100);
                    setEditorContrast(100);
                    setEditorSaturate(100);
                    setEditorGrayscale(false);
                    setEditorSepia(false);
                    setEditorMirrorHorizontal(false);
                    setEditorMirrorVertical(false);
                    setEditorPreset('none');
                    setDrawMode(false);
                    setCropMode(false);
                    setCropLeft(0);
                    setCropRight(0);
                    setCropTop(0);
                    setCropBottom(0);
                  }}
                >
                  Zurücksetzen
                </button>
              </div>
              
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.6rem', width: '100%', marginTop: '0.25rem' }} 
                onClick={onSaveClick}
                disabled={editorSaving}
              >
                <Save size={16} style={{ marginRight: '4px' }} />
                {editorSaving ? 'Speichert...' : 'Bild speichern'}
              </button>
            </div>
          </div>

          {/* EXIF Info panel */}
          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', marginTop: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Aufnahmedatum</div>
                <strong>{new Date(selectedPhoto.date).toLocaleString('de-DE')}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Kamera</div>
                <strong>{selectedPhoto.camera || 'Keine Angabe'}</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Dateigröße</div>
                <strong>{(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB</strong>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Schärfegrad</div>
                <strong style={{ color: selectedPhoto.isBlurry ? 'var(--danger)' : 'var(--success)' }}>
                  {selectedPhoto.sharpness} ({selectedPhoto.isBlurry ? 'Verwackelt' : 'Scharf'})
                </strong>
              </div>
            </div>

            {/* Collapsible advanced EXIF panel */}
            {(selectedPhoto.iso || selectedPhoto.exposureTime || selectedPhoto.aperture || selectedPhoto.focalLength || selectedPhoto.flash) && (
              <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--panel-border)', paddingTop: '0.75rem' }}>
                <button 
                  onClick={() => setShowExifDetails(!showExifDetails)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', padding: 0, fontWeight: 600 }}
                >
                  <span>{showExifDetails ? 'Detaillierte Kamera-Infos ausblenden' : 'Detaillierte Kamera-Infos einblenden'}</span>
                  <span>{showExifDetails ? '▲' : '▼'}</span>
                </button>
                
                {showExifDetails && (
                  <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.15)', padding: '0.5rem', borderRadius: '4px' }}>
                    {selectedPhoto.iso && (
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>ISO</div>
                        <strong>{selectedPhoto.iso}</strong>
                      </div>
                    )}
                    {selectedPhoto.aperture && (
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Blende</div>
                        <strong>f/{selectedPhoto.aperture}</strong>
                      </div>
                    )}
                    {selectedPhoto.exposureTime && (
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Belichtungszeit</div>
                        <strong>{selectedPhoto.exposureTime}</strong>
                      </div>
                    )}
                    {selectedPhoto.focalLength && (
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Brennweite</div>
                        <strong>{selectedPhoto.focalLength} mm</strong>
                      </div>
                    )}
                    {selectedPhoto.flash && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ color: 'var(--text-muted)' }}>Blitz</div>
                        <strong>{selectedPhoto.flash}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button 
                className={`btn btn-secondary ${selectedPhoto.isFavorite ? 'active' : ''}`}
                onClick={(e) => toggleFavorite(selectedPhoto, e)}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
              >
                <Heart size={14} fill={selectedPhoto.isFavorite ? 'var(--accent)' : 'none'} style={{ marginRight: '4px' }} />
                {selectedPhoto.isFavorite ? 'Highlight' : 'Zu Highlights'}
              </button>
              <button 
                className="btn btn-secondary"
                style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
                onClick={(e) => handleDelete(selectedPhoto.id, e)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
