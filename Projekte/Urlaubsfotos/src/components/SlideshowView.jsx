import React, { useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  SlidersHorizontal, 
  Music 
} from 'lucide-react';

export default function SlideshowView({
  photos,
  slideshowIndex,
  setSlideshowIndex,
  isPlaying,
  setIsPlaying,
  slideshowSpeed,
  setSlideshowSpeed,
  kenBurns,
  setKenBurns,
  musicActive,
  setMusicActive,
  slideshowMood,
  setSlideshowMood,
  oceanWavesActive,
  setOceanWavesActive,
  slideshowVolume,
  setSlideshowVolume,
  setActiveView,
  audioCtx
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Canvas visualizer loop
  useEffect(() => {
    if (!musicActive || !audioCtx || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Try to find the analyser node from the AudioContext
    // We can also create it or find it if we connect it
    let analyser = null;
    try {
      // We search if there's an analyser node connected in the audioCtx
      // In our implementation in App.jsx, we will expose the analyser node or create it
      // Let's check if the window/audioCtx has the custom analyser node attached
      analyser = audioCtx.analyserNode || null;
    } catch (e) {
      console.warn("No analyser node found:", e);
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const bufferLength = analyser ? analyser.frequencyBinCount : 32;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Fallback simulated data if no analyser is connected yet
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.sin(Date.now() * 0.004 + i * 0.2) * 30 + 40;
        }
      }

      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = analyser ? (dataArray[i] / 2) : dataArray[i];

        // Draw double sided/symmetric bars
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.8)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [musicActive, audioCtx]);

  if (photos.length === 0) {
    return (
      <div className="animate-fade-in throwback-container">
        <div className="view-header" style={{ width: '100%', maxWidth: '900px' }}>
          <div>
            <h1 className="view-title">Deine Urlaubs-Highlights</h1>
            <p className="view-subtitle">Eine automatische Diashow deiner schönsten Reiseerinnerungen</p>
          </div>
        </div>
        <div className="card empty-state">
          <Camera size={64} className="logo-icon" />
          <h2>Keine Fotos für den Rückblick</h2>
          <p>Bitte lade zuerst einige Urlaubsbilder hoch, um eine Diashow zu generieren.</p>
          <button className="btn btn-primary" onClick={() => setActiveView('upload')}>
            Bilder importieren
          </button>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[slideshowIndex];
  const imgUrl = currentPhoto ? URL.createObjectURL(currentPhoto.blob) : '';

  return (
    <div className="animate-fade-in throwback-container">
      <div className="view-header" style={{ width: '100%', maxWidth: '900px' }}>
        <div>
          <h1 className="view-title">Deine Urlaubs-Highlights</h1>
          <p className="view-subtitle">Eine automatische Diashow deiner schönsten Reiseerinnerungen</p>
        </div>
      </div>

      <div className="slideshow-frame">
        {currentPhoto && (
          <>
            <img 
              src={imgUrl} 
              alt={currentPhoto.name} 
              className={`slideshow-image ${kenBurns ? 'ken-burns' : ''}`} 
            />
            <div className="slideshow-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <MapPin size={18} />
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                  {currentPhoto.location?.name || 'Schöne Urlaubserinnerung'}
                </h2>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem' }}>
                Aufgenommen am {new Date(currentPhoto.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                {currentPhoto.camera && ` mit ${currentPhoto.camera}`}
              </p>
              {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {currentPhoto.tags.map(tag => (
                    <span key={tag} className="badge badge-info" style={{ background: 'rgba(99, 102, 241, 0.3)' }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="slideshow-controls card">
        <button 
          className="btn btn-secondary" 
          onClick={() => setSlideshowIndex(prev => (prev - 1 + photos.length) % photos.length)}
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          {isPlaying ? 'Pause' : 'Abspielen'}
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setSlideshowIndex(prev => (prev + 1) % photos.length)}
        >
          <ChevronRight size={20} />
        </button>
        
        <div style={{ borderLeft: '1px solid var(--panel-border)', height: '24px', margin: '0 0.5rem' }}></div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={16} />
          <span style={{ fontSize: '0.85rem' }}>{slideshowSpeed}s</span>
          <input 
            type="range" 
            min="2" 
            max="15" 
            value={slideshowSpeed} 
            onChange={(e) => setSlideshowSpeed(parseInt(e.target.value))}
            style={{ width: '80px' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={kenBurns} 
            onChange={(e) => setKenBurns(e.target.checked)} 
          />
          Pan & Zoom
        </label>

        <button 
          className={`btn ${musicActive ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setMusicActive(!musicActive)}
          style={{ padding: '0.5rem 0.75rem' }}
        >
          <Music size={16} /> Ambient-Musik
        </button>
        
        {musicActive && (
          <>
            <div style={{ borderLeft: '1px solid var(--panel-border)', height: '24px', margin: '0 0.5rem' }}></div>
            
            <select
              value={slideshowMood}
              onChange={(e) => setSlideshowMood(e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
            >
              <option value="relaxed">Entspannt</option>
              <option value="melancholic">Melancholisch</option>
              <option value="joyful">Fröhlich</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={oceanWavesActive} 
                onChange={(e) => setOceanWavesActive(e.target.checked)} 
              />
              Meeresrauschen
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem' }}>Vol:</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={slideshowVolume} 
                onChange={(e) => setSlideshowVolume(parseInt(e.target.value))}
                style={{ width: '75px' }}
              />
            </div>
            
            <canvas 
              ref={canvasRef} 
              width={100} 
              height={32} 
              style={{ borderRadius: '4px', border: '1px solid var(--panel-border)', marginLeft: '0.5rem' }} 
            />
          </>
        )}
      </div>
    </div>
  );
}
