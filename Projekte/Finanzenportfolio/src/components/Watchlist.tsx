import React, { useState } from 'react';
import type { WatchlistItem, AssetCategory } from '../types';
import { Eye, Plus, Trash2, ShoppingCart, Notebook, TrendingDown, Bell } from 'lucide-react';

interface WatchlistProps {
  watchlist: WatchlistItem[];
  currentPrices: Record<string, number>;
  onAddWatchlist: (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => void;
  onRemoveWatchlist: (id: string) => void;
  onQuickBuy: (ticker: string, name: string, category: AssetCategory, price: number) => void;
  isReadOnly?: boolean;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  watchlist,
  currentPrices,
  onAddWatchlist,
  onRemoveWatchlist,
  onQuickBuy,
  isReadOnly = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Stock');
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !name || targetPrice === '') return;

    onAddWatchlist({
      ticker: ticker.toUpperCase(),
      name,
      category,
      targetPrice: Number(targetPrice),
      notes: notes.trim()
    });

    setTicker('');
    setName('');
    setCategory('Stock');
    setTargetPrice('');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="fade-in wl-container">
      <div className="wl-header">
        <div>
          <h2 className="wl-title-h2">Watchlist</h2>
          <p className="wl-subtitle">Beobachte interessante Assets und schlage beim richtigen Preis zu.</p>
        </div>
        {!isReadOnly && (
          <button 
            className="btn-primary wl-add-btn" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={16} /> {showAddForm ? 'Schließen' : 'Asset hinzufügen'}
          </button>
        )}
      </div>

      {isReadOnly && (
        <div className="glass-panel text-muted-bg p-4 mb-4" style={{ borderLeft: '4px solid var(--accent-purple)', background: 'rgba(168, 85, 247, 0.05)' }}>
          <h4 style={{ margin: 0, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            🌐 Gesamtportfolio-Modus (Schreibgeschützt)
          </h4>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-color-muted)' }}>
            Die Watchlist ist in der Gesamtübersicht schreibgeschützt. Wähle ein spezifisches Portfolio aus, um Werte zu bearbeiten oder zu kaufen.
          </p>
        </div>
      )}

      {showAddForm && (
        <div className="glass-panel wl-add-form-panel">
          <h3 className="wl-add-form-title">Neues Asset beobachten</h3>
          <form onSubmit={handleSubmit} className="transaction-form wl-form-grid">
            <div className="form-group">
              <label htmlFor="wl-ticker">Ticker Symbol</label>
              <input 
                id="wl-ticker"
                type="text" 
                value={ticker} 
                onChange={(e) => setTicker(e.target.value)} 
                placeholder="z.B. MSFT" 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="wl-name">Name</label>
              <input 
                id="wl-name"
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="z.B. Microsoft Corp." 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="wl-category">Kategorie</label>
              <select 
                id="wl-category"
                value={category} 
                title="Kategorie"
                aria-label="Kategorie"
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
              >
                <option value="Stock">Aktie</option>
                <option value="ETF">ETF</option>
                <option value="Crypto">Krypto</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="wl-targetPrice">Zielpreis (€)</label>
              <input 
                id="wl-targetPrice"
                type="number" 
                step="0.01" 
                value={targetPrice} 
                onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : '')} 
                placeholder="z.B. 380.00" 
                required 
              />
            </div>
            <div className="form-group wl-form-span-2">
              <label htmlFor="wl-notes">Notizen</label>
              <input 
                id="wl-notes"
                type="text" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Warum beobachten wir dieses Asset? (z.B. Kauf nach Quartalszahlen)" 
              />
            </div>
            <div className="wl-form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>Abbrechen</button>
              <button type="submit" className="btn-primary">Hinzufügen</button>
            </div>
          </form>
        </div>
      )}

      {watchlist.length === 0 ? (
        <div className="glass-panel wl-empty-state">
          <Eye size={48} className="wl-empty-icon" />
          <p className="wl-empty-p1">Deine Watchlist ist noch leer.</p>
          <p className="wl-empty-p2">Füge Assets hinzu, die du beobachten möchtest.</p>
        </div>
      ) : (
        <div className="wl-grid">
          {watchlist.map((item) => {
            const currentPrice = currentPrices[item.ticker] || item.targetPrice * 1.1;
            const isTargetReached = currentPrice <= item.targetPrice;
            const differencePercent = ((currentPrice - item.targetPrice) / item.targetPrice) * 100;

            return (
              <div 
                key={item.id} 
                className="glass-panel wl-card-wrapper" 
                style={{ 
                  border: isTargetReached ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                  boxShadow: isTargetReached ? '0 8px 32px 0 rgba(16, 185, 129, 0.05)' : 'none'
                }}
              >
                <div>
                  <div className="wl-card-header">
                    <div>
                      <span className={item.category === 'Stock' ? 'wl-card-badge-stock' : item.category === 'ETF' ? 'wl-card-badge-etf' : 'wl-card-badge-crypto'}>
                        {item.category === 'Stock' ? 'Aktie' : item.category === 'ETF' ? 'ETF' : 'Krypto'}
                      </span>
                      <h3 className="wl-card-ticker">{item.ticker}</h3>
                      <p className="wl-card-name">{item.name}</p>
                    </div>
                    {!isReadOnly && (
                      <button 
                        onClick={() => onRemoveWatchlist(item.id)} 
                        className="wl-card-trash-btn text-hover-rose"
                        title="Aus Watchlist entfernen"
                        aria-label="Aus Watchlist entfernen"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="wl-card-prices-grid">
                    <div>
                      <span className="wl-card-price-label">Zielpreis</span>
                      <p className="wl-card-price-value">{item.targetPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
                    </div>
                    <div>
                      <span className="wl-card-price-label">Aktueller Kurs</span>
                      <p className="wl-card-price-value" style={{ color: isTargetReached ? 'var(--status-positive)' : 'inherit' }}>
                        {currentPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="wl-card-notes-box">
                      <Notebook size={14} className="wl-card-notes-icon" />
                      <span className="wl-card-notes-text">{item.notes}</span>
                    </div>
                  )}
                </div>

                <div>
                  {isTargetReached ? (
                    <div className="status-badge positive wl-card-badge-container">
                      <Bell size={14} /> Zielpreis erreicht! (-{Math.abs(differencePercent).toFixed(1)}%)
                    </div>
                  ) : (
                    <div className="wl-card-price-distance">
                      <TrendingDown size={14} /> Noch {differencePercent.toFixed(1)}% über Zielpreis
                    </div>
                  )}

                  {!isReadOnly && (
                    <button 
                      className="btn-secondary wl-card-buy-btn" 
                      onClick={() => onQuickBuy(item.ticker, item.name, item.category, currentPrice)}
                      style={{ 
                        background: isTargetReached ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)', 
                        color: isTargetReached ? 'var(--status-positive)' : 'inherit', 
                        border: isTargetReached ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)' 
                      }}
                    >
                      <ShoppingCart size={14} /> Transaktion erfassen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
