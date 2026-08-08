import React, { useState } from 'react';
import { parseUniversalCsv, type UniversalCsvImportResult } from '../services/universalCsvImporter';
import type { Transaction } from '../types';
import { FileSpreadsheet, X, CheckCircle2, Upload } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTransactions: (txs: Transaction[]) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportTransactions
}) => {
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [parseResult, setParseResult] = useState<UniversalCsvImportResult | null>(null);

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
              <h3 className="text-lg font-bold">Universal CSV Auto-Detector Importer</h3>
              <p className="text-xs text-slate-400">Automatische Erkennung von Portfolio Performance, Parqet & Broker-CSV</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs">
          
          {/* File Upload Zone */}
          <div 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv,text/csv';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files?.[0]) handleFileUpload(files[0]);
              };
              input.click();
            }}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-950/50 rounded-xl p-6 text-center cursor-pointer transition-all"
          >
            <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <span className="font-semibold text-slate-200 block">Klicke hier zum Hochladen einer CSV-Datei</span>
            <span className="text-slate-500 text-[11px] block mt-1">Oder füge den CSV-Inhalt unten direkt ein</span>
          </div>

          {/* Text Area fallback */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold block">CSV-Text einfügen:</label>
            <textarea
              value={csvRawText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="Datum;Typ;Wertpapiername;ISIN/Ticker;Stückzahl;Kurs..."
              className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Parse Result Summary */}
          {parseResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300">Format erkannt: {parseResult.detectedFormat}</span>
                </div>
                <span className="font-bold text-slate-200">{parseResult.transactions.length} Transaktionen bereit</span>
              </div>

              {parseResult.transactions.length > 0 && (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
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

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200">
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!parseResult || parseResult.transactions.length === 0}
            className="px-5 py-2 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg disabled:opacity-50 transition-all"
          >
            {parseResult?.transactions.length || 0} Transaktionen importieren
          </button>
        </div>

      </div>
    </div>
  );
};
