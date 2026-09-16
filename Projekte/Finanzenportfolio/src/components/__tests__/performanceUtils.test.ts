import { describe, it, expect } from 'vitest';
import {
  calculateTTWRR,
  calculateMaxDrawdown,
  calculateSharpeRatio,
  calculateRealizedGains,
  calculateGermanTax,
  calculateCryptoTaxFreeShares,
  calculateVorabpauschale,
  calculateSectorAndRegionBreakdown,
  runMonteCarloSimulation,
  runStressTestScenarios,
  calculateAlphaBeta,
  calculateRebalancingOrders,
  calculateTaxLossHarvestingSuggestions
} from '../performanceUtils';
import { parseUniversalCsv } from '../../services/universalCsvImporter';
import type { Transaction, Holding } from '../../types';

describe('performanceUtils Financial Calculations', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      type: 'DEPOSIT',
      date: '01.01.2024',
      ticker: 'CASH',
      name: 'Deposit',
      amount: 10000,
      price: 1,
      fee: 0,
      tax: 0,
      category: 'Stock',
      currency: 'EUR'
    },
    {
      id: '2',
      type: 'BUY',
      date: '10.01.2024',
      ticker: 'AAPL',
      name: 'Apple',
      amount: 10,
      price: 150,
      fee: 2,
      tax: 0,
      category: 'Stock',
      currency: 'EUR'
    },
    {
      id: '3',
      type: 'BUY',
      date: '15.01.2024',
      ticker: 'EUNL',
      name: 'MSCI World ETF',
      amount: 50,
      price: 80,
      fee: 0,
      tax: 0,
      category: 'ETF',
      currency: 'EUR'
    },
    {
      id: '4',
      type: 'DIVIDEND',
      date: '10.06.2024',
      ticker: 'AAPL',
      name: 'Apple',
      amount: 10,
      price: 1.5,
      fee: 0,
      tax: 2.5,
      category: 'Stock',
      currency: 'EUR'
    },
    {
      id: '5',
      type: 'SELL',
      date: '20.06.2024',
      ticker: 'AAPL',
      name: 'Apple',
      amount: 5,
      price: 200,
      fee: 1,
      tax: 5,
      category: 'Stock',
      currency: 'EUR'
    }
  ];

  it('calculates TTWRR correctly', () => {
    const ttwrr = calculateTTWRR(sampleTransactions, 6000, 4500);
    expect(ttwrr).toBeGreaterThan(0);
  });

  it('calculates Maximum Drawdown', () => {
    const series = [100, 120, 90, 110, 80, 105];
    const maxDd = calculateMaxDrawdown(series);
    expect(maxDd).toBeCloseTo(33.33, 1);
  });

  it('calculates Sharpe Ratio', () => {
    const sharpe = calculateSharpeRatio(12, 15, 2);
    expect(sharpe).toBeCloseTo(0.666, 2);
  });

  it('calculates Realized Gains using FIFO', () => {
    const gains = calculateRealizedGains(sampleTransactions);
    expect(gains).toBeGreaterThan(200);
  });

  it('calculates German Tax with exemption', () => {
    const taxRes = calculateGermanTax(sampleTransactions, 1000);
    expect(taxRes.realizedGainsRaw).toBeGreaterThan(0);
    expect(taxRes.taxExemptionRemaining).toBeLessThanOrEqual(1000);
  });

  it('calculates Crypto Tax-Free status after 365 days', () => {
    const btcTxs: Transaction[] = [
      {
        id: 'btc-1',
        type: 'BUY',
        date: '01.01.2022',
        ticker: 'BTC',
        name: 'Bitcoin',
        amount: 1.5,
        price: 30000,
        fee: 5,
        tax: 0,
        category: 'Crypto'
      }
    ];

    const freeShares = calculateCryptoTaxFreeShares(btcTxs, 'BTC', new Date('2024-01-01'));
    expect(freeShares).toBe(1.5);
  });

  it('calculates Vorabpauschale for ETFs', () => {
    const holdings: Holding[] = [
      {
        ticker: 'EUNL',
        name: 'MSCI World ETF',
        category: 'ETF',
        shares: 100,
        averageBuyPrice: 80,
        currentPrice: 90,
        totalCost: 8000,
        currentValue: 9000,
        totalGain: 1000,
        totalGainPercent: 12.5,
        portfolioWeight: 100,
        yieldOnCost: 0,
        teilfreistellungRate: 0.30
      }
    ];

    const vorab = calculateVorabpauschale(holdings, 0.0229);
    expect(vorab).toBeCloseTo(89.77, 1);
  });

  it('calculates Sector and Region breakdowns', () => {
    const holdings: Holding[] = [
      {
        ticker: 'AAPL',
        name: 'Apple',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 150,
        currentPrice: 200,
        totalCost: 1500,
        currentValue: 2000,
        totalGain: 500,
        totalGainPercent: 33.3,
        portfolioWeight: 50,
        yieldOnCost: 1,
        sector: 'Technology',
        region: 'North America'
      },
      {
        ticker: 'EUNL',
        name: 'iShares Core MSCI World',
        category: 'ETF',
        shares: 20,
        averageBuyPrice: 80,
        currentPrice: 100,
        totalCost: 1600,
        currentValue: 2000,
        totalGain: 400,
        totalGainPercent: 25,
        portfolioWeight: 50,
        yieldOnCost: 0,
        sector: 'Financials',
        region: 'Global'
      }
    ];

    const breakdown = calculateSectorAndRegionBreakdown(holdings);
    expect(breakdown.sectors.length).toBe(2);
    expect(breakdown.regions.length).toBe(2);
    expect(breakdown.sectors[0].percentage).toBe(50);
  });

  it('runs Monte Carlo simulation with 1,000 trials', () => {
    const mc = runMonteCarloSimulation(10000, 200, 10, 7.0, 15.0, 100);
    expect(mc.percentile50.length).toBe(11);
    expect(mc.finalMedian).toBeGreaterThan(10000);
    expect(mc.finalHigh).toBeGreaterThan(mc.finalLow);
  });

  it('runs historical crisis stress tests', () => {
    const tests = runStressTestScenarios(50000);
    expect(tests.length).toBe(4);
    expect(tests[0].scenarioName).toContain('2008');
    expect(tests[0].portfolioLossEur).toBeGreaterThan(20000);
  });

  it('auto-detects and parses Universal CSV', () => {
    const sampleCsv = `Datum;Typ;Wertpapiername;ISIN;Stückzahl;Kurs\n01.01.2026;Kauf;Apple Inc.;US0378331002;10;180,00`;
    const res = parseUniversalCsv(sampleCsv);
    expect(res.detectedFormat).toContain('Portfolio Performance');
    expect(res.transactions.length).toBe(1);
    expect(res.transactions[0].name).toBe('Apple Inc.');
  });

  it('calculates Alpha and Beta metrics', () => {
    const pRets = [0.02, 0.03, -0.01, 0.04];
    const mRets = [0.015, 0.02, -0.012, 0.03];
    const metrics = calculateAlphaBeta(pRets, mRets, 2.0);
    expect(metrics.beta).toBeGreaterThan(0);
  });

  it('calculates optimal rebalancing orders for lump sum deposit', () => {
    const holdings: Holding[] = [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 150,
        currentPrice: 200,
        totalCost: 1500,
        currentValue: 2000,
        totalGain: 500,
        totalGainPercent: 33.3,
        portfolioWeight: 100,
        yieldOnCost: 1
      }
    ];

    const orders = calculateRebalancingOrders(holdings, 1000, { Stock: 100 });
    expect(orders.length).toBe(1);
    expect(orders[0].buyAmountEur).toBe(1000);
    expect(orders[0].buyShares).toBe(5);
  });

  it('calculates tax loss harvesting and exemption allowance suggestions', () => {
    const holdings: Holding[] = [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 100,
        currentPrice: 150,
        totalCost: 1000,
        currentValue: 1500,
        totalGain: 500,
        totalGainPercent: 50,
        portfolioWeight: 50,
        yieldOnCost: 2
      },
      {
        ticker: 'TSLA',
        name: 'Tesla Inc.',
        category: 'Stock',
        shares: 5,
        averageBuyPrice: 200,
        currentPrice: 100,
        totalCost: 1000,
        currentValue: 500,
        totalGain: -500,
        totalGainPercent: -50,
        portfolioWeight: 50,
        yieldOnCost: 0
      }
    ];

    const res = calculateTaxLossHarvestingSuggestions(holdings, 1000, 200);
    expect(res.unusedExemptionEur).toBe(800);
    expect(res.suggestions.length).toBeGreaterThan(0);
  });
});

import {
  simulateFireWithdrawal,
  calculateDripComparison,
  calculateFxExposure,
  calculateRealEstateMetrics,
  calculateDepositLadderStats,
  calculateEnhancedGermanTax,
  calculateCorrelationMatrix,
  calculateDividendSafetyScores,
  calculateCryptoStakingTaxSummary,
  calculateOptionGreeks,
  calculateDynamicSavingsGrowth,
  calculateCustomMacroScenarioImpact,
  calculateCryptoFifoTranches,
  calculateFxHedgingAnalysis,
  calculateDividendSeasonalityProfile,
  calculateBondDurationSensitivity,
  exportRebalancingOrdersToCsv,
  calculatePurchasingPowerTarget,
  calculateAssetClassCumulativeReturns,
  calculateEmergencyFundStatus,
  compareTwoPortfolios,
  calculateNextTarget2ExecutionDates
} from '../performanceUtils';
import { getEcbReferenceRate, convertWithEcbRate } from '../../services/fxRatesService';
import { parsePortfolioPerformanceCsv, exportToPortfolioPerformanceCsv } from '../../services/portfolioPerformanceImporter';
import { lookupIsinMetadata } from '../../services/isinMetadataService';

describe('New Major Financial Utilities & Extensions', () => {
  it('simulates FIRE withdrawal correctly with Guyton-Klinger Guardrails', () => {
    const res = simulateFireWithdrawal({
      initialPortfolioValue: 800000,
      monthlyExpensesEur: 2000,
      annualInflationPercent: 2.0,
      expectedAnnualReturnPercent: 7.0,
      expectedAnnualYieldPercent: 3.5,
      retirementYears: 30,
      withdrawalStrategy: 'VARIABLE_GUARDRAILS',
      includeCapitalGainsTax: true,
      effectiveTaxRatePercent: 18.5,
      monthlyHealthInsuranceEur: 300
    });

    expect(res.success).toBe(true);
    expect(res.yearlyBreakdown.length).toBe(30);
    expect(res.finalPortfolioValue).toBeGreaterThan(0);
    expect(res.totalWithdrawn).toBeGreaterThan(500000);
  });

  it('calculates DRIP dividend compounding outperformance', () => {
    const holdings: Holding[] = [
      {
        ticker: 'AAPL',
        name: 'Apple',
        category: 'Stock',
        shares: 100,
        averageBuyPrice: 150,
        currentPrice: 200,
        totalCost: 15000,
        currentValue: 20000,
        totalGain: 5000,
        totalGainPercent: 33.3,
        portfolioWeight: 100,
        yieldOnCost: 3.5
      }
    ];

    const dripRes = calculateDripComparison([], holdings, 10, 3.5, 6.0);
    expect(dripRes.years.length).toBe(11);
    expect(dripRes.dripOutperformanceEur).toBeGreaterThan(0);
    expect(dripRes.withDripValue[10]).toBeGreaterThan(dripRes.withoutDripValue[10]);
  });

  it('calculates multi-currency FX exposure and sensitivity', () => {
    const holdings: Holding[] = [
      {
        ticker: 'AAPL',
        name: 'Apple',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 150,
        currentPrice: 200,
        totalCost: 1500,
        currentValue: 2000,
        totalGain: 500,
        totalGainPercent: 33.3,
        portfolioWeight: 50,
        yieldOnCost: 1,
        region: 'North America',
        currency: 'USD'
      },
      {
        ticker: 'SAP',
        name: 'SAP SE',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 150,
        currentPrice: 200,
        totalCost: 1500,
        currentValue: 2000,
        totalGain: 500,
        totalGainPercent: 33.3,
        portfolioWeight: 50,
        yieldOnCost: 1,
        region: 'Europe',
        currency: 'EUR'
      }
    ];

    const fxRes = calculateFxExposure(holdings, []);
    expect(fxRes.totalValueEur).toBe(4000);
    expect(fxRes.foreignExposurePercent).toBe(50);
  });

  it('calculates real estate metrics, equity and cashflow', () => {
    const metrics = calculateRealEstateMetrics([
      {
        id: 're-1',
        name: 'Apartment Berlin',
        location: 'Berlin',
        purchaseDate: '01.01.2020',
        purchasePriceEur: 300000,
        currentMarketValueEur: 350000,
        loanBalanceEur: 200000,
        monthlyRentalIncomeEur: 1200,
        monthlyOperatingCostsEur: 200,
        monthlyMortgagePaymentEur: 800,
        interestRatePercent: 2.5,
        squareMeters: 65
      }
    ]);

    expect(metrics.netEquityEur).toBe(150000);
    expect(metrics.monthlyNetCashflow).toBe(200); // 1200 - 200 - 800
    expect(metrics.grossRentalYieldPercent).toBeCloseTo(4.11, 1);
  });

  it('calculates deposit ladder weighted interest and maturities', () => {
    const stats = calculateDepositLadderStats([
      {
        id: 'dep-1',
        bankName: 'ING',
        depositType: 'FESTGELD',
        principalEur: 10000,
        interestRatePercent: 3.5,
        startDate: '01.01.2026',
        maturityDate: '01.01.2027',
        payoutInterval: 'AT_MATURITY',
        isAutoRenew: false
      }
    ]);

    expect(stats.totalDeposited).toBe(10000);
    expect(stats.averageInterestRatePercent).toBe(3.5);
    expect(stats.annualInterestIncome).toBe(350);
  });

  it('calculates enhanced German tax with loss pools and Günstigerprüfung', () => {
    const txs: Transaction[] = [
      {
        id: 'tx-sell-loss',
        type: 'SELL',
        date: '01.03.2026',
        ticker: 'TSLA',
        name: 'Tesla Inc.',
        amount: 10,
        price: 100,
        fee: 0,
        tax: 0,
        category: 'Stock'
      }
    ];

    const taxRes = calculateEnhancedGermanTax(txs, 1000, 500, 200, 18);
    expect(taxRes.stockLossPoolRemainingEur).toBeGreaterThanOrEqual(500);
    expect(taxRes.generalLossPoolRemainingEur).toBeGreaterThanOrEqual(200);
  });

  it('parses and exports Portfolio Performance CSV correctly', () => {
    const sampleTxs: Transaction[] = [
      {
        id: 'tx-1',
        type: 'BUY',
        date: '15.01.2026',
        ticker: 'AAPL',
        name: 'Apple Inc.',
        amount: 10,
        price: 180,
        fee: 1,
        tax: 0,
        category: 'Stock',
        currency: 'EUR'
      }
    ];

    const csvOutput = exportToPortfolioPerformanceCsv(sampleTxs);
    expect(csvOutput).toContain('Apple Inc.');
    expect(csvOutput).toContain('Kauf');

    const imported = parsePortfolioPerformanceCsv(csvOutput);
    expect(imported.length).toBe(1);
    expect(imported[0].ticker).toBe('AAPL');
    expect(imported[0].amount).toBe(10);
  });

  it('accurately enriches ISIN metadata for top global ETFs and Equities', () => {
    const msciWorldMeta = lookupIsinMetadata('IE00B4L5Y983');
    expect(msciWorldMeta.ticker).toBe('EUNL');
    expect(msciWorldMeta.category).toBe('ETF');
    expect(msciWorldMeta.region).toBe('Global');
    expect(msciWorldMeta.terPercent).toBe(0.20);

    const appleMeta = lookupIsinMetadata('US0378331002');
    expect(appleMeta.ticker).toBe('AAPL');
    expect(appleMeta.sector).toBe('Technology');
    expect(appleMeta.region).toBe('North America');

    const heuristicMeta = lookupIsinMetadata('CUSTOM_TECH_ETF', 'iShares Global Clean Energy UCITS ETF');
    expect(heuristicMeta.category).toBe('ETF');
    expect(heuristicMeta.sector).toBe('Energy');
  });

  it('calculates Pearson correlation matrix and diversification score', () => {
    const sampleHoldings: Holding[] = [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 150,
        currentPrice: 200,
        totalCost: 1500,
        currentValue: 2000,
        totalGain: 500,
        totalGainPercent: 33.3,
        portfolioWeight: 50,
        yieldOnCost: 0.5,
        sector: 'Technology',
        region: 'North America'
      },
      {
        ticker: 'BTC',
        name: 'Bitcoin',
        category: 'Crypto',
        shares: 0.1,
        averageBuyPrice: 50000,
        currentPrice: 60000,
        totalCost: 5000,
        currentValue: 6000,
        totalGain: 1000,
        totalGainPercent: 20,
        portfolioWeight: 50,
        yieldOnCost: 0,
        region: 'Global'
      }
    ];

    const corr = calculateCorrelationMatrix(sampleHoldings);
    expect(corr.tickers.length).toBe(2);
    expect(corr.matrix['AAPL']['AAPL']).toBe(1.0);
    expect(corr.matrix['AAPL']['BTC']).toBeLessThan(0.5);
    expect(corr.diversificationScore).toBe('OPTIMAL');
  });

  it('calculates Dividend Safety Scores & Aristocrat Status', () => {
    const holdings: Holding[] = [
      {
        ticker: 'JNJ',
        name: 'Johnson & Johnson',
        category: 'Stock',
        shares: 20,
        averageBuyPrice: 140,
        currentPrice: 160,
        totalCost: 2800,
        currentValue: 3200,
        totalGain: 400,
        totalGainPercent: 14.3,
        portfolioWeight: 100,
        yieldOnCost: 3.2
      }
    ];

    const scores = calculateDividendSafetyScores(holdings, []);
    expect(scores.length).toBe(1);
    expect(scores[0].aristocratStatus).toBe('KING');
    expect(scores[0].safetyScore).toBeGreaterThanOrEqual(90);
    expect(scores[0].safetyTier).toBe('SEHR_SICHER');
  });

  it('tracks Crypto Staking Tax under 256 Euro Freigrenze', () => {
    const txs: Transaction[] = [
      {
        id: 'st-1',
        type: 'STAKING',
        date: '10.02.2026',
        ticker: 'SOL',
        name: 'Solana Staking Reward',
        amount: 1,
        price: 150,
        fee: 0,
        tax: 0,
        category: 'Crypto',
        currency: 'EUR'
      }
    ];

    const summary = calculateCryptoStakingTaxSummary(txs, 30);
    expect(summary.totalStakingIncomeEur).toBe(150);
    expect(summary.isTaxFree).toBe(true);
    expect(summary.taxableStakingIncomeEur).toBe(0);

    // Over limit test
    const txsOver: Transaction[] = [
      ...txs,
      {
        id: 'st-2',
        type: 'STAKING',
        date: '15.03.2026',
        ticker: 'SOL',
        name: 'Solana Reward 2',
        amount: 1,
        price: 150,
        fee: 0,
        tax: 0,
        category: 'Crypto',
        currency: 'EUR'
      }
    ];

    const summaryOver = calculateCryptoStakingTaxSummary(txsOver, 30);
    expect(summaryOver.totalStakingIncomeEur).toBe(300);
    expect(summaryOver.isTaxFree).toBe(false);
    expect(summaryOver.taxableStakingIncomeEur).toBe(300);
    expect(summaryOver.estimatedIncomeTaxEur).toBe(90);
  });

  it('calculates Option Greeks with Black-Scholes approximation', () => {
    const putGreeks = calculateOptionGreeks(100, 100, 30, 20, 3.0, 'PUT');
    expect(putGreeks.delta).toBeLessThan(0);
    expect(putGreeks.delta).toBeGreaterThan(-1);
    expect(putGreeks.thetaDaily).toBeDefined();

    const callGreeks = calculateOptionGreeks(100, 100, 30, 20, 3.0, 'CALL');
    expect(callGreeks.delta).toBeGreaterThan(0);
    expect(callGreeks.delta).toBeLessThan(1);
  });

  it('simulates Dynamic Savings Growth with career escalator raises', () => {
    const res = calculateDynamicSavingsGrowth(200, 3.0, 7.0, 10);
    expect(res.years.length).toBe(10);
    expect(res.dynamicTotalValue[9]).toBeGreaterThan(res.constantTotalValue[9]);
    expect(res.outperformanceEur).toBeGreaterThan(0);
  });

  it('calculates custom macro scenario stress tests and worst hit asset', () => {
    const holdings: Holding[] = [
      {
        ticker: 'NVDA',
        name: 'NVIDIA Corp.',
        category: 'Stock',
        sector: 'Technology',
        shares: 10,
        averageBuyPrice: 100,
        currentPrice: 150,
        totalCost: 1000,
        currentValue: 1500,
        totalGain: 500,
        totalGainPercent: 50,
        portfolioWeight: 100,
        yieldOnCost: 0.1
      }
    ];

    const scenario = {
      name: 'Tech Shock',
      stockShockPercent: -20,
      cryptoShockPercent: -50,
      commodityShockPercent: 10,
      techSectorExtraShockPercent: -15
    };

    const impact = calculateCustomMacroScenarioImpact(holdings, scenario);
    expect(impact.percentageLoss).toBe(35); // -20% stock + -15% tech
    expect(impact.worstHitHolding?.ticker).toBe('NVDA');
  });

  it('calculates Crypto FiFo Tranches and Tax-Free eligibility', () => {
    const txs: Transaction[] = [
      {
        id: 'tx-old',
        type: 'BUY',
        date: '01.01.2024',
        ticker: 'BTC',
        name: 'Bitcoin',
        amount: 0.5,
        price: 40000,
        fee: 0,
        tax: 0,
        category: 'Crypto',
        currency: 'EUR'
      },
      {
        id: 'tx-new',
        type: 'BUY',
        date: '01.08.2026',
        ticker: 'ETH',
        name: 'Ethereum',
        amount: 2,
        price: 3000,
        fee: 0,
        tax: 0,
        category: 'Crypto',
        currency: 'EUR'
      }
    ];

    const currentPrices = { BTC: 60000, ETH: 2500 };
    const res = calculateCryptoFifoTranches(txs, currentPrices);

    expect(res.tranches.length).toBe(2);
    const btcTranche = res.tranches.find(t => t.ticker === 'BTC');
    const ethTranche = res.tranches.find(t => t.ticker === 'ETH');

    expect(btcTranche?.isTaxFree).toBe(true);
    expect(ethTranche?.isTaxFree).toBe(false);
    expect(ethTranche?.canHarvestLoss).toBe(true); // Loss of 1000 EUR
    expect(res.harvestableLossesEur).toBe(1000);
  });

  it('calculates FX Hedging analysis and risk reduction', () => {
    const usdHoldings: Holding[] = [
      {
        ticker: 'MSFT',
        name: 'Microsoft',
        category: 'Stock',
        currency: 'USD',
        shares: 10,
        averageBuyPrice: 300,
        currentPrice: 400,
        totalCost: 3000,
        currentValue: 4000,
        totalGain: 1000,
        totalGainPercent: 33.3,
        portfolioWeight: 100,
        yieldOnCost: 0.8
      }
    ];

    const res = calculateFxHedgingAnalysis(usdHoldings, 50, 1.2);
    expect(res.totalNonEurValueEur).toBe(4000);
    expect(res.hedgedAmountEur).toBe(2000);
    expect(res.annualHedgingCostEur).toBe(24);
  });

  it('calculates Dividend Seasonality profile across 12 months', () => {
    const divTxs: Transaction[] = [
      {
        id: 'div-1',
        type: 'DIVIDEND',
        date: '15.05.2026',
        ticker: 'ALV',
        name: 'Allianz',
        amount: 10,
        price: 13.80,
        fee: 0,
        tax: 0,
        category: 'Stock',
        currency: 'EUR'
      }
    ];

    const profile = calculateDividendSeasonalityProfile(divTxs);
    expect(profile.length).toBe(12);
    expect(profile[4].monthName).toBe('Mai');
    expect(profile[4].totalDividendsEur).toBe(138);
  });

  it('calculates Bond Duration and interest rate sensitivity', () => {
    const bondHoldings: Holding[] = [
      {
        ticker: 'AGGH',
        name: 'iShares Core Global Aggregate Bond UCITS ETF',
        category: 'Bond',
        shares: 100,
        averageBuyPrice: 5,
        currentPrice: 5,
        totalCost: 500,
        currentValue: 500,
        totalGain: 0,
        totalGainPercent: 0,
        portfolioWeight: 100,
        yieldOnCost: 3.5
      }
    ];

    const res = calculateBondDurationSensitivity(bondHoldings, 100);
    expect(res.bondHoldingsValueEur).toBe(500);
    expect(res.estimatedPriceChangePercent).toBe(-6.5);
    expect(Math.abs(res.estimatedValueImpactEur)).toBeLessThanOrEqual(33);
  });

  it('exports Rebalancing Orders to standard CSV format', () => {
    const orders = [
      {
        ticker: 'MSFT',
        name: 'Microsoft Corp.',
        buyAmountEur: 1000,
        buyShares: 2.5,
        estimatedFeeEur: 1.0,
        category: 'Stock',
        currentShares: 10,
        currentValue: 4000,
        targetWeightPct: 20.0,
        targetValue: 5000
      }
    ];

    const csv = exportRebalancingOrdersToCsv(orders as any, 'EUR');
    expect(csv).toContain('Ticker;Name;Kaufbetrag');
    expect(csv).toContain('MSFT;"Microsoft Corp.";1000.00;2.5000;1.00');
  });

  it('calculates Purchasing Power Target and time to goal', () => {
    const res = calculatePurchasingPowerTarget(1000000, 100000, 1000, 7.0, 2.0);
    expect(res.isGoalReached).toBe(true);
    expect(res.yearsToTarget).toBeLessThan(35);
    expect(res.realPurchasingPowerEur).toBeLessThan(1000000);
    expect(res.purchasingPowerLossPercent).toBeGreaterThan(0);
  });

  it('converts currencies accurately with historical ECB reference rates', () => {
    const rateUsd = getEcbReferenceRate('USD', '15.08.2026');
    expect(rateUsd).toBe(1.085);
    const converted = convertWithEcbRate(1085, 'USD', 'EUR', '15.08.2026');
    expect(Math.round(converted)).toBe(1000);
  });

  it('calculates Asset Class Cumulative Returns timeline points', () => {
    const holdings: Holding[] = [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 150,
        currentPrice: 200,
        totalCost: 1500,
        currentValue: 2000,
        totalGain: 500,
        totalGainPercent: 33.3,
        portfolioWeight: 50,
        yieldOnCost: 0.5
      },
      {
        ticker: 'VWCE',
        name: 'Vanguard FTSE All-World',
        category: 'ETF',
        shares: 20,
        averageBuyPrice: 100,
        currentPrice: 120,
        totalCost: 2000,
        currentValue: 2400,
        totalGain: 400,
        totalGainPercent: 20.0,
        portfolioWeight: 50,
        yieldOnCost: 1.8
      }
    ];

    const timeline = calculateAssetClassCumulativeReturns(holdings);
    expect(timeline.length).toBe(5);
    expect(timeline[0].dateLabel).toBe('Start');
    expect(timeline[4].Aktien).toBe(33.3);
    expect(timeline[4].ETFs).toBe(20.0);
  });

  it('calculates Emergency Fund & Liquidity status', () => {
    const fund = calculateEmergencyFundStatus(2000, 6000, 3);
    expect(fund.targetAmountEur).toBe(6000);
    expect(fund.coveredMonths).toBe(3.0);
    expect(fund.progressPercent).toBe(100);
    expect(fund.status).toBe('HEALTHY');
  });

  it('compares two portfolios side-by-side', () => {
    const holdingsA: Holding[] = [{ ticker: 'A', name: 'Alpha', category: 'Stock', shares: 1, averageBuyPrice: 100, currentPrice: 150, totalCost: 100, currentValue: 150, totalGain: 50, totalGainPercent: 50, portfolioWeight: 100, yieldOnCost: 0 }];
    const holdingsB: Holding[] = [{ ticker: 'B', name: 'Beta', category: 'Stock', shares: 1, averageBuyPrice: 100, currentPrice: 120, totalCost: 100, currentValue: 120, totalGain: 20, totalGainPercent: 20, portfolioWeight: 100, yieldOnCost: 0 }];

    const comp = compareTwoPortfolios(holdingsA, holdingsB);
    expect(comp.outperformer).toBe('A');
    expect(comp.outperformancePercent).toBe(30.0);
  });

  it('calculates Target2 bank holiday & weekend shifts for savings plans', () => {
    const dates = calculateNextTarget2ExecutionDates(1, 3);
    expect(dates.length).toBe(3);
    expect(dates[0].intendedDate).toBeDefined();
    expect(dates[0].actualExecutionDate).toBeDefined();
  });
});

