import React, { useState, useEffect } from 'react';
import type { Holding, Transaction } from '../types';
import { X, FileText, ShieldCheck } from 'lucide-react';
import { calculateFXGainBreakdown } from './performanceUtils';

interface HoldingDetailModalProps {
  holding: Holding | null;
  transactions: Transaction[];
  onClose: () => void;
  onUpdateNotes?: (ticker: string, notes: string) => void;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const HoldingDetailModal: React.FC<HoldingDetailModalProps> = ({
  holding,
  transactions,
  onClose,
  onUpdateNotes,
  baseCurrency
}) => {
  const [notesText, setNotesText] = useState(holding?.notes || '');

  useEffect(() => {
    if (holding) {
      setNotesText(holding.notes || '');
    }
  }, [holding]);

  if (!holding) return null;

  const assetTxs = transactions.filter(t => t.ticker === holding.ticker);
  const buySells = assetTxs.filter(t => t.type === 'BUY' || t.type === 'SELL').sort((a, b) => new Date(b.date.split('.').reverse().join('-')).getTime() - new Date(a.date.split('.').reverse().join('-')).getTime());
  const divTxs = assetTxs.filter(t => t.type === 'DIVIDEND').sort((a, b) => new Date(b.date.split('.').reverse().join('-')).getTime() - new Date(a.date.split('.').reverse().join('-')).getTime());

  const totalDivReceived = divTxs.reduce((sum, t) => sum + (t.amount * t.price - t.tax) / (t.exchangeRate || 1), 0);
  const fxBreakdown = calculateFXGainBreakdown(transactions, holding.ticker, holding.currentPrice, 1.0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{holding.name}</h2>
              <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg font-mono font-semibold">
                {holding.ticker}
              </span>
              <span className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-medium">
                {holding.category}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span>Sektor: <strong className="text-slate-200">{holding.sector || 'Allgemein'}</strong></span>
              <span>Region: <strong className="text-slate-200">{holding.region || 'Global'}</strong></span>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 block">Positionswert</span>
              <span className="text-base font-bold text-slate-100 mt-1 block">
                {holding.currentValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 block">Gesamtkaufwert</span>
              <span className="text-base font-bold text-slate-300 mt-1 block">
                {holding.totalCost.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 block">Gewinn / Verlust</span>
              <span className={`text-base font-bold mt-1 block ${holding.totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {holding.totalGain >= 0 ? '+' : ''}{holding.totalGain.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })} ({holding.totalGainPercent.toFixed(2)}%)
              </span>
            </div>
            <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400 block">Erhaltene Div.</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {totalDivReceived.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
            </div>
          </div>

          {/* Crypto Holding Period status */}
          {holding.category === 'Crypto' && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-300">Steuerfreie Krypto-Haltefrist (DE)</h4>
                  <p className="text-xs text-amber-200/70">Gewinne nach 1 Jahr Haltedauer sind in DE komplett steuerfrei</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-400 block">
                  {holding.cryptoTaxFreeShares || 0} / {holding.shares} Units
                </span>
                <span className="text-[10px] text-amber-300">Steuerfrei veräußerbar</span>
              </div>
            </div>
          )}

          {/* Asset vs FX Gain breakdown */}
          <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Performancedekompensation</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-400">Reiner Kursgewinn:</span>
                <span className={`font-semibold ${fxBreakdown.assetGainEur >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fxBreakdown.assetGainEur.toFixed(2)} €
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-400">Währungsgewinn (FX):</span>
                <span className={`font-semibold ${fxBreakdown.fxGainEur >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fxBreakdown.fxGainEur.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Transaktionshistorie ({buySells.length})</h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Typ</th>
                    <th className="p-3">Datum</th>
                    <th className="p-3">Stück</th>
                    <th className="p-3">Preis</th>
                    <th className="p-3 text-right">Gesamtwert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {buySells.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/50">
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{tx.date}</td>
                      <td className="p-3 font-medium">{tx.amount}</td>
                      <td className="p-3 font-medium">{tx.price.toFixed(2)} €</td>
                      <td className="p-3 text-right font-semibold">{(tx.amount * tx.price).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Personal Notes */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Notizen & Strategie für dieses Asset
            </label>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Notiere Kaufgründe, Kurs-Ziele oder Notizen..."
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200">
            Schließen
          </button>
          <button 
            onClick={() => {
              if (onUpdateNotes) onUpdateNotes(holding.ticker, notesText);
              onClose();
            }}
            className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all"
          >
            Notizen Speichern
          </button>
        </div>

      </div>
    </div>
  );
};
