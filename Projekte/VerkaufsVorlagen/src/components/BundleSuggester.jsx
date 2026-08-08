import React, { useState } from 'react';
import { Package, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { generateBundleSuggestion } from '../gemini';

export default function BundleSuggester({ currentItem, history, apiKey, onApplyBundle, showToast }) {
  const [bundle, setBundle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const otherItemNames = history
    .filter((item) => item.name !== currentItem.name && !item.saleDetails?.isSold)
    .map((item) => item.name);

  const handleGenerate = async () => {
    if (!currentItem.name) {
      showToast('Bitte gib zuerst einen Anzeigentitel ein.');
      return;
    }
    setIsLoading(true);
    showToast('Bundle-Vorschlag wird generiert...');
    try {
      let result;
      if (!apiKey) {
        // Mock result
        result = {
          bundleTitle: `${currentItem.name} + Zubehör-Paket`,
          items: [currentItem.name, 'Schutzhülle', 'Ladekabel (2m)', 'Panzerglas'],
          bundlePrice: Math.round((parseFloat(currentItem.suggestedPrice) || 50) * 0.88),
          savingsHint: `Statt ${Math.round((parseFloat(currentItem.suggestedPrice) || 50) * 1.12)} € als Bundle für ${Math.round((parseFloat(currentItem.suggestedPrice) || 50) * 0.88)} €`,
          bundleDescription: `Biete dieses praktische Bundle bestehend aus ${currentItem.name} und passendem Zubehör an. Alles zusammen deutlich günstiger als der Einzelkauf. Perfekt für den sofortigen Einsatz ohne zusätzliche Anschaffungen!`,
        };
        showToast('Mock-Modus: Bundle simuliert.');
      } else {
        result = await generateBundleSuggestion(currentItem, otherItemNames, apiKey);
      }
      setBundle(result);
      showToast('Bundle-Vorschlag bereit!');
    } catch (err) {
      showToast(err.message || 'Fehler beim Bundle-Vorschlag.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!bundle) return;
    onApplyBundle({
      description: bundle.bundleDescription,
      suggestedPrice: bundle.bundlePrice,
    });
    showToast('Bundle-Beschreibung und Preis übernommen!');
  };

  const handleCopyDescription = () => {
    if (!bundle) return;
    navigator.clipboard.writeText(bundle.bundleDescription);
    showToast('Bundle-Beschreibung kopiert!');
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Bundle-Verkauf (KI)</h3>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.8rem', gap: '5px' }}
          onClick={handleGenerate}
          disabled={isLoading}
        >
          <Sparkles size={13} style={{ color: 'var(--primary)' }} />
          {isLoading ? 'Generiere...' : bundle ? 'Neu' : 'Vorschlagen'}
        </button>
      </div>

      {!bundle && !isLoading && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          KI schlägt passendes Zubehör vor und erstellt eine fertige Bundle-Beschreibung mit Paketpreis für schnellere Verkäufe.
          {otherItemNames.length > 0 && (
            <span style={{ display: 'block', marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              📋 {otherItemNames.length} weitere{otherItemNames.length > 1 ? ' Artikel' : 'r Artikel'} aus deiner Liste werden berücksichtigt.
            </span>
          )}
        </p>
      )}

      {isLoading && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 0' }}>
          <div className="typing-dot" style={{ width: '8px', height: '8px' }} />
          <div className="typing-dot" style={{ width: '8px', height: '8px' }} />
          <div className="typing-dot" style={{ width: '8px', height: '8px' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>Analysiere Kombinationsmöglichkeiten...</span>
        </div>
      )}

      {bundle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Bundle title and price */}
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '6px' }}>📦 {bundle.bundleTitle}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {bundle.items.map((item, idx) => (
                <span key={idx} style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: idx === 0 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${idx === 0 ? 'rgba(99,102,241,0.4)' : 'var(--border-color)'}`,
                  color: idx === 0 ? 'var(--primary)' : 'var(--text-secondary)',
                }}>
                  {item}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00bc7e' }}>{bundle.bundlePrice} €</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{bundle.savingsHint}</span>
            </div>
          </div>

          {/* Bundle description */}
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {bundle.bundleDescription}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', justifyContent: 'center', gap: '6px' }}
              onClick={handleApply}
            >
              <RefreshCw size={13} />
              In Formular übernehmen
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', justifyContent: 'center', gap: '6px' }}
              onClick={handleCopyDescription}
            >
              <Copy size={13} />
              Beschreibung kopieren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
