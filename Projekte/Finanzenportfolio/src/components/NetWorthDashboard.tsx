import React, { useState } from 'react';
import type { Portfolio } from '../types';
import { Plus, Trash2, Landmark } from 'lucide-react';

interface NetWorthDashboardProps {
  portfolios: Portfolio[];
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
}

interface CustomAsset {
  id: string;
  name: string;
  category: 'REAL_ESTATE' | 'CASH_ACCOUNT' | 'OTHER_ASSET' | 'LIABILITY';
  value: number;
}

export const NetWorthDashboard: React.FC<NetWorthDashboardProps> = ({
  portfolios,
  baseCurrency
}) => {
  const [customAssets, setCustomAssets] = useState<CustomAsset[]>([
    { id: 'ca-1', name: 'Notgroschen (Tagesgeld)', category: 'CASH_ACCOUNT', value: 10000 },
    { id: 'ca-2', name: 'Eigentumswohnung (Geschätzt)', category: 'REAL_ESTATE', value: 250000 },
    { id: 'ca-3', name: 'Immobilienkredit Restschuld', category: 'LIABILITY', value: -180000 }
  ]);

  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState<number>(1000);
  const [newCategory, setNewCategory] = useState<CustomAsset['category']>('CASH_ACCOUNT');

  // Sum all portfolios value
  const totalPortfoliosValue = portfolios.reduce((totalSum, p) => {
    const portfolioVal = p.transactions.reduce((sum, tx) => {
      if (tx.type === 'BUY' || tx.type === 'DEPOSIT') return sum + (tx.amount * tx.price);
      if (tx.type === 'SELL' || tx.type === 'WITHDRAWAL') return sum - (tx.amount * tx.price);
      return sum;
    }, 0);
    return totalSum + Math.max(0, portfolioVal);
  }, 0);

  const customAssetsTotal = customAssets.reduce((sum, ca) => sum + ca.value, 0);
  const netWorth = totalPortfoliosValue + customAssetsTotal;

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCustomAssets([
      ...customAssets,
      {
        id: `ca-${Date.now()}`,
        name: newName.trim(),
        category: newCategory,
        value: newCategory === 'LIABILITY' ? -Math.abs(newValue) : Math.abs(newValue)
      }
    ]);
    setNewName('');
    setNewValue(1000);
  };

  const handleRemoveAsset = (id: string) => {
    setCustomAssets(customAssets.filter(ca => ca.id !== id));
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Gesamtvermögens-Übersicht (Net Worth)</h3>
            <p className="text-xs text-slate-400">Kumuliertes Gesamtvermögen aus Portfolios, Tagesgeld, Immobilien & Schulden</p>
          </div>
        </div>

        <div className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg">
          <span className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider block">Net Worth</span>
          <span className="text-xl font-black text-white block">
            {netWorth.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>
      </div>

      {/* Asset Components breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block font-semibold">Aktien & Krypto Depots ({portfolios.length})</span>
          <span className="text-lg font-black text-blue-400 mt-1 block">
            {totalPortfoliosValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block font-semibold">Tagesgeld & Immobilien</span>
          <span className="text-lg font-black text-emerald-400 mt-1 block">
            {customAssets.filter(a => a.value > 0).reduce((sum, a) => sum + a.value, 0).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block font-semibold">Verbindlichkeiten / Kredite</span>
          <span className="text-lg font-black text-rose-400 mt-1 block">
            {customAssets.filter(a => a.value < 0).reduce((sum, a) => sum + a.value, 0).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>
      </div>

      {/* Add Custom Asset Form */}
      <form onSubmit={handleAddAsset} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3 text-xs">
        <span className="font-bold text-slate-200 block">Weiteres Vermögen / Verbindlichkeit hinzufügen</span>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Bezeichnung (z.B. Bausparer, Auto)..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
          >
            <option value="CASH_ACCOUNT">Tagesgeld / Konto</option>
            <option value="REAL_ESTATE">Immobilie / Sachwert</option>
            <option value="LIABILITY">Verbindlichkeit / Kredit (-)</option>
          </select>
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(Number(e.target.value))}
            className="w-28 bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
          />
          <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-lg transition-colors flex items-center justify-center gap-1">
            <Plus className="w-4 h-4" /> Hinzufügen
          </button>
        </div>
      </form>

      {/* Custom Asset List */}
      <div className="space-y-2 text-xs">
        {customAssets.map(ca => (
          <div key={ca.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex justify-between items-center">
            <span className="font-medium text-slate-200">{ca.name}</span>
            <div className="flex items-center gap-3">
              <span className={`font-bold font-mono ${ca.value < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {ca.value.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
              </span>
              <button onClick={() => handleRemoveAsset(ca.id)} className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
