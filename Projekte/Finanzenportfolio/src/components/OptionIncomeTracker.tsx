import React, { useState, useMemo } from 'react';
import type { Transaction, Holding } from '../types';
import { DollarSign, Plus, ShieldCheck, TrendingUp } from 'lucide-react';
import { convertCurrency, calculateOptionAnnualizedYield } from './performanceUtils';
import { calculatePortfolioDeltaHedging } from '../utils/optionGreeksUtils';

interface OptionIncomeTrackerProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  holdings?: Holding[];
  totalPortfolioValue?: number;
}

export const OptionIncomeTracker: React.FC<OptionIncomeTrackerProps> = ({
  transactions,
  onAddTransaction,
  baseCurrency,
  holdings = [],
  totalPortfolioValue = 0
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [ticker, setTicker] = useState('AAPL');
  const [name, setName] = useState('Apple Inc.');
  const [optionType, setOptionType] = useState<'CALL' | 'PUT'>('PUT');
  const [strikePrice, setStrikePrice] = useState<number>(180);
  const [expirationDate, setExpirationDate] = useState<string>('30.09.2026');
  const [contracts, setContracts] = useState<number>(1);
  const [premiumPerShare, setPremiumPerShare] = useState<number>(2.50);

  const formatVal = (valInEur: number) => {
    const converted = convertCurrency(valInEur, 'EUR', baseCurrency);
    return converted.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency });
  };

  // Filter option transactions
  const optionTxs = useMemo(() => {
    return transactions.filter(t => t.type === 'OPTION_PREMIUM' || t.type === 'OPTION_EXPIRE' || t.type === 'OPTION_ASSIGN');
  }, [transactions]);

  const totalPremiumEur = useMemo(() => {
    return optionTxs.reduce((acc, t) => acc + (t.amount * t.price) / (t.exchangeRate || 1), 0);
  }, [optionTxs]);

  const annualizedYield = useMemo(() => {
    return calculateOptionAnnualizedYield(optionTxs);
  }, [optionTxs]);

  // Advanced Delta-Hedging & Black-Scholes Greeks calculation
  const deltaHedgingSummary = useMemo(() => {
    return calculatePortfolioDeltaHedging(transactions, holdings, totalPortfolioValue);
  }, [transactions, holdings, totalPortfolioValue]);

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmountShares = contracts * 100;
    
    onAddTransaction({
      id: `option-${Date.now()}`,
      type: 'OPTION_PREMIUM',
      date: new Date().toLocaleDateString('de-DE'),
      ticker,
      name,
      amount: totalAmountShares,
      price: premiumPerShare,
      fee: 1.0,
      tax: 0,
      category: 'Stock',
      currency: 'EUR',
      strikePrice,
      expirationDate,
      optionType
    });

    setShowAddForm(false);
  };

  return (
    <div className="glass-panel fade-in space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Option Income Tracker & Delta-Hedging Hub
          </h2>
          <p className="text-xs text-slate-400">Erfassung von Cash-Secured Puts, Covered Calls, Black-Scholes Greeks & Portfolio-Absicherung</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Option Trade Einbuchen
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Vereinnahmte Optionsprämien</span>
          <span className="text-2xl font-black text-emerald-400 block mt-1">{formatVal(totalPremiumEur)}</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Täglicher Theta-Verfall (Θ)</span>
          <span className="text-2xl font-black text-emerald-300 block mt-1">
            +{formatVal(deltaHedgingSummary.dailyThetaIncomeEur)}/Tag
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Zeitwertgewinn pro Tag</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Portfolio Gesamt-Delta (Δ)</span>
          <span className="text-2xl font-black text-blue-400 block mt-1">
            {formatVal(deltaHedgingSummary.portfolioBetaWeightDeltaEur)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Äquivalent zu {deltaHedgingSummary.totalDeltaShares} Benchmark-Anteilen</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Ø Prämienrendite p.a.</span>
          <span className="text-2xl font-black text-blue-400 block mt-1">
            {optionTxs.length > 0 ? `+${annualizedYield.toFixed(1)}%` : '0.0%'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{optionTxs.length} Options-Buchungen</span>
        </div>
      </div>

      {/* Delta-Hedging & Crash-Protection Radar */}
      <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="font-bold text-slate-200 block text-sm flex items-center gap-1.5">
              🛡️ Delta-Neutral & Protective Put Hedging Assistent
            </span>
            <span className="text-slate-400 block mt-1">
              Absicherungs-Status: <strong className="text-emerald-400">{deltaHedgingSummary.hedgingStatus}</strong> | Gesamtnotional der Optionen: <strong className="text-slate-200">{formatVal(deltaHedgingSummary.totalOptionNotionalExposureEur)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/25 font-semibold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Tail-Risk Schutz aktiv
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-xl text-slate-300 flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-blue-300 text-xs">Black-Scholes Hedging-Empfehlung:</strong>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {deltaHedgingSummary.protectivePutRecommendation.description}
              {' '}Geschätzte Prämie: <strong className="text-emerald-400">~{formatVal(deltaHedgingSummary.protectivePutRecommendation.estimatedCostEur)}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Add Form Modal/Card */}
      {showAddForm && (
        <form onSubmit={handleAddOption} className="p-5 bg-slate-950/80 border border-slate-700 rounded-2xl space-y-4 animate-in fade-in duration-150 text-xs">
          <h4 className="font-bold text-slate-200 text-sm">Neue Optionsprämie erfassen</h4>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Ticker</label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Name des Basiswerts</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Optionstyp</label>
              <select
                value={optionType}
                onChange={(e) => setOptionType(e.target.value as 'CALL' | 'PUT')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200"
              >
                <option value="PUT">Cash-Secured Put</option>
                <option value="CALL">Covered Call</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Strike-Preis (€ / $)</label>
              <input
                type="number"
                step="0.5"
                value={strikePrice}
                onChange={(e) => setStrikePrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Verfalldatum (DD.MM.YYYY)</label>
              <input
                type="text"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Anzahl Kontrakte (1 Kontrakt = 100 Stk)</label>
              <input
                type="number"
                min="1"
                value={contracts}
                onChange={(e) => setContracts(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Prämie je Aktie</label>
              <input
                type="number"
                step="0.05"
                value={premiumPerShare}
                onChange={(e) => setPremiumPerShare(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <span className="text-[11px] text-slate-400 mb-1">Prämieneinnahme Brutto:</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                {formatVal(contracts * 100 * premiumPerShare)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
              Abbrechen
            </button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl">
              Prämie Buchen
            </button>
          </div>
        </form>
      )}

      {/* Options Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40 text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
            <tr>
              <th className="p-3">Typ</th>
              <th className="p-3">Asset</th>
              <th className="p-3">Ticker</th>
              <th className="p-3">Strike</th>
              <th className="p-3">Delta (Δ)</th>
              <th className="p-3">Theta (Θ/Tag)</th>
              <th className="p-3">Verfall</th>
              <th className="p-3">Deckung</th>
              <th className="p-3 text-right">Prämie Gesamt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {optionTxs.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-500">
                  Noch keine Optionsprämien erfasst. Klicke auf "Option Trade Einbuchen".
                </td>
              </tr>
            ) : (
              deltaHedgingSummary.positions.map((pos) => {
                return (
                  <tr key={pos.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-purple-400">
                      {pos.optionType}
                    </td>
                    <td className="p-3 font-medium text-slate-200">{pos.name}</td>
                    <td className="p-3 font-mono text-slate-400">{pos.ticker}</td>
                    <td className="p-3 font-mono text-slate-300">{pos.strikePrice} €</td>
                    <td className="p-3 font-mono text-blue-400">{pos.delta.toFixed(2)}</td>
                    <td className="p-3 font-mono text-emerald-400">+{formatVal(pos.theta)}/Tag</td>
                    <td className="p-3 text-slate-400">{pos.daysToExpiration} Tage</td>
                    <td className="p-3">
                      {pos.isCovered ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-semibold">
                          Gedeckt (100+)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px] font-semibold">
                          Cash-Secured
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      +{formatVal(pos.contracts * 100 * (pos.strikePrice * 0.025))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
