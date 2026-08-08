import React, { useState } from 'react';
import { User, Heart, Share2, MapPin } from 'lucide-react';

export default function VisualMockup({ currentItem }) {
  const [platform, setPlatform] = useState('kleinanzeigen'); // 'kleinanzeigen' | 'ebay'

  const title = currentItem.name || 'Neuer Artikel';
  const price = currentItem.suggestedPrice || '0.00';
  const description = currentItem.description || 'Keine Beschreibung vorhanden.';
  const condition = currentItem.condition || 'Gut';
  const functionality = currentItem.functionality || 'Keine Angaben';
  const shipping = currentItem.shippingMethod || 'Nur Abholung';
  const payment = currentItem.paymentMethod || 'Barzahlung bei Abholung';
  const tags = currentItem.tags || '';

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Visual Live-Mockup (Vorschau)</h3>
        
        {/* Toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className="btn"
            style={{ 
              padding: '4px 10px', 
              fontSize: '0.75rem', 
              borderRadius: '6px',
              background: platform === 'kleinanzeigen' ? '#4cb543' : 'transparent',
              color: platform === 'kleinanzeigen' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setPlatform('kleinanzeigen')}
          >
            Kleinanzeigen
          </button>
          <button
            type="button"
            className="btn"
            style={{ 
              padding: '4px 10px', 
              fontSize: '0.75rem', 
              borderRadius: '6px',
              background: platform === 'ebay' ? '#0053a0' : 'transparent',
              color: platform === 'ebay' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => setPlatform('ebay')}
          >
            eBay
          </button>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
        So wird dein Inserat für Käufer auf Mobilgeräten aussehen:
      </p>

      {/* Mockup Frame container simulating a smartphone */}
      <div style={{ 
        border: '8px solid #2e3035', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        background: platform === 'kleinanzeigen' ? '#f6f8f5' : '#ffffff', 
        color: '#1a1a1a', 
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '380px',
        margin: '0 auto',
        width: '100%',
        fontFamily: platform === 'kleinanzeigen' ? 'Arial, sans-serif' : 'Helvetica Neue, Helvetica, Arial, sans-serif'
      }}>
        
        {/* Mockup Header */}
        {platform === 'kleinanzeigen' ? (
          <div style={{ background: '#4cb543', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>kleinanzeigen</span>
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.85rem' }}>
              <Heart size={16} />
              <Share2 size={16} />
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ color: '#e53238', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-1px' }}>e</span>
              <span style={{ color: '#0064d2', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-1px' }}>b</span>
              <span style={{ color: '#f5af02', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-1px' }}>a</span>
              <span style={{ color: '#86b817', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-1px' }}>y</span>
            </div>
            <div style={{ display: 'flex', gap: '14px', color: '#555' }}>
              <Heart size={16} />
              <Share2 size={16} />
            </div>
          </div>
        )}

        {/* Mockup Body Content */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', paddingBottom: '20px' }}>
          {/* Main Product Image inside frame */}
          <div style={{ position: 'relative', width: '100%', height: '200px', background: '#e0e0e0' }}>
            {currentItem.image ? (
              <img src={currentItem.image} alt="Artikel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.85rem' }}>
                Kein Bild hochgeladen
              </div>
            )}
            {platform === 'kleinanzeigen' && (
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                1 / {currentItem.images?.length || 1}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Title & Price */}
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3 }}>{title}</h4>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: platform === 'kleinanzeigen' ? '#222' : '#0053a0' }}>
                  {price} €
                </span>
                {platform === 'kleinanzeigen' && (
                  <span style={{ fontSize: '0.75rem', color: '#4cb543', fontWeight: 700 }}>VB</span>
                )}
              </div>
            </div>

            {/* eBay Primary CTA Buttons */}
            {platform === 'ebay' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <button type="button" style={{ width: '100%', padding: '10px', background: '#0053a0', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>
                  Sofort-Kaufen
                </button>
                <button type="button" style={{ width: '100%', padding: '10px', background: '#fff', color: '#0053a0', border: '1px solid #0053a0', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}>
                  In den Warenkorb
                </button>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '4px 0' }} />

            {/* Attributes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#555' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ color: '#888' }}>Zustand: </span>
                  <strong style={{ color: '#1a1a1a' }}>{condition}</strong>
                </div>
                <div>
                  <span style={{ color: '#888' }}>Versand: </span>
                  <strong style={{ color: '#1a1a1a' }}>{shipping.replace(/DHL|Hermes|Paket|versichert/g, '').split('(')[0].trim() || 'Abholung'}</strong>
                </div>
              </div>
              <div>
                <span style={{ color: '#888' }}>Zahlung: </span>
                <strong style={{ color: '#1a1a1a' }}>{payment.length > 35 ? `${payment.slice(0, 35)}...` : payment}</strong>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '4px 0' }} />

            {/* Seller profile card (Kleinanzeigen Style) */}
            {platform === 'kleinanzeigen' && (
              <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#f0f0f0', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  <User size={18} />
                </div>
                <div style={{ flex: 1, fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold', color: '#222' }}>Privater Anbieter</div>
                  <div style={{ color: '#777', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                    <MapPin size={10} /> 10115 Berlin Mitte
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#4cb543', fontWeight: 'bold', background: '#ebf7ec', padding: '2px 6px', borderRadius: '4px' }}>
                  ⭐ 4.9
                </span>
              </div>
            )}

            {/* Description Description */}
            <div style={{ fontSize: '0.78rem', color: '#2d2d2d', lineHeight: 1.4 }}>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '0.8rem', fontWeight: 'bold', color: '#1a1a1a' }}>Beschreibung</h5>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {description.length > 180 ? `${description.slice(0, 180)}...` : description}
              </div>
            </div>

            {/* Functionality & Warranty details */}
            {(functionality || currentItem.purchaseDetails) && (
              <div style={{ background: platform === 'kleinanzeigen' ? '#fff' : '#f7f7f7', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '10px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {functionality && (
                  <div>
                    <strong style={{ color: '#1a1a1a' }}>Funktionalität: </strong>
                    <span style={{ color: '#555' }}>{functionality}</span>
                  </div>
                )}
                {currentItem.purchaseDetails && (
                  <div>
                    <strong style={{ color: '#1a1a1a' }}>Garantie: </strong>
                    <span style={{ color: '#555' }}>
                      Rechnung vorhanden ({currentItem.purchaseDetails.merchant}), Garantie bis {new Date(currentItem.purchaseDetails.warrantyUntil).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tags / Search optimization */}
            {tags && (
              <div style={{ fontSize: '0.7rem', color: platform === 'kleinanzeigen' ? '#4cb543' : '#0053a0', wordBreak: 'break-word', fontWeight: 500 }}>
                {tags}
              </div>
            )}

            {/* Kleinanzeigen Action Buttons */}
            {platform === 'kleinanzeigen' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="button" style={{ flex: 1, padding: '8px', background: '#4cb543', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer' }}>
                  Nachricht schreiben
                </button>
                <button type="button" style={{ padding: '8px 12px', background: '#ebf7ec', color: '#4cb543', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.78rem', cursor: 'pointer' }}>
                  Anrufen
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
