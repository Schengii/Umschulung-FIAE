import React, { useState, useMemo } from 'react';
import type { Holding, Transaction } from '../types';
import { RefreshCw, TrendingUp, DollarSign, ArrowUpRight, Zap, X, Info, Check } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { calculateDripComparison } from './performanceUtils';

interface DripCompoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  baseCurrency?: string;
}

export const DripCompoundModal: React.FC<DripCompoundModalProps> = ({
  isOpen,
  onClose,
  holdings,
  transactions,
  onAddTransaction,
  baseCurrency = 'EUR'
}) => {
  const [projectionYears, setProjectionYears] = useState(15);
  const [expectedYieldPercent, setExpectedYieldPercent] = useState(3.5);
  const [expectedGrowthPercent, setExpectedGrowthPercent] = useState(6.0);
  const [executedDripMessage, setExecutedDripMessage] = useState<string | null>(null);

  // Calculate current portfolio weighted dividend yield
  const currentTotalVal = useMemo(() => holdings.reduce((sum, h) => sum + h.currentValue, 0), [holdings]);
  const currentAnnualDividend = useMemo(() => {
    return holdings.reduce((sum, h) => {
      if (h.category === 'Crypto') return sum;
      return sum + (h.currentValue * (h.yieldOnCost / 100));
    }, 0);
  }, [holdings]);

  const currentYieldPct = currentTotalVal > 0 ? (currentAnnualDividend / currentTotalVal) * 100 : 3.0;

  // Real dividends received this year that could be DRIP-reinvested
  const currentYear = new Date().getFullYear();
  const uninvestedDividendsThisYear = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== 'DIVIDEND') return false;
      const yr = parseInt(t.date.split('.')[2]);
      return yr === currentYear;
    });
  }, [transactions, currentYear]);

  const totalDividendsThisYearEur = uninvestedDividendsThisYear.reduce((sum, t) => {
    const rate = t.exchangeRate || 1.0;
    return sum + (t.amount * t.price - t.tax) / rate;
  }, 0);

  const dripResult = useMemo(() => {
    return calculateDripComparison(
      transactions,
      holdings,
      projectionYears,
      expectedYieldPercent,
      expectedGrowthPercent
    );
  }, [transactions, holdings, projectionYears, expectedYieldPercent, expectedGrowthPercent]);

  const chartData = useMemo(() => {
    return dripResult.years.map((yr, idx) => ({
      year: yr,
      'Mit Reinvestition (DRIP)': dripResult.withDripValue[idx],
      'Ohne Reinvestition': dripResult.withoutDripValue[idx]
    }));
  }, [dripResult]);

  if (!isOpen) return null;

  const handleExecuteDripForYear = () => {
    if (uninvestedDividendsThisYear.length === 0) {
      alert('Keine Dividendenzahlungen im aktuellen Jahr zum Reinvestieren vorhanden.');
      return;
    }

    let bookedCount = 0;
    uninvestedDividendsThisYear.forEach(divTx => {
      const rate = divTx.exchangeRate || 1.0;
      const netDividendEur = (divTx.amount * divTx.price - divTx.tax) / rate;
      const holding = holdings.find(h => h.ticker === divTx.ticker);
      const buyPrice = holding?.currentPrice || divTx.price;
      const sharesToBuy = buyPrice > 0 ? netDividendEur / buyPrice : 1;

      onAddTransaction({
        id: `drip-${Date.now()}-${divTx.id}`,
        type: 'BUY',
        date: new Date().toLocaleDateString('de-DE'),
        ticker: divTx.ticker,
        name: `${divTx.name} (DRIP Reinvest)`,
        amount: Math.round(sharesToBuy * 10000) / 10000,
        price: buyPrice,
        fee: 0,
        tax: 0,
        category: divTx.category || 'Stock',
        currency: 'EUR',
        notes: `Automatische Dividenden-Reinvestition (DRIP) für Ausschüttung vom ${divTx.date}`
      });
      bookedCount++;
    });

    setExecutedDripMessage(`Erfolgreich ${bookedCount} Dividenden-Reinvestitionen (${totalDividendsThisYearEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}) als Käufe eingebucht!`);
    setTimeout(() => setExecutedDripMessage(null), 5000);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '850px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '8px' }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Dividenden-Reinvestition (DRIP) & Zinseszins-Simulator</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Vergleiche den Zinseszins-Effekt mit vs. ohne Reinvestition und buche reale Dividenden reinvestiert ein
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Controls Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Simulationszeitraum: <strong style={{ color: 'var(--text-color)' }}>{projectionYears} Jahre</strong>
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={projectionYears}
                onChange={e => setProjectionYears(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Dividendenrendite p.a.: <strong style={{ color: '#10b981' }}>{expectedYieldPercent.toFixed(1)}%</strong>
              </label>
              <input
                type="range"
                min={1.0}
                max={9.0}
                step={0.5}
                value={expectedYieldPercent}
                onChange={e => setExpectedYieldPercent(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Kurszuwachs p.a.: <strong style={{ color: '#3b82f6' }}>{expectedGrowthPercent.toFixed(1)}%</strong>
              </label>
              <input
                type="range"
                min={2.0}
                max={12.0}
                step={0.5}
                value={expectedGrowthPercent}
                onChange={e => setExpectedGrowthPercent(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zinseszins-Mehrertrag (DRIP Alpha)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.4rem', color: '#10b981' }}>
                +{dripResult.dripOutperformanceEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                +{dripResult.dripOutperformancePercent.toFixed(1)}% mehr Vermögen
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Endwert mit Reinvestition</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.4rem', color: 'var(--text-color)' }}>
                {dripResult.withDripValue[dripResult.withDripValue.length - 1]?.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                vs. {dripResult.withoutDripValue[dripResult.withoutDripValue.length - 1]?.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} (ohne DRIP)
              </div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reinvestierte Dividenden gesamt</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.4rem', color: '#3b82f6' }}>
                +{dripResult.totalDividendsReinvested.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Über den gesamten Zeitraum
              </div>
            </div>
          </div>

          {/* Compound Chart */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-color)' }}>
              Vermögensverlauf: Automatische Reinvestition vs. Bar-Ausschüttung
            </div>
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="dripGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="noDripGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k €`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-main, #0f172a)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    formatter={(val: any) => `${Number(val).toLocaleString('de-DE')} €`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Mit Reinvestition (DRIP)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#dripGrad)" />
                  <Area type="monotone" dataKey="Ohne Reinvestition" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#noDripGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 1-Click Execution for Current Year Received Dividends */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Zap size={18} /> Reale Dividenden {currentYear} direkt reinvestieren
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Im Jahr {currentYear} hast du <strong>{totalDividendsThisYearEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</strong> aus {uninvestedDividendsThisYear.length} Dividendenausschüttungen erhalten. Buche sie mit 1 Klick als Zukäufe der jeweiligen Titel ein.
              </div>
            </div>

            <button
              onClick={handleExecuteDripForYear}
              disabled={uninvestedDividendsThisYear.length === 0}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
            >
              <RefreshCw size={15} /> DRIP für {currentYear} einbuchen
            </button>
          </div>

          {executedDripMessage && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={16} /> {executedDripMessage}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
