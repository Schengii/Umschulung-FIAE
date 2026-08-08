import React, { useState, useRef } from 'react';
import { Sparkles, Download, Grid, Check, RefreshCw } from 'lucide-react';

export default function PostcardView({ photos }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [layout, setLayout] = useState('single'); // single, split, grid
  const [theme, setTheme] = useState('polaroid'); // polaroid, classic, vintage, summer
  const [headline, setHeadline] = useState('Viele Grüße!');
  const [subline, setSubline] = useState('aus dem wunderschönen Urlaub');
  const [fontFamily, setFontFamily] = useState('Cursive'); // Cursive, Georgia, sans-serif
  const [exporting, setExporting] = useState(false);

  const canvasRef = useRef(null);

  const handleSelectPhoto = (id) => {
    const maxPhotos = layout === 'single' ? 1 : layout === 'split' ? 2 : 4;
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= maxPhotos) {
        return [...prev.slice(1), id]; // slide window
      }
      return [...prev, id];
    });
  };

  const getLimitText = () => {
    if (layout === 'single') return 'Wähle 1 Foto aus';
    if (layout === 'split') return 'Wähle bis zu 2 Fotos aus';
    return 'Wähle bis zu 4 Fotos aus';
  };

  const triggerDownload = async () => {
    if (selectedIds.length === 0) {
      alert('Bitte wähle zuerst mindestens ein Foto aus!');
      return;
    }
    setExporting(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const width = 1200;
      const height = 800;
      canvas.width = width;
      canvas.height = height;

      // Draw Theme background
      if (theme === 'polaroid') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'vintage') {
        ctx.fillStyle = '#faf7f2';
        ctx.fillRect(0, 0, width, height);
        // Vignette
        const gradient = ctx.createRadialGradient(width/2, height/2, 200, width/2, height/2, 700);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(139,90,43,0.15)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'summer') {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#fdba74');
        gradient.addColorStop(0.5, '#f472b6');
        gradient.addColorStop(1, '#38bdf8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      // Collect image elements
      const imgs = [];
      for (const id of selectedIds) {
        const photo = photos.find(p => p.id === id);
        if (photo) {
          const img = new Image();
          const url = URL.createObjectURL(photo.blob);
          img.src = url;
          await new Promise((resolve) => {
            img.onload = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = () => resolve();
          });
          imgs.push(img);
        }
      }

      // Draw Layout Image Areas
      const padding = theme === 'polaroid' ? 40 : theme === 'vintage' ? 30 : 50;
      const bottomAreaHeight = 180;
      const drawWidth = width - padding * 2;
      const drawHeight = height - padding - bottomAreaHeight;

      if (imgs.length > 0) {
        if (layout === 'single') {
          drawCover(ctx, imgs[0], padding, padding, drawWidth, drawHeight);
        } else if (layout === 'split') {
          const wHalf = drawWidth / 2 - 10;
          drawCover(ctx, imgs[0], padding, padding, wHalf, drawHeight);
          if (imgs[1]) {
            drawCover(ctx, imgs[1], padding + wHalf + 20, padding, wHalf, drawHeight);
          }
        } else if (layout === 'grid') {
          const wHalf = drawWidth / 2 - 10;
          const hHalf = drawHeight / 2 - 10;
          drawCover(ctx, imgs[0], padding, padding, wHalf, hHalf);
          if (imgs[1]) drawCover(ctx, imgs[1], padding + wHalf + 20, padding, wHalf, hHalf);
          if (imgs[2]) drawCover(ctx, imgs[2], padding, padding + hHalf + 20, wHalf, hHalf);
          if (imgs[3]) drawCover(ctx, imgs[3], padding + wHalf + 20, padding + hHalf + 20, wHalf, hHalf);
        }
      }

      // Apply vintage coloring if selected
      if (theme === 'vintage') {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          data[i] = r * 0.9 + g * 0.1;
          data[i+1] = g * 0.8 + r * 0.1;
          data[i+2] = b * 0.7 + g * 0.1;
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Text Render
      ctx.textAlign = 'center';
      
      let fontName = 'Georgia';
      if (fontFamily === 'Cursive') fontName = 'Brush Script MT, cursive, sans-serif';
      if (fontFamily === 'sans-serif') fontName = 'Outfit, sans-serif';

      ctx.fillStyle = theme === 'summer' ? '#ffffff' : '#0f172a';
      ctx.font = `italic bold 48px ${fontName}`;
      ctx.fillText(headline, width / 2, height - 90);

      ctx.fillStyle = theme === 'summer' ? 'rgba(255,255,255,0.85)' : '#475569';
      ctx.font = `24px ${fontName}`;
      ctx.fillText(subline, width / 2, height - 50);

      // Download
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `postkarte_${new Date().toISOString().split('T')[0]}.jpeg`;
      link.click();
    } catch (e) {
      console.error(e);
      alert('Fehler beim Exportieren der Postkarte.');
    } finally {
      setExporting(false);
    }
  };

  // Helper to draw image cover style
  function drawCover(ctx, img, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    const imgRatio = img.width / img.height;
    const areaRatio = w / h;

    let sx, sy, sWidth, sHeight;
    if (imgRatio > areaRatio) {
      sHeight = img.height;
      sWidth = img.height * areaRatio;
      sx = (img.width - sWidth) / 2;
      sy = 0;
    } else {
      sWidth = img.width;
      sHeight = img.width / areaRatio;
      sx = 0;
      sy = (img.height - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
    ctx.restore();
  }

  return (
    <div className="animate-fade-in">
      <div className="view-header">
        <div>
          <h1 className="view-title">Postkarten- & Collagen-Generator</h1>
          <p className="view-subtitle">Erstelle wunderschöne digitale Postkarten mit deinen Urlaubsfotos</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Side: Live Preview & Image Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Postcard Live Preview */}
          <div 
            style={{ 
              width: '100%', 
              aspectRatio: '3/2', 
              background: theme === 'polaroid' ? '#f8fafc' : theme === 'vintage' ? '#faf7f2' : theme === 'summer' ? 'linear-gradient(135deg, #fdba74, #f472b6, #38bdf8)' : '#ffffff', 
              borderRadius: '12px',
              padding: theme === 'polaroid' ? '30px' : theme === 'vintage' ? '20px' : '40px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#0f172a',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Grid Container */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: layout === 'single' ? '1fr' : 'repeat(2, 1fr)', gap: '15px' }}>
              {selectedIds.length === 0 ? (
                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', border: '2px dashed rgba(0,0,0,0.1)', height: '100%', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>
                  Bitte wähle Fotos aus der Liste unten aus
                </div>
              ) : (
                (() => {
                  const rendered = [];
                  const count = layout === 'single' ? 1 : layout === 'split' ? 2 : 4;
                  for (let i = 0; i < count; i++) {
                    const id = selectedIds[i];
                    if (id) {
                      const photo = photos.find(p => p.id === id);
                      const url = photo ? URL.createObjectURL(photo.blob) : null;
                      rendered.push(
                        <div key={i} style={{ background: `url(${url}) center/cover`, borderRadius: '6px', width: '100%', height: '100%', filter: theme === 'vintage' ? 'sepia(40%) contrast(90%)' : 'none' }} />
                      );
                    } else {
                      rendered.push(
                        <div key={i} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '6px', border: '1px dashed rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(0,0,0,0.3)', fontSize: '0.8rem' }}>Bildplatzhalter</div>
                      );
                    }
                  }
                  return rendered;
                })()
              )}
            </div>

            {/* Custom Texts */}
            <div style={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '15px' }}>
              <div 
                style={{ 
                  fontFamily: fontFamily === 'Cursive' ? 'Brush Script MT, cursive' : fontFamily === 'Georgia' ? 'Georgia' : 'Outfit',
                  fontStyle: 'italic',
                  fontSize: '2rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  color: theme === 'summer' ? '#fff' : '#0f172a'
                }}
              >
                {headline || 'Viele Grüße!'}
              </div>
              <div 
                style={{ 
                  fontFamily: fontFamily === 'Cursive' ? 'Brush Script MT, cursive' : fontFamily === 'Georgia' ? 'Georgia' : 'Outfit',
                  fontSize: '1rem',
                  textAlign: 'center',
                  color: theme === 'summer' ? 'rgba(255,255,255,0.85)' : '#475569',
                  marginTop: '4px'
                }}
              >
                {subline || 'aus dem Urlaub'}
              </div>
            </div>
          </div>

          {/* Photo Selector */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: 600 }}>{getLimitText()}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
              {photos.map(photo => {
                const isSelected = selectedIds.includes(photo.id);
                const thumbUrl = URL.createObjectURL(photo.thumbnailBlob || photo.blob);
                return (
                  <div 
                    key={photo.id}
                    onClick={() => handleSelectPhoto(photo.id)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '6px',
                      background: `url(${thumbUrl}) center/cover`,
                      cursor: 'pointer',
                      position: 'relative',
                      border: isSelected ? '3px solid var(--primary)' : '1px solid var(--panel-border)',
                      boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none'
                    }}
                  >
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Options Sidebar */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Layout</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={`btn ${layout === 'single' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => { setLayout('single'); setSelectedIds(prev => prev.slice(0, 1)); }}>1 Bild</button>
              <button className={`btn ${layout === 'split' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => { setLayout('split'); setSelectedIds(prev => prev.slice(0, 2)); }}>2 Bilder</button>
              <button className={`btn ${layout === 'grid' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => { setLayout('grid'); setSelectedIds(prev => prev.slice(0, 4)); }}>4 Bilder</button>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rahmen & Theme</h4>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', outline: 'none' }}
            >
              <option value="polaroid">Polaroid (Weiß)</option>
              <option value="classic">Klassisch (Minimalistisches Weiß)</option>
              <option value="vintage">Vintage Warm (Retro-Sepia)</option>
              <option value="summer">Sommer (Farbverlauf)</option>
            </select>
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Hauptzeile</h4>
            <input 
              type="text" 
              value={headline} 
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="z.B. Viele Grüße!"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Unterzeile</h4>
            <input 
              type="text" 
              value={subline} 
              onChange={(e) => setSubline(e.target.value)}
              placeholder="z.B. aus Rom 2025"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Schriftart</h4>
            <select 
              value={fontFamily} 
              onChange={(e) => setFontFamily(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', outline: 'none' }}
            >
              <option value="Cursive">Schreibschrift (Cursive)</option>
              <option value="Georgia">Serifen-Schrift (Georgia)</option>
              <option value="sans-serif">Modern (Sans-Serif)</option>
            </select>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={triggerDownload}
            disabled={exporting}
          >
            {exporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? 'Generiere...' : 'Postkarte herunterladen'}
          </button>
        </div>

      </div>

      {/* Hidden canvas for high-resolution render */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
