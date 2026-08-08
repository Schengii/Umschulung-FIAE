import React from 'react';
import type { Portfolio } from '../types';
import { calculateGermanTax, calculateVorabpauschale } from './performanceUtils';
import { FileText, Printer, X } from 'lucide-react';

interface TaxReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  taxExemptionLimit: number;
}

export const TaxReportModal: React.FC<TaxReportModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  taxExemptionLimit
}) => {
  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const taxResult = calculateGermanTax(portfolio.transactions, taxExemptionLimit);
  const vorabpauschale = calculateVorabpauschale(
    portfolio.transactions.map(t => ({
      ticker: t.ticker,
      name: t.name,
      category: t.category,
      shares: t.amount,
      averageBuyPrice: t.price,
      currentPrice: t.price,
      totalCost: t.amount * t.price,
      currentValue: t.amount * t.price,
      totalGain: 0,
      totalGainPercent: 0,
      portfolioWeight: 0,
      yieldOnCost: 0,
      teilfreistellungRate: 0.30
    })),
    0.0229
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:max-w-none">
        
        {/* Header (Hidden in Print) */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Steuerbescheinigungs-Report ({currentYear})</h3>
              <p className="text-xs text-slate-400">Übersicht für die deutsche Anlage KAP / KAP-INV</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" /> Drucken / PDF Export
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-8 flex-1 overflow-y-auto space-y-6 print:p-0 print:overflow-visible">
          
          {/* Printable Header */}
          <div className="border-b border-slate-800 pb-6 print:border-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black text-slate-100 print:text-black">Depot-Steuerbescheinigung</h1>
                <p className="text-xs text-slate-400 print:text-gray-600 mt-1">
                  Portfolio: <strong className="text-slate-200 print:text-black">{portfolio.name}</strong> • Steuerjahr: {currentYear}
                </p>
              </div>
              <div className="text-right text-xs text-slate-400 print:text-gray-600">
                <p>Erstellt am: {new Date().toLocaleDateString('de-DE')}</p>
                <p className="font-mono mt-0.5">Finanzenportfolio DE Steuer-Engine</p>
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl print:bg-gray-50 print:border-gray-300">
              <span className="text-xs text-slate-400 print:text-gray-600 font-semibold block">Realisierte Brutto-Gewinne (FIFO)</span>
              <span className="text-xl font-black text-slate-100 print:text-black mt-1 block">
                {taxResult.realizedGainsRaw.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
              <span className="text-[10px] text-slate-500 print:text-gray-500 mt-1 block">Vor Teilfreistellung & Haltefristen</span>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl print:bg-emerald-50 print:border-emerald-200">
              <span className="text-xs text-emerald-400 print:text-emerald-800 font-semibold block">Steuerpflichtiger Ertrag (Netto)</span>
              <span className="text-xl font-black text-emerald-300 print:text-emerald-900 mt-1 block">
                {taxResult.taxableGains.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
              <span className="text-[10px] text-emerald-400/70 print:text-emerald-700 mt-1 block">Nach ETF 30% Teilfreistellung & Krypto 1J Haltedauer</span>
            </div>
          </div>

          {/* Detailed Tax Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 print:text-black">Steuerliche Aufschlüsselung (§ 20 EStG & § 18 InvStG)</h4>
            
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 print:border-gray-300 print:bg-white">
              <div className="divide-y divide-slate-800/60 print:divide-gray-200 text-xs">
                <div className="p-3.5 flex justify-between items-center">
                  <span className="text-slate-300 print:text-black font-medium">Eingerichteter Freistellungsauftrag</span>
                  <span className="font-semibold text-slate-200 print:text-black">{taxExemptionLimit.toFixed(2)} €</span>
                </div>
                <div className="p-3.5 flex justify-between items-center">
                  <span className="text-slate-300 print:text-black font-medium">Verbrauchter Sparer-Pauschbetrag</span>
                  <span className="font-semibold text-emerald-400 print:text-emerald-700">
                    {Math.min(taxExemptionLimit, taxResult.taxableGains).toFixed(2)} €
                  </span>
                </div>
                <div className="p-3.5 flex justify-between items-center">
                  <span className="text-slate-300 print:text-black font-medium">Verbleibender Freistellungsauftrag</span>
                  <span className="font-semibold text-slate-200 print:text-black">{taxResult.taxExemptionRemaining.toFixed(2)} €</span>
                </div>
                <div className="p-3.5 flex justify-between items-center bg-slate-900/40 print:bg-gray-100">
                  <span className="text-slate-300 print:text-black font-semibold">Geschätzte Abgeltungsteuer (25% + Soli)</span>
                  <span className="font-bold text-amber-400 print:text-amber-900">
                    {taxResult.withholdingTaxEstimate.toFixed(2)} €
                  </span>
                </div>
                <div className="p-3.5 flex justify-between items-center">
                  <span className="text-slate-300 print:text-black font-medium">Vorabpauschale Schätzung (§ 18 InvStG)</span>
                  <span className="font-semibold text-blue-400 print:text-blue-800">{vorabpauschale.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed print:border-gray-300 print:text-gray-600">
            <strong>Hinweis:</strong> Dieser Report ist eine simulierte Steuerberechnung zur Orientierung für die Steuererklärung (Anlage KAP). Bei ausländischen Brokern ohne automatischen Abzug (z.B. Interactive Brokers, Revolut) müssen Kapitalerträge manuell in der Steuererklärung angegeben werden.
          </div>

        </div>

        {/* Footer (Hidden in Print) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end print:hidden">
          <button onClick={onClose} className="px-5 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors">
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
