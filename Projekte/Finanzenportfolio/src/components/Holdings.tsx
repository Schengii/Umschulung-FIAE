import React, { useState, useMemo } from 'react';
import type { Holding, Transaction } from '../types';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { convertCurrency } from './performanceUtils';
import { HoldingDetailModal } from './HoldingDetailModal';

interface HoldingsProps {
  holdings: Holding[];
  transactions: Transaction[];
  onTriggerPriceRefresh: () => void;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  onBaseCurrencyChange: (currency: 'EUR' | 'USD' | 'CHF' | 'GBP') => void;
}

export const Holdings: React.FC<HoldingsProps> = ({ 
  holdings, 
  transactions, 
  onTriggerPriceRefresh,
  baseCurrency,
  onBaseCurrencyChange
}) => {
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Currency Formatter
  const formatVal = (value: number) => {
    return value.toLocaleString('de-DE', {
      style: 'currency',
      currency: baseCurrency
    });
  };

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
    if (!searchQuery.trim()) return convertedHoldings;
    const q = searchQuery.toLowerCase();
    return convertedHoldings.filter(h =>
      h.name.toLowerCase().includes(q) || h.ticker.toLowerCase().includes(q)
    );
  }, [convertedHoldings, searchQuery]);

  return (
    <div className="holdings-container">
      {/* Top Header Bar */}
      <div className="holdings-header">
        <div>
          <h2 className="holdings-title">Depot-Bestände</h2>
          <p className="holdings-subtitle">Aktuelle Positionen, Einstandskurse & Wertentwicklung</p>
        </div>

        <div className="controls-group">
          <input
            type="text"
            placeholder="Asset suchen (Ticker/Name)..."
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
            onClick={onTriggerPriceRefresh}
            title="Echtzeit-Kurse aktualisieren"
          >
            <RefreshCw size={16} /> Aktualisieren
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      {filteredHoldings.length === 0 ? (
        <div className="empty-state-card">
          <p className="empty-text">Keine passenden Positionen im aktuellen Portfolio vorhanden.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Asset / Ticker</th>
                <th>Kategorie</th>
                <th>Anteile</th>
                <th>Kaufkurs (Ø)</th>
                <th>Aktueller Kurs</th>
                <th>Gesamtwert</th>
                <th>Gewinn / Verlust</th>
                <th>Depotanteil</th>
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
                      <span className="asset-ticker">{h.ticker}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${h.category.toLowerCase()}`}>
                      {h.category}
                    </span>
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
