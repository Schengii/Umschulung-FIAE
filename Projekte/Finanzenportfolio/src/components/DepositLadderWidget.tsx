import React, { useState } from 'react';
import type { DepositLadderItem } from '../types';
import { Layers, Plus, Trash2, AlertCircle, CheckCircle2, ShieldAlert, Edit3, X, Check } from 'lucide-react';
import { calculateDepositLadderStats } from './performanceUtils';

interface DepositLadderWidgetProps {
  deposits: DepositLadderItem[];
  onAddDeposit: (deposit: DepositLadderItem) => void;
  onUpdateDeposit?: (deposit: DepositLadderItem) => void;
  onDeleteDeposit: (id: string) => void;
  baseCurrency?: string;
}

export const DepositLadderWidget: React.FC<DepositLadderWidgetProps> = ({
  deposits,
  onAddDeposit,
  onUpdateDeposit,
  onDeleteDeposit,
  baseCurrency = 'EUR'
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<DepositLadderItem | null>(null);

  const [bankName, setBankName] = useState('');
  const [depositType, setDepositType] = useState<'FESTGELD' | 'TAGESGELD' | 'SPARBRIEF'>('FESTGELD');
  const [principal, setPrincipal] = useState(5000);
  const [interestRate, setInterestRate] = useState(3.6);
  const [maturityDate, setMaturityDate] = useState('15.09.2026');

  const stats = calculateDepositLadderStats(deposits);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) return;

    const newDep: DepositLadderItem = {
      id: `dep-${Date.now()}`,
      bankName: bankName.trim(),
      depositType,
      principalEur: Number(principal),
      interestRatePercent: Number(interestRate),
      startDate: new Date().toLocaleDateString('de-DE'),
      maturityDate: maturityDate.trim(),
      payoutInterval: 'AT_MATURITY',
      isAutoRenew: false
    };

    onAddDeposit(newDep);
    setShowAddModal(false);
    setBankName('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeposit) return;
    if (onUpdateDeposit) {
      onUpdateDeposit(editingDeposit);
    }
    setEditingDeposit(null);
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.4rem' }}>
            <Layers className="text-amber-500" size={24} /> Festgeld- & Tagesgeld-Zinstreppe
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Optimiere Liquidität, Fälligkeiten und garantierten Zinsertrag durch gestaffelte Festgelder und Tagesgelder.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Anlage hinzufügen
        </button>
      </div>

      {/* Deposit Insurance Warning Banner */}
      {stats.exceededDepositInsuranceBanks && stats.exceededDepositInsuranceBanks.length > 0 && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem'
        }}>
          <ShieldAlert size={24} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: '600', color: '#ef4444', marginBottom: '0.25rem' }}>
              Achtung: Gesetzliche Einlagensicherung überschritten (&gt; 100.000 € je Institut)
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.9 }}>
              Folgende Banken weisen ein Anlagevolumen über 100.000 € auf:{' '}
              <strong style={{ color: '#fca5a5' }}>{stats.exceededDepositInsuranceBanks.join(', ')}</strong>.
              Guthaben oberhalb von 100.000 € je Bank und Anleger sind im Falle einer Bankeninsolvenz nicht durch die gesetzliche EU-Einlagensicherung abgesichert. Bitte streue das Kapital auf mehrere unabhängige Institute.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gesamtvolumen Festgeld/Tagesgeld</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {stats.totalDeposited.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Verteilt auf {deposits.length} Tranche{deposits.length !== 1 ? 'n' : ''}
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ø Gewichteter Zins</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.5rem' }}>
            {stats.averageInterestRatePercent.toFixed(2)}% p.a.
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Garantierte Verzinsung
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Jährlicher Zinsertrag</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.5rem' }}>
            +{stats.annualInterestIncome.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            ({(stats.annualInterestIncome / 12).toFixed(2)} € pro Monat)
          </div>
        </div>
      </div>

      {/* Ladder Overview / Timeline */}
      <div style={{ background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontWeight: '600' }}>
          Zinstreppe & Fälligkeitskalender
        </div>

        {deposits.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Layers size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>Noch keine Festgelder oder Tagesgeldkonten angelegt.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Bank & Institut</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Typ</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Anlagebetrag</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Zinssatz</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Fälligkeit</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status / Resttage</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingMaturities.map(d => {
                  const isExpiringSoon = d.daysRemaining >= 0 && d.daysRemaining <= 30;
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{d.bankName}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          background: d.depositType === 'FESTGELD' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                          color: d.depositType === 'FESTGELD' ? '#3b82f6' : '#10b981'
                        }}>
                          {d.depositType}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>
                        {d.principalEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: '600' }}>
                        {d.interestRatePercent.toFixed(2)}% p.a.
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{d.maturityDate}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {d.depositType === 'TAGESGELD' ? (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                            <CheckCircle2 size={14} /> Täglich verfügbar
                          </span>
                        ) : isExpiringSoon ? (
                          <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: '600' }}>
                            <AlertCircle size={14} /> Noch {d.daysRemaining} Tage (Bald fällig)
                          </span>
                        ) : d.daysRemaining < 0 ? (
                          <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>Fällig seit {Math.abs(d.daysRemaining)} Tagen</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Noch {d.daysRemaining} Tage</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setEditingDeposit({ ...d })}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', marginRight: '0.5rem' }}
                          title="Bearbeiten"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteDeposit(d.id)}
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

      {/* Modal to add deposit */}
      {showAddModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg, #1e293b)', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '460px',
            border: '1px solid var(--border-color)'
          }}>
            <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} /> Zinsanlage hinzufügen
            </h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bank / Plattform</label>
                <input
                  type="text"
                  placeholder="z.B. ING, Klarna, WeltSparen, Trade Republic"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Anlageform</label>
                <select
                  value={depositType}
                  onChange={e => setDepositType(e.target.value as any)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
                >
                  <option value="FESTGELD">Festgeld</option>
                  <option value="TAGESGELD">Tagesgeld (täglich fällig)</option>
                  <option value="SPARBRIEF">Sparbrief / Anleihe</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Anlagebetrag (€)</label>
                  <input
                    type="number"
                    value={principal}
                    onChange={e => setPrincipal(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zinssatz (% p.a.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={interestRate}
                    onChange={e => setInterestRate(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fälligkeitsdatum (DD.MM.YYYY)</label>
                <input
                  type="text"
                  value={maturityDate}
                  onChange={e => setMaturityDate(e.target.value)}
                  placeholder="31.12.2026"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
                />
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

      {/* Modal to edit deposit */}
      {editingDeposit && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg, #1e293b)', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '460px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} /> Zinsanlage bearbeiten
              </h3>
              <button
                type="button"
                onClick={() => setEditingDeposit(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bank / Plattform</label>
                <input
                  type="text"
                  value={editingDeposit.bankName}
                  onChange={e => setEditingDeposit({ ...editingDeposit, bankName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Anlageform</label>
                <select
                  value={editingDeposit.depositType}
                  onChange={e => setEditingDeposit({ ...editingDeposit, depositType: e.target.value as any })}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
                >
                  <option value="FESTGELD">Festgeld</option>
                  <option value="TAGESGELD">Tagesgeld (täglich fällig)</option>
                  <option value="SPARBRIEF">Sparbrief / Anleihe</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Anlagebetrag (€)</label>
                  <input
                    type="number"
                    value={editingDeposit.principalEur}
                    onChange={e => setEditingDeposit({ ...editingDeposit, principalEur: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zinssatz (% p.a.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingDeposit.interestRatePercent}
                    onChange={e => setEditingDeposit({ ...editingDeposit, interestRatePercent: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fälligkeitsdatum (DD.MM.YYYY)</label>
                <input
                  type="text"
                  value={editingDeposit.maturityDate}
                  onChange={e => setEditingDeposit({ ...editingDeposit, maturityDate: e.target.value })}
                  placeholder="31.12.2026"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingDeposit(null)}>
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
