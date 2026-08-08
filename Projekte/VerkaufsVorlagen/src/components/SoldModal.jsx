import React, { useState } from 'react';

export default function SoldModal({ 
  initialPrice, 
  onSave, 
  onClose 
}) {
  const [price, setPrice] = useState(initialPrice || '');
  const [platform, setPlatform] = useState('kleinanzeigen');
  const [fees, setFees] = useState('');
  const [shipping, setShipping] = useState('');

  const handleSave = () => {
    onSave({
      price: parseFloat(price) || 0,
      platform,
      fees: parseFloat(fees) || 0,
      shipping: parseFloat(shipping) || 0
    });
  };

  const handleCalcEbayCommercialFee = () => {
    const val = parseFloat(price) || 0;
    if (val > 0) {
      const calculated = (val * 0.11 + 0.05).toFixed(2);
      setFees(calculated);
    }
  };

  const getPlatformFeeInfo = () => {
    if (platform === 'ebay') {
      return (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4, textAlign: 'left' }}>
          <span>Privatverkäufe auf eBay.de sind gebührenfrei. Gewerbliche Gebühr beträgt ca. 11% + 0,05 €. </span>
          <button 
            type="button" 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: 0, cursor: 'pointer', textDecoration: 'underline', font: 'inherit', fontWeight: 600 }}
            onClick={handleCalcEbayCommercialFee}
          >
            Berechnen
          </button>
        </div>
      );
    } else if (platform === 'kleinanzeigen') {
      return (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4, textAlign: 'left' }}>
          Standard-Inserate sind kostenlos. Bei "Sicher Bezahlen" zahlt der Käufer die Käuferschutz-Gebühren.
        </div>
      );
    } else if (platform === 'vinted') {
      return (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.4, textAlign: 'left' }}>
          Verkäufe sind für Verkäufer gebührenfrei. Der Käufer trägt die Käuferschutzgebühr (5% + 0,70 €).
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>Verkauf eintragen</h3>
          <button type="button" className="btn close-btn" style={{ padding: '0 4px', fontSize: '1.25rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>
        
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Verkaufspreis (€)</label>
          <input 
            type="number" 
            className="input-field" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Plattform</label>
          <select 
            className="input-field" 
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="kleinanzeigen">Kleinanzeigen</option>
            <option value="ebay">eBay</option>
            <option value="vinted">Vinted</option>
            <option value="andere">Andere</option>
          </select>
        </div>

        <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Gebühren (€)</label>
            <input 
              type="number" 
              className="input-field" 
              value={fees} 
              placeholder="0.00"
              onChange={(e) => setFees(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Versand/Porto (€)</label>
            <input 
              type="number" 
              className="input-field" 
              value={shipping} 
              placeholder="0.00"
              onChange={(e) => setShipping(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic platform helper text */}
        <div style={{ marginBottom: '16px' }}>
          {getPlatformFeeInfo()}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Abbrechen
          </button>
          <button 
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            Verkauf speichern
          </button>
        </div>
      </div>
    </div>
  );
}
