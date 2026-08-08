export type AssetCategory = 'Stock' | 'ETF' | 'Crypto' | 'Bond' | 'Cash' | 'RealEstate' | 'P2P';

export type Sector = 'Technology' | 'Healthcare' | 'Financials' | 'Consumer' | 'Industrials' | 'Energy' | 'Utilities' | 'Real Estate' | 'Other';

export type Region = 'North America' | 'Europe' | 'Emerging Markets' | 'Asia Pacific' | 'Global' | 'Other';

export interface AssetMappingRule {
  id: string;
  pattern: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  sector?: Sector;
  region?: Region;
  broker?: string;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL' | 'STAKING';
  date: string;
  ticker: string;
  name: string;
  amount: number;
  price: number;
  fee: number;
  tax: number;
  category: AssetCategory;
  sector?: Sector;
  region?: Region;
  broker?: string;
  currency?: 'EUR' | 'USD' | 'CHF' | 'GBP';
  exchangeRate?: number;
  notes?: string;
}

export interface Holding {
  ticker: string;
  name: string;
  category: AssetCategory;
  shares: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  totalGain: number;
  totalGainPercent: number;
  portfolioWeight: number;
  yieldOnCost: number;
  assetGainEur?: number;
  fxGainEur?: number;
  cryptoTaxFreeShares?: number;
  sector?: Sector;
  region?: Region;
  broker?: string;
  teilfreistellungRate?: number;
  notes?: string;
  tags?: string[];
}

export interface TargetAllocation {
  category: AssetCategory;
  weight: number;
}

export interface TaxLossPools {
  stockLossPool: number;
  generalLossPool: number;
  vorabpauschaleEstimate: number;
  taxExemptionUsed: number;
  teilfreistellungTaxSaved: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalGains: number;
  totalGainsPercent: number;
  dividendsReceived: number;
  cashBalance: number;
  irr: number;
  ttwrr: number;
  maxDrawdown: number;
  sharpeRatio: number;
  realizedGains: number;
  taxExemptionUsed: number;
  stakingRewards?: number;
  vorabpauschaleEstimate?: number;
  stockLossPool?: number;
  generalLossPool?: number;
  teilfreistellungTaxSaved?: number;
}

export interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  targetPrice: number;
  notes?: string;
  addedAt: string;
}

export interface SavingsPlan {
  id: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  amount: number;
  isActive: boolean;
  sector?: Sector;
  region?: Region;
  broker?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  transactions: Transaction[];
  watchlist: WatchlistItem[];
  savingsPlans?: SavingsPlan[];
  targetAllocations?: TargetAllocation[];
  mappingRules?: AssetMappingRule[];
  taxLossPools?: TaxLossPools;
}

export interface BenchmarkSeries {
  name: string;
  ticker: string;
  color: string;
  data: { date: string; value: number; changePercent: number }[];
}

export interface MarketPriceData {
  ticker: string;
  price: number;
  change24h?: number;
  updatedAt: string;
}

export interface MonteCarloResult {
  percentile10: number[];
  percentile50: number[];
  percentile90: number[];
  years: number[];
  finalMedian: number;
  finalLow: number;
  finalHigh: number;
}

export interface StressTestResult {
  scenarioName: string;
  dropPercent: number;
  portfolioLossEur: number;
  portfolioNewValueEur: number;
  recoveryMonthsEstimate: number;
}

export interface HealthAuditIssue {
  id: string;
  type: 'WARNING' | 'CRITICAL' | 'INFO';
  title: string;
  description: string;
  suggestion: string;
  affectedTickers?: string[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'INVESTOR' | 'DIVIDEND' | 'TAX' | 'MILESTONE';
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
}

export interface AttributionBreakdown {
  startingValue: number;
  capitalGains: number;
  dividendsReceived: number;
  fxGain: number;
  feesPaid: number;
  taxesPaid: number;
  finalValue: number;
}

