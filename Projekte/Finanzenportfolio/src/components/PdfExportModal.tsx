import React, { useState, useMemo } from 'react';
import type { Portfolio, Holding } from '../types';
import { FileText, Printer, X, Calendar, Sliders } from 'lucide-react';
import { generateKapTaxCertificateData } from '../services/kapTaxExporter';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  holdings?: Holding[];
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  baseCurrency,
  holdings = []
}) => {
  const [reportType, setReportType] = useState<'STANDARD' | 'TAX_KAP'>('STANDARD');
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear());
  const [taxAllowance, setTaxAllowance] = useState<number>(1000);

  const kapData = useMemo(() => {
    return generateKapTaxCertificateData(portfolio, holdings, taxYear, taxAllowance);
  }, [portfolio, holdings, taxYear, taxAllowance]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">PDF & Steuerbeleg-Generator</h3>
              <p className="text-xs text-slate-400">Exportiere druckfertige Jahres- und Steuerberichte für das Finanzamt</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Report Type Selector */}
            <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setReportType('STANDARD')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  reportType === 'STANDARD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Standard Jahresbericht
              </button>
              <button
                type="button"
                onClick={() => setReportType('TAX_KAP')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  reportType === 'TAX_KAP' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Steuerbeleg Anlage KAP
              </button>
            </div>

            {reportType === 'TAX_KAP' && (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={taxYear}
                  onChange={(e) => setTaxYear(Number(e.target.value))}
                  className="bg-transparent text-slate-200 border-none outline-none font-semibold cursor-pointer"
                >
                  <option value={new Date().getFullYear()} className="bg-slate-900">{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() - 1} className="bg-slate-900">{new Date().getFullYear() - 1}</option>
                  <option value={new Date().getFullYear() - 2} className="bg-slate-900">{new Date().getFullYear() - 2}</option>
                </select>

                <div className="h-4 w-px bg-slate-700 mx-1" />

                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={taxAllowance}
                  onChange={(e) => setTaxAllowance(Number(e.target.value))}
                  className="bg-transparent text-slate-200 border-none outline-none font-semibold cursor-pointer"
                >
                  <option value={1000} className="bg-slate-900">1.000 € (Single)</option>
                  <option value={2000} className="bg-slate-900">2.000 € (Paar)</option>
                  <option value={0} className="bg-slate-900">0 € (ausgeschöpft)</option>
                </select>
              </div>
            )}

            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs">
              <Printer className="w-4 h-4" /> Drucken / PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-white text-slate-900 font-sans print:p-0">
          
          {reportType === 'STANDARD' ? (
            <>
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
            </>
          ) : (
            /* ANLAGE KAP TAX CERTIFICATE */
            <>
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">Amtliche Kennziffern</span>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Steuerbescheinigung & Anlage KAP</h1>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Steuerjahr {kapData.taxYear} | Ausgestellt am {kapData.reportDate} zur Vorlage beim Finanzamt / Steuerberater
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 block">Einkommensteuererklärung</span>
                  <span className="text-xs text-slate-500 font-mono">EStG § 20 & § 32d • {portfolio.name}</span>
                </div>
              </div>

              {/* Official Table for Tax Filing */}
              <div className="space-y-3 text-xs">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-1 flex items-center justify-between">
                  <span>1. Aufstellung der Einkünfte aus Kapitalvermögen (Anlage KAP)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Alle Beträge in {baseCurrency}</span>
                </h3>

                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-semibold">
                        <th className="py-2 px-3">Zeile Anlage KAP</th>
                        <th className="py-2 px-3">Steuerlicher Tatbestand</th>
                        <th className="py-2 px-3 text-right">Steuerpflichtiger Betrag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-blue-800">Zeile 7</td>
                        <td className="py-2 px-3">Inländische Kapitalerträge gesamt (Dividenden, Zinsen & Kursgewinne)</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">{kapData.summary.totalTaxableGainsEur.toFixed(2)} €</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-blue-800">Zeile 8</td>
                        <td className="py-2 px-3">Darin enthaltene Gewinne aus Aktienveräußerungen gem. § 20 Abs. 2 Satz 1 Nr. 1 EStG</td>
                        <td className="py-2 px-3 text-right font-mono">{kapData.summary.realizedStockGainsEur.toFixed(2)} €</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-blue-800">Zeile 14</td>
                        <td className="py-2 px-3">Verluste ohne Aktienverkäufe (ETFs, Derivate, Zinsen)</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700">{kapData.summary.realizedOtherLossesEur.toFixed(2)} €</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-blue-800">Zeile 15</td>
                        <td className="py-2 px-3">Verluste aus der Veräußerung von Aktien (separater Verlusttopf)</td>
                        <td className="py-2 px-3 text-right font-mono text-red-600">{kapData.summary.realizedStockLossesEur.toFixed(2)} €</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-blue-800">Zeile 16/17</td>
                        <td className="py-2 px-3">In Anspruch genommener Sparer-Pauschbetrag</td>
                        <td className="py-2 px-3 text-right font-mono">{kapData.summary.usedTaxAllowanceEur.toFixed(2)} €</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-800">Zeile 41</td>
                        <td className="py-2 px-3">Anrechenbare ausländische Quellensteuer (nach DBA)</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">{kapData.foreignWithholdingTax.creditedForeignTaxEur.toFixed(2)} €</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loss Pool & Summary Cards */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg">
                  <span className="text-slate-600 block font-medium">Verlustvortrag Aktien</span>
                  <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
                    {kapData.lossPoolsCarryForward.stockLossPoolRemainingEur.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-slate-500">Für Folgejahre gesichert</span>
                </div>
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg">
                  <span className="text-slate-600 block font-medium">Verlustvortrag Sonstiges</span>
                  <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
                    {kapData.lossPoolsCarryForward.generalLossPoolRemainingEur.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-slate-500">ETFs, Zinsen & Derivate</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-emerald-800 block font-bold">Geschätzte Steuerlast (KapESt + Soli)</span>
                  <span className="text-base font-black text-emerald-900 mt-1 block font-mono">
                    {kapData.summary.totalTaxLiabilityEur.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-emerald-700">Vor etwaiger Günstigerprüfung</span>
                </div>
              </div>

              {/* Transactions Evidence Excerpt */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-1">
                  2. Einzelbelege & Transaktionsnachweis ({kapData.transactionsBreakdown.length} Buchungen im Steuerjahr)
                </h3>
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-slate-100 sticky top-0 border-b">
                      <tr>
                        <th className="py-1 px-2">Datum</th>
                        <th className="py-1 px-2">Ticker</th>
                        <th className="py-1 px-2">Wertpapier / Ertrag</th>
                        <th className="py-1 px-2">Typ</th>
                        <th className="py-1 px-2 text-right">Ertrag/Gewinn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {kapData.transactionsBreakdown.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1 px-2 font-mono">{item.date}</td>
                          <td className="py-1 px-2 font-mono">{item.ticker}</td>
                          <td className="py-1 px-2">{item.name}</td>
                          <td className="py-1 px-2 font-semibold">{item.type}</td>
                          <td className="py-1 px-2 text-right font-mono font-bold">
                            {item.gainOrIncomeEur.toFixed(2)} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
