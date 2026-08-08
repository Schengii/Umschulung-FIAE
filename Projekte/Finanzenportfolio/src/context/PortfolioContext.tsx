import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Portfolio, Transaction, WatchlistItem, SavingsPlan, AssetMappingRule, PortfolioStats, Holding } from '../types';
import { fetchLiveExchangeRates, fetchLiveCryptoPrices, fetchLiveStockPrices } from '../services/marketDataApi';
import { calculateIRR, calculateTTWRR, calculateRealizedGains, calculateCryptoTaxFreeShares } from '../components/performanceUtils';

interface PortfolioContextType {
  portfolios: Portfolio[];
  activePortfolio: Portfolio;
  activePortfolioId: string;
  currentPrices: Record<string, number>;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  setBaseCurrency: (cur: 'EUR' | 'USD' | 'CHF' | 'GBP') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  activeBrokerFilter: string;
  setActiveBrokerFilter: (broker: string) => void;
  holdings: Holding[];
  stats: PortfolioStats;
  switchPortfolio: (id: string) => void;
  createPortfolio: (name: string) => void;
  deletePortfolio: (id: string) => void;
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addWatchlistItem: (item: WatchlistItem) => void;
  removeWatchlistItem: (id: string) => void;
  addSavingsPlan: (plan: SavingsPlan) => void;
  toggleSavingsPlan: (id: string) => void;
  removeSavingsPlan: (id: string) => void;
  executeSavingsPlans: () => void;
  executeRebalancingBuys: (buys: { ticker: string; name: string; amount: number; price: number; category: any }[]) => void;
  addMappingRule: (rule: AssetMappingRule) => void;
  deleteMappingRule: (id: string) => void;
  refreshPrices: () => Promise<void>;
  importBackup: (data: Portfolio[]) => void;
  updateHoldingNotes: (ticker: string, notes: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-0',
    type: 'DEPOSIT',
    date: '01.01.2026',
    ticker: 'CASH',
    name: 'Einzahlung (Cash)',
    amount: 15000,
    price: 1,
    fee: 0,
    tax: 0,
    category: 'Stock',
    currency: 'EUR',
    exchangeRate: 1.0
  },
  {
    id: 'tx-1',
    type: 'BUY',
    date: '15.01.2026',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    amount: 15,
    price: 172.50,
    fee: 1.00,
    tax: 0,
    category: 'Stock',
    sector: 'Technology',
    region: 'North America',
    currency: 'EUR',
    exchangeRate: 1.0
  },
  {
    id: 'tx-2',
    type: 'BUY',
    date: '20.02.2026',
    ticker: 'EUNL',
    name: 'iShares Core MSCI World ETF',
    amount: 80,
    price: 82.30,
    fee: 0,
    tax: 0,
    category: 'ETF',
    sector: 'Financials',
    region: 'Global',
    currency: 'EUR',
    exchangeRate: 1.0
  },
  {
    id: 'tx-3',
    type: 'BUY',
    date: '05.03.2026',
    ticker: 'BTC',
    name: 'Bitcoin (BTC)',
    amount: 0.085,
    price: 61200.00,
    fee: 4.50,
    tax: 0,
    category: 'Crypto',
    region: 'Global',
    currency: 'EUR',
    exchangeRate: 1.0
  }
];

const DEFAULT_PORTFOLIO: Portfolio = {
  id: 'default',
  name: 'Haupt-Portfolio',
  transactions: INITIAL_TRANSACTIONS,
  watchlist: [
    {
      id: 'w-1',
      ticker: 'MSFT',
      name: 'Microsoft Corp.',
      category: 'Stock',
      targetPrice: 380.00,
      notes: 'Kauf geplant bei Korrektur.',
      addedAt: '20.06.2026'
    }
  ],
  savingsPlans: [
    {
      id: 'sp-1',
      ticker: 'EUNL',
      name: 'iShares Core MSCI World ETF',
      category: 'ETF',
      amount: 150,
      isActive: true
    }
  ]
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(() => {
    const saved = localStorage.getItem('finanz_portfolios');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [DEFAULT_PORTFOLIO];
  });

  const [activePortfolioId, setActivePortfolioId] = useState<string>(() => {
    return localStorage.getItem('finanz_active_portfolio') || 'default';
  });

  const [baseCurrency, setBaseCurrency] = useState<'EUR' | 'USD' | 'CHF' | 'GBP'>('EUR');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeBrokerFilter, setActiveBrokerFilter] = useState<string>('ALL');
  
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({
    AAPL: 191.45,
    EUNL: 87.65,
    BTC: 63450.00,
    MSFT: 415.50
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('finanz_portfolios', JSON.stringify(portfolios));
  }, [portfolios]);

  useEffect(() => {
    localStorage.setItem('finanz_active_portfolio', activePortfolioId);
  }, [activePortfolioId]);

  const activePortfolio = useMemo(() => {
    return portfolios.find(p => p.id === activePortfolioId) || portfolios[0] || DEFAULT_PORTFOLIO;
  }, [portfolios, activePortfolioId]);

  // Live Prices refresh handler
  const refreshPrices = async () => {
    const cryptoPrices = await fetchLiveCryptoPrices();
    const fxRates = await fetchLiveExchangeRates();
    
    const tickers = Array.from(new Set(activePortfolio.transactions.map(t => t.ticker))).filter(t => t !== 'CASH');
    const stockPrices = await fetchLiveStockPrices(tickers);

    setCurrentPrices(prev => ({
      ...prev,
      ...cryptoPrices,
      ...stockPrices,
      ...fxRates
    }));
  };

  // Filtered transactions by broker if set
  const filteredTransactions = useMemo(() => {
    if (activeBrokerFilter === 'ALL') return activePortfolio.transactions;
    return activePortfolio.transactions.filter(t => t.broker === activeBrokerFilter);
  }, [activePortfolio.transactions, activeBrokerFilter]);

  // Compute Holdings
  const holdings = useMemo(() => {
    const assetMap: Record<string, {
      ticker: string;
      name: string;
      category: any;
      shares: number;
      totalCost: number;
      sector?: any;
      region?: any;
      broker?: string;
      notes?: string;
    }> = {};

    filteredTransactions.forEach(tx => {
      if (tx.type === 'DEPOSIT' || tx.type === 'WITHDRAWAL' || tx.ticker === 'CASH') return;

      if (!assetMap[tx.ticker]) {
        assetMap[tx.ticker] = {
          ticker: tx.ticker,
          name: tx.name,
          category: tx.category,
          shares: 0,
          totalCost: 0,
          sector: tx.sector,
          region: tx.region,
          broker: tx.broker,
          notes: tx.notes
        };
      }

      const rate = tx.exchangeRate || 1.0;
      if (tx.type === 'BUY' || tx.type === 'STAKING') {
        assetMap[tx.ticker].shares += tx.amount;
        assetMap[tx.ticker].totalCost += (tx.amount * tx.price + tx.fee) / rate;
      } else if (tx.type === 'SELL') {
        const avgCost = assetMap[tx.ticker].shares > 0 ? assetMap[tx.ticker].totalCost / assetMap[tx.ticker].shares : 0;
        assetMap[tx.ticker].shares = Math.max(0, assetMap[tx.ticker].shares - tx.amount);
        assetMap[tx.ticker].totalCost = assetMap[tx.ticker].shares * avgCost;
      }
    });

    const activeList = Object.values(assetMap).filter(a => a.shares > 0.00001);
    const totalPortfolioValue = activeList.reduce((sum, a) => sum + (a.shares * (currentPrices[a.ticker] || 100)), 0);

    return activeList.map(a => {
      const price = currentPrices[a.ticker] || (a.totalCost / a.shares) || 100;
      const currentValue = a.shares * price;
      const totalGain = currentValue - a.totalCost;
      const totalGainPercent = a.totalCost > 0 ? (totalGain / a.totalCost) * 100 : 0;
      const portfolioWeight = totalPortfolioValue > 0 ? (currentValue / totalPortfolioValue) * 100 : 0;
      const averageBuyPrice = a.shares > 0 ? a.totalCost / a.shares : 0;

      const cryptoTaxFree = a.category === 'Crypto' ? calculateCryptoTaxFreeShares(activePortfolio.transactions, a.ticker) : undefined;

      return {
        ticker: a.ticker,
        name: a.name,
        category: a.category,
        shares: a.shares,
        averageBuyPrice,
        currentPrice: price,
        totalCost: a.totalCost,
        currentValue,
        totalGain,
        totalGainPercent,
        portfolioWeight,
        yieldOnCost: 0,
        sector: a.sector,
        region: a.region,
        notes: a.notes,
        cryptoTaxFreeShares: cryptoTaxFree
      };
    });
  }, [filteredTransactions, currentPrices, activePortfolio.transactions]);

  // Cash Balance
  const cashBalance = useMemo(() => {
    let cash = 0;
    activePortfolio.transactions.forEach(tx => {
      const rate = tx.exchangeRate || 1.0;
      if (tx.type === 'DEPOSIT') cash += tx.amount / rate;
      else if (tx.type === 'WITHDRAWAL') cash -= tx.amount / rate;
      else if (tx.type === 'BUY') cash -= (tx.amount * tx.price + tx.fee) / rate;
      else if (tx.type === 'SELL') cash += (tx.amount * tx.price - tx.fee - tx.tax) / rate;
      else if (tx.type === 'DIVIDEND') cash += (tx.amount * tx.price - tx.tax) / rate;
    });
    return Math.max(0, cash);
  }, [activePortfolio.transactions]);

  // Portfolio Stats
  const stats = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
    const totalGains = totalValue - totalCost;
    const totalGainsPercent = totalCost > 0 ? (totalGains / totalCost) * 100 : 0;

    const divSum = activePortfolio.transactions
      .filter(t => t.type === 'DIVIDEND')
      .reduce((sum, t) => sum + (t.amount * t.price - t.tax) / (t.exchangeRate || 1), 0);

    const irr = calculateIRR(activePortfolio.transactions, totalValue, cashBalance);
    const ttwrr = calculateTTWRR(activePortfolio.transactions, totalValue, cashBalance);
    const realizedGains = calculateRealizedGains(activePortfolio.transactions);

    return {
      totalValue: totalValue + cashBalance,
      totalCost,
      totalGains,
      totalGainsPercent,
      dividendsReceived: divSum,
      cashBalance,
      irr,
      ttwrr,
      maxDrawdown: 5.2,
      sharpeRatio: 1.45,
      realizedGains,
      taxExemptionUsed: Math.min(1000, realizedGains + divSum)
    };
  }, [holdings, activePortfolio.transactions, cashBalance]);

  // Actions
  const switchPortfolio = (id: string) => setActivePortfolioId(id);

  const createPortfolio = (name: string) => {
    const newP: Portfolio = {
      id: `p-${Date.now()}`,
      name,
      transactions: [],
      watchlist: []
    };
    setPortfolios(prev => [...prev, newP]);
    setActivePortfolioId(newP.id);
  };

  const deletePortfolio = (id: string) => {
    if (portfolios.length <= 1) return;
    setPortfolios(prev => prev.filter(p => p.id !== id));
    setActivePortfolioId(portfolios[0].id);
  };

  const addTransaction = (tx: Transaction) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, transactions: [tx, ...p.transactions] };
      }
      return p;
    }));
  };

  const deleteTransaction = (id: string) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, transactions: p.transactions.filter(t => t.id !== id) };
      }
      return p;
    }));
  };

  const addWatchlistItem = (item: WatchlistItem) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, watchlist: [...(p.watchlist || []), item] };
      }
      return p;
    }));
  };

  const removeWatchlistItem = (id: string) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, watchlist: (p.watchlist || []).filter(w => w.id !== id) };
      }
      return p;
    }));
  };

  const addSavingsPlan = (plan: SavingsPlan) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, savingsPlans: [...(p.savingsPlans || []), plan] };
      }
      return p;
    }));
  };

  const toggleSavingsPlan = (id: string) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return {
          ...p,
          savingsPlans: (p.savingsPlans || []).map(sp => sp.id === id ? { ...sp, isActive: !sp.isActive } : sp)
        };
      }
      return p;
    }));
  };

  const removeSavingsPlan = (id: string) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, savingsPlans: (p.savingsPlans || []).filter(sp => sp.id !== id) };
      }
      return p;
    }));
  };

  const executeSavingsPlans = () => {
    const activePlans = activePortfolio.savingsPlans?.filter(sp => sp.isActive) || [];
    if (activePlans.length === 0) return;

    const todayStr = new Date().toLocaleDateString('de-DE');
    const newTxs: Transaction[] = activePlans.map((sp, idx) => {
      const price = currentPrices[sp.ticker] || 100;
      const amount = sp.amount / price;
      return {
        id: `sp-exec-${Date.now()}-${idx}`,
        type: 'BUY',
        date: todayStr,
        ticker: sp.ticker,
        name: sp.name,
        amount,
        price,
        fee: 0,
        tax: 0,
        category: sp.category,
        currency: 'EUR'
      };
    });

    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, transactions: [...newTxs, ...p.transactions] };
      }
      return p;
    }));
  };

  const executeRebalancingBuys = (buys: { ticker: string; name: string; amount: number; price: number; category: any }[]) => {
    const todayStr = new Date().toLocaleDateString('de-DE');
    const newTxs: Transaction[] = buys.map((b, idx) => ({
      id: `rebal-${Date.now()}-${idx}`,
      type: 'BUY',
      date: todayStr,
      ticker: b.ticker,
      name: b.name,
      amount: b.amount / b.price,
      price: b.price,
      fee: 1.0,
      tax: 0,
      category: b.category,
      currency: 'EUR'
    }));

    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, transactions: [...newTxs, ...p.transactions] };
      }
      return p;
    }));
  };

  const addMappingRule = (rule: AssetMappingRule) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, mappingRules: [...(p.mappingRules || []), rule] };
      }
      return p;
    }));
  };

  const deleteMappingRule = (id: string) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return { ...p, mappingRules: (p.mappingRules || []).filter(r => r.id !== id) };
      }
      return p;
    }));
  };

  const importBackup = (data: Portfolio[]) => {
    setPortfolios(data);
    if (data.length > 0) setActivePortfolioId(data[0].id);
  };

  const updateHoldingNotes = (ticker: string, notes: string) => {
    setPortfolios(prev => prev.map(p => {
      if (p.id === activePortfolioId) {
        return {
          ...p,
          transactions: p.transactions.map(t => t.ticker === ticker ? { ...t, notes } : t)
        };
      }
      return p;
    }));
  };

  return (
    <PortfolioContext.Provider value={{
      portfolios,
      activePortfolio,
      activePortfolioId,
      currentPrices,
      baseCurrency,
      setBaseCurrency,
      isDarkMode,
      setIsDarkMode,
      activeBrokerFilter,
      setActiveBrokerFilter,
      holdings,
      stats,
      switchPortfolio,
      createPortfolio,
      deletePortfolio,
      addTransaction,
      deleteTransaction,
      addWatchlistItem,
      removeWatchlistItem,
      addSavingsPlan,
      toggleSavingsPlan,
      removeSavingsPlan,
      executeSavingsPlans,
      executeRebalancingBuys,
      addMappingRule,
      deleteMappingRule,
      refreshPrices,
      importBackup,
      updateHoldingNotes
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
