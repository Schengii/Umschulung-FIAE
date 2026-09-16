import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { DollarSign, Plus } from 'lucide-react';
import { convertCurrency, calculateOptionGreeks, calculateOptionAnnualizedYield } from './performanceUtils';

interface OptionIncomeTrackerProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

export const OptionIncomeTracker: React.FC<OptionIncomeTrackerProps> = ({
  transactions,
  onAddTransaction,
  baseCurrency
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
            <DollarSign className="w-5 h-5 text-emerald-400" /> Option Income Tracker & Wheel Strategy
          </h2>
          <p className="text-xs text-slate-400">Erfassung von Cash-Secured Puts, Covered Calls & Prämienrenditen</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Option Trade Einbuchen
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Vereinnahmte Optionsprämien</span>
          <span className="text-2xl font-black text-emerald-400 block mt-1">{formatVal(totalPremiumEur)}</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Aktive Kontrakte</span>
          <span className="text-2xl font-black text-slate-100 block mt-1">{optionTxs.length}</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold block">Ø Prämienrendite p.a.</span>
          <span className="text-2xl font-black text-blue-400 block mt-1">
            {optionTxs.length > 0 ? `+${annualizedYield.toFixed(1)}%` : '0.0%'}
          </span>
        </div>
      </div>

      {/* Delta-Hedging & Crash-Protection Radar */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
        <div>
          <span className="font-bold text-slate-200 block text-sm flex items-center gap-1.5">
            🛡️ Delta-Neutral & Protective Put Hedging Assistent
          </span>
          <span className="text-slate-400 block mt-0.5">
            Aktives Portfolio-Delta: <strong className="text-blue-400">Δ +0.82</strong> | Empfohlene Absicherung für Tail-Risk: <strong className="text-emerald-400">2x Protective Puts (10% OTM, 60-90 Tage)</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
            Status: Moderat Bullisch
          </span>
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
              <label className="text-slate-400 font-semibold block mb-1">Asset Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Typ</label>
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
              <label className="text-slate-400 font-semibold block mb-1">Basispreis / Strike ($/€)</label>
              <input
                type="number"
                step="0.5"
                value={strikePrice}
                onChange={(e) => setStrikePrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Verfallsdatum</label>
              <input
                type="text"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                placeholder="DD.MM.YYYY"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Anzahl Kontrakte (1 = 100 Stk)</label>
              <input
                type="number"
                value={contracts}
                onChange={(e) => setContracts(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Prämie pro Aktie ($/€)</label>
              <input
                type="number"
                step="0.01"
                value={premiumPerShare}
                onChange={(e) => setPremiumPerShare(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              <th className="p-3 text-right">Prämie Gesamt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {optionTxs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">
                  Noch keine Optionsprämien erfasst. Klicke auf "Option Trade Einbuchen".
                </td>
              </tr>
            ) : (
              optionTxs.map((tx) => {
                const strike = tx.strikePrice || 100;
                const greeks = calculateOptionGreeks(strike * 1.02, strike, 45, 25, 3.5, tx.optionType || 'PUT');
                const thetaCash = (greeks.thetaDaily * (tx.amount || 100));

                return (
                  <tr key={tx.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-purple-400">
                      {tx.optionType || 'PUT'}
                    </td>
                    <td className="p-3 font-medium text-slate-200">{tx.name}</td>
                    <td className="p-3 font-mono text-slate-400">{tx.ticker}</td>
                    <td className="p-3 font-mono text-slate-300">{tx.strikePrice ? `${tx.strikePrice} €` : '-'}</td>
                    <td className="p-3 font-mono text-blue-400">{greeks.delta.toFixed(2)}</td>
                    <td className="p-3 font-mono text-emerald-400">+{thetaCash.toFixed(2)} €/Tag</td>
                    <td className="p-3 text-slate-400">{tx.expirationDate || tx.date}</td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      +{formatVal(tx.amount * tx.price)}
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
