import React, { useState, useEffect, useMemo } from 'react';
import type { Portfolio } from '../types';
import { Plus, Trash2, Landmark, Building, PiggyBank, CreditCard, PieChart } from 'lucide-react';

interface NetWorthDashboardProps {
  portfolios: Portfolio[];
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  currentTotalValue?: number;
}

interface CustomAsset {
  id: string;
  name: string;
  category: 'REAL_ESTATE' | 'CASH_ACCOUNT' | 'OTHER_ASSET' | 'LIABILITY';
  value: number;
}

export const NetWorthDashboard: React.FC<NetWorthDashboardProps> = ({
  portfolios,
  baseCurrency,
  currentTotalValue
}) => {
  const [customAssets, setCustomAssets] = useState<CustomAsset[]>(() => {
    const saved = localStorage.getItem('finanz_networth_custom_assets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'ca-1', name: 'Notgroschen (Tagesgeld)', category: 'CASH_ACCOUNT', value: 10000 }
    ];
  });

  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState<number>(1000);
  const [newCategory, setNewCategory] = useState<CustomAsset['category']>('CASH_ACCOUNT');

  // Save custom assets to localStorage
  useEffect(() => {
    localStorage.setItem('finanz_networth_custom_assets', JSON.stringify(customAssets));
  }, [customAssets]);

  // Aggregate Real Estate from all active portfolios
  const realEstateStats = useMemo(() => {
    const allProps = portfolios.flatMap(p => p.realEstate || []);
    const marketValue = allProps.reduce((sum, r) => sum + (r.currentMarketValueEur || 0), 0);
    const debt = allProps.reduce((sum, r) => sum + (r.loanBalanceEur || 0), 0);
    const netEquity = marketValue - debt;
    return { count: allProps.length, marketValue, debt, netEquity };
  }, [portfolios]);

  // Aggregate Deposit Ladder from all portfolios
  const depositLadderTotal = useMemo(() => {
    const allDeposits = portfolios.flatMap(p => p.depositLadder || []);
    return allDeposits.reduce((sum, d) => sum + (d.principalEur || 0), 0);
  }, [portfolios]);

  // Portfolio Total Value (market price based if provided, else fallback to net transaction cashflows)
  const totalDepotsValue = useMemo(() => {
    if (typeof currentTotalValue === 'number' && currentTotalValue >= 0) {
      return currentTotalValue;
    }
    return portfolios.reduce((totalSum, p) => {
      const portfolioVal = p.transactions.reduce((sum, tx) => {
        if (tx.type === 'BUY' || tx.type === 'DEPOSIT') return sum + (tx.amount * tx.price);
        if (tx.type === 'SELL' || tx.type === 'WITHDRAWAL') return sum - (tx.amount * tx.price);
        return sum;
      }, 0);
      return totalSum + Math.max(0, portfolioVal);
    }, 0);
  }, [portfolios, currentTotalValue]);

  const customAssetsPositives = customAssets.filter(a => a.value > 0).reduce((sum, ca) => sum + ca.value, 0);
  const customAssetsDebts = customAssets.filter(a => a.value < 0).reduce((sum, ca) => sum + Math.abs(ca.value), 0);

  // Total Net Worth = Depots + Real Estate Net Equity + Termingelder + Positives Custom Assets - Custom Debts
  const netWorth = totalDepotsValue + realEstateStats.netEquity + depositLadderTotal + customAssetsPositives - customAssetsDebts;

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
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">Gesamtvermögens-Übersicht (Net Worth)</h3>
            <p className="text-xs text-slate-400">Vollständige Aggregation: Depots, Festgelder, Immobilien (Equity) & Verbindlichkeiten</p>
          </div>
        </div>

        <div className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg">
          <span className="text-[10px] uppercase font-bold text-emerald-100 tracking-wider block">Gesamt-Nettovermögen</span>
          <span className="text-xl font-black text-white block">
            {netWorth.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>
      </div>

      {/* Asset Components breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
            <span>Depots (Marktwert)</span>
            <PieChart className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-lg font-black text-blue-400 block">
            {totalDepotsValue.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">{portfolios.length} Portfolio(s) aktiv</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
            <span>Immobilien (Netto-Equity)</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-lg font-black text-amber-400 block">
            {realEstateStats.netEquity.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {realEstateStats.count > 0 ? `${realEstateStats.count} Objekt(e) (Kredit: ${realEstateStats.debt.toLocaleString('de-DE')} €)` : 'Keine Immobilien erfasst'}
          </span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
            <span>Festgeld & Tagesgeld</span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-lg font-black text-emerald-400 block">
            {(depositLadderTotal + customAssets.filter(a => a.category === 'CASH_ACCOUNT').reduce((s, a) => s + a.value, 0)).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Zinstreppe + Rücklagen</span>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 font-semibold mb-1">
            <span>Schulden & Kredite</span>
            <CreditCard className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-lg font-black text-rose-400 block">
            {-(realEstateStats.debt + customAssetsDebts).toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Immo-Darlehen & Kredite</span>
        </div>
      </div>

      {/* Add Custom Asset Form */}
      <form onSubmit={handleAddAsset} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3 text-xs">
        <span className="font-bold text-slate-200 block">Manuelles Vermögen / Verbindlichkeit hinzufügen</span>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Bezeichnung (z.B. Bausparer, Pkw, Privatdarlehen)..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
          >
            <option value="CASH_ACCOUNT">Tagesgeld / Bankkonto</option>
            <option value="REAL_ESTATE">Sachwert / Sonstiges</option>
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
      {customAssets.length > 0 && (
        <div className="space-y-2 text-xs">
          <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Erfasste Zusatzpositionen:</span>
          {customAssets.map(ca => (
            <div key={ca.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex justify-between items-center">
              <span className="font-medium text-slate-200">{ca.name}</span>
              <div className="flex items-center gap-3">
                <span className={`font-bold font-mono ${ca.value < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {ca.value.toLocaleString('de-DE', { style: 'currency', currency: baseCurrency })}
                </span>
                <button onClick={() => handleRemoveAsset(ca.id)} className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded transition-colors" title="Löschen">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
