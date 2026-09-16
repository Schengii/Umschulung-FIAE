import React, { useState } from 'react';
import type { RealEstateAsset } from '../types';
import { Home, Plus, Trash2, TrendingUp, DollarSign, MapPin, Building, Key, Edit3, X, Check } from 'lucide-react';
import { calculateRealEstateMetrics } from './performanceUtils';

interface RealEstateTrackerProps {
  properties: RealEstateAsset[];
  onAddProperty: (property: RealEstateAsset) => void;
  onUpdateProperty?: (property: RealEstateAsset) => void;
  onDeleteProperty: (id: string) => void;
  baseCurrency?: string;
}

export const RealEstateTracker: React.FC<RealEstateTrackerProps> = ({
  properties,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  baseCurrency = 'EUR'
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<RealEstateAsset | null>(null);

  // New property form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(350000);
  const [currentMarketValue, setCurrentMarketValue] = useState(380000);
  const [loanBalance, setLoanBalance] = useState(250000);
  const [monthlyRentGross, setMonthlyRentGross] = useState(1400);
  const [monthlyCosts, setMonthlyCosts] = useState(250);
  const [monthlyMortgage, setMonthlyMortgage] = useState(950);
  const [squareMeters, setSquareMeters] = useState(75);
  const [interestRate, setInterestRate] = useState(3.5);

  const metrics = calculateRealEstateMetrics(properties);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProp: RealEstateAsset = {
      id: `re-${Date.now()}`,
      name: name.trim(),
      location: location.trim() || 'Berlin',
      purchaseDate: new Date().toLocaleDateString('de-DE'),
      purchasePriceEur: Number(purchasePrice),
      currentMarketValueEur: Number(currentMarketValue),
      loanBalanceEur: Number(loanBalance),
      monthlyRentalIncomeEur: Number(monthlyRentGross),
      monthlyOperatingCostsEur: Number(monthlyCosts),
      monthlyMortgagePaymentEur: Number(monthlyMortgage),
      interestRatePercent: Number(interestRate),
      squareMeters: Number(squareMeters)
    };

    onAddProperty(newProp);
    setShowAddModal(false);
    setName('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    if (onUpdateProperty) {
      onUpdateProperty(editingProperty);
    }
    setEditingProperty(null);
  };

  return (
    <div className="real-estate-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with Title and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.4rem' }}>
            <Building className="text-blue-500" size={24} /> Immobilien & Cashflow-Tracker
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Verwalte Mietrenditen, Netto-Eigenkapital, Tilgungspläne und monatlichen Cashflow deiner Immobilien.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Immobilie hinzufügen
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Home size={16} /> Immobilien-Gesamtwert
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {metrics.totalMarketValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {properties.length} Objekt{properties.length !== 1 ? 'e' : ''} im Portfolio
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Key size={16} /> Netto-Eigenkapital (Equity)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.5rem' }}>
            {metrics.netEquityEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Beleihungsquote (LTV): {metrics.debtToValueRatioPercent.toFixed(1)}%
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <DollarSign size={16} /> Monatlicher Netto-Cashflow
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: metrics.monthlyNetCashflow >= 0 ? '#10b981' : '#ef4444', marginTop: '0.5rem' }}>
            {metrics.monthlyNetCashflow.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} / Mo.
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Nach Instandhaltung & Bankrate
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <TrendingUp size={16} /> Brutto- / Netto-Mietrendite
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.5rem' }}>
            {metrics.grossRentalYieldPercent.toFixed(2)}% <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {metrics.netRentalYieldPercent.toFixed(2)}%</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Mieteinnahmen: {metrics.annualGrossRent.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} p.a.
          </div>
        </div>
      </div>

      {/* Properties List Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: '600' }}>
          Vorhandene Immobilien & Renditedetails
        </div>

        {properties.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Building size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>Noch keine Immobilien hinterlegt.</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ marginTop: '0.5rem' }}>
              Erstes Objekt anlegen
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Objekt & Lage</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Wohnfläche</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Marktwert</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Restschuld</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Netto-Eigenkapital</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Kaltmiete / Mo.</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Bankrate / Mo.</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Netto-Cashflow</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => {
                  const equity = p.currentMarketValueEur - p.loanBalanceEur;
                  const cashflow = p.monthlyRentalIncomeEur - p.monthlyOperatingCostsEur - p.monthlyMortgagePaymentEur;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: '600' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} /> {p.location}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{p.squareMeters} m²</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>
                        {p.currentMarketValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ef4444' }}>
                        {p.loanBalanceEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: '600' }}>
                        {equity.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {p.monthlyRentalIncomeEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {p.monthlyMortgagePaymentEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: cashflow >= 0 ? '#10b981' : '#ef4444' }}>
                        {cashflow >= 0 ? '+' : ''}{cashflow.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setEditingProperty({ ...p })}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', marginRight: '0.5rem' }}
                          title="Bearbeiten"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteProperty(p.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal to add property */}
      {showAddModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg, #1e293b)', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '520px',
            border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={20} /> Neues Immobilienobjekt anlegen
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name / Bezeichnung</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="z.B. 2-Zimmer Wohnung Prenzlauer Berg"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Standort / Stadt</label>
                  <input
                    type="text"
                    className="input-field"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Berlin"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wohnfläche (m²)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={squareMeters}
                    onChange={e => setSquareMeters(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kaufpreis (€)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aktueller Marktwert (€)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={currentMarketValue}
                    onChange={e => setCurrentMarketValue(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Restschuld Darlehen (€)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={loanBalance}
                    onChange={e => setLoanBalance(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sollzins (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={interestRate}
                    onChange={e => setInterestRate(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kaltmiete (€/Mo.)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={monthlyRentGross}
                    onChange={e => setMonthlyRentGross(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bankrate (€/Mo.)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={monthlyMortgage}
                    onChange={e => setMonthlyMortgage(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hausgeld/Kosten (€)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={monthlyCosts}
                    onChange={e => setMonthlyCosts(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary">
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to edit property */}
      {editingProperty && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg, #1e293b)', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '520px',
            border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} /> Immobilie bearbeiten
              </h3>
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Name / Bezeichnung</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingProperty.name}
                  onChange={e => setEditingProperty({ ...editingProperty, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Standort / Lage</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingProperty.location}
                    onChange={e => setEditingProperty({ ...editingProperty, location: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wohnfläche (m²)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingProperty.squareMeters}
                    onChange={e => setEditingProperty({ ...editingProperty, squareMeters: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kaufpreis (€)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingProperty.purchasePriceEur}
                    onChange={e => setEditingProperty({ ...editingProperty, purchasePriceEur: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aktueller Marktwert (€)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingProperty.currentMarketValueEur}
                    onChange={e => setEditingProperty({ ...editingProperty, currentMarketValueEur: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Restschuld (€)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingProperty.loanBalanceEur}
                    onChange={e => setEditingProperty({ ...editingProperty, loanBalanceEur: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sollzins (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={editingProperty.interestRatePercent || 0}
                    onChange={e => setEditingProperty({ ...editingProperty, interestRatePercent: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kaltmiete (€/Mo.)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingProperty.monthlyRentalIncomeEur}
                    onChange={e => setEditingProperty({ ...editingProperty, monthlyRentalIncomeEur: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bankrate (€/Mo.)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingProperty.monthlyMortgagePaymentEur}
                    onChange={e => setEditingProperty({ ...editingProperty, monthlyMortgagePaymentEur: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kosten (€/Mo.)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editingProperty.monthlyOperatingCostsEur}
                    onChange={e => setEditingProperty({ ...editingProperty, monthlyOperatingCostsEur: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingProperty(null)}>
                  Abbrechen
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Check size={16} /> Übernehmen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
