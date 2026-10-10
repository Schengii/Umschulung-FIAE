import React, { useState, useMemo } from 'react';
import { Calculator, X, AlertCircle, Info, Check } from 'lucide-react';
import type { Holding, Transaction } from '../types';
import { calculateDetailedVorabpauschale, HISTORICAL_BASISZINS } from '../utils/vorabpauschaleUtils';

interface VorabpauschaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings: Holding[];
  transactions: Transaction[];
  baseCurrency?: string;
}

export const VorabpauschaleModal: React.FC<VorabpauschaleModalProps> = ({
  isOpen,
  onClose,
  holdings,
  transactions,
  baseCurrency = 'EUR'
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [customZinsInput, setCustomZinsInput] = useState<string>('2.40');
  const [useCustomZins, setUseCustomZins] = useState<boolean>(false);

  // Group annual dividends per ETF ticker for the selected year
  const dividendsByTicker = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(tx => tx.type === 'DIVIDEND')
      .forEach(tx => {
        const txYear = parseInt(tx.date.split('.')[2] || tx.date.split('-')[0]);
        if (txYear === selectedYear) {
          const rate = tx.exchangeRate || 1.0;
          const net = (tx.amount * tx.price) / rate;
          map[tx.ticker] = (map[tx.ticker] || 0) + net;
        }
      });
    return map;
  }, [transactions, selectedYear]);

  // Perform calculation
  const calcResult = useMemo(() => {
    const customRate = useCustomZins ? parseFloat(customZinsInput) / 100 : undefined;
    return calculateDetailedVorabpauschale(
      holdings,
      dividendsByTicker,
      selectedYear,
      customRate
    );
  }, [holdings, dividendsByTicker, selectedYear, useCustomZins, customZinsInput]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Vorabpauschale-Rechner (InvStG § 18 & § 20)</h3>
              <p className="text-xs text-slate-400">Automatische Ermittlung des Basisertrags und der geschätzten Steuerlast für thesaurierende ETFs</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Steuerjahr</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-medium"
              >
                <option value={2026}>2026 (Prognose: 2,40%)</option>
                <option value={2025}>2025 (Festgesetzt: 2,53%)</option>
                <option value={2024}>2024 (Festgesetzt: 2,29%)</option>
                <option value={2023}>2023 (Festgesetzt: 2,55%)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Bundesbank Basiszins (%)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={useCustomZins ? customZinsInput : (HISTORICAL_BASISZINS[selectedYear] * 100).toFixed(2)}
                  onChange={(e) => {
                    setUseCustomZins(true);
                    setCustomZinsInput(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-200 font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-slate-400 font-semibold block mb-1">InvStG Gesetzesstatus</span>
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl font-medium">
                <Check className="w-4 h-4" /> 70% Faktor & TFS aktiv
              </div>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-[11px] block">ETF-Jahresanfangswert</span>
              <span className="text-lg font-bold text-slate-200 mt-1 block">
                {calcResult.totalStartValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
            </div>

            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-[11px] block">Erhaltene Ausschüttungen</span>
              <span className="text-lg font-bold text-slate-300 mt-1 block">
                {calcResult.totalDividendsPaidEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <span className="text-amber-400 text-[11px] font-semibold block">Steuerpfl. Vorabpauschale</span>
              <span className="text-lg font-bold text-amber-300 mt-1 block">
                {calcResult.totalTaxableVorabpauschaleEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
            </div>

            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <span className="text-rose-400 text-[11px] font-semibold block">Vorauss. Steuerabzug (26,38%)</span>
              <span className="text-lg font-bold text-rose-300 mt-1 block">
                {calcResult.totalEstimatedTaxEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
            </div>
          </div>

          {/* Explanation Info Box */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed text-[11px]">
              <strong>Wie berechnet dein Broker die Vorabpauschale?</strong><br />
              Die Vorabpauschale ist die Differenz zwischen dem Basisertrag (Startwert × Basiszins × 0,7) und den tatsächlichen Ausschüttungen im Kalenderjahr, maximal jedoch begrenzt auf die echte Wertsteigerung des ETFs. Bei Aktien-ETFs mindert die 30%-ige Teilfreistellung den steuerpflichtigen Betrag. Der Broker bucht den Steuerbetrag automatisch im Januar vom Verrechnungskonto ab oder verrechnet ihn mit dem Sparer-Pauschbetrag.
            </div>
          </div>

          {/* Detailed ETF Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wide">Einzelauswertung je ETF-Position ({calcResult.breakdown.length})</h4>
            {calcResult.breakdown.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-950/30 rounded-2xl border border-slate-800">
                Keine ETF-Holdings im aktiven Portfolio gefunden.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">ETF Position</th>
                      <th className="p-3 text-right">Startwert</th>
                      <th className="p-3 text-right">Wertsteigerung</th>
                      <th className="p-3 text-right">Ausschüttung</th>
                      <th className="p-3 text-right">Basisertrag (70%)</th>
                      <th className="p-3 text-right">Teilfreistellung</th>
                      <th className="p-3 text-right text-amber-400 font-bold">Vorabpauschale</th>
                      <th className="p-3 text-right text-rose-400 font-bold">Steuerlast</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {calcResult.breakdown.map((row) => (
                      <tr key={row.ticker} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <div className="font-bold text-slate-200">{row.name}</div>
                          <span className="font-mono text-[10px] text-slate-400">{row.ticker} ({row.shares} Stk.)</span>
                        </td>
                        <td className="p-3 text-right text-slate-300">
                          {row.startOfYearValueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </td>
                        <td className={`p-3 text-right font-medium ${row.annualPerformanceEur >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {row.annualPerformanceEur >= 0 ? '+' : ''}
                          {row.annualPerformanceEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </td>
                        <td className="p-3 text-right text-slate-300">
                          {row.annualDividendsPaidEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </td>
                        <td className="p-3 text-right text-slate-300">
                          {row.basisErtragGrossEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </td>
                        <td className="p-3 text-right text-blue-400 font-medium">
                          {row.teilfreistellungPct}%
                        </td>
                        <td className="p-3 text-right font-bold text-amber-300">
                          {row.vorabpauschaleTaxableEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </td>
                        <td className="p-3 text-right font-bold text-rose-400">
                          {row.estimatedTaxDueEur.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Keine Gewähr. Die tatsächliche Abrechnung erfolgt durch dein deutsches Kreditinstitut.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all"
          >
            Fertig
          </button>
        </div>

      </div>
    </div>
  );
};
