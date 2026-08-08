import React, { useState, useMemo } from 'react';
import type { SavingsPlan, AssetCategory } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, TrendingUp, Calendar, Play, Pause } from 'lucide-react';

interface SavingsSimulatorProps {
  savingsPlans: SavingsPlan[];
  portfolioValue: number;
  onAddSavingsPlan: (plan: Omit<SavingsPlan, 'id'>) => void;
  onDeleteSavingsPlan: (id: string) => void;
  onToggleSavingsPlan: (id: string) => void;
  isReadOnly?: boolean;
}

export const SavingsSimulator: React.FC<SavingsSimulatorProps> = ({
  savingsPlans,
  portfolioValue,
  onAddSavingsPlan,
  onDeleteSavingsPlan,
  onToggleSavingsPlan,
  isReadOnly = false
}) => {
  // Sparplan Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Stock');
  const [amount, setAmount] = useState<number | ''>('');

  // Simulator Sliders State
  const [initialCapital, setInitialCapital] = useState<number>(Math.round(portfolioValue));
  const [annualReturn, setAnnualReturn] = useState<number>(7); // 7% p.a. default
  const [years, setYears] = useState<number>(20); // 20 years default

  // Calculate sum of active savings plans
  const totalActiveSavings = useMemo(() => {
    return savingsPlans
      .filter(p => p.isActive)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [savingsPlans]);

  const [monthlyContribution, setMonthlyContribution] = useState<number>(totalActiveSavings || 150);

  // Sync monthly savings input if total active changes
  React.useEffect(() => {
    if (totalActiveSavings > 0) {
      setMonthlyContribution(totalActiveSavings);
    }
  }, [totalActiveSavings]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !name || amount === '') return;

    onAddSavingsPlan({
      ticker: ticker.toUpperCase(),
      name,
      category,
      amount: Number(amount),
      isActive: true
    });

    setTicker('');
    setName('');
    setCategory('Stock');
    setAmount('');
    setShowAddForm(false);
  };

  // Generate Compound Interest projection data
  const simulationData = useMemo(() => {
    const data = [];
    const monthlyRate = annualReturn / 100 / 12;
    let totalInvested = initialCapital;
    let totalValue = initialCapital;

    // Push initial point
    data.push({
      year: 0,
      'Eingezahltes Kapital': Math.round(totalInvested),
      'Zinseszinsgewinn': 0,
      'Gesamtwert': Math.round(totalValue)
    });

    for (let y = 1; y <= years; y++) {
      // Compound monthly for 12 months
      for (let m = 0; m < 12; m++) {
        totalValue = (totalValue + monthlyContribution) * (1 + monthlyRate);
        totalInvested += monthlyContribution;
      }

      const totalInterests = Math.max(0, totalValue - totalInvested);

      data.push({
        year: y,
        'Eingezahltes Kapital': Math.round(totalInvested),
        'Zinseszinsgewinn': Math.round(totalInterests),
        'Gesamtwert': Math.round(totalValue)
      });
    }

    return data;
  }, [initialCapital, annualReturn, years, monthlyContribution]);

  const endStats = useMemo(() => {
    const lastPoint = simulationData[simulationData.length - 1];
    return {
      totalValue: lastPoint['Gesamtwert'],
      totalInvested: lastPoint['Eingezahltes Kapital'],
      totalInterests: lastPoint['Zinseszinsgewinn']
    };
  }, [simulationData]);

  return (
    <div className="fade-in sav-container">
      <div className="sav-header">
        <div>
          <h2 className="sav-title-h2">Sparpläne & Zinseszins-Simulator</h2>
          <p className="sav-subtitle">Plane deine finanzielle Zukunft und simuliere das Wachstum deines Portfolios.</p>
        </div>
      </div>

      <div className="sav-main-grid">
        
        {/* Left Column: Savings Plan Manager */}
        <div className="sav-col-flex">
          
          <div className="glass-panel">
            {isReadOnly && (
              <div className="glass-panel text-muted-bg p-4 mb-4" style={{ borderLeft: '4px solid var(--accent-purple)', background: 'rgba(168, 85, 247, 0.05)' }}>
                <h4 style={{ margin: 0, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                  🌐 Gesamtportfolio-Modus (Schreibgeschützt)
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-color-muted)' }}>
                  Sparpläne können in der Gesamtübersicht nicht erstellt oder modifiziert werden. Wähle ein spezifisches Portfolio aus, um Änderungen vorzunehmen.
                </p>
              </div>
            )}
            <div className="sav-panel-header">
              <h3 className="sav-panel-title">
                <Calendar size={18} className="portfolio-select-icon" /> Aktive Sparpläne
              </h3>
              {!isReadOnly && (
                <button 
                  className="btn-primary sav-panel-btn-neu" 
                  onClick={() => setShowAddForm(!showAddForm)}
                  aria-label={showAddForm ? 'Erstellungsformular schließen' : 'Neuen Sparplan erstellen'}
                >
                  <Plus size={12} /> {showAddForm ? 'Zu' : 'Neu'}
                </button>
              )}
            </div>

            {showAddForm && (
              <form onSubmit={handleAddSubmit} className="transaction-form sav-form-form">
                <div className="sav-form-col-flex">
                  <div className="form-group">
                    <label htmlFor="sp-ticker">Ticker Symbol</label>
                    <input 
                      id="sp-ticker"
                      type="text" 
                      value={ticker} 
                      onChange={(e) => setTicker(e.target.value)} 
                      placeholder="z.B. MSCI World" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sp-name">Name</label>
                    <input 
                      id="sp-name"
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="z.B. iShares Core MSCI World" 
                      required 
                    />
                  </div>
                  <div className="sav-form-grid-2">
                    <div className="form-group">
                      <label htmlFor="sp-category">Kategorie</label>
                      <select 
                        id="sp-category"
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
                      <label htmlFor="sp-amount">Sparrate (€ / Mon.)</label>
                      <input 
                        id="sp-amount"
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')} 
                        placeholder="z.B. 50" 
                        required 
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary sav-form-submit-btn">Sparplan anlegen</button>
                </div>
              </form>
            )}

            {savingsPlans.length === 0 ? (
              <p className="sav-list-empty">
                Keine Sparpläne angelegt.
              </p>
            ) : (
              <div className="sav-list-flex">
                {savingsPlans.map(plan => (
                  <div key={plan.id} className="sav-item-box">
                    <div className="sav-item-left">
                       <button 
                        onClick={isReadOnly ? undefined : () => onToggleSavingsPlan(plan.id)}
                        className="sav-item-playpause"
                        style={{ 
                          color: plan.isActive ? 'var(--status-positive)' : 'var(--text-muted)',
                          cursor: isReadOnly ? 'not-allowed' : 'pointer',
                          opacity: isReadOnly ? 0.6 : 1
                        }}
                        title={isReadOnly ? 'Schreibgeschützt' : plan.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        aria-label={plan.isActive ? 'Sparplan deaktivieren' : 'Sparplan aktivieren'}
                        disabled={isReadOnly}
                      >
                        {plan.isActive ? <Play size={16} /> : <Pause size={16} />}
                      </button>
                      <div>
                        <div 
                          className="sav-item-title-active"
                          style={{ 
                            textDecoration: plan.isActive ? 'none' : 'line-through', 
                            opacity: plan.isActive ? 1 : 0.5 
                          }}
                        >
                          {plan.ticker}
                        </div>
                        <div className="sav-item-subtitle">{plan.name}</div>
                      </div>
                    </div>
                    
                    <div className="sav-item-right">
                      <span className="sav-item-amount" style={{ color: plan.isActive ? 'inherit' : 'var(--text-muted)' }}>
                        {plan.amount.toLocaleString('de-DE')} €
                      </span>
                      {!isReadOnly && (
                        <button 
                          onClick={() => onDeleteSavingsPlan(plan.id)}
                          className="sav-item-trash-btn text-hover-rose"
                          title="Sparplan löschen"
                          aria-label="Sparplan löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="sav-total-divider">
                  <span className="sav-total-label">Gesamte Sparrate:</span>
                  <span className="sav-total-value">{totalActiveSavings.toLocaleString('de-DE')} € / Mon.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Compound Interest Simulator */}
        <div className="sav-col-flex">
          <div className="glass-panel">
            <h3 className="sav-sim-header">
              <TrendingUp size={18} className="text-secondary" style={{ color: 'var(--accent-blue)' }} /> Zinseszins-Simulator
            </h3>

            {/* Parameter Sliders */}
            <div className="sav-sim-grid-sliders">
              <div className="form-group">
                <div className="sav-slider-label-row">
                  <label htmlFor="slider-initial-capital">Startkapital</label>
                  <span className="sav-slider-label-bold">{initialCapital.toLocaleString('de-DE')} €</span>
                </div>
                <input 
                  id="slider-initial-capital"
                  type="range" 
                  min="0" 
                  max="100000" 
                  step="1000"
                  value={initialCapital} 
                  title="Startkapital Regler"
                  aria-label="Startkapital"
                  placeholder="Startkapital einstellen"
                  onChange={(e) => setInitialCapital(Number(e.target.value))} 
                  className="sav-slider-input"
                />
              </div>

              <div className="form-group">
                <div className="sav-slider-label-row">
                  <label htmlFor="slider-annual-return">Rendite p.a.</label>
                  <span className="sav-slider-label-bold" style={{ color: 'var(--status-positive)' }}>{annualReturn} %</span>
                </div>
                <input 
                  id="slider-annual-return"
                  type="range" 
                  min="1" 
                  max="15" 
                  step="0.5"
                  value={annualReturn} 
                  title="Rendite p.a. Regler"
                  aria-label="Rendite p.a."
                  placeholder="Rendite p.a. einstellen"
                  onChange={(e) => setAnnualReturn(Number(e.target.value))} 
                  className="sav-slider-input"
                />
              </div>

              <div className="form-group">
                <div className="sav-slider-label-row">
                  <label htmlFor="slider-monthly-contribution">Monatliche Sparrate</label>
                  <span className="sav-slider-label-bold" style={{ color: 'var(--accent-purple)' }}>{monthlyContribution.toLocaleString('de-DE')} €</span>
                </div>
                <input 
                  id="slider-monthly-contribution"
                  type="range" 
                  min="0" 
                  max="2000" 
                  step="25"
                  value={monthlyContribution} 
                  title="Monatliche Sparrate Regler"
                  aria-label="Monatliche Sparrate"
                  placeholder="Monatliche Sparrate einstellen"
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))} 
                  className="sav-slider-input"
                />
              </div>

              <div className="form-group">
                <div className="sav-slider-label-row">
                  <label htmlFor="slider-years">Laufzeit (Jahre)</label>
                  <span className="sav-slider-label-bold">{years} Jahre</span>
                </div>
                <input 
                  id="slider-years"
                  type="range" 
                  min="5" 
                  max="40" 
                  step="1"
                  value={years} 
                  title="Laufzeit in Jahren Regler"
                  aria-label="Laufzeit in Jahren"
                  placeholder="Laufzeit einstellen"
                  onChange={(e) => setYears(Number(e.target.value))} 
                  className="sav-slider-input"
                />
              </div>
            </div>

            {/* Projection Summary Row */}
            <div className="sav-sim-stats-grid">
              <div>
                <span className="sav-sim-stat-label">Investiertes Kapital</span>
                <p className="sav-sim-stat-value">{endStats.totalInvested.toLocaleString('de-DE')} €</p>
              </div>
              <div>
                <span className="sav-sim-stat-label">Zinsgewinne</span>
                <p className="sav-sim-stat-value" style={{ color: 'var(--status-positive)' }}>+{endStats.totalInterests.toLocaleString('de-DE')} €</p>
              </div>
              <div>
                <span className="sav-sim-stat-label">Endkapital Gesamt</span>
                <p className="sav-sim-stat-value" style={{ color: 'var(--accent-blue)' }}>{endStats.totalValue.toLocaleString('de-DE')} €</p>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="sav-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationData}>
                  <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={(v) => `Jahr ${v}`} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k €`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    labelFormatter={(v) => `Jahr ${v}`}
                    formatter={(value) => `${Number(value).toLocaleString('de-DE')} €`}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" name="Eingezahltes Kapital" dataKey="Eingezahltes Kapital" stroke="var(--accent-purple)" strokeWidth={2} fill="var(--accent-purple)" fillOpacity={0.1} stackId="1" />
                  <Area type="monotone" name="Zinseszinsgewinn" dataKey="Zinseszinsgewinn" stroke="var(--status-positive)" strokeWidth={2} fill="var(--status-positive)" fillOpacity={0.2} stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
