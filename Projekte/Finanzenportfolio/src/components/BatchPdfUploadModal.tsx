import React, { useState } from 'react';
import { parseBrokerPdf, type ParsedTransaction } from './PdfParser';
import type { AssetMappingRule, Transaction } from '../types';
import { Upload, X, CheckCircle, AlertCircle, FileText, Trash2 } from 'lucide-react';

interface BatchPdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBatch: (transactions: Transaction[]) => void;
  mappingRules: AssetMappingRule[];
}

export const BatchPdfUploadModal: React.FC<BatchPdfUploadModalProps> = ({
  isOpen,
  onClose,
  onImportBatch,
  mappingRules
}) => {
  const [parsedList, setParsedList] = useState<{ file: File; tx: ParsedTransaction; status: 'ok' | 'error' }[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFilesChosen = async (files: FileList | File[]) => {
    setLoading(true);
    const newItems: { file: File; tx: ParsedTransaction; status: 'ok' | 'error' }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          const parsed = await parseBrokerPdf(file, mappingRules);
          newItems.push({ file, tx: parsed, status: 'ok' });
        } catch (e) {
          console.error(e);
          newItems.push({
            file,
            tx: {
              type: 'BUY',
              date: new Date().toISOString().split('T')[0],
              ticker: 'FEHLER',
              name: file.name,
              amount: 1,
              price: 0,
              fee: 0,
              tax: 0,
              category: 'Stock'
            },
            status: 'error'
          });
        }
      }
    }

    setParsedList(prev => [...prev, ...newItems]);
    setLoading(false);
  };

  const handleRemove = (index: number) => {
    setParsedList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    const validTxs: Transaction[] = parsedList
      .filter(item => item.status === 'ok' && item.tx.ticker !== 'FEHLER')
      .map((item, idx) => ({
        id: `batch-${Date.now()}-${idx}`,
        type: item.tx.type,
        date: item.tx.date,
        ticker: item.tx.ticker,
        name: item.tx.name,
        amount: item.tx.amount,
        price: item.tx.price,
        fee: item.tx.fee,
        tax: item.tx.tax,
        category: item.tx.category,
        currency: 'EUR',
        exchangeRate: 1.0
      }));

    if (validTxs.length > 0) {
      onImportBatch(validTxs);
      setParsedList([]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Stapel-PDF Upload (Batch Import)</h3>
              <p className="text-xs text-slate-400">Lade mehrere Bankdokumente gleichzeitig hoch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Dropzone */}
          <div 
            className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 bg-slate-950/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'application/pdf';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) handleFilesChosen(files);
              };
              input.click();
            }}
          >
            <FileText className="w-10 h-10 mx-auto text-slate-500 group-hover:text-blue-400 transition-colors mb-3" />
            <p className="text-sm font-medium text-slate-200">Klicke hier oder ziehe mehrere PDF-Abrechnungen hinein</p>
            <p className="text-xs text-slate-500 mt-1">Unterstützt Trade Republic, Scalable, ING, comdirect, DKB, Consors, Finanzen.net ZERO</p>
          </div>

          {loading && (
            <div className="py-4 text-center text-sm text-blue-400 animate-pulse">
              PDF-Dateien werden verarbeitet...
            </div>
          )}

          {/* Table */}
          {parsedList.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Erkannte Buchungen ({parsedList.length})</span>
                <button onClick={() => setParsedList([])} className="hover:text-red-400">Alle löschen</button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-3">Status</th>
                      <th className="p-3">Typ</th>
                      <th className="p-3">Datum</th>
                      <th className="p-3">Asset / Ticker</th>
                      <th className="p-3">Menge</th>
                      <th className="p-3">Preis</th>
                      <th className="p-3 text-right">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {parsedList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3">
                          {item.status === 'ok' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                              <CheckCircle className="w-3 h-3" /> OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-medium">
                              <AlertCircle className="w-3 h-3" /> Fehler
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold">{item.tx.type}</td>
                        <td className="p-3 text-slate-400">{item.tx.date}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{item.tx.name}</div>
                          <div className="text-[10px] text-slate-500">{item.tx.ticker} • {item.tx.category}</div>
                        </td>
                        <td className="p-3 font-medium">{item.tx.amount}</td>
                        <td className="p-3 font-medium">{item.tx.price.toFixed(2)} €</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleRemove(idx)} 
                            className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Abbrechen
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={parsedList.length === 0 || parsedList.every(i => i.status !== 'ok')}
            className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {parsedList.filter(i => i.status === 'ok').length} Buchungen einbuchen
          </button>
        </div>

      </div>
    </div>
  );
};
