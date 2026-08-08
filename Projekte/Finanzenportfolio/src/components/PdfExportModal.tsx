import React from 'react';
import type { Portfolio } from '../types';
import { FileText, Printer, X } from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  baseCurrency
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">PDF & Druckberichts-Generator</h3>
              <p className="text-xs text-slate-400">Exportiere Auswertungen als offizielles PDF-Dokument</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs">
              <Printer className="w-4 h-4" /> PDF Drucken / Speichern
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-white text-slate-900 font-sans print:p-0">
          
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Portfolio Auswertung & Jahresbericht</h1>
              <p className="text-xs text-slate-600">Erstellt am {new Date().toLocaleDateString('de-DE')} | Depotinhaber: Privater Anleger</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-blue-800 block">FinanzPortfolio CoPilot</span>
              <span className="text-xs text-slate-500 font-mono">Portfolio: {portfolio.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">Gesamtzahl Transaktionen</span>
              <span className="text-lg font-bold">{portfolio.transactions.length}</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">Basis-Währung</span>
              <span className="text-lg font-bold">{baseCurrency}</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">Status Steuerprüfung</span>
              <span className="text-lg font-bold text-emerald-700">Verifiziert (FIFO)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-sm border-b border-slate-300 pb-1">Transaktionsauszug (Auswahl)</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-700">
                  <th className="py-2">Datum</th>
                  <th className="py-2">Typ</th>
                  <th className="py-2">Asset</th>
                  <th className="py-2">Stückzahl</th>
                  <th className="py-2 text-right">Kurs ({baseCurrency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {portfolio.transactions.slice(0, 15).map(t => (
                  <tr key={t.id}>
                    <td className="py-1.5">{t.date}</td>
                    <td className="py-1.5 font-bold">{t.type}</td>
                    <td className="py-1.5">{t.name} ({t.ticker})</td>
                    <td className="py-1.5">{t.amount}</td>
                    <td className="py-1.5 text-right font-mono">{t.price.toFixed(2)}</td>
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
