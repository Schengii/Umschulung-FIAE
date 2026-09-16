import React, { useState } from 'react';
import type { Transaction, Holding, DepositLadderItem } from '../types';
import { Calendar, Download, Copy, Check, X, Bell, CheckCircle2, Building, DollarSign } from 'lucide-react';
import { downloadComprehensiveCalendar, generateComprehensiveIcalContent } from '../services/icalExporter';

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  holdings: Holding[];
  deposits?: DepositLadderItem[];
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  holdings,
  deposits = []
}) => {
  const [includePastDividends, setIncludePastDividends] = useState(true);
  const [includeForecastDividends, setIncludeForecastDividends] = useState(true);
  const [includeDepositMaturities, setIncludeDepositMaturities] = useState(true);
  const [monthsAhead, setMonthsAhead] = useState(12);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    downloadComprehensiveCalendar(transactions, holdings, deposits, {
      includePastDividends,
      includeForecastDividends,
      includeDepositMaturities,
      monthsAhead
    });
  };

  const handleCopyIcs = () => {
    const content = generateComprehensiveIcalContent(transactions, holdings, deposits, {
      includePastDividends,
      includeForecastDividends,
      includeDepositMaturities,
      monthsAhead
    });
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Preview counts
  const pastCount = includePastDividends ? transactions.filter(t => t.type === 'DIVIDEND').length : 0;
  const depositCount = includeDepositMaturities ? deposits.length : 0;
  const forecastHoldingsCount = includeForecastDividends ? holdings.filter(h => h.category !== 'Crypto' && h.yieldOnCost > 0).length : 0;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <div style={{
        background: 'var(--card-bg, #0f172a)', border: '1px solid var(--border-color)', borderRadius: '16px',
        maxWidth: '560px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: '8px' }}>
              <Calendar size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Finanz- & Dividendenkalender (.ics)</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Termine mit Apple Kalender, Google Kalender & Outlook synchronisieren
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Exportiere alle bevorstehenden Zahltage, Ex-Tage und Festgeldfälligkeiten als standardisierte Kalenderdatei, damit du keine Ausschüttung und keine Zinsfälligkeit mehr verpasst.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-color)' }}>Termin-Kategorien auswählen:</span>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={includeForecastDividends}
                onChange={e => setIncludeForecastDividends(e.target.checked)}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Bell size={15} color="#3b82f6" /> <strong>Zukünftige Dividenden-Zahltage</strong> ({forecastHoldingsCount} dividendenstarke Positionen)
              </span>
            </label>

            {includeForecastDividends && (
              <div style={{ marginLeft: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Vorschau-Zeitraum:</span>
                <select
                  value={monthsAhead}
                  onChange={e => setMonthsAhead(Number(e.target.value))}
                  style={{ background: 'var(--bg-main, #0b1120)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.5rem', color: 'var(--text-color)' }}
                >
                  <option value={3}>Nächste 3 Monate</option>
                  <option value={6}>Nächste 6 Monate</option>
                  <option value={12}>Nächste 12 Monate</option>
                </select>
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={includeDepositMaturities}
                onChange={e => setIncludeDepositMaturities(e.target.checked)}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={15} color="#f59e0b" /> <strong>Festgeld- & Zinstreppen-Fälligkeiten</strong> ({depositCount} Fälligkeiten)
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={includePastDividends}
                onChange={e => setIncludePastDividends(e.target.checked)}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={15} color="#10b981" /> <strong>Vergangene Dividenden-Buchungen</strong> ({pastCount} Buchungen)
              </span>
            </label>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: '600', color: '#60a5fa', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} /> Kompatibilität mit allen Kalendern
            </div>
            Die generierte <code>.ics</code> Datei lässt sich mit einem Doppelklick direkt in <strong>Apple Kalender</strong> (macOS / iOS), <strong>Google Calendar</strong> (Web / Android) und <strong>Microsoft Outlook</strong> importieren.
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleCopyIcs}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'iCal kopiert!' : 'ICS Text kopieren'}
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: '0.85rem' }}>
              Abbrechen
            </button>
            <button
              onClick={handleDownload}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Download size={15} /> Kalenderdatei herunterladen (.ics)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
