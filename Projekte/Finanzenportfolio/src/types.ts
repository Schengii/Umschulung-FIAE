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
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL' | 'STAKING' | 'AIRDROP' | 'MINING' | 'FEE' | 'OPTION_PREMIUM' | 'OPTION_EXPIRE' | 'OPTION_ASSIGN' | 'INTEREST' | 'RENT_INCOME' | 'MAINTENANCE_EXPENSE' | 'FX_SWAP';
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
  fromCurrency?: 'EUR' | 'USD' | 'CHF' | 'GBP';
  toCurrency?: 'EUR' | 'USD' | 'CHF' | 'GBP';
  fromAmount?: number;
  toAmount?: number;
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
  terPercent?: number;
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
  annualDynamizationPercent?: number; // e.g. 2, 5 percent
  lastDynamizationDate?: string; // YYYY-MM-DD
  pausedUntilDate?: string; // e.g. '2026-12-31'
  minimumEmergencyCashBufferEur?: number; // threshold below which execution pauses
}

export type DividendAristocratTier = 'KING' | 'ARISTOCRAT' | 'CHAMPION' | 'CONTENDER' | 'CHALLENGER' | 'NONE';

export interface DividendGrowthAnalysis {
  ticker: string;
  name: string;
  yearsOfIncreases: number;
  tier: DividendAristocratTier;
  tierLabel: string;
  tierBadgeColor: string;
  cagr1y: number;
  cagr3y: number;
  cagr5y: number;
  cagr10y: number;
  payoutRatioEarningsPercent: number;
  payoutRatioFcfPercent: number;
  cutRisk: 'SAFE' | 'MODERATE' | 'HIGH_RISK';
}

export interface MultiCurrencyCashBalances {
  EUR: number;
  USD: number;
  CHF: number;
  GBP: number;
  totalEurEquivalent: number;
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

export interface PriceAlert {
  id: string;
  ticker: string;
  name: string;
  condition: 'ABOVE' | 'BELOW' | 'DAILY_DROP_PCT';
  targetValue: number;
  currentValue?: number;
  createdAt: string;
  triggeredAt?: string;
  isActive: boolean;
  notes?: string;
}

export interface BrokerStats {
  brokerName: string;
  holdingsCount: number;
  totalMarketValueEur: number;
  totalInvestedEur: number;
  totalGainEur: number;
  totalGainPercent: number;
  totalDividendsEur: number;
  totalFeesEur: number;
  transactionsCount: number;
  shareOfPortfolioPercent: number;
}

export interface RebalanceCategoryOrder {
  category: AssetCategory;
  currentValueEur: number;
  currentWeightPercent: number;
  targetWeightPercent: number;
  targetValueEur: number;
  driftPercent: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  orderValueEur: number;
  suggestedAssets: {
    ticker: string;
    name: string;
    currentPrice: number;
    suggestedShares: number;
    suggestedAmountEur: number;
  }[];
}

export interface RebalanceCalculationResult {
  mode: 'FULL' | 'CASHFLOW_ONLY';
  freshCapitalEur: number;
  totalPortfolioValueEur: number;
  postRebalanceValueEur: number;
  categoryOrders: RebalanceCategoryOrder[];
  totalBuyVolumeEur: number;
  totalSellVolumeEur: number;
}

export interface FundFeeItem {
  ticker: string;
  name: string;
  category: AssetCategory;
  currentValueEur: number;
  terPercent: number;
  annualCostEur: number;
  portfolioSharePercent: number;
}

export interface TerAnalysisResult {
  totalAnalyzedFundValueEur: number;
  weightedTerPercent: number;
  totalAnnualFeeEur: number;
  tenYearCompoundLossEur: number;
  twentyYearCompoundLossEur: number;
  thirtyYearCompoundLossEur: number;
  potentialSavingVsActiveFundEur: number;
  funds: FundFeeItem[];
  projection: {
    year: number;
    withoutFeesEur: number;
    withCurrentTerEur: number;
    withActiveFundFeeEur: number;
    cumulativeFeeLossEur: number;
  }[];
}

export interface CryptoLossLot {
  id: string;
  ticker: string;
  name: string;
  buyDate: string;
  daysHeld: number;
  daysRemainingInTaxYearWindow: number;
  amount: number;
  buyPriceEur: number;
  currentPriceEur: number;
  costBasisEur: number;
  currentValueEur: number;
  unrealizedLossEur: number;
  potentialTaxSavingsEur: number;
  isActionable: boolean;
}

export interface CryptoTaxLossHarvestingSummary {
  realizedGainsThisYearEur: number;
  totalHarvestableLossesEur: number;
  estimatedTaxSavingsEur: number;
  taxRatePercent: number;
  lots: CryptoLossLot[];
}

export interface CorrelationCluster {
  id: string;
  name: string;
  tickers: string[];
  averageCorrelation: number;
  riskDescription: string;
}

export interface CorrelationAnalysisResult {
  tickers: string[];
  names: Record<string, string>;
  categories: Record<string, AssetCategory>;
  matrix: Record<string, Record<string, number>>;
  averageCorrelation: number;
  diversificationScore: 'OPTIMAL' | 'MODERATE' | 'POOR';
  diversificationScorePercent: number; // 0 to 100
  clusters: CorrelationCluster[];
  recommendations: string[];
}

export interface FireWithdrawalSimulationParams {
  currentAge: number;
  retirementAge: number;
  targetAge: number; // e.g. 90 or 95
  currentPortfolioValue: number;
  annualReturnPercent: number;
  annualInflationPercent: number;
  monthlyBaseExpensesEur: number;
  monthlyHealthInsuranceEur: number;
  monthlyStatePensionEur: number; // Gesetzliche Rente ab Rentenalter
  statePensionStartAge: number; // e.g. 67
  monthlyCompanyPensionEur: number; // bAV / Zusatzrente
  companyPensionStartAge: number;
  withdrawalStrategy: 'CONSTANT_INFLATION_ADJUSTED' | 'GUYTON_KLINGER' | 'VPW' | 'FIXED_PERCENTAGE';
  initialWithdrawalRatePercent: number; // e.g. 3.5% or 4.0%
  bequestGoalEur: number; // Restvermögen für Erben (0 = vollständiger Verzehr)
}

export interface FireYearlyDetail {
  year: number;
  age: number;
  startingValue: number;
  portfolioGrowth: number;
  statePensionReceived: number;
  companyPensionReceived: number;
  grossExpensesNeeded: number;
  withdrawalAmount: number;
  healthInsurancePaid: number;
  taxesPaid: number;
  endingValue: number;
  isDepleted: boolean;
}

export interface FireWithdrawalSimulationResult {
  isSuccess: boolean;
  depletionAge?: number;
  finalPortfolioValueEur: number;
  totalWithdrawnEur: number;
  totalPensionReceivedEur: number;
  minPortfolioValueEur: number;
  yearlyDetails: FireYearlyDetail[];
  recommendation: string;
}

export interface SavingsMilestone {
  targetAmountEur: number;
  label: string;
  fixedScenarioMonth: number;
  dynamizedScenarioMonth: number;
  monthsSaved: number;
}

export interface SavingsGrowthYearPoint {
  year: number;
  age: number;
  fixedTotalEur: number;
  fixedContributionsEur: number;
  dynamizedTotalEur: number;
  dynamizedContributionsEur: number;
  stepUpTotalEur: number;
  stepUpContributionsEur: number;
}

export interface SavingsGrowthComparisonResult {
  initialCapitalEur: number;
  monthlyContributionEur: number;
  annualReturnPercent: number;
  annualDynamizationPercent: number;
  stepUpMonthlyEur: number;
  horizonYears: number;
  tenYearValueFixed: number;
  twentyYearValueFixed: number;
  thirtyYearValueFixed: number;
  tenYearValueDynamized: number;
  twentyYearValueDynamized: number;
  thirtyYearValueDynamized: number;
  extraWealthFromDynamization30Y: number;
  milestones: SavingsMilestone[];
  yearlyTrajectory: SavingsGrowthYearPoint[];
}
