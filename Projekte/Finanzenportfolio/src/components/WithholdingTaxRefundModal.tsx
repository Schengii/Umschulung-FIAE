import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import { Landmark, Printer, X, ShieldCheck } from 'lucide-react';
import { calculateWithholdingTaxRefunds } from './performanceUtils';

interface WithholdingTaxRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  baseCurrency?: string;
}

export const WithholdingTaxRefundModal: React.FC<WithholdingTaxRefundModalProps> = ({
  isOpen,
  onClose,
  transactions,
  baseCurrency = 'EUR'
}) => {
  const refundSummary = useMemo(() => {
    return calculateWithholdingTaxRefunds(transactions);
  }, [transactions]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '800px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
              <Landmark size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Ausländische Quellensteuer-Rückerstattung</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Rückforderung überhöhter Quellensteuern (Schweiz Form 82 I, Frankreich, Österreich)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => window.print()} className="btn btn-secondary" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Printer size={14} /> Drucken / PDF
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ausländische Bruttodividenden</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginTop: '0.2rem' }}>
                {refundSummary.totalGrossDividendsEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>Einbehaltene Quellensteuer</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>
                {refundSummary.totalWithheldTaxEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981' }}>Erstattungsfähiges Potenzial</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981', marginTop: '0.2rem' }}>
                +{refundSummary.totalReclaimableEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>
          </div>

          {/* Refund Countries Table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', fontWeight: 'bold', fontSize: '0.85rem' }}>
              Länderspezifische Rückforderungs-Übersicht & Formulare
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem' }}>Land</th>
                  <th style={{ padding: '0.6rem' }}>QSt-Satz / DBA</th>
                  <th style={{ padding: '0.6rem' }}>Benötigtes Steuerformular</th>
                  <th style={{ padding: '0.6rem', textAlign: 'right' }}>Erstattungsbetrag</th>
                </tr>
              </thead>
              <tbody>
                {refundSummary.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Keine ausländischen Dividenden mit erstattungsfähiger Quellensteuer erfasst.
                    </td>
                  </tr>
                ) : (
                  refundSummary.items.map(item => (
                    <tr key={item.countryCode} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 'bold' }}>
                        {item.country} ({item.countryCode})
                      </td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>
                        {item.domesticWithholdingTaxPct}% (DBA: {item.dbaCreditedTaxPct}%)
                      </td>
                      <td style={{ padding: '0.6rem', color: '#3b82f6' }}>
                        {item.formName}
                      </td>
                      <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 'bold', color: item.reclaimableRefundEur > 0 ? '#10b981' : 'var(--text-muted)' }}>
                        {item.reclaimableRefundEur > 0 ? `+${item.reclaimableRefundEur.toFixed(2)} €` : 'Voll angerechnet (0 €)'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Instructions Box */}
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '10px' }}>
            <span style={{ fontWeight: 'bold', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <ShieldCheck size={16} /> Anleitung zur Antragstellung
            </span>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.5' }}>
              <li><strong>Schweiz (Form 82 I):</strong> Reiche den Antrag digital bei der Eidgenössischen Steuerverwaltung (ESTV) mit den Tax Vouchern deiner Bank ein (Frist: 3 Jahre).</li>
              <li><strong>Frankreich (Form 5000):</strong> Bei Vorab-Befreiung über deine Depotbank reduziert sich der Einbehalt direkt auf 15%.</li>
              <li><strong>USA (W-8BEN):</strong> Die meisten Neo- und Direktbroker hinterlegen das W-8BEN automatisch, sodass maximal 15% US-Quellensteuer einbehalten und voll auf die deutsche Abgeltungsteuer angerechnet werden.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
