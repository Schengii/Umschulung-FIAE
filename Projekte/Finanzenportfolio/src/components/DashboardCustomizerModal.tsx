import React from 'react';
import { Sliders, Eye, EyeOff, X } from 'lucide-react';

export interface DashboardWidgetConfig {
  id: string;
  name: string;
  category: 'ALL' | 'DIVIDENDS' | 'GROWTH' | 'SECURITY';
  isVisible: boolean;
}

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'health_audit', name: 'Depot-Gesundheitscheck (Health Audit)', category: 'SECURITY', isVisible: true },
  { id: 'heatmap', name: 'Performance-Treemap & Heatmap', category: 'ALL', isVisible: true },
  { id: 'benchmark', name: 'Benchmark-Vergleich (MSCI World, S&P 500, DAX)', category: 'GROWTH', isVisible: true },
  { id: 'rebalancing', name: 'Rebalancing-Auftragsplaner mit Toleranzbändern', category: 'ALL', isVisible: true },
  { id: 'dividend_growth_radar', name: 'Dividenden-Wachstums-Radar & 5J Cashflow-Prognose', category: 'DIVIDENDS', isVisible: true },
  { id: 'factor_exposure', name: 'Fama-French 5-Faktor Risiko-Zerlegung', category: 'GROWTH', isVisible: true },
  { id: 'ex_date_radar', name: 'Ex-Dividenden-Radar', category: 'DIVIDENDS', isVisible: true },
  { id: 'correlation', name: 'Asset-Korrelationsmatrix & Heatmap', category: 'SECURITY', isVisible: true },
  { id: 'dividend_safety', name: 'Dividenden-Sicherheits- & Aristokraten-Score', category: 'DIVIDENDS', isVisible: true },
  { id: 'crypto_staking', name: 'Krypto-Staking & DeFi Steuer-Tracker', category: 'GROWTH', isVisible: true },
  { id: 'drip', name: 'DRIP Dividenden-Zinseszins-Simulation', category: 'DIVIDENDS', isVisible: true },
  { id: 'fx_exposure', name: 'Währungsrisiko- & FX Exposure Matrix', category: 'SECURITY', isVisible: true },
  { id: 'fx_hedging', name: 'Multi-Währungs-Absicherung & FX Hedging Rechner', category: 'SECURITY', isVisible: true },
  { id: 'dividend_seasonality', name: 'Dividenden-Saisonalität & Cashflow-Heatmap', category: 'DIVIDENDS', isVisible: true },
  { id: 'bond_duration', name: 'Anleihen-Duration & Zinsänderungsrisiko', category: 'SECURITY', isVisible: true },
  { id: 'asset_class_chart', name: 'Performance-Vergleich nach Assetklassen', category: 'GROWTH', isVisible: true },
  { id: 'performance_attr', name: 'Performance-Attribution (Asset- vs. FX-Gewinne)', category: 'ALL', isVisible: true },
  { id: 'allocation_radar', name: 'Soll- vs. Ist-Allokation Radar', category: 'ALL', isVisible: true },
  { id: 'fire_freedom', name: 'FIRE Entnahme-Studio & Monte Carlo', category: 'ALL', isVisible: true }
];

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidgetConfig[];
  onToggleWidget: (id: string) => void;
  onApplyPreset: (preset: 'ALL' | 'DIVIDENDS' | 'GROWTH' | 'SECURITY') => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onApplyPreset
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '600px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '8px' }}>
              <Sliders size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Dashboard-Widget Customizer</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Passe dein Dashboard an deinen persönlichen Investment-Fokus an</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Presets */}
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>1-Klick Fokus-Voreinstellungen:</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => onApplyPreset('ALL')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                🌟 Alle Widgets (Komplett)
              </button>
              <button onClick={() => onApplyPreset('DIVIDENDS')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                💰 Dividenden-Fokus
              </button>
              <button onClick={() => onApplyPreset('GROWTH')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                🚀 Tech & Growth Fokus
              </button>
              <button onClick={() => onApplyPreset('SECURITY')} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                🛡️ Allwetter & Risikofokus
              </button>
            </div>
          </div>

          {/* Widgets List */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            {widgets.map((w) => (
              <div
                key={w.id}
                onClick={() => onToggleWidget(w.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 1rem',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: w.isVisible ? 'rgba(255,255,255,0.02)' : 'transparent',
                  opacity: w.isVisible ? 1 : 0.5
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {w.isVisible ? <Eye size={16} color="#10b981" /> : <EyeOff size={16} color="#64748b" />}
                  <span style={{ fontSize: '0.85rem', fontWeight: w.isVisible ? '600' : 'normal' }}>{w.name}</span>
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  background: w.isVisible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: w.isVisible ? '#10b981' : 'var(--text-muted)'
                }}>
                  {w.isVisible ? 'Aktiv' : 'Ausgeblendet'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Übernehmen
          </button>
        </div>
      </div>
    </div>
  );
};
