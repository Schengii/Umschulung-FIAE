import React, { useState } from 'react';
import type { Portfolio, Holding } from '../types';
import { FileText, Printer, Copy, Check, Download, X } from 'lucide-react';

interface PdfFactsheetExporterProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  holdings: Holding[];
  baseCurrency?: string;
}

export const PdfFactsheetExporter: React.FC<PdfFactsheetExporterProps> = ({
  isOpen,
  onClose,
  portfolio,
  holdings,
  baseCurrency = 'EUR'
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const top5 = [...holdings].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);

  const handleCopyMarkdown = () => {
    const md = `# 📊 Portfolio-Factsheet: ${portfolio.name}
**Datum:** ${new Date().toLocaleDateString('de-DE')} | **Währung:** ${baseCurrency}

### Kennzahlen
- **Gesamtvermögen:** ${totalValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
- **Einstandswert:** ${totalCost.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
- **Rendite:** ${totalGain >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}% (${totalGain.toFixed(2)} €)
- **Positionen:** ${holdings.length}

### Top 5 Bestände
${top5.map((h, i) => `${i + 1}. **${h.name}** (${h.ticker}): ${h.currentValue.toFixed(2)} € (${((h.currentValue / totalValue) * 100).toFixed(1)}%)`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ['Name', 'Ticker', 'Kategorie', 'Anteile', 'Kaufkurs', 'Aktueller Kurs', 'Marktwert', 'Gewinn', 'Rendite %'],
      ...holdings.map(h => [
        `"${h.name}"`,
        h.ticker,
        h.category,
        h.shares.toString(),
        h.averageBuyPrice.toString(),
        h.currentPrice.toString(),
        h.currentValue.toString(),
        h.totalGain.toString(),
        h.totalGainPercent.toFixed(2)
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Factsheet_${portfolio.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(6px)', padding: '1rem'
    }}>
      <div style={{
        background: '#fff', color: '#0f172a', borderRadius: '16px',
        maxWidth: '800px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{ padding: '1rem 1.5rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={20} className="text-emerald-400" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Institutionelles Portfolio-Factsheet (Druckansicht)</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={handleCopyMarkdown}
              style={{ background: '#334155', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}
              title="Factsheet-Markdown in Zwischenablage kopieren"
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'Kopiert' : 'Markdown'}
            </button>
            <button
              onClick={handleDownloadCsv}
              style={{ background: '#334155', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}
              title="Factsheet-Bestände als CSV herunterladen"
            >
              <Download size={14} /> CSV
            </button>
            <button onClick={() => window.print()} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <Printer size={14} /> PDF Drucken
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Factsheet Document Layout (Printable A4 Style) */}
        <div style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
          {/* Title Header */}
          <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#3b82f6', letterSpacing: '1px', textTransform: 'uppercase' }}>Monatsbericht & Fondsprofil</span>
              <h1 style={{ margin: '0.2rem 0', fontSize: '1.6rem', color: '#0f172a', fontWeight: '800' }}>{portfolio.name}</h1>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Erstellt am: {new Date().toLocaleDateString('de-DE')} | Währung: {baseCurrency}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Gesamtvermögen</span>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>
                {totalValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Einstandswert</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.2rem' }}>
                {totalCost.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Gesamtrendite</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: totalGain >= 0 ? '#10b981' : '#ef4444', marginTop: '0.2rem' }}>
                {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Positionen</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginTop: '0.2rem' }}>
                {holdings.length} Assets
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Diversifikation</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3b82f6', marginTop: '0.2rem' }}>
                Sehr Gut
              </div>
            </div>
          </div>

          {/* Top 5 Holdings Table */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Top 5 Positionen & Gewichtung</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Asset</th>
                  <th style={{ padding: '0.5rem' }}>Ticker</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Marktwert</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Gewichtung</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Rendite</th>
                </tr>
              </thead>
              <tbody>
                {top5.map(h => (
                  <tr key={h.ticker} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{h.name}</td>
                    <td style={{ padding: '0.5rem', color: '#64748b' }}>{h.ticker}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                      {h.currentValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                      {totalValue > 0 ? ((h.currentValue / totalValue) * 100).toFixed(1) : 0}%
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: h.totalGain >= 0 ? '#10b981' : '#ef4444' }}>
                      {h.totalGain >= 0 ? '+' : ''}{h.totalGainPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
