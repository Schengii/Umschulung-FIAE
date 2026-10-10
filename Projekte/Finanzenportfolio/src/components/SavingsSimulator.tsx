import React, { useState, useMemo } from 'react';
import type { SavingsPlan, AssetCategory } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, TrendingUp, Calendar, Play, Pause, Zap, Check, Sliders, X } from 'lucide-react';

interface SavingsSimulatorProps {
  savingsPlans: SavingsPlan[];
  portfolioValue: number;
  onAddSavingsPlan: (plan: Omit<SavingsPlan, 'id'>) => void;
  onUpdateSavingsPlan?: (plan: SavingsPlan) => void;
  onDeleteSavingsPlan: (id: string) => void;
  onToggleSavingsPlan: (id: string) => void;
  onExecuteSavingsPlans?: () => void;
  isReadOnly?: boolean;
}

export const SavingsSimulator: React.FC<SavingsSimulatorProps> = ({
  savingsPlans,
  portfolioValue,
  onAddSavingsPlan,
  onUpdateSavingsPlan,
  onDeleteSavingsPlan,
  onToggleSavingsPlan,
  onExecuteSavingsPlans,
  isReadOnly = false
}) => {
  // Sparplan Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Stock');
  const [amount, setAmount] = useState<number | ''>('');
  const [addDynamization, setAddDynamization] = useState<string>('0');

  // Plan Edit Modal State
  const [editingPlan, setEditingPlan] = useState<SavingsPlan | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editDynamization, setEditDynamization] = useState<string>('0');
  const [editPausedUntil, setEditPausedUntil] = useState<string>('');
  const [editEmergencyBuffer, setEditEmergencyBuffer] = useState<string>('');

  // Simulator Sliders State
  const [initialCapital, setInitialCapital] = useState<number>(Math.round(portfolioValue));
  const [annualReturn, setAnnualReturn] = useState<number>(7); // 7% p.a. default
  const [years, setYears] = useState<number>(20); // 20 years default
  const [annualSavingsGrowth, setAnnualSavingsGrowth] = useState<number>(2.5); // 2.5% salary raise adjustment p.a.

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

  const [executedNotice, setExecutedNotice] = useState<string | null>(null);

  const handleExecute = () => {
    if (onExecuteSavingsPlans) {
      onExecuteSavingsPlans();
      setExecutedNotice('Aktive Sparpläne für diesen Monat wurden erfolgreich eingebucht!');
      setTimeout(() => setExecutedNotice(null), 3500);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker || !name || amount === '') return;

    onAddSavingsPlan({
      ticker: ticker.toUpperCase(),
      name,
      category,
      amount: Number(amount),
      isActive: true,
      annualDynamizationPercent: parseFloat(addDynamization) || 0
    });

    setTicker('');
    setName('');
    setCategory('Stock');
    setAmount('');
    setAddDynamization('0');
    setShowAddForm(false);
  };

  const handleOpenEdit = (plan: SavingsPlan) => {
    setEditingPlan(plan);
    setEditAmount(plan.amount.toString());
    setEditDynamization((plan.annualDynamizationPercent || 0).toString());
    setEditPausedUntil(plan.pausedUntilDate || '');
    setEditEmergencyBuffer((plan.minimumEmergencyCashBufferEur || 0).toString());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !onUpdateSavingsPlan) return;

    onUpdateSavingsPlan({
      ...editingPlan,
      amount: parseFloat(editAmount) || editingPlan.amount,
      annualDynamizationPercent: parseFloat(editDynamization) || 0,
      pausedUntilDate: editPausedUntil.trim() || undefined,
      minimumEmergencyCashBufferEur: parseFloat(editEmergencyBuffer) || undefined
    });

    setEditingPlan(null);
  };

  // Generate Compound Interest projection data
  const simulationData = useMemo(() => {
    const data = [];
    const monthlyRate = annualReturn / 100 / 12;
    let totalInvested = initialCapital;
    let totalValue = initialCapital;
    let dynValue = initialCapital;
    let dynInvested = initialCapital;

    // Push initial point
    data.push({
      year: 0,
      'Eingezahltes Kapital': Math.round(totalInvested),
      'Zinseszinsgewinn': 0,
      'Gesamtwert': Math.round(totalValue),
      'Dynamischer Endwert (+Gehaltssprung)': Math.round(dynValue)
    });

    for (let y = 1; y <= years; y++) {
      const currentMonthlyContrib = monthlyContribution * Math.pow(1 + annualSavingsGrowth / 100, y - 1);

      // Compound monthly for 12 months
      for (let m = 0; m < 12; m++) {
        totalValue = (totalValue + monthlyContribution) * (1 + monthlyRate);
        totalInvested += monthlyContribution;

        dynValue = (dynValue + currentMonthlyContrib) * (1 + monthlyRate);
        dynInvested += currentMonthlyContrib;
      }

      const totalInterests = Math.max(0, totalValue - totalInvested);

      data.push({
        year: y,
        'Eingezahltes Kapital': Math.round(totalInvested),
        'Zinseszinsgewinn': Math.round(totalInterests),
        'Gesamtwert': Math.round(totalValue),
        'Dynamischer Endwert (+Gehaltssprung)': Math.round(dynValue)
      });
    }

    return data;
  }, [initialCapital, annualReturn, years, monthlyContribution, annualSavingsGrowth]);

  const endStats = useMemo(() => {
    const lastPoint = simulationData[simulationData.length - 1];
    return {
      totalValue: lastPoint['Gesamtwert'],
      totalInvested: lastPoint['Eingezahltes Kapital'],
      totalInterests: lastPoint['Zinseszinsgewinn'],
      dynamicValue: lastPoint['Dynamischer Endwert (+Gehaltssprung)']
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
            <div className="sav-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 className="sav-panel-title">
                <Calendar size={18} className="portfolio-select-icon" /> Aktive Sparpläne
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {!isReadOnly && savingsPlans.filter(p => p.isActive).length > 0 && (
                  <button
                    type="button"
                    onClick={handleExecute}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                    title="Aktive Sparpläne für diesen Monat als Käufe einbuchen"
                  >
                    <Zap size={13} /> Jetzt ausführen
                  </button>
                )}
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
            </div>

            {executedNotice && (
              <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                <Check size={14} /> {executedNotice}
              </div>
            )}

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
                        
                        {/* Dynamization & Pause Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.25rem' }}>
                          {(plan.annualDynamizationPercent || 0) > 0 && (
                            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
                              📈 +{plan.annualDynamizationPercent}% Dynamik/J.
                            </span>
                          )}
                          {plan.pausedUntilDate && (
                            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 600 }}>
                              ⏸️ Pausiert bis {plan.pausedUntilDate}
                            </span>
                          )}
                          {(plan.minimumEmergencyCashBufferEur || 0) > 0 && (
                            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 600 }}>
                              🛡️ Puffer: {plan.minimumEmergencyCashBufferEur} €
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="sav-item-right">
                      <span className="sav-item-amount" style={{ color: plan.isActive ? 'inherit' : 'var(--text-muted)' }}>
                        {plan.amount.toLocaleString('de-DE')} €
                      </span>
                      {!isReadOnly && (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <button 
                            onClick={() => handleOpenEdit(plan)}
                            className="sav-item-trash-btn"
                            title="Dynamisierung & Pause konfigurieren"
                            aria-label="Sparplan konfigurieren"
                            style={{ color: '#3b82f6' }}
                          >
                            <Sliders size={14} />
                          </button>
                          <button 
                            onClick={() => onDeleteSavingsPlan(plan.id)}
                            className="sav-item-trash-btn text-hover-rose"
                            title="Sparplan löschen"
                            aria-label="Sparplan löschen"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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

              <div className="form-group">
                <div className="sav-slider-label-row">
                  <label htmlFor="slider-annual-growth">Jährliche Sparratenerhöhung (Gehaltssteigerung)</label>
                  <span className="sav-slider-label-bold" style={{ color: '#10b981' }}>+{annualSavingsGrowth} % / Jahr</span>
                </div>
                <input 
                  id="slider-annual-growth"
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.5"
                  value={annualSavingsGrowth} 
                  title="Jährliche Sparratenerhöhung Regler"
                  aria-label="Jährliche Sparratenerhöhung"
                  placeholder="Sparratenerhöhung einstellen"
                  onChange={(e) => setAnnualSavingsGrowth(Number(e.target.value))} 
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
                <span className="sav-sim-stat-label">Endkapital (Nominal)</span>
                <p className="sav-sim-stat-value" style={{ color: 'var(--accent-blue)' }}>{endStats.totalValue.toLocaleString('de-DE')} €</p>
              </div>
              <div>
                <span className="sav-sim-stat-label">Reale Kaufkraft (2% Inflation)</span>
                <p className="sav-sim-stat-value" style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  {Math.round(endStats.totalValue / Math.pow(1.02, years)).toLocaleString('de-DE')} €
                </p>
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
                  <Area type="monotone" name="Dynamischer Endwert (+Gehaltssprung)" dataKey="Dynamischer Endwert (+Gehaltssprung)" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.05} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

      </div>
      {/* In-Place Plan Configuration Modal */}
      {editingPlan && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
            maxWidth: '480px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={18} color="#3b82f6" /> Sparplan-Dynamisierung & Notgroschen
              </h3>
              <button onClick={() => setEditingPlan(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Konfiguration für <strong>{editingPlan.name} ({editingPlan.ticker})</strong>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Monatliche Sparrate (€)</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Jährliche Dynamisierung (% pro Jahr)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  placeholder="z.B. 2.5 oder 5"
                  value={editDynamization}
                  onChange={(e) => setEditDynamization(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Erhöht die Sparrate jährlich automatisch (z.B. Inflations- oder Gehaltssprung).
                </span>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Temporär pausieren bis (Datum)</label>
                <input
                  type="date"
                  className="form-input"
                  value={editPausedUntil}
                  onChange={(e) => setEditPausedUntil(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Der Sparplan wird bis zu diesem Tag bei Sofortausführungen automatisch übersprungen.
                </span>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Notgroschen-Sperre (€ Mindestpuffer)</label>
                <input
                  type="number"
                  step="100"
                  className="form-input"
                  placeholder="z.B. 5000"
                  value={editEmergencyBuffer}
                  onChange={(e) => setEditEmergencyBuffer(e.target.value)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Verhindert Ausführung, wenn das liquide Cash-Polster diesen Wert unterschreitet.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingPlan(null)}>
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary">
                  Einstellungen speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
