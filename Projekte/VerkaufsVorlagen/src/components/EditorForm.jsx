import React, { useState } from 'react';
import { Sparkles, Euro, RefreshCw, RotateCw, Globe, Camera, AlertTriangle, Lightbulb } from 'lucide-react';
import InvoiceScanner from './InvoiceScanner';
import ShippingCalculator from './ShippingCalculator';
import { rewriteDescription, translateDescription, generateTags, analyzePhotoQuality } from '../gemini';

export default function EditorForm({
  currentItem,
  uploadedImages,
  activeImageId,
  apiKey,
  onChange,
  onSetActiveImageId,
  onSetAsCover,
  onDeleteImage,
  onUpdateImage,
  onAddImagesClick,
  onReAnalyze,
  showToast
}) {
  const [selectedTone, setSelectedTone] = useState('Locker & Freundlich');
  const [isRewriting, setIsRewriting] = useState(false);

  const [selectedLang, setSelectedLang] = useState('Englisch');
  const [isTranslating, setIsTranslating] = useState(false);

  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [isAnalyzingPhotos, setIsAnalyzingPhotos] = useState(false);

  const handleRewrite = async () => {
    if (!currentItem.description) {
      showToast('Bitte gib zuerst eine Beschreibung ein.');
      return;
    }
    setIsRewriting(true);
    showToast('Beschreibung wird umgeschrieben...');
    try {
      const newText = await rewriteDescription(currentItem.description, selectedTone, apiKey);
      onChange('description', newText);
      showToast('Beschreibung erfolgreich umgeschrieben!');
    } catch (err) {
      showToast(err.message || 'Fehler beim Umschreiben.');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleTranslate = async () => {
    if (!currentItem.description) {
      showToast('Bitte gib zuerst eine Beschreibung ein.');
      return;
    }
    setIsTranslating(true);
    showToast('Beschreibung wird übersetzt...');
    try {
      const translatedText = await translateDescription(currentItem.description, selectedLang, apiKey);
      onChange('description', translatedText);
      showToast('Beschreibung erfolgreich übersetzt!');
    } catch (err) {
      showToast(err.message || 'Fehler beim Übersetzen.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRotateImage = () => {
    if (!activeImage) return;
    
    showToast('Bild wird rotiert...');
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Rotate 90 degrees clockwise
      canvas.width = img.height;
      canvas.height = img.width;
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const newUrl = URL.createObjectURL(blob);
          onUpdateImage(activeImage.id, newUrl, blob);
          showToast('Bild erfolgreich rotiert!');
        } else {
          showToast('Fehler beim Rotieren.');
        }
      }, 'image/jpeg', 0.9);
    };
    img.onerror = () => {
      showToast('Konnte Bild nicht laden. Rotation fehlgeschlagen.');
    };
    img.src = activeImage.url;
  };

  const handleRemoveBackground = () => {
    if (!activeImage) return;
    
    showToast('Hintergrund wird entfernt...');
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Sample the corners to detect background color average
      const cornerPixels = [
        { r: data[0], g: data[1], b: data[2] }, // top-left
        { r: data[(canvas.width - 1) * 4], g: data[(canvas.width - 1) * 4 + 1], b: data[(canvas.width - 1) * 4 + 2] }, // top-right
        { r: data[data.length - 4], g: data[data.length - 3], b: data[data.length - 2] } // bottom-right
      ];
      
      const avgBg = {
        r: Math.round(cornerPixels.reduce((s, p) => s + p.r, 0) / 3),
        g: Math.round(cornerPixels.reduce((s, p) => s + p.g, 0) / 3),
        b: Math.round(cornerPixels.reduce((s, p) => s + p.b, 0) / 3),
      };
      
      const isBgLight = (avgBg.r + avgBg.g + avgBg.b) / 3 > 120;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        let shouldClear = false;
        
        if (isBgLight) {
          const dist = Math.sqrt(Math.pow(r - avgBg.r, 2) + Math.pow(g - avgBg.g, 2) + Math.pow(b - avgBg.b, 2));
          const brightness = (r + g + b) / 3;
          if (dist < 45 || brightness > 210) {
            shouldClear = true;
          }
        } else {
          const brightness = (r + g + b) / 3;
          if (brightness > 200) {
            shouldClear = true;
          }
        }
        
        if (shouldClear) {
          data[i] = 255;
          data[i+1] = 255;
          data[i+2] = 255;
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const newUrl = URL.createObjectURL(blob);
          onUpdateImage(activeImage.id, newUrl, blob);
          showToast('Hintergrund erfolgreich bereinigt (Studio-Look)!');
        } else {
          showToast('Fehler bei der Bildverarbeitung.');
        }
      }, 'image/jpeg', 0.9);
    };
    img.onerror = () => {
      showToast('Konnte Bild nicht laden. Hintergrund-Bereinigung fehlgeschlagen.');
    };
    img.src = activeImage.url;
  };

  const handleGenerateTags = async () => {
    if (!currentItem.name) {
      showToast('Bitte gib zuerst einen Anzeigentitel ein.');
      return;
    }
    setIsGeneratingTags(true);
    showToast('Schlagwörter werden generiert...');
    try {
      let result = '';
      if (!apiKey) {
        // Mock tags
        result = '#pro #graphit #topzustand #smartphone #apple';
        showToast('Mock-Modus: Schlagwörter simuliert.');
      } else {
        result = await generateTags(currentItem.name, currentItem.description || '', apiKey);
      }
      onChange('tags', result);
      showToast('Schlagwörter erfolgreich generiert!');
    } catch (err) {
      showToast(err.message || 'Fehler beim Generieren der Schlagwörter.');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleAnalyzePhotos = async () => {
    if (uploadedImages.length === 0) {
      showToast('Bitte lade zuerst mindestens ein Bild hoch.');
      return;
    }
    setIsAnalyzingPhotos(true);
    showToast('Fotos werden analysiert...');
    try {
      let result;
      if (!apiKey) {
        // Mock result
        result = {
          score: 6,
          tips: [
            { type: 'warning', text: 'Der Hintergrund wirkt unruhig. Fotografiere auf einer neutralen, hellen Fläche.' },
            { type: 'tip', text: 'Ergänze ein Detailfoto, das Gebrauchsspuren oder besondere Merkmale zeigt.' },
            { type: 'tip', text: 'Nutze natürliches Tageslicht statt künstlicher Beleuchtung für klarere Farben.' },
          ]
        };
        showToast('Mock-Modus: Foto-Analyse simuliert.');
      } else {
        const blobs = uploadedImages.slice(0, 3).map(img => img.file).filter(Boolean);
        if (blobs.length === 0) {
          showToast('Keine lokalem Bilder verfügbar. Lade neue Bilder hoch.');
          setIsAnalyzingPhotos(false);
          return;
        }
        result = await analyzePhotoQuality(blobs, apiKey);
      }
      setPhotoAnalysis(result);
      showToast('Foto-Analyse abgeschlossen!');
    } catch (err) {
      showToast(err.message || 'Fehler bei der Foto-Analyse.');
    } finally {
      setIsAnalyzingPhotos(false);
    }
  };

  const activeImage = uploadedImages.find(img => img.id === activeImageId) || uploadedImages.find(img => img.isCover) || uploadedImages[0];

  return (
    <div className="glass-panel editor-card" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Objektdetails anpassen</h2>
        <span className="badge badge-condition">{currentItem.condition}</span>
      </div>

      <div className="gallery-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <div className="image-preview-container" style={{ position: 'relative' }}>
          {activeImage && (
            <img src={activeImage.url} alt="Hauptansicht" className="image-preview" />
          )}
          {activeImage?.isCover && (
            <span className="badge badge-condition" style={{ backgroundColor: 'var(--primary)', color: '#fff', borderColor: 'transparent' }}>
              Hauptbild
            </span>
          )}

          {activeImage && (
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '6px', background: 'rgba(13,15,20,0.85)', backdropFilter: 'blur(4px)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                onClick={handleRemoveBackground}
              >
                <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                Studio-Look
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 10px', fontSize: '0.8rem', gap: '6px', background: 'rgba(13,15,20,0.85)', backdropFilter: 'blur(4px)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                onClick={handleRotateImage}
              >
                <RotateCw size={14} />
                Drehen
              </button>
            </div>
          )}
        </div>
        
        {/* Thumbnail Row */}
        <div className="gallery-thumbnails" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
          {uploadedImages.map((img) => (
            <div 
              key={img.id} 
              className={`gallery-thumb-container ${img.id === activeImageId ? 'active' : ''} ${img.isCover ? 'cover' : ''}`}
              onClick={() => onSetActiveImageId(img.id)}
            >
              <img src={img.url} alt="Miniaturansicht" className="gallery-thumb-img" />
              <div className="gallery-thumb-actions">
                {!img.isCover && (
                  <button 
                    type="button"
                    className="thumb-action-btn cover-btn" 
                    onClick={(e) => { e.stopPropagation(); onSetAsCover(img.id); }}
                    title="Als Hauptbild festlegen"
                  >
                    ★
                  </button>
                )}
                <button 
                  type="button"
                  className="thumb-action-btn delete-btn" 
                  onClick={(e) => { e.stopPropagation(); onDeleteImage(img.id); }}
                  title="Bild entfernen"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          
          {uploadedImages.length < 5 && (
            <div 
              className="gallery-thumb-add"
              onClick={onAddImagesClick}
              title="Weiteres Bild hochladen"
            >
              <span>+</span>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }} 
            onClick={onReAnalyze}
          >
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            Neu analysieren (KI)
          </button>
          <button 
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}
            onClick={handleAnalyzePhotos}
            disabled={isAnalyzingPhotos}
          >
            <Camera size={16} style={{ color: 'var(--accent-amber)' }} />
            {isAnalyzingPhotos ? 'Analysiere...' : 'Foto-Check (KI)'}
          </button>
        </div>

        {/* Photo quality results */}
        {photoAnalysis && (
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>📷 Foto-Qualität</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(photoAnalysis.score / 10) * 100}%`, height: '100%', borderRadius: '3px', background: photoAnalysis.score >= 8 ? '#00bc7e' : photoAnalysis.score >= 5 ? '#ffb61e' : '#f87171' }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: photoAnalysis.score >= 8 ? '#00bc7e' : photoAnalysis.score >= 5 ? '#ffb61e' : '#f87171' }}>
                  {photoAnalysis.score}/10
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {photoAnalysis.tips.map((tip, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.82rem' }}>
                  {tip.type === 'error' && <AlertTriangle size={13} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />}
                  {tip.type === 'warning' && <AlertTriangle size={13} style={{ color: '#ffb61e', flexShrink: 0, marginTop: '2px' }} />}
                  {tip.type === 'tip' && <Lightbulb size={13} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />}
                  <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Section */}
      <InvoiceScanner
        currentItem={currentItem}
        apiKey={apiKey}
        onInvoiceExtracted={(details) => onChange('purchaseDetails', details)}
        onRemoveInvoice={() => onChange('purchaseDetails', null)}
        showToast={showToast}
      />

      {/* Form Fields */}
      <div className="form-group" style={{ marginTop: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Anzeigentitel</label>
        <input 
          type="text" 
          className="input-field" 
          value={currentItem.name} 
          onChange={(e) => onChange('name', e.target.value)} 
        />
      </div>

      <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Zustand</label>
          <select 
            className="input-field" 
            value={currentItem.condition} 
            onChange={(e) => onChange('condition', e.target.value)}
          >
            <option value="Neu">Neu (OVP)</option>
            <option value="Sehr gut">Sehr gut (Kaum Gebrauchsspuren)</option>
            <option value="Gut">Gut (Gebrauchsspuren vorhanden)</option>
            <option value="Akzeptabel">Akzeptabel (Deutliche Spuren)</option>
            <option value="Defekt / Ersatzteil">Defekt / Ersatzteil</option>
          </select>
        </div>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Verkaufspreis (€)</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="number" 
              className="input-field" 
              style={{ paddingLeft: '32px' }}
              value={currentItem.suggestedPrice} 
              onChange={(e) => onChange('suggestedPrice', parseFloat(e.target.value) || 0)} 
            />
            <Euro size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
          </div>
        </div>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Schmerzgrenze (€)</label>
          <div style={{ position: 'relative' }}>
            <input 
              type="number" 
              className="input-field" 
              style={{ paddingLeft: '32px' }}
              value={currentItem.minimumPrice || ''} 
              placeholder="z.B. 80"
              onChange={(e) => onChange('minimumPrice', parseFloat(e.target.value) || '')} 
            />
            <Euro size={16} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Funktionalität & Mängel</label>
        <input 
          type="text" 
          className="input-field" 
          value={currentItem.functionality} 
          onChange={(e) => onChange('functionality', e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Nutzen & Vorteile (für Käufer)</label>
        <textarea 
          className="input-field" 
          rows="2"
          value={currentItem.utility} 
          onChange={(e) => onChange('utility', e.target.value)} 
        />
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontWeight: 600, margin: 0 }}>Beschreibung</label>
          
          {/* Tone Rewrite UI */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              className="input-field"
              style={{ margin: 0, padding: '4px 8px', fontSize: '0.75rem', height: '28px', width: '130px' }}
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
            >
              <option value="Locker & Freundlich">Locker & Freundlich</option>
              <option value="Seriös & Professionell">Seriös & Professionell</option>
              <option value="Kurz & Bündig">Kurz & Bündig</option>
              <option value="Dringend / Schnellverkauf">Dringend / Eilig</option>
            </select>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', gap: '4px' }}
              onClick={handleRewrite}
              disabled={isRewriting}
            >
              <RefreshCw size={12} className={isRewriting ? 'spin' : ''} />
              Stil ändern
            </button>
          </div>
        </div>
        <textarea 
          className="input-field" 
          rows="6"
          value={currentItem.description} 
          onChange={(e) => onChange('description', e.target.value)} 
        />

        {/* Translation Panel */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Übersetzen in:</span>
          <select
            className="input-field"
            style={{ margin: 0, padding: '4px 8px', fontSize: '0.75rem', height: '28px', width: '110px' }}
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
          >
            <option value="Englisch">Englisch</option>
            <option value="Französisch">Französisch</option>
            <option value="Spanisch">Spanisch</option>
            <option value="Italienisch">Italienisch</option>
          </select>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.75rem', height: '28px', gap: '4px' }}
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            <Globe size={12} className={isTranslating ? 'spin' : ''} />
            Übersetzen
          </button>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Rechtlicher Haftungsausschluss (Gewährleistung)</label>
        <select
          className="input-field"
          value={currentItem.disclaimer || 'standard'}
          onChange={(e) => onChange('disclaimer', e.target.value)}
        >
          <option value="standard">Standard Privatverkauf (Sachmängelhaftung ausgeschlossen)</option>
          <option value="erweitert">Erweitert privat (Keine Garantie, Gewährleistung oder Rücknahme)</option>
          <option value="elektronik">Elektronik-Klausel (Ausschluss nach EU-Recht für Gebrauchtwaren)</option>
          <option value="kein">Kein Disclaimer (Nicht empfohlen)</option>
        </select>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
          Der ausgewählte Text wird automatisch an das Ende deiner eBay- und Kleinanzeigen-Kopiervorlagen angehängt.
        </span>
      </div>

      {/* Hashtag Generator Section */}
      <div className="form-group" style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontWeight: 600, margin: 0 }}>KI-Schlagwörter & Tags (SEO)</label>
          {currentItem.tags && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', height: '26px' }}
                onClick={() => {
                  navigator.clipboard.writeText(currentItem.tags);
                  showToast('Schlagwörter kopiert!');
                }}
              >
                Kopieren
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', height: '26px', minWidth: '26px', display: 'flex', justifyContent: 'center' }}
                onClick={handleGenerateTags}
                disabled={isGeneratingTags}
                title="Neu generieren"
              >
                <RefreshCw size={12} className={isGeneratingTags ? 'spin' : ''} />
              </button>
            </div>
          )}
        </div>

        {currentItem.tags ? (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
            {currentItem.tags.split(' ').map((tag, idx) => (
              <span 
                key={idx} 
                className="badge" 
                style={{ 
                  position: 'static', 
                  backgroundColor: 'var(--border-color)', 
                  borderColor: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                onClick={() => {
                  navigator.clipboard.writeText(tag);
                  showToast(`${tag} kopiert!`);
                }}
                title="Klicken zum Kopieren"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}
            onClick={handleGenerateTags}
            disabled={isGeneratingTags}
          >
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            {isGeneratingTags ? 'Generiere Schlagwörter...' : 'KI-Schlagwörter generieren (SEO-Boost)'}
          </button>
        )}
      </div>

      <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Versandoptionen</label>
          <input 
            type="text" 
            className="input-field" 
            value={currentItem.shippingMethod} 
            onChange={(e) => onChange('shippingMethod', e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Zahlungsarten</label>
          <input 
            type="text" 
            className="input-field" 
            value={currentItem.paymentMethod} 
            onChange={(e) => onChange('paymentMethod', e.target.value)} 
          />
        </div>
      </div>

      <ShippingCalculator
        suggestedPrice={currentItem.suggestedPrice}
        onSelectShipping={(label) => onChange('shippingMethod', label)}
        showToast={showToast}
      />
    </div>
  );
}
