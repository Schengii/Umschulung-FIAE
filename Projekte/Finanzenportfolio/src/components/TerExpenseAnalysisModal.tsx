import React, { useState, useMemo } from 'react';
import type { Holding } from '../types';
import { PieChart, X, Sliders } from 'lucide-react';
import { calculateTerAnalysis } from '../utils/terUtils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TerExpenseAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  baseCurrency?: string;
}

export const TerExpenseAnalysisModal: React.FC<TerExpenseAnalysisModalProps> = ({
  isOpen,
  onClose,
  holdings,
  baseCurrency = 'EUR'
}) => {
  const [expectedGrossReturn, setExpectedGrossReturn] = useState<number>(7.0);
  const [activeFundTerBenchmark, setActiveFundTerBenchmark] = useState<number>(1.80);

  const analysis = useMemo(() => {
    return calculateTerAnalysis(holdings, {
      expectedGrossReturnPercent: expectedGrossReturn,
      benchmarkActiveFundTerPercent: activeFundTerBenchmark,
      projectionYears: 30
    });
  }, [holdings, expectedGrossReturn, activeFundTerBenchmark]);

  if (!isOpen) return null;

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
            <div style={{ padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '8px' }}>
              <PieChart size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>Fondskosten- & TER-Zinseszins-Analyse</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Total Expense Ratio (TER), laufende Fondskosten & Zinseszins-Verlust über Zeit
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ETF & Fondsvermögen</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.2rem' }}>
                {analysis.totalAnalyzedFundValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{analysis.funds.length} Positionen</span>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.05)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 'bold' }}>Gewichtete Gesamtkostenquote (TER)</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c084fc', marginTop: '0.2rem' }}>
                {analysis.weightedTerPercent.toFixed(2)}% <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>p.a.</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#c084fc' }}>
                {analysis.totalAnnualFeeEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} pro Jahr
              </span>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>Zinseszins-Verlust (30 Jahre)</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>
                -{analysis.thirtyYearCompoundLossEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                10 J: -{analysis.tenYearCompoundLossEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>Ersparnis vs. Bank-Fonds (1.8%)</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>
                +{analysis.potentialSavingVsActiveFundEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#10b981' }}>Über 30 Jahre Vermögensvorteil</span>
            </div>
          </div>

          {/* Simulation Settings */}
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <Sliders size={16} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)' }}>Erwartete Bruttorendite:</span>
              <input
                type="number"
                step="0.5"
                min="1"
                max="15"
                value={expectedGrossReturn}
                onChange={e => setExpectedGrossReturn(Number(e.target.value) || 0)}
                style={{ width: '60px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }}
              />
              <span>% p.a.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Vergleichs-Fonds (Bankfiliale) TER:</span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="4.0"
                value={activeFundTerBenchmark}
                onChange={e => setActiveFundTerBenchmark(Number(e.target.value) || 0)}
                style={{ width: '60px', padding: '0.2rem 0.4rem', fontSize: '0.8rem', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff' }}
              />
              <span>% p.a.</span>
            </div>
          </div>

          {/* Projection Chart */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                Vermögensentwicklung & Gebühreneinfluss über 30 Jahre
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Zinseszins-Simulation
              </span>
            </div>
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis.projection} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `J.${v}`} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k €`} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '0.75rem' }}
                    formatter={(val: any, name: any) => {
                      const v = Number(val) || 0;
                      const label = name === 'withoutFeesEur' ? 'Ohne Kosten (Brutto)' : name === 'withCurrentTerEur' ? `Mein ETF (${analysis.weightedTerPercent}%)` : `Aktiver Fonds (${activeFundTerBenchmark}%)`;
                      return [v.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency }), label];
                    }}
                  />
                  <Legend
                    formatter={(val) => {
                      if (val === 'withoutFeesEur') return 'Theoretisch ohne Kosten';
                      if (val === 'withCurrentTerEur') return `Mit aktuellem ETF-Portfolio (${analysis.weightedTerPercent}%)`;
                      return `Mit aktivem Filialbank-Fonds (${activeFundTerBenchmark}%)`;
                    }}
                  />
                  <Area type="monotone" dataKey="withoutFeesEur" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="withCurrentTerEur" stroke="#10b981" fill="rgba(16, 185, 129, 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="withActiveFundFeeEur" stroke="#ef4444" fill="rgba(239, 68, 68, 0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ETF Positions Breakdown Table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>ETF / Fonds</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Aktueller Wert</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Anteil Fonds</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>TER (% p.a.)</th>
                  <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Kosten p.a.</th>
                </tr>
              </thead>
              <tbody>
                {analysis.funds.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Keine ETF- oder Fonds-Positionen im Portfolio gefunden.
                    </td>
                  </tr>
                ) : (
                  analysis.funds.map(f => (
                    <tr key={f.ticker} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem 0.8rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{f.ticker}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.name}</div>
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>
                        {f.currentValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {f.portfolioSharePercent.toFixed(1)}%
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: '600' }}>
                        {f.terPercent.toFixed(2)}%
                      </td>
                      <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 'bold', color: '#c084fc' }}>
                        {f.annualCostEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
