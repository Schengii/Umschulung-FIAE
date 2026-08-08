import React, { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { analyzeInvoice } from '../gemini';

export default function InvoiceScanner({ 
  currentItem, 
  apiKey, 
  onInvoiceExtracted, 
  onRemoveInvoice, 
  showToast 
}) {
  const invoiceInputRef = useRef(null);
  const [isInvoiceUploading, setIsInvoiceUploading] = useState(false);

  const handleInvoiceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsInvoiceUploading(true);
    showToast('Kaufbeleg wird hochgeladen und analysiert...');
    
    try {
      let result;
      if (!apiKey) {
        result = {
          originalPrice: currentItem.suggestedPrice ? parseFloat((currentItem.suggestedPrice * 1.6).toFixed(2)) : 149.99,
          purchaseDate: '2025-01-10',
          merchant: 'MediaMarkt',
          warrantyMonths: 24
        };
        showToast('Mock-Modus: Belegdaten simuliert ausgelesen.');
      } else {
        result = await analyzeInvoice(file, apiKey);
      }

      const pDate = new Date(result.purchaseDate);
      pDate.setMonth(pDate.getMonth() + (result.warrantyMonths || 24));
      
      const purchaseDetails = {
        originalPrice: result.originalPrice || 0,
        purchaseDate: result.purchaseDate,
        warrantyUntil: pDate.toISOString().split('T')[0],
        merchant: result.merchant || 'Händler',
        invoiceFileName: file.name
      };

      onInvoiceExtracted(purchaseDetails);
      showToast('Kaufbeleg erfolgreich erfasst!');
    } catch (err) {
      console.error(err);
      showToast('Fehler beim Auslesen des Belegs.');
    } finally {
      setIsInvoiceUploading(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <div className="invoice-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '4px' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
        Kaufbeleg & Garantie
      </label>
      
      {currentItem.purchaseDetails ? (
        <div className="invoice-details-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', position: 'relative' }}>
          <button 
            type="button" 
            className="close-btn" 
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={onRemoveInvoice}
            title="Beleg entfernen"
          >
            ✕
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
            <FileText size={16} style={{ color: 'var(--primary)' }} />
            <span>Rechnung von {currentItem.purchaseDetails.merchant}</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>
              <span>Neupreis: </span>
              <strong style={{ color: '#fff' }}>{currentItem.purchaseDetails.originalPrice.toFixed(2)} €</strong>
            </div>
            <div>
              <span>Kaufdatum: </span>
              <strong style={{ color: '#fff' }}>{new Date(currentItem.purchaseDetails.purchaseDate).toLocaleDateString()}</strong>
            </div>
          </div>

          {(() => {
            const today = new Date();
            const expiry = new Date(currentItem.purchaseDetails.warrantyUntil);
            const total = 24; 
            const remainingMs = expiry - today;
            const remainingMonths = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60 * 24 * 30.4)));
            const progressPercent = Math.min(100, Math.max(0, (remainingMonths / total) * 100));
            const isExpired = remainingMonths <= 0;
            
            return (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>Restgarantie: {isExpired ? 'Abgelaufen' : `${remainingMonths} Monate`}</span>
                  <span>Garantie bis: {expiry.toLocaleDateString()}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${progressPercent}%`, 
                      height: '100%', 
                      background: isExpired ? 'var(--accent-rose)' : remainingMonths < 6 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                      borderRadius: '3px',
                      transition: 'width 0.5s ease-in-out'
                    }} 
                  />
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div 
          className="invoice-upload-dropzone" 
          onClick={() => invoiceInputRef.current.click()}
          style={{ border: '1px dashed var(--border-color)', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', transition: 'var(--transition-smooth)' }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          <input 
            type="file" 
            ref={invoiceInputRef}
            onChange={handleInvoiceUpload}
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Upload size={16} />
            <span>{isInvoiceUploading ? 'Wird ausgelesen...' : 'Rechnung hochladen (Neupreis & Garantie extrahieren)'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
