import React, { useState, useMemo } from 'react';
import type { Holding, Transaction } from '../types';
import { TrendingUp, TrendingDown, RefreshCw, Sparkles, Check, Tag, Plus, X, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { convertCurrency } from './performanceUtils';
import { HoldingDetailModal } from './HoldingDetailModal';
import { lookupIsinMetadata } from '../services/isinMetadataService';
import { usePortfolio } from '../context/PortfolioContext';

interface HoldingsProps {
  holdings: Holding[];
  transactions: Transaction[];
  onTriggerPriceRefresh: () => void;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  onBaseCurrencyChange: (currency: 'EUR' | 'USD' | 'CHF' | 'GBP') => void;
}

const PREDEFINED_TAGS = ['#Core', '#Satellite', '#Dividende', '#Tech', '#Growth', '#Value', '#Krypto', '#Defensiv'];

type SortKey = 'name' | 'category' | 'shares' | 'averageBuyPrice' | 'currentPrice' | 'currentValue' | 'totalGain' | 'portfolioWeight';

export const Holdings: React.FC<HoldingsProps> = ({ 
  holdings, 
  transactions, 
  onTriggerPriceRefresh,
  baseCurrency,
  onBaseCurrencyChange
}) => {
  const { updateHoldingTags } = usePortfolio();
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string>('ALL');
  const [enrichedCount, setEnrichedCount] = useState<number | null>(null);
  const [editingTagTicker, setEditingTagTicker] = useState<string | null>(null);
  const [newCustomTag, setNewCustomTag] = useState('');
  const [sortColumn, setSortColumn] = useState<SortKey>('currentValue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleAutoEnrich = () => {
    let count = 0;
    holdings.forEach(h => {
      const meta = lookupIsinMetadata(h.ticker, h.name);
      if (meta.sector && !h.sector) {
        h.sector = meta.sector;
        count++;
      }
      if (meta.region && !h.region) {
        h.region = meta.region;
        count++;
      }
    });
    setEnrichedCount(count);
    setTimeout(() => setEnrichedCount(null), 3000);
  };

  // Currency Formatter
  const formatVal = (value: number) => {
    return value.toLocaleString('de-DE', {
      style: 'currency',
      currency: baseCurrency
    });
  };

  // Extract all active tags in the portfolio
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    holdings.forEach(h => (h.tags || []).forEach(t => set.add(t)));
    return Array.from(set);
  }, [holdings]);

  // Convert values on the fly to baseCurrency for display
  const convertedHoldings = useMemo(() => {
    return holdings.map(h => {
      const currentPriceConverted = convertCurrency(h.currentPrice, 'EUR', baseCurrency);
      const averageBuyPriceConverted = convertCurrency(h.averageBuyPrice, 'EUR', baseCurrency);
      const totalCostConverted = convertCurrency(h.totalCost, 'EUR', baseCurrency);
      const currentValueConverted = convertCurrency(h.currentValue, 'EUR', baseCurrency);
      const totalGainConverted = currentValueConverted - totalCostConverted;
      const assetGainConverted = convertCurrency(h.assetGainEur || 0, 'EUR', baseCurrency);
      const fxGainConverted = convertCurrency(h.fxGainEur || 0, 'EUR', baseCurrency);

      return {
        ...h,
        currentPrice: currentPriceConverted,
        averageBuyPrice: averageBuyPriceConverted,
        totalCost: totalCostConverted,
        currentValue: currentValueConverted,
        totalGain: totalGainConverted,
        assetGainEur: assetGainConverted,
        fxGainEur: fxGainConverted
      };
    });
  }, [holdings, baseCurrency]);

  const filteredHoldings = useMemo(() => {
    const list = convertedHoldings.filter(h => {
      // Search text filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        h.name.toLowerCase().includes(q) || 
        h.ticker.toLowerCase().includes(q) ||
        (h.tags || []).some(t => t.toLowerCase().includes(q))
      );

      // Tag filter
      const matchesTag = activeTagFilter === 'ALL' || (h.tags || []).includes(activeTagFilter);

      return matchesSearch && matchesTag;
    });

    // Apply sorting
    return list.sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      if (sortColumn === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [convertedHoldings, searchQuery, activeTagFilter, sortColumn, sortDirection]);

  const handleSort = (column: SortKey) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleExportHoldingsCsv = () => {
    const headers = ['Ticker', 'Name', 'Kategorie', 'Sektor', 'Region', 'Anteile', `Kaufkurs (${baseCurrency})`, `Aktueller Kurs (${baseCurrency})`, `Gesamtwert (${baseCurrency})`, `G/V (${baseCurrency})`, 'G/V (%)', 'Depotanteil (%)', 'Tags'];
    const rows = filteredHoldings.map(h => [
      `"${h.ticker}"`,
      `"${h.name.replace(/"/g, '""')}"`,
      `"${h.category}"`,
      `"${h.sector || ''}"`,
      `"${h.region || ''}"`,
      h.shares.toFixed(4),
      h.averageBuyPrice.toFixed(2),
      h.currentPrice.toFixed(2),
      h.currentValue.toFixed(2),
      h.totalGain.toFixed(2),
      h.totalGainPercent.toFixed(2),
      h.portfolioWeight.toFixed(2),
      `"${(h.tags || []).join(', ')}"`
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finanzportfolio_holdings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleTag = (ticker: string, currentTags: string[], tagToToggle: string) => {
    const exists = currentTags.includes(tagToToggle);
    const updated = exists 
      ? currentTags.filter(t => t !== tagToToggle)
      : [...currentTags, tagToToggle];
    updateHoldingTags(ticker, updated);
  };

  const handleAddCustomTag = (ticker: string, currentTags: string[]) => {
    let tag = newCustomTag.trim();
    if (!tag) return;
    if (!tag.startsWith('#')) tag = '#' + tag;
    if (!currentTags.includes(tag)) {
      updateHoldingTags(ticker, [...currentTags, tag]);
    }
    setNewCustomTag('');
  };

  return (
    <div className="holdings-container">
      {/* Top Header Bar */}
      <div className="holdings-header">
        <div>
          <h2 className="holdings-title">Depot-Bestände & Tag-Studio</h2>
          <p className="holdings-subtitle">Aktuelle Positionen, Strategie-Tags, Einstandskurse & Wertentwicklung</p>
        </div>

        <div className="controls-group">
          <button
            onClick={handleAutoEnrich}
            className="theme-toggle-btn"
            title="Stammdaten, Sektoren & Regionen automatisch per ISIN-Lookup anreichern"
            style={{ width: 'auto', padding: '0 0.75rem', gap: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}
          >
            {enrichedCount !== null ? <Check size={14} color="#10b981" /> : <Sparkles size={14} className="text-amber-400" />}
            <span>{enrichedCount !== null ? `${enrichedCount} Bestände angereichert` : 'ISIN Auto-Mapping'}</span>
          </button>

          <input
            type="text"
            placeholder="Asset oder #Tag suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />

          {/* Base Currency Switcher */}
          <div className="currency-selector">
            <span className="currency-label">Währung:</span>
            <div className="currency-btn-group">
              {(['EUR', 'USD', 'CHF', 'GBP'] as const).map((cur) => (
                <button
                  key={cur}
                  className={`currency-btn ${baseCurrency === cur ? 'active' : ''}`}
                  onClick={() => onBaseCurrencyChange(cur)}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="btn btn-secondary"
            onClick={handleExportHoldingsCsv}
            title="Bestände als CSV herunterladen"
          >
            <Download size={16} /> Export CSV
          </button>

          <button 
            className="btn btn-secondary"
            onClick={onTriggerPriceRefresh}
            title="Echtzeit-Kurse aktualisieren"
          >
            <RefreshCw size={16} /> Aktualisieren
          </button>
        </div>
      </div>

      {/* Tag Filtering Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        marginBottom: '16px',
        borderRadius: '12px',
        backgroundColor: 'var(--card-bg, rgba(30, 41, 59, 0.4))',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflowX: 'auto'
      }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <Tag size={14} /> Filter:
        </span>
        <button
          onClick={() => setActiveTagFilter('ALL')}
          style={{
            fontSize: '0.78rem',
            padding: '4px 10px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            backgroundColor: activeTagFilter === 'ALL' ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
            color: activeTagFilter === 'ALL' ? '#fff' : '#94a3b8'
          }}
        >
          Alle ({convertedHoldings.length})
        </button>
        {PREDEFINED_TAGS.map(tag => {
          const count = convertedHoldings.filter(h => (h.tags || []).includes(tag)).length;
          const isActive = activeTagFilter === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTagFilter(isActive ? 'ALL' : tag)}
              style={{
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                backgroundColor: isActive ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#fff' : '#94a3b8',
                display: count > 0 ? 'inline-block' : 'none'
              }}
            >
              {tag} ({count})
            </button>
          );
        })}
        {availableTags.filter(t => !PREDEFINED_TAGS.includes(t)).map(tag => {
          const count = convertedHoldings.filter(h => (h.tags || []).includes(tag)).length;
          const isActive = activeTagFilter === tag;
          return (
            <button
              key={tag}
              onClick={() => setActiveTagFilter(isActive ? 'ALL' : tag)}
              style={{
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                backgroundColor: isActive ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)',
                color: isActive ? '#fff' : '#94a3b8'
              }}
            >
              {tag} ({count})
            </button>
          );
        })}
      </div>

      {/* Holdings Table */}
      {filteredHoldings.length === 0 ? (
        <div className="empty-state-card">
          <p className="empty-text">Keine passenden Positionen mit den aktuellen Filterkriterien gefunden.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Nach Asset/Ticker sortieren">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Asset / Ticker {sortColumn === 'name' ? (sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={12} opacity={0.4} />}
                  </span>
                </th>
                <th onClick={() => handleSort('category')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Nach Kategorie sortieren">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Kategorie & Tags {sortColumn === 'category' ? (sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={12} opacity={0.4} />}
                  </span>
                </th>
                <th onClick={() => handleSort('shares')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Nach Anteilen sortieren">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Anteile {sortColumn === 'shares' ? (sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={12} opacity={0.4} />}
                  </span>
                </th>
                <th onClick={() => handleSort('averageBuyPrice')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Nach Kaufkurs sortieren">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Kaufkurs (Ø) {sortColumn === 'averageBuyPrice' ? (sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={12} opacity={0.4} />}
                  </span>
                </th>
                <th onClick={() => handleSort('currentPrice')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Nach aktuellem Kurs sortieren">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Aktueller Kurs {sortColumn === 'currentPrice' ? (sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={12} opacity={0.4} />}
                  </span>
                </th>
                <th onClick={() => handleSort('currentValue')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Nach Gesamtwert sortieren">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Gesamtwert {sortColumn === 'currentValue' ? (sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={12} opacity={0.4} />}
                  </span>
                </th>
                <th onClick={() => handleSort('totalGain')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Nach Gewinn/Verlust sortieren">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Gewinn / Verlust {sortColumn === 'totalGain' ? (sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={12} opacity={0.4} />}
                  </span>
                </th>
                <th onClick={() => handleSort('portfolioWeight')} style={{ cursor: 'pointer', userSelect: 'none' }} title="Nach Depotanteil sortieren">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Depotanteil {sortColumn === 'portfolioWeight' ? (sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={12} opacity={0.4} />}
                  </span>
                </th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoldings.map((h) => (
                <tr 
                  key={h.ticker} 
                  className="table-row-clickable"
                  onClick={() => setSelectedHolding(h)}
                >
                  <td>
                    <div className="asset-info">
                      <span className="asset-name">{h.name}</span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="asset-ticker">{h.ticker}</span>
                        {h.sector && (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '4px' }}>
                            {h.sector}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                      <span className={`badge badge-${h.category.toLowerCase()}`}>
                        {h.category}
                      </span>
                      {(h.tags || []).map(tag => (
                        <span 
                          key={tag}
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: tag === '#Core' ? 'rgba(59, 130, 246, 0.18)' : tag === '#Satellite' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(139, 92, 246, 0.18)',
                            color: tag === '#Core' ? '#60a5fa' : tag === '#Satellite' ? '#fbbf24' : '#c084fc',
                            border: '1px solid rgba(255,255,255,0.08)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="fw-500">
                    {h.shares.toLocaleString('de-DE', { maximumFractionDigits: 4 })}
                  </td>
                  <td>{formatVal(h.averageBuyPrice)}</td>
                  <td>{formatVal(h.currentPrice)}</td>
                  <td className="fw-600">{formatVal(h.currentValue)}</td>
                  <td>
                    <div className={`gain-indicator ${h.totalGain >= 0 ? 'positive' : 'negative'}`}>
                      {h.totalGain >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>
                        {h.totalGain >= 0 ? '+' : ''}{formatVal(h.totalGain)} ({h.totalGainPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="weight-cell">
                      <span>{h.portfolioWeight.toFixed(1)}%</span>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill"
                          style={{ width: `${Math.min(100, h.portfolioWeight)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingTagTicker(editingTagTicker === h.ticker ? null : h.ticker)}
                      className="theme-toggle-btn"
                      title="Tags für diese Position anpassen"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', width: 'auto', display: 'flex', gap: '4px', alignItems: 'center' }}
                    >
                      <Tag size={13} /> Tags
                    </button>

                    {/* Inline Tag Popover */}
                    {editingTagTicker === h.ticker && (
                      <div style={{
                        position: 'absolute',
                        zIndex: 999,
                        marginTop: '6px',
                        right: '40px',
                        backgroundColor: 'var(--card-bg, #1e222d)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        padding: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        width: '240px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tags für {h.ticker}:</span>
                          <button onClick={() => setEditingTagTicker(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                          {PREDEFINED_TAGS.map(t => {
                            const isSelected = (h.tags || []).includes(t);
                            return (
                              <button
                                key={t}
                                onClick={() => handleToggleTag(h.ticker, h.tags || [], t)}
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  backgroundColor: isSelected ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                                  color: isSelected ? '#fff' : '#94a3b8'
                                }}
                              >
                                {t} {isSelected && '✓'}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="text"
                            placeholder="#EigenerTag..."
                            value={newCustomTag}
                            onChange={e => setNewCustomTag(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddCustomTag(h.ticker, h.tags || []); }}
                            style={{
                              flex: 1,
                              fontSize: '0.75rem',
                              padding: '4px 8px',
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '6px',
                              color: '#fff'
                            }}
                          />
                          <button
                            onClick={() => handleAddCustomTag(h.ticker, h.tags || [])}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: '#10b981',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer'
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Holding Detail Drawer / Modal */}
      {selectedHolding && (
        <HoldingDetailModal
          holding={selectedHolding}
          transactions={transactions}
          onClose={() => setSelectedHolding(null)}
          baseCurrency={baseCurrency}
        />
      )}
    </div>
  );
};

