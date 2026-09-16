import React, { useState } from 'react';
import { Scale, X, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import type { Holding } from '../types';
import { calculateTaxLossHarvestingSuggestions, convertCurrency } from './performanceUtils';

interface TaxLossHarvestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  usedExemptionEur: number;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const TaxLossHarvestingModal: React.FC<TaxLossHarvestingModalProps> = ({
  isOpen,
  onClose,
  holdings,
  usedExemptionEur,
  baseCurrency
}) => {
  const [targetExemptionEur, setTargetExemptionEur] = useState<number>(1000); // 1000 Single / 2000 Joint

  if (!isOpen) return null;

  const result = calculateTaxLossHarvestingSuggestions(holdings, targetExemptionEur, usedExemptionEur);

  const formatVal = (valInEur: number) => {
    const converted = convertCurrency(valInEur, 'EUR', baseCurrency);
    return converted.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Steuerliche Optimierungs-Engine</h3>
              <p className="text-xs text-slate-400">Freibetrag-Ausschöpfung & Tax Loss Harvesting Assistent</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          
          {/* Controls & Exemption Selector */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-slate-400 font-semibold block">Sparer-Pauschbetrag</span>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setTargetExemptionEur(1000)}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${targetExemptionEur === 1000 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                >
                  1.000 € (Einzel)
                </button>
                <button
                  onClick={() => setTargetExemptionEur(2000)}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${targetExemptionEur === 2000 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                >
                  2.000 € (Ehepaar)
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 font-semibold block">Bisher Genutzt</span>
              <span className="text-xl font-bold text-slate-200 block mt-1">{formatVal(usedExemptionEur)}</span>
              <span className="text-[10px] text-slate-500 block">Aus Dividenden & Verkäufen</span>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <span className="text-amber-400 font-semibold block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Verbleibender Freibetrag
              </span>
              <span className="text-xl font-bold text-amber-300 block mt-1">{formatVal(result.unusedExemptionEur)}</span>
              <span className="text-[10px] text-amber-400/80 block">Steuerfreies Gewinn-Potenzial</span>
            </div>
          </div>

          {/* Savings Highlight */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="font-bold text-emerald-300 text-sm">Mögliche Steuerersparnis: {formatVal(result.totalPotentialTaxSavedEur)}</h4>
                <p className="text-slate-400 text-[11px]">Geschätzte Abgeltungsteuer-Ersparnis durch Umsetzung der Empfehlungen vor Jahresende.</p>
              </div>
            </div>
          </div>

          {/* Suggestions List */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-xs tracking-wide uppercase">Handlungsempfehlungen</h4>
            
            {result.suggestions.length === 0 ? (
              <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl text-center text-slate-400">
                Keine Handlungsnotwendigkeit. Dein Freibetrag ist voll ausgeschöpft oder es liegen keine passenden Gewinn-/Verlustpositionen vor.
              </div>
            ) : (
              <div className="space-y-2">
                {result.suggestions.map((sug, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      sug.action === 'SELL_GAIN_HARVEST'
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${sug.action === 'SELL_GAIN_HARVEST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {sug.action === 'SELL_GAIN_HARVEST' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-200">
                          <span>{sug.name}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">{sug.ticker}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{sug.reason}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-200 block">Empfohlen: Verkaufe {sug.suggestedSharesToSell} Stk.</span>
                      <span className={`text-xs font-semibold ${sug.action === 'SELL_GAIN_HARVEST' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {sug.action === 'SELL_GAIN_HARVEST' ? '+' : ''}{formatVal(sug.estimatedRealizedGainOrLossEur)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-slate-400" /> Keine Steuerberatung. Vor Verkauf etwaige Transaktionsgebühren prüfen.
          </p>
          <button onClick={onClose} className="px-5 py-2 font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all">
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
