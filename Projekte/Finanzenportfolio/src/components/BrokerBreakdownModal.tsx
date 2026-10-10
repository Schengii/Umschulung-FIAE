import React, { useMemo } from 'react';
import { Landmark, X, TrendingUp, TrendingDown, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { Holding, Transaction } from '../types';
import { calculateBrokerBreakdown } from '../utils/brokerUtils';

interface BrokerBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  transactions: Transaction[];
  baseCurrency?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316'];

export const BrokerBreakdownModal: React.FC<BrokerBreakdownModalProps> = ({
  isOpen,
  onClose,
  holdings,
  transactions,
  baseCurrency = 'EUR'
}) => {
  const brokerStats = useMemo(() => {
    return calculateBrokerBreakdown(holdings, transactions);
  }, [holdings, transactions]);

  const totalPortfolioValue = useMemo(() => {
    return brokerStats.reduce((sum, b) => sum + b.totalMarketValueEur, 0);
  }, [brokerStats]);

  const totalDividends = useMemo(() => {
    return brokerStats.reduce((sum, b) => sum + b.totalDividendsEur, 0);
  }, [brokerStats]);

  const totalFees = useMemo(() => {
    return brokerStats.reduce((sum, b) => sum + b.totalFeesEur, 0);
  }, [brokerStats]);

  if (!isOpen) return null;

  const pieData = brokerStats.map(b => ({
    name: b.brokerName,
    value: b.totalMarketValueEur
  }));

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '920px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: '12px' }}>
              <Landmark size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Multi-Broker Depot-Mapping & Vergleich
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Übersicht deiner Bestände, Renditen, Gebühren und Ausschüttungen aufgeschlüsselt nach Brokern
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Erfasste Broker / Depots</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '0.2rem', color: 'var(--text-color)' }}>
                {brokerStats.length}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gesamtwert aller Depots</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '0.2rem', color: '#3b82f6' }}>
                {totalPortfolioValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Erhaltene Dividenden</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '0.2rem', color: '#10b981' }}>
                {totalDividends.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bezahlte Ordergebühren</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '0.2rem', color: '#ef4444' }}>
                {totalFees.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>
          </div>

          {/* Allocation Pie Chart */}
          {brokerStats.length > 1 && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '14px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieIcon size={16} color="#3b82f6" /> Depotvolumen-Verteilung nach Brokern
              </div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      paddingAngle={3}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        `${Number(val).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}`,
                        'Depotwert'
                      ]}
                      contentStyle={{ background: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Broker Details Table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem' }}>Broker / Depot</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Positionen</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Depotwert</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Investiert</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Gewinn / Verlust</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Anteil</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Gebühren</th>
                </tr>
              </thead>
              <tbody>
                {brokerStats.map((broker, idx) => {
                  const isPositive = broker.totalGainEur >= 0;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }} />
                          {broker.brokerName}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {broker.holdingsCount} Assets ({broker.transactionsCount} Trades)
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 'bold' }}>
                        {broker.totalMarketValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        {broker.totalInvestedEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          <span>{broker.totalGainEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({broker.totalGainPercent.toFixed(1)}%)</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '50px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${broker.shareOfPortfolioPercent}%`, height: '100%', background: COLORS[idx % COLORS.length] }} />
                          </div>
                          <span>{broker.shareOfPortfolioPercent}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#ef4444' }}>
                        {broker.totalFeesEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
