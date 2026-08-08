import React, { useState } from 'react';
import { Package, CheckCircle } from 'lucide-react';

const SHIPPING_OPTIONS = [
  {
    provider: 'DHL',
    emoji: '📦',
    color: '#ffcc00',
    textColor: '#333',
    options: [
      { label: 'Päckchen S (bis 2 kg)', price: 3.49, maxWeight: 2, size: 'S' },
      { label: 'Päckchen M (bis 2 kg)', price: 4.49, maxWeight: 2, size: 'M' },
      { label: 'Paket (bis 5 kg)', price: 5.49, maxWeight: 5, size: 'L' },
      { label: 'Paket (bis 10 kg)', price: 7.49, maxWeight: 10, size: 'XL' },
      { label: 'Paket (bis 31,5 kg)', price: 10.49, maxWeight: 31.5, size: 'XXL' },
    ],
  },
  {
    provider: 'Hermes',
    emoji: '🔶',
    color: '#ff6600',
    textColor: '#fff',
    options: [
      { label: 'Päckchen (bis 0,5 kg)', price: 3.69, maxWeight: 0.5, size: 'XS' },
      { label: 'Paket S (bis 2 kg)', price: 4.50, maxWeight: 2, size: 'S' },
      { label: 'Paket M (bis 5 kg)', price: 5.19, maxWeight: 5, size: 'M' },
      { label: 'Paket L (bis 10 kg)', price: 6.29, maxWeight: 10, size: 'L' },
      { label: 'Paket XL (bis 25 kg)', price: 8.99, maxWeight: 25, size: 'XL' },
    ],
  },
  {
    provider: 'DPD',
    emoji: '🚚',
    color: '#dc2020',
    textColor: '#fff',
    options: [
      { label: 'Paket (bis 5 kg)', price: 4.89, maxWeight: 5, size: 'M' },
      { label: 'Paket (bis 10 kg)', price: 6.49, maxWeight: 10, size: 'L' },
      { label: 'Paket (bis 20 kg)', price: 8.49, maxWeight: 20, size: 'XL' },
    ],
  },
  {
    provider: 'Post (Warensendung)',
    emoji: '✉️',
    color: '#ffd700',
    textColor: '#333',
    options: [
      { label: 'Büchersendung (bis 1 kg)', price: 1.90, maxWeight: 1, size: 'XS' },
      { label: 'Warensendung (bis 0,5 kg)', price: 1.99, maxWeight: 0.5, size: 'XS' },
      { label: 'Warensendung (bis 1 kg)', price: 2.49, maxWeight: 1, size: 'S' },
      { label: 'Warensendung (bis 2 kg)', price: 2.90, maxWeight: 2, size: 'M' },
    ],
  },
];

export default function ShippingCalculator({ suggestedPrice, onSelectShipping, showToast }) {
  const [weight, setWeight] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const weightNum = parseFloat(weight) || 0;
  const priceNum = parseFloat(suggestedPrice) || 0;

  const filteredOptions = SHIPPING_OPTIONS.map((provider) => ({
    ...provider,
    options: provider.options.filter((opt) => weightNum === 0 || opt.maxWeight >= weightNum),
  })).filter((p) => p.options.length > 0);

  const handleSelect = (provider, option) => {
    const label = `${provider.provider} ${option.label} (${option.price.toFixed(2)} €)`;
    setSelectedOption({ provider: provider.provider, option });
    if (onSelectShipping) onSelectShipping(label);
    showToast(`${provider.provider} ${option.label} ausgewählt!`);
  };

  return (
    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Package size={15} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Versandkosten-Rechner</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="number"
            className="input-field"
            style={{ margin: 0, paddingRight: '32px', fontSize: '0.85rem' }}
            placeholder="Gewicht in kg (z.B. 0.5)"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setShowResults(true); }}
            min="0"
            step="0.1"
          />
          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          onClick={() => setShowResults(!showResults)}
        >
          {showResults ? 'Verbergen' : 'Anzeigen'}
        </button>
      </div>

      {showResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredOptions.map((provider) => (
            <div key={provider.provider}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.95rem' }}>{provider.emoji}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{provider.provider}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {provider.options.map((opt) => {
                  const netProfit = priceNum > 0 ? (priceNum - opt.price).toFixed(2) : null;
                  const isSelected = selectedOption?.provider === provider.provider && selectedOption?.option?.label === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelect(provider, opt)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '7px',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                        background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.01)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isSelected && <CheckCircle size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {netProfit !== null && (
                          <span style={{ fontSize: '0.72rem', color: parseFloat(netProfit) > 0 ? '#00bc7e' : '#f87171' }}>
                            Netto: {netProfit} €
                          </span>
                        )}
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{opt.price.toFixed(2)} €</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {weightNum > 0 && filteredOptions.length === 0 && (
            <p style={{ fontSize: '0.82rem', color: '#f87171' }}>Kein Standardanbieter kann dieses Gewicht versenden. Prüfe Speditionsangebote.</p>
          )}
        </div>
      )}
    </div>
  );
}
