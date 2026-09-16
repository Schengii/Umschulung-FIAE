export type AssetCategory = 'Stock' | 'ETF' | 'Crypto' | 'Bond' | 'Cash' | 'RealEstate' | 'P2P' | 'PreciousMetal';

export type TaxCountry = 'DE' | 'AT' | 'CH';

export type Sector = 'Technology' | 'Healthcare' | 'Financials' | 'Consumer' | 'Industrials' | 'Energy' | 'Utilities' | 'Real Estate' | 'Materials' | 'Communication' | 'Other';

export type Region = 'North America' | 'Europe' | 'Emerging Markets' | 'Asia Pacific' | 'Global' | 'Other';

export type BenchmarkIndex = 'MSCI_WORLD' | 'SP500' | 'DAX40' | 'BTC';

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
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL' | 'STAKING' | 'AIRDROP' | 'MINING' | 'FEE' | 'OPTION_PREMIUM' | 'OPTION_EXPIRE' | 'OPTION_ASSIGN' | 'INTEREST' | 'RENT_INCOME' | 'MAINTENANCE_EXPENSE';
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
  strikePrice?: number;
  expirationDate?: string;
  optionType?: 'CALL' | 'PUT';
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
  currency?: 'EUR' | 'USD' | 'CHF' | 'GBP';
  teilfreistellungRate?: number;
  notes?: string;
  tags?: string[];
}

export interface RealEstateAsset {
  id: string;
  name: string;
  purchaseDate: string;
  purchasePriceEur: number;
  currentMarketValueEur: number;
  monthlyRentalIncomeEur: number;
  monthlyOperatingCostsEur: number;
  loanBalanceEur: number;
  monthlyMortgagePaymentEur: number; // Zins + Tilgung
  interestRatePercent: number;
  squareMeters: number;
  location: string;
  notes?: string;
}

export interface DepositLadderItem {
  id: string;
  bankName: string;
  depositType: 'FESTGELD' | 'TAGESGELD' | 'SPARBRIEF';
  principalEur: number;
  interestRatePercent: number;
  startDate: string;
  maturityDate: string; // Fälligkeitsdatum
  payoutInterval: 'ANNUAL' | 'AT_MATURITY' | 'MONTHLY';
  isAutoRenew: boolean;
  notes?: string;
}

export interface P2PLoanItem {
  id: string;
  platform: string; // e.g. Bondora, Mintos, EstateGuru
  investedEur: number;
  currentValueEur: number;
  interestEarnedEur: number;
  averageInterestRatePercent: number;
  delayedAmountEur: number;
  defaultedAmountEur: number;
  autoInvestActive: boolean;
}

export interface FireWithdrawalConfig {
  initialPortfolioValue: number;
  monthlyExpensesEur: number;
  annualInflationPercent: number;
  expectedAnnualReturnPercent: number;
  expectedAnnualYieldPercent: number;
  retirementYears: number;
  withdrawalStrategy: 'FIXED_4_PERCENT' | 'VARIABLE_GUARDRAILS' | 'VPW' | 'CONSTANT_INFLATION_ADJUSTED';
  includeCapitalGainsTax: boolean;
  effectiveTaxRatePercent: number;
  monthlyHealthInsuranceEur: number;
}

export interface FireSimulationYearResult {
  year: number;
  age: number;
  startingValue: number;
  annualWithdrawal: number;
  monthlyWithdrawalEffective: number;
  investmentReturns: number;
  taxPaid: number;
  healthInsurancePaid: number;
  endingValue: number;
  isBankrupt: boolean;
}

export interface FireSimulationResult {
  success: boolean;
  ruinYear?: number;
  finalPortfolioValue: number;
  totalWithdrawn: number;
  yearlyBreakdown: FireSimulationYearResult[];
  safeWithdrawalRatePercent: number;
  sequenceRiskScore: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface DripComparisonResult {
  years: string[];
  withoutDripValue: number[];
  withDripValue: number[];
  totalDividendsReinvested: number;
  dripOutperformanceEur: number;
  dripOutperformancePercent: number;
}

export interface FxExposureItem {
  currency: 'EUR' | 'USD' | 'CHF' | 'GBP' | 'OTHER';
  valueEur: number;
  percentage: number;
  stressedValueEurDrop10Pct: number;
}

export interface FxExposureResult {
  exposures: FxExposureItem[];
  totalValueEur: number;
  foreignExposurePercent: number;
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
  interestReceived?: number;
  rentalCashflowNet?: number;
  cashBalance: number;
  irr: number;
  ttwrr: number;
  maxDrawdown: number;
  sharpeRatio: number;
  realizedGains: number;
  taxExemptionUsed: number;
  taxCountry?: TaxCountry;
  taxAllowanceEur?: number;
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
  realEstate?: RealEstateAsset[];
  depositLadder?: DepositLadderItem[];
  p2pLoans?: P2PLoanItem[];
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

export interface EsgScoreResult {
  overallScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  ratingGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  controversies: string[];
}

export interface OptionTrade {
  id: string;
  ticker: string;
  underlyingName: string;
  optionType: 'CALL' | 'PUT';
  strikePrice: number;
  expirationDate: string;
  contracts: number;
  premiumPerShare: number;
  totalPremiumEur: number;
  status: 'OPEN' | 'EXPIRED' | 'ASSIGNED' | 'CLOSED';
}

export interface PortfolioSnapshot {
  id: string;
  timestamp: string;
  description: string;
  portfolios: Portfolio[];
  transactionCount: number;
  totalValueEur: number;
}

export interface RebalancingPlanItem {
  ticker: string;
  name: string;
  category: AssetCategory;
  currentWeight: number;
  targetWeight: number;
  driftPercent: number;
  isWithinBand: boolean;
  action: 'BUY' | 'SELL' | 'HOLD';
  deltaEur: number;
  suggestedShares: number;
}

export interface FireMonteCarloSummary {
  simulationsRun: number;
  ruinProbabilityPercent: number;
  percentile10EndingValue: number;
  percentile50EndingValue: number;
  percentile90EndingValue: number;
  worstCaseRuinYear?: number;
  paths: { year: number; p10: number; p50: number; p90: number }[];
}




