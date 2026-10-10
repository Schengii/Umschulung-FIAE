import React, { useState } from 'react';
import { parseUniversalCsv, type UniversalCsvImportResult } from '../services/universalCsvImporter';
import { downloadParqetJsonFile, downloadPortfolioPerformanceCsvFile } from '../services/parqetPpExportService';
import type { Transaction, Holding } from '../types';
import { FileSpreadsheet, X, CheckCircle2, Upload, Download } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (txs: Transaction[]) => void;
  currentTransactions?: Transaction[];
  currentHoldings?: Holding[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportTransactions,
  currentTransactions = [],
  currentHoldings = []
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [parseResult, setParseResult] = useState<UniversalCsvImportResult | null>(null);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setCsvRawText(text);
    if (text.trim()) {
      const res = parseUniversalCsv(text);
      setParseResult(res);
    } else {
      setParseResult(null);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    if (parseResult && parseResult.transactions.length > 0) {
      onImportTransactions(parseResult.transactions);
      onClose();
    }
  };

  const handleExportParqet = () => {
    downloadParqetJsonFile(currentTransactions, currentHoldings, `parqet_export_${new Date().toISOString().slice(0, 10)}.json`);
    setExportSuccessMsg('Parqet JSON Export erfolgreich gestartet!');
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  const handleExportPortfolioPerformance = () => {
    downloadPortfolioPerformanceCsvFile(currentTransactions, `portfolio_performance_${new Date().toISOString().slice(0, 10)}.csv`);
    setExportSuccessMsg('Portfolio Performance CSV Export erfolgreich gestartet!');
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Universal CSV & Parqet / Portfolio Performance Hub</h3>
              <p className="text-xs text-slate-400">Automatischer Import & nativer Export für Parqet, Portfolio Performance & Neobroker</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'import' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Import
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('export')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${activeTab === 'export' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Export (Parqet / PP)
              </button>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
          
          {activeTab === 'import' ? (
            <>
              {/* File Upload Zone */}
              <div 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv,text/csv,.json,application/json';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files?.[0]) handleFileUpload(files[0]);
                  };
                  input.click();
                }}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/50 rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <span className="font-semibold text-slate-200 block">Klicke hier zum Hochladen einer CSV- oder JSON-Datei</span>
                <span className="text-slate-500 text-[11px] block mt-1">Unterstützt Portfolio Performance, Parqet JSON/CSV, Ghostfolio & Broker</span>
              </div>

              {/* Text Area fallback */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">Oder CSV/JSON Text direkt einfügen:</label>
                <textarea
                  value={csvRawText}
                  onChange={(e) => handleParse(e.target.value)}
                  placeholder="Datum;Typ;Wertpapiername;ISIN/Ticker;Stückzahl;Kurs... oder JSON Aktivitäten"
                  className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Parse Preview Status */}
              {parseResult && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Erkanntes Format: <strong>{parseResult.detectedFormat}</strong></span>
                    </div>
                    <span className="font-bold">{parseResult.transactions.length} Buchungen gefunden</span>
                  </div>

                  {parseResult.transactions.length > 0 && (
                    <div className="border border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">Typ</th>
                            <th className="p-2.5">Datum</th>
                            <th className="p-2.5">Asset</th>
                            <th className="p-2.5">Ticker</th>
                            <th className="p-2.5">Stück</th>
                            <th className="p-2.5 text-right">Kurs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {parseResult.transactions.slice(0, 10).map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-900/50">
                              <td className="p-2.5 font-bold text-emerald-400">{tx.type}</td>
                              <td className="p-2.5 text-slate-400">{tx.date}</td>
                              <td className="p-2.5 font-medium text-slate-200">{tx.name}</td>
                              <td className="p-2.5 font-mono text-slate-400">{tx.ticker}</td>
                              <td className="p-2.5">{tx.amount}</td>
                              <td className="p-2.5 text-right font-medium">{tx.price.toFixed(2)} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parseResult.transactions.length > 10 && (
                        <p className="p-2 text-center text-[10px] text-slate-500 bg-slate-900/60">
                          ...und {parseResult.transactions.length - 10} weitere Transaktionen
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <div className="font-bold text-sm text-slate-200">Exportiere dein Portfolio für externe Analysetools</div>
                <p className="text-slate-400 leading-relaxed">
                  Übertrage deine Bestände und Transaktionshistorie mit 1 Klick in standardisierte Austauschformate.
                  Keine manuellen Neueingaben in Parqet oder Portfolio Performance nötig.
                </p>
                <div className="text-[11px] text-slate-500 pt-1">
                  Aktuelles Portfolio enthält <strong>{currentTransactions.length} Transaktionen</strong> und <strong>{currentHoldings.length} Positionen</strong>.
                </div>
              </div>

              {exportSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{exportSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/40 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-200">Parqet JSON Export</span>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-mono">.json</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                      Erzeugt ein voll kompatibles Parqet Activity-JSON inklusive Asset-Metadaten, Kursen, Gebühren und Steuern.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportParqet}
                    disabled={currentTransactions.length === 0}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Download className="w-4 h-4" /> Parqet JSON herunterladen
                  </button>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-200">Portfolio Performance CSV</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono">.csv</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                      Erzeugt eine Standard-Buchungs-CSV mit deutscher Formatierung (Semikolon-getrennt, Komma-Dezimal) für PP.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportPortfolioPerformance}
                    disabled={currentTransactions.length === 0}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Download className="w-4 h-4" /> PP CSV herunterladen
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200">
            Schließen
          </button>
          {activeTab === 'import' && (
            <button
              onClick={handleSave}
              disabled={!parseResult || parseResult.transactions.length === 0}
              className="px-5 py-2 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg disabled:opacity-50 transition-all"
            >
              {parseResult?.transactions.length || 0} Transaktionen importieren
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
