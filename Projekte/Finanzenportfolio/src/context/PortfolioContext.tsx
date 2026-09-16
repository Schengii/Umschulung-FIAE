import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Portfolio, Transaction, WatchlistItem, SavingsPlan, AssetMappingRule, PortfolioStats, Holding, PortfolioSnapshot, TaxCountry, RealEstateAsset, DepositLadderItem } from '../types';
import { fetchLiveExchangeRates, fetchLiveCryptoPrices, fetchLiveStockPrices } from '../services/marketDataApi';
import { calculateIRR, calculateTTWRR, calculateRealizedGains, calculateCryptoTaxFreeShares, calculateDynamicPortfolioRiskMetrics } from '../components/performanceUtils';
import { encryptData, decryptData } from '../services/cryptoStorage';

interface PortfolioContextType {
  portfolios: Portfolio[];
  activePortfolio: Portfolio;
  activePortfolioId: string;
  currentPrices: Record<string, number>;
  fxRates: Record<string, number>;
  baseCurrency: 'EUR' | 'USD' | 'CHF' | 'GBP';
  setBaseCurrency: (cur: 'EUR' | 'USD' | 'CHF' | 'GBP') => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  taxCountry: TaxCountry;
  setTaxCountry: (country: TaxCountry) => void;
  taxAllowanceEur: number;
  setTaxAllowanceEur: (allowance: number) => void;
  activeBrokerFilter: string;
  setActiveBrokerFilter: (broker: string) => void;
  isVaultLocked: boolean;
  lockVault: () => void;
  unlockVault: (unlockedPortfolios: Portfolio[]) => void;
  resetVault: () => void;
  changeVaultPin: (oldPin: string, newPin: string) => Promise<boolean>;
  disableVault: (pin: string) => Promise<boolean>;
  autoLockMinutes: number;
  setAutoLockMinutes: (min: number) => void;
  snapshots: PortfolioSnapshot[];
  createSnapshot: (description: string) => void;
  restoreSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
  holdings: Holding[];
  stats: PortfolioStats;
  switchPortfolio: (id: string) => void;
  createPortfolio: (name: string) => void;
  deletePortfolio: (id: string) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (tx: Transaction) => void;
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
  updateHoldingTags: (ticker: string, tags: string[]) => void;
  addRealEstate: (prop: RealEstateAsset) => void;
  updateRealEstate: (prop: RealEstateAsset) => void;
  deleteRealEstate: (id: string) => void;
  addDepositLadderItem: (item: DepositLadderItem) => void;
  updateDepositLadderItem: (item: DepositLadderItem) => void;
  deleteDepositLadderItem: (id: string) => void;
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
  const [isVaultLocked, setIsVaultLocked] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('finanz_encrypted_vault'));
  });

  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('finanz_autolock_minutes');
    return saved ? parseInt(saved, 10) : 15;
  });

  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>(() => {
    const saved = localStorage.getItem('finanz_snapshots');
    return saved ? JSON.parse(saved) : [];
  });

  const [holdingTagsMap, setHoldingTagsMap] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('finanz_holding_tags');
    return saved ? JSON.parse(saved) : {
      AAPL: ['#Core', '#Tech', '#Dividende'],
      EUNL: ['#Core', '#Weltweit'],
      BTC: ['#Satellite', '#Krypto']
    };
  });

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

  const [taxCountry, setTaxCountry] = useState<TaxCountry>(() => {
    return (localStorage.getItem('finanz_tax_country') as TaxCountry) || 'DE';
  });

  const [taxAllowanceEur, setTaxAllowanceEur] = useState<number>(() => {
    const saved = localStorage.getItem('finanz_tax_allowance');
    return saved ? parseFloat(saved) : 1000;
  });
  
  const [fxRates, setFxRates] = useState<Record<string, number>>({
    EUR: 1.0,
    USD: 1.08,
    CHF: 0.96,
    GBP: 0.85
  });

  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({
    AAPL: 191.45,
    EUNL: 87.65,
    BTC: 63450.00,
    MSFT: 415.50
  });

  // Save to localStorage
  useEffect(() => {
    if (!isVaultLocked) {
      localStorage.setItem('finanz_portfolios', JSON.stringify(portfolios));
    }
  }, [portfolios, isVaultLocked]);

  useEffect(() => {
    localStorage.setItem('finanz_tax_country', taxCountry);
  }, [taxCountry]);

  useEffect(() => {
    localStorage.setItem('finanz_tax_allowance', taxAllowanceEur.toString());
  }, [taxAllowanceEur]);

  useEffect(() => {
    localStorage.setItem('finanz_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    localStorage.setItem('finanz_holding_tags', JSON.stringify(holdingTagsMap));
  }, [holdingTagsMap]);

  useEffect(() => {
    localStorage.setItem('finanz_autolock_minutes', autoLockMinutes.toString());
  }, [autoLockMinutes]);

  useEffect(() => {
    localStorage.setItem('finanz_active_portfolio', activePortfolioId);
  }, [activePortfolioId]);

  const lockVault = () => {
    if (localStorage.getItem('finanz_encrypted_vault')) {
      setIsVaultLocked(true);
    }
  };

  // Change PIN with old PIN verification
  const changeVaultPin = async (oldPin: string, newPin: string): Promise<boolean> => {
    const cipher = localStorage.getItem('finanz_encrypted_vault');
    if (!cipher) return false;
    try {
      const decrypted = await decryptData(cipher, oldPin);
      const newCipher = await encryptData(decrypted, newPin);
      localStorage.setItem('finanz_encrypted_vault', newCipher);
      return true;
    } catch {
      return false;
    }
  };

  // Safely disable vault encryption
  const disableVault = async (pin: string): Promise<boolean> => {
    const cipher = localStorage.getItem('finanz_encrypted_vault');
    if (!cipher) {
      localStorage.removeItem('finanz_encrypted_vault');
      setIsVaultLocked(false);
      return true;
    }
    try {
      const decrypted = await decryptData(cipher, pin);
      const parsed = JSON.parse(decrypted);
      if (Array.isArray(parsed)) {
        setPortfolios(parsed);
      }
      localStorage.removeItem('finanz_encrypted_vault');
      setIsVaultLocked(false);
      return true;
    } catch {
      return false;
    }
  };

  // Activity listener for Auto-Lock
  useEffect(() => {
    if (isVaultLocked || autoLockMinutes <= 0) return;
    
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (localStorage.getItem('finanz_encrypted_vault')) {
          setIsVaultLocked(true);
        }
      }, autoLockMinutes * 60 * 1000);
    };

    resetTimer();
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, resetTimer));

    return () => {
      clearTimeout(timer);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [isVaultLocked, autoLockMinutes]);

  const unlockVault = (unlockedPortfolios: Portfolio[]) => {
    setPortfolios(unlockedPortfolios);
    setIsVaultLocked(false);
  };

  const resetVault = () => {
    localStorage.removeItem('finanz_encrypted_vault');
    setIsVaultLocked(false);
  };

  const activePortfolio = useMemo<Portfolio>(() => {
    if (activePortfolioId === 'FAMILY_ALL') {
      const allTxs = portfolios.flatMap(p => p.transactions || []);
      const allWatchlist = portfolios.flatMap(p => p.watchlist || []);
      const allSavings = portfolios.flatMap(p => p.savingsPlans || []);
      const allRealEstate = portfolios.flatMap(p => p.realEstate || []);
      const allDepositLadder = portfolios.flatMap(p => p.depositLadder || []);
      const allMapping = portfolios.flatMap(p => p.mappingRules || []);
      return {
        id: 'FAMILY_ALL',
        name: '👨‍👩‍👧‍👦 Familien-Gesamtsicht (Alle Portfolios)',
        transactions: allTxs,
        watchlist: allWatchlist,
        savingsPlans: allSavings,
        realEstate: allRealEstate,
        depositLadder: allDepositLadder,
        mappingRules: allMapping
      };
    }
    return portfolios.find(p => p.id === activePortfolioId) || portfolios[0] || DEFAULT_PORTFOLIO;
  }, [portfolios, activePortfolioId]);

  // Live Prices refresh handler: includes both transactions and watchlist tickers
  const refreshPrices = async () => {
    const cryptoPrices = await fetchLiveCryptoPrices();
    const fx = await fetchLiveExchangeRates();
    setFxRates(fx);
    
    const txTickers = (activePortfolio.transactions || []).map(t => t.ticker);
    const wlTickers = (activePortfolio.watchlist || []).map(w => w.ticker);
    const tickers = Array.from(new Set([...txTickers, ...wlTickers])).filter(t => t && t !== 'CASH');
    const stockPrices = await fetchLiveStockPrices(tickers);

    setCurrentPrices(prev => ({
      ...prev,
      ...cryptoPrices,
      ...stockPrices,
      ...fx
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
        tags: holdingTagsMap[a.ticker] || ['#Core'],
        cryptoTaxFreeShares: cryptoTaxFree
      };
    });
  }, [filteredTransactions, currentPrices, activePortfolio.transactions, holdingTagsMap]);

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

    const totalValWithCash = totalValue + cashBalance;
    const irr = calculateIRR(activePortfolio.transactions, totalValue, cashBalance);
    const ttwrr = calculateTTWRR(activePortfolio.transactions, totalValue, cashBalance);
    const realizedGains = calculateRealizedGains(activePortfolio.transactions);

    const dynamicRisk = calculateDynamicPortfolioRiskMetrics(
      activePortfolio.transactions,
      currentPrices,
      totalValWithCash,
      irr
    );

    return {
      totalValue: totalValWithCash,
      totalCost,
      totalGains,
      totalGainsPercent,
      dividendsReceived: divSum,
      cashBalance,
      irr,
      ttwrr,
      maxDrawdown: dynamicRisk.maxDrawdown,
      sharpeRatio: dynamicRisk.sharpeRatio,
      realizedGains,
      taxExemptionUsed: Math.min(taxAllowanceEur, realizedGains + divSum),
      taxCountry,
      taxAllowanceEur
    };
  }, [holdings, activePortfolio.transactions, cashBalance, currentPrices, taxAllowanceEur, taxCountry]);

  // Snapshots Management
  const createSnapshot = (description: string) => {
    const totalVal = holdings.reduce((sum, h) => sum + h.currentValue, 0) + cashBalance;
    const txCount = portfolios.reduce((sum, p) => sum + (p.transactions?.length || 0), 0);
    const newSnapshot: PortfolioSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleString('de-DE'),
      description,
      portfolios: JSON.parse(JSON.stringify(portfolios)),
      transactionCount: txCount,
      totalValueEur: Math.round(totalVal)
    };
    setSnapshots(prev => [newSnapshot, ...prev].slice(0, 5));
  };

  const restoreSnapshot = (snapshotId: string) => {
    const match = snapshots.find(s => s.id === snapshotId);
    if (match && match.portfolios) {
      createSnapshot(`Automatischer Stand vor Rollback auf "${match.description}"`);
      setPortfolios(match.portfolios);
    }
  };

  const deleteSnapshot = (snapshotId: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
  };

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
    createSnapshot(`Vor dem Löschen von Portfolio ID "${id}"`);
    const remaining = portfolios.filter(p => p.id !== id);
    setPortfolios(remaining);
    setActivePortfolioId(remaining[0].id);
  };

  const addTransaction = (tx: Transaction) => {
    const targetId = activePortfolioId === 'FAMILY_ALL' ? (portfolios[0]?.id || 'default') : activePortfolioId;
    setPortfolios(prev => prev.map(p => {
      if (p.id === targetId) {
        return { ...p, transactions: [tx, ...(p.transactions || [])] };
      }
      return p;
    }));
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setPortfolios(prev => prev.map(p => {
      const exists = (p.transactions || []).some(t => t.id === updatedTx.id);
      if (exists) {
        return {
          ...p,
          transactions: (p.transactions || []).map(t => t.id === updatedTx.id ? updatedTx : t)
        };
      }
      return p;
    }));
  };

  const deleteTransaction = (id: string) => {
    setPortfolios(prev => prev.map(p => {
      if (activePortfolioId === 'FAMILY_ALL' || p.id === activePortfolioId) {
        return { ...p, transactions: (p.transactions || []).filter(t => t.id !== id) };
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
    createSnapshot('Automatischer Stand vor Backup-Import');
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

  const updateHoldingTags = (ticker: string, tags: string[]) => {
    setHoldingTagsMap(prev => ({
      ...prev,
      [ticker]: tags
    }));
  };

  const addRealEstate = (prop: RealEstateAsset) => {
    const targetId = activePortfolioId === 'FAMILY_ALL' ? (portfolios[0]?.id || 'default') : activePortfolioId;
    setPortfolios(prev => prev.map(p => {
      if (p.id === targetId) {
        return { ...p, realEstate: [...(p.realEstate || []), prop] };
      }
      return p;
    }));
  };

  const updateRealEstate = (prop: RealEstateAsset) => {
    setPortfolios(prev => prev.map(p => {
      const exists = (p.realEstate || []).some(r => r.id === prop.id);
      if (exists) {
        return {
          ...p,
          realEstate: (p.realEstate || []).map(r => r.id === prop.id ? prop : r)
        };
      }
      return p;
    }));
  };

  const deleteRealEstate = (id: string) => {
    setPortfolios(prev => prev.map(p => {
      if (activePortfolioId === 'FAMILY_ALL' || p.id === activePortfolioId) {
        return { ...p, realEstate: (p.realEstate || []).filter(r => r.id !== id) };
      }
      return p;
    }));
  };

  const addDepositLadderItem = (item: DepositLadderItem) => {
    const targetId = activePortfolioId === 'FAMILY_ALL' ? (portfolios[0]?.id || 'default') : activePortfolioId;
    setPortfolios(prev => prev.map(p => {
      if (p.id === targetId) {
        return { ...p, depositLadder: [...(p.depositLadder || []), item] };
      }
      return p;
    }));
  };

  const updateDepositLadderItem = (item: DepositLadderItem) => {
    setPortfolios(prev => prev.map(p => {
      const exists = (p.depositLadder || []).some(d => d.id === item.id);
      if (exists) {
        return {
          ...p,
          depositLadder: (p.depositLadder || []).map(d => d.id === item.id ? item : d)
        };
      }
      return p;
    }));
  };

  const deleteDepositLadderItem = (id: string) => {
    setPortfolios(prev => prev.map(p => {
      if (activePortfolioId === 'FAMILY_ALL' || p.id === activePortfolioId) {
        return { ...p, depositLadder: (p.depositLadder || []).filter(d => d.id !== id) };
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
      fxRates,
      baseCurrency,
      setBaseCurrency,
      isDarkMode,
      setIsDarkMode,
      taxCountry,
      setTaxCountry,
      taxAllowanceEur,
      setTaxAllowanceEur,
      activeBrokerFilter,
      setActiveBrokerFilter,
      isVaultLocked,
      lockVault,
      unlockVault,
      resetVault,
      changeVaultPin,
      disableVault,
      autoLockMinutes,
      setAutoLockMinutes,
      snapshots,
      createSnapshot,
      restoreSnapshot,
      deleteSnapshot,
      holdings,
      stats,
      switchPortfolio,
      createPortfolio,
      deletePortfolio,
      addTransaction,
      updateTransaction,
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
      updateHoldingNotes,
      updateHoldingTags,
      addRealEstate,
      updateRealEstate,
      deleteRealEstate,
      addDepositLadderItem,
      updateDepositLadderItem,
      deleteDepositLadderItem
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
