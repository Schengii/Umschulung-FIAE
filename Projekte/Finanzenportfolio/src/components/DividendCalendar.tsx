import React, { useState, useMemo } from 'react';
import type { Transaction, Holding } from '../types';
import { ArrowLeft, ArrowRight, TrendingUp, DollarSign, Clock, Calendar, BarChart3 } from 'lucide-react';
import { convertCurrency } from './performanceUtils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DividendCalendarProps {
  transactions: Transaction[];
  holdings: Holding[];
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const DividendCalendar: React.FC<DividendCalendarProps> = ({
  transactions,
  holdings,
  baseCurrency
}) => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [viewMode, setViewMode] = useState<'history' | 'forecast'>('history');

  const monthsList = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // Format helper
  const formatVal = (valInEur: number) => {
    const converted = convertCurrency(valInEur, 'EUR', baseCurrency);
    return converted.toLocaleString('de-DE', {
      style: 'currency',
      currency: baseCurrency
    });
  };

  // Filter dividend transactions for selected month and year (Historical view)
  const monthlyDividends = useMemo(() => {
    return transactions
      .filter(tx => {
        if (tx.type !== 'DIVIDEND') return false;
        const dateObj = new Date(tx.date.split('.').reverse().join('-'));
        return dateObj.getFullYear() === selectedYear && dateObj.getMonth() === selectedMonth;
      })
      .map(tx => {
        const rate = tx.exchangeRate || 1.0;
        const netPayoutEur = (tx.amount * tx.price - tx.tax) / rate;
        const grossPayoutEur = (tx.amount * tx.price) / rate;
        const taxEur = tx.tax / rate;

        return {
          ...tx,
          netPayoutEur,
          grossPayoutEur,
          taxEur
        };
      })
      .sort((a, b) => {
        const dayA = parseInt(a.date.split('.')[0]);
        const dayB = parseInt(b.date.split('.')[0]);
        return dayA - dayB;
      });
  }, [transactions, selectedYear, selectedMonth]);

  // Summaries for selected month
  const totalNet = useMemo(() => {
    return monthlyDividends.reduce((acc, curr) => acc + curr.netPayoutEur, 0);
  }, [monthlyDividends]);

  const totalTax = useMemo(() => {
    return monthlyDividends.reduce((acc, curr) => acc + curr.taxEur, 0);
  }, [monthlyDividends]);

  const topPayer = useMemo(() => {
    if (monthlyDividends.length === 0) return null;
    const totals: Record<string, { name: string; total: number }> = {};
    monthlyDividends.forEach(tx => {
      if (!totals[tx.ticker]) totals[tx.ticker] = { name: tx.name, total: 0 };
      totals[tx.ticker].total += tx.netPayoutEur;
    });
    return Object.entries(totals)
      .map(([ticker, val]) => ({ ticker, ...val }))
      .sort((a, b) => b.total - a.total)[0];
  }, [monthlyDividends]);

  // Payout Forecast for the next 12 months
  const forecastData = useMemo(() => {
    const today = new Date();
    const monthsForecast = Array.from({ length: 12 }, (_, i) => {
      const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      return {
        monthIndex: targetDate.getMonth(),
        year: targetDate.getFullYear(),
        monthName: targetDate.toLocaleDateString('de-DE', { month: 'short' }) + ' ' + targetDate.getFullYear().toString().slice(-2),
        totalPayoutEur: 0,
        assets: [] as Array<{ ticker: string; name: string; amount: number; estimatedPayoutEur: number }>
      };
    });

    holdings.forEach(holding => {
      if (holding.shares <= 0) return;

      // Find historical dividends for this asset
      const assetDivs = transactions.filter(t => t.type === 'DIVIDEND' && t.ticker === holding.ticker);

      if (assetDivs.length > 0) {
        // Find latest dividend price (dividend per share)
        const latestDiv = assetDivs.sort((a, b) => {
          const dateA = new Date(a.date.split('.').reverse().join('-')).getTime();
          const dateB = new Date(b.date.split('.').reverse().join('-')).getTime();
          return dateB - dateA;
        })[0];

        const ratePerShareEur = latestDiv.price / (latestDiv.exchangeRate || 1.0);

        // Identify historical payment months
        const paymentMonths = Array.from(new Set(assetDivs.map(t => {
          return new Date(t.date.split('.').reverse().join('-')).getMonth();
        })));

        monthsForecast.forEach(m => {
          if (paymentMonths.includes(m.monthIndex)) {
            const estPayout = holding.shares * ratePerShareEur;
            m.totalPayoutEur += estPayout;
            m.assets.push({
              ticker: holding.ticker,
              name: holding.name,
              amount: holding.shares,
              estimatedPayoutEur: estPayout
            });
          }
        });
      } else {
        // Fallback for dividend payers without transaction history (assume 2.0% p.a. paid quarterly)
        // e.g. paid in Jan, Apr, Jul, Oct (months 0, 3, 6, 9)
        const estQuarterlyRate = (holding.averageBuyPrice * 0.005);
        monthsForecast.forEach(m => {
          if ([0, 3, 6, 9].includes(m.monthIndex)) {
            const estPayout = holding.shares * estQuarterlyRate;
            m.totalPayoutEur += estPayout;
            m.assets.push({
              ticker: holding.ticker,
              name: holding.name,
              amount: holding.shares,
              estimatedPayoutEur: estPayout
            });
          }
        });
      }
    });

    return monthsForecast;
  }, [holdings, transactions]);

  const totalForecastPayout = useMemo(() => {
    return forecastData.reduce((acc, curr) => acc + curr.totalPayoutEur, 0);
  }, [forecastData]);

  const averageForecastPayout = useMemo(() => {
    return totalForecastPayout / 12;
  }, [totalForecastPayout]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  return (
    <div className="glass-panel fade-in">
      {/* View Switcher Tabs */}
      <div className="hl-header-row mb-5" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <h2 className="hl-title-h2">Auszahlungskalender & Prognose</h2>
          <p className="hl-subtitle">Detaillierte Übersicht deiner erhaltenen Dividenden und zukünftigen Ausschüttungen.</p>
        </div>
        <div className="navigation-tabs" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '8px' }}>
          <button 
            className={`nav-tab ${viewMode === 'history' ? 'active' : ''}`}
            onClick={() => setViewMode('history')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Calendar size={14} /> Historie
          </button>
          <button 
            className={`nav-tab ${viewMode === 'forecast' ? 'active' : ''}`}
            onClick={() => setViewMode('forecast')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <BarChart3 size={14} /> 12M Prognose
          </button>
        </div>
      </div>

      {viewMode === 'history' ? (
        <>
          <div className="hl-header-row mb-4">
            <span className="fw-600 text-white fs-md">Monatsübersicht</span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={handlePrevMonth} className="btn-secondary p-2" title="Vorheriger Monat">
                <ArrowLeft size={16} />
              </button>
              <span className="fw-600 px-3 fs-md text-white" style={{ minWidth: '150px', textAlign: 'center' }}>
                {monthsList[selectedMonth]} {selectedYear}
              </span>
              <button onClick={handleNextMonth} className="btn-secondary p-2" title="Nächster Monat">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="sav-sim-stats-grid mb-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="glass-panel text-muted-bg p-4">
              <div className="strat-card-title-row">
                <span className="sav-sim-stat-label">Netto-Auszahlung ({baseCurrency})</span>
                <DollarSign size={18} style={{ color: 'var(--accent-gold)' }} />
              </div>
              <p className="sav-sim-stat-value text-gold" style={{ color: 'var(--accent-gold)' }}>
                {formatVal(totalNet)}
              </p>
            </div>

            <div className="glass-panel text-muted-bg p-4">
              <div className="strat-card-title-row">
                <span className="sav-sim-stat-label">Abgeführte Steuern</span>
                <Clock size={18} style={{ color: 'var(--accent-rose)' }} />
              </div>
              <p className="sav-sim-stat-value text-negative" style={{ color: 'var(--accent-rose)' }}>
                {formatVal(totalTax)}
              </p>
            </div>

            <div className="glass-panel text-muted-bg p-4">
              <div className="strat-card-title-row">
                <span className="sav-sim-stat-label">Top Ausschütter</span>
                <TrendingUp size={18} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <p className="sav-sim-stat-value text-purple" style={{ color: 'var(--accent-blue)', fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {topPayer ? `${topPayer.name} (${formatVal(topPayer.total)})` : 'Keine Dividenden'}
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tag / Datum</th>
                  <th>Wertpapier (Ticker)</th>
                  <th>Stückzahl (Anteile)</th>
                  <th>Brutto pro Stück</th>
                  <th>Einbehaltene Steuern</th>
                  <th>Auszahlungsbetrag (Netto)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyDividends.length > 0 ? (
                  monthlyDividends.map((div) => {
                    const txCurrency = div.currency || 'EUR';
                    const divPriceConverted = convertCurrency(div.price, txCurrency, baseCurrency);
                    const divTaxConverted = convertCurrency(div.tax, txCurrency, baseCurrency);
                    const netPayoutConverted = convertCurrency(div.netPayoutEur, 'EUR', baseCurrency);

                    return (
                      <tr key={div.id}>
                        <td className="fw-600">{div.date}</td>
                        <td>
                          <div className="hl-flex-col-name">
                            <span className="hl-name-span">{div.name}</span>
                            <span className="hl-ticker-span">{div.ticker}</span>
                          </div>
                        </td>
                        <td>{div.amount.toLocaleString('de-DE', { maximumFractionDigits: 4 })}</td>
                        <td>{divPriceConverted.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</td>
                        <td style={{ color: 'var(--accent-rose)' }}>
                          {divTaxConverted > 0 ? `-${divTaxConverted.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}` : '—'}
                        </td>
                        <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                          +{netPayoutConverted.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="hl-empty-row" style={{ padding: '3rem' }}>
                      Keine Ausschüttungen für diesen Monat erfasst.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Dividend Forecast view */}
          <div className="sav-sim-stats-grid mb-6" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="glass-panel text-muted-bg p-4">
              <span className="sav-sim-stat-label">Erwartete Dividenden (Nächste 12M)</span>
              <p className="sav-sim-stat-value text-gold" style={{ color: 'var(--accent-gold)' }}>
                {formatVal(totalForecastPayout)}
              </p>
            </div>
            <div className="glass-panel text-muted-bg p-4">
              <span className="sav-sim-stat-label">Durchschnitt pro Monat</span>
              <p className="sav-sim-stat-value text-gold" style={{ color: 'var(--accent-emerald)' }}>
                {formatVal(averageForecastPayout)}
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 mb-6" style={{ height: '280px' }}>
            <span className="sav-item-subtitle" style={{ display: 'block', marginBottom: '1rem', fontWeight: 600 }}>Ausschüttungen nach Monaten ({baseCurrency})</span>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={forecastData.map(d => ({
                month: d.monthName,
                Dividende: Math.round(convertCurrency(d.totalPayoutEur, 'EUR', baseCurrency))
              }))}>
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  formatter={(value) => `${value} ${baseCurrency}`}
                />
                <Bar dataKey="Dividende" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 className="sav-panel-title mb-3">Vorschau der Ausschüttungen</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Monat</th>
                  <th>Prognostizierte Zahler</th>
                  <th>Geschätzte Gesamtsumme</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((data, idx) => (
                  <tr key={idx}>
                    <td className="fw-600">{data.monthName}</td>
                    <td>
                      {data.assets.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {data.assets.map((asset, aIdx) => (
                            <span 
                              key={aIdx} 
                              className="badge" 
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.15rem 0.4rem' }}
                              title={`${asset.name}: ${asset.amount} Stk.`}
                            >
                              {asset.ticker} ({formatVal(asset.estimatedPayoutEur)})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-bg" style={{ fontSize: '0.85rem' }}>Keine Ausschüttungen</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {data.totalPayoutEur > 0 ? `+${formatVal(data.totalPayoutEur)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
