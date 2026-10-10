import React, { useState } from 'react';
import { FileSpreadsheet, Download, Check, X } from 'lucide-react';
import type { Portfolio, PortfolioStats, Holding, Transaction, DepositLadderItem } from '../types';
import type { DachTaxResult } from './performanceUtils';
import { exportPortfolioToExcel } from '../utils/exportUtils';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  stats?: PortfolioStats;
  holdings: Holding[];
  transactions: Transaction[];
  depositLadder?: DepositLadderItem[];
  taxResult?: DachTaxResult;
  baseCurrency?: string;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  stats,
  holdings,
  transactions,
  depositLadder = [],
  taxResult,
  baseCurrency = 'EUR'
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    try {
      exportPortfolioToExcel({
        portfolio,
        stats,
        holdings,
        transactions,
        depositLadder,
        taxResult,
        baseCurrency
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Excel export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const sheetsInfo = [
    { title: '1. Portfolio-Übersicht', desc: 'Gesamtwert, TTWRR, IRR, Sharpe Ratio, Max Drawdown, KPIs', count: '15 Kennzahlen' },
    { title: '2. Bestände (Holdings)', desc: 'Alle Positionen inkl. Stückzahl, Kaufkurs, Marktwert, GuV, Rendite', count: `${holdings.length} Assets` },
    { title: '3. Transaktionen', desc: 'Vollständige Orderhistorie mit Typ, Kurs, Gebühren, Steuern und Broker', count: `${transactions.length} Buchungen` },
    { title: '4. Dividenden-Historie', desc: 'Detaillierte Ausschüttungen inkl. Brutto, Steuer und Nettoertrag', count: `${transactions.filter(t => t.type === 'DIVIDEND').length} Dividenden` },
    { title: '5. Zinstreppe & Festgelder', desc: 'Termingelder, Zinssätze, Fälligkeitstermine und Einlagensicherungs-Status', count: `${depositLadder.length} Einträge` },
    { title: '6. DACH Steuer-Report', desc: 'Realisierte Gewinne, Freibetrag, fällige Steuer & länderspezifische Regeln', count: taxResult ? taxResult.countryName : 'Standard' }
  ];

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '720px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '12px' }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>
                Excel Multi-Sheet Export (.xlsx)
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Erzeuge eine strukturierte Microsoft Excel Arbeitsmappe mit 6 getrennten Tabellenblättern
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ fontSize: '0.85rem', color: 'var(--text-color)' }}>
            Folgende Tabellenblätter werden in deiner Excel-Datei automatisch formatiert und zusammengeführt:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {sheetsInfo.map((sheet, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#10b981' }}>
                    {sheet.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {sheet.desc}
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>
                  {sheet.count}
                </span>
              </div>
            ))}
          </div>

          {downloadSuccess && (
            <div style={{
              padding: '0.85rem 1rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: '10px',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <Check size={18} /> Excel-Arbeitsmappe wurde erfolgreich generiert und heruntergeladen!
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            100% Client-Side • Keine Übertragung an externe Server
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Abbrechen
            </button>
            <button
              className="btn btn-primary"
              onClick={handleExport}
              disabled={isExporting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', borderColor: '#10b981' }}
            >
              <Download size={16} /> {isExporting ? 'Generiere Excel...' : 'Excel (.xlsx) jetzt herunterladen'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
