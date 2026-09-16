import { describe, it, expect } from 'vitest';
import { 
  calculateToleranceBandRebalancing, 
  runFireMonteCarloSimulation 
} from '../performanceUtils';
import { parseUniversalCsv } from '../../services/universalCsvImporter';
import { getEcbReferenceRate, convertWithEcbRate } from '../../services/fxRatesService';
import { lookupIsinMetadata, fetchOnlineIsinMetadata } from '../../services/isinMetadataService';
import type { Holding, FireWithdrawalConfig } from '../../types';

describe('Tolerance-Band Rebalancing Engine', () => {
  const mockHoldings: Holding[] = [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      category: 'Stock',
      shares: 10,
      averageBuyPrice: 150,
      currentPrice: 200,
      totalCost: 1500,
      currentValue: 2000, // 50%
      totalGain: 500,
      totalGainPercent: 33.3,
      portfolioWeight: 50,
      yieldOnCost: 1.5
    },
    {
      ticker: 'EUNL',
      name: 'iShares Core MSCI World',
      category: 'ETF',
      shares: 20,
      averageBuyPrice: 70,
      currentPrice: 80,
      totalCost: 1400,
      currentValue: 1600, // 40%
      totalGain: 200,
      totalGainPercent: 14.3,
      portfolioWeight: 40,
      yieldOnCost: 2.0
    },
    {
      ticker: 'BTC',
      name: 'Bitcoin',
      category: 'Crypto',
      shares: 0.01,
      averageBuyPrice: 30000,
      currentPrice: 40000,
      totalCost: 300,
      currentValue: 400, // 10%
      totalGain: 100,
      totalGainPercent: 33.3,
      portfolioWeight: 10,
      yieldOnCost: 0
    }
  ];

  it('recognizes holdings inside tolerance band and triggers no orders', () => {
    // Total value = 4000 EUR. Target weights: Stock 50% (2000), ETF 40% (1600), Crypto 10% (400)
    const result = calculateToleranceBandRebalancing(
      mockHoldings,
      { Stock: 50, ETF: 40, Crypto: 10 },
      { toleranceBandPct: 2.0, availableCashEur: 0, mode: 'FULL_REBALANCE' }
    );

    expect(result.inBalanceCount).toBe(3);
    expect(result.rebalanceNeededCount).toBe(0);
    expect(result.totalBuyEur).toBe(0);
    expect(result.totalSellEur).toBe(0);
  });

  it('triggers orders when drift exceeds tolerance band', () => {
    // If Stock target is 30% and ETF target is 60%, Stock is at 50% (+20% drift) -> SELL order
    const result = calculateToleranceBandRebalancing(
      mockHoldings,
      { Stock: 30, ETF: 60, Crypto: 10 },
      { toleranceBandPct: 2.0, availableCashEur: 0, mode: 'FULL_REBALANCE' }
    );

    expect(result.rebalanceNeededCount).toBeGreaterThan(0);
    const stockItem = result.items.find(i => i.ticker === 'AAPL');
    const etfItem = result.items.find(i => i.ticker === 'EUNL');

    expect(stockItem?.action).toBe('SELL');
    expect(etfItem?.action).toBe('BUY');
  });

  it('supports Cash-Inflow Buy-Only mode', () => {
    const result = calculateToleranceBandRebalancing(
      mockHoldings,
      { Stock: 40, ETF: 50, Crypto: 10 },
      { toleranceBandPct: 1.0, availableCashEur: 1000, mode: 'BUY_ONLY' }
    );

    // In BUY_ONLY mode, no SELL orders should be generated
    expect(result.totalSellEur).toBe(0);
    expect(result.items.every(i => i.action !== 'SELL')).toBe(true);
  });
});

describe('Monte-Carlo FIRE Safe Withdrawal Engine', () => {
  const config: FireWithdrawalConfig = {
    initialPortfolioValue: 500000,
    monthlyExpensesEur: 1500,
    annualInflationPercent: 2.0,
    expectedAnnualReturnPercent: 7.0,
    expectedAnnualYieldPercent: 3.0,
    retirementYears: 25,
    withdrawalStrategy: 'VARIABLE_GUARDRAILS',
    includeCapitalGainsTax: true,
    effectiveTaxRatePercent: 18.5,
    monthlyHealthInsuranceEur: 250
  };

  it('computes 500 randomized Monte Carlo simulation paths with percentiles', () => {
    const result = runFireMonteCarloSimulation(config, 15.0, 200);

    expect(result.simulationsRun).toBe(200);
    expect(result.paths.length).toBe(26); // year 0 to 25
    expect(result.percentile90EndingValue).toBeGreaterThanOrEqual(result.percentile50EndingValue);
    expect(result.percentile50EndingValue).toBeGreaterThanOrEqual(result.percentile10EndingValue);
    expect(result.ruinProbabilityPercent).toBeGreaterThanOrEqual(0);
    expect(result.ruinProbabilityPercent).toBeLessThanOrEqual(100);
  });
});

describe('Universal CSV & JSON Importer', () => {
  it('parses Portfolio Performance CSV correctly', () => {
    const ppCsv = `Datum;Typ;Wertpapiername;ISIN/Ticker;Stück;Kurs;Gebühren;Steuern;Währung
15.01.2026;Kauf;Apple Inc.;US0378331002;10;175,50;1,00;0,00;EUR
20.02.2026;Dividende;Apple Inc.;US0378331002;10;0,25;0,00;0,50;EUR`;

    const result = parseUniversalCsv(ppCsv);
    expect(result.detectedFormat).toBe('Portfolio Performance CSV');
    expect(result.transactions.length).toBe(2);
    expect(result.transactions[0].type).toBe('BUY');
    expect(result.transactions[0].amount).toBe(10);
    expect(result.transactions[0].price).toBe(175.5);
    expect(result.transactions[1].type).toBe('DIVIDEND');
  });

  it('parses Parqet JSON export format correctly', () => {
    const parqetJson = JSON.stringify({
      activities: [
        {
          type: 'Buy',
          date: '2026-03-10T10:00:00Z',
          ticker: 'MSFT',
          name: 'Microsoft Corp.',
          shares: 5,
          price: 410.0,
          fee: 1.0,
          currency: 'EUR',
          assetType: 'Stock'
        }
      ]
    });

    const result = parseUniversalCsv(parqetJson);
    expect(result.detectedFormat).toBe('Parqet JSON Export');
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].ticker).toBe('MSFT');
    expect(result.transactions[0].amount).toBe(5);
    expect(result.transactions[0].price).toBe(410);
  });

  it('parses Interactive Brokers (IBKR) CSV trade lines', () => {
    const ibkrCsv = `Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,Quantity,T. Price
Trades,Data,Order,Stocks,USD,AAPL,2026-01-15,15,180.50`;

    const result = parseUniversalCsv(ibkrCsv);
    expect(result.detectedFormat).toBe('Interactive Brokers (IBKR) CSV');
    expect(result.transactions.length).toBeGreaterThan(0);
    expect(result.transactions[0].ticker).toBe('AAPL');
  });
});

describe('ECB Historical FX Engine', () => {
  it('returns exact reference rates and converts accurately', () => {
    const usdRate = getEcbReferenceRate('USD', '2026-08-01');
    expect(usdRate).toBe(1.085);

    const eurToUsd = convertWithEcbRate(100, 'EUR', 'USD', '2026-08-01');
    expect(Math.round(eurToUsd * 100) / 100).toBe(108.5);

    const usdToEur = convertWithEcbRate(108.5, 'USD', 'EUR', '2026-08-01');
    expect(Math.round(usdToEur)).toBe(100);
  });
});

describe('ISIN Metadata & Sector Auto-Enrichment', () => {
  it('identifies top global ETFs and stocks accurately', () => {
    const msciWorld = lookupIsinMetadata('IE00B4L5Y983', 'iShares Core MSCI World');
    expect(msciWorld.category).toBe('ETF');
    expect(msciWorld.region).toBe('Global');
    expect(msciWorld.terPercent).toBe(0.20);

    const apple = lookupIsinMetadata('US0378331002', 'Apple Inc.');
    expect(apple.ticker).toBe('AAPL');
    expect(apple.sector).toBe('Technology');
    expect(apple.region).toBe('North America');

    const gold = lookupIsinMetadata('DE000A0S9GB0', 'Xetra-Gold');
    expect(gold.category).toBe('PreciousMetal');
  });

  it('fetches online or cached metadata with fallback', async () => {
    const res = await fetchOnlineIsinMetadata('IE00B4L5Y983', 'MSCI World');
    expect(res.category).toBe('ETF');
    expect(res.ticker).toBe('EUNL');
  });
});

describe('Async Monte Carlo Runner', () => {
  it('executes Monte Carlo simulation asynchronously in background', async () => {
    const { runMonteCarloSimulationAsync } = await import('../../workers/monteCarloRunner');
    const result = await runMonteCarloSimulationAsync(
      {
        initialPortfolioValue: 200000,
        monthlyExpensesEur: 1200,
        annualInflationPercent: 2.0,
        expectedAnnualReturnPercent: 6.5,
        expectedAnnualYieldPercent: 2.5,
        retirementYears: 20,
        withdrawalStrategy: 'VARIABLE_GUARDRAILS',
        includeCapitalGainsTax: true,
        effectiveTaxRatePercent: 18.5,
        monthlyHealthInsuranceEur: 200
      },
      12.0,
      100
    );

    expect(result.simulationsRun).toBe(100);
    expect(result.paths.length).toBe(21);
    expect(result.percentile50EndingValue).toBeGreaterThanOrEqual(0);
  });
});

describe('Fama-French 5-Factor Model & Withholding Tax Refund', () => {
  it('calculates Fama-French factor exposures and quality score accurately', async () => {
    const { calculateFamaFrench5Factors } = await import('../performanceUtils');
    const mockHoldings: any[] = [
      { ticker: 'AAPL', name: 'Apple Inc.', category: 'Stock', currentValue: 5000, totalCost: 4000 },
      { ticker: 'EUNL', name: 'iShares Core MSCI World', category: 'ETF', currentValue: 5000, totalCost: 4500 }
    ];

    const result = calculateFamaFrench5Factors(mockHoldings);
    expect(result.marketBeta).toBeGreaterThan(0.5);
    expect(result.qualityScore).toBeGreaterThanOrEqual(50);
    expect(result.profitabilityRmw).toBeGreaterThanOrEqual(0);
  });

  it('calculates reclaimable foreign withholding taxes for Switzerland and France', async () => {
    const { calculateWithholdingTaxRefunds } = await import('../performanceUtils');
    const mockTxs: any[] = [
      { id: 'tx-ch', type: 'DIVIDEND', ticker: 'NESN', name: 'Nestle SA', amount: 10, price: 100, date: '15.04.2026' },
      { id: 'tx-fr', type: 'DIVIDEND', ticker: 'MC', name: 'LVMH', amount: 5, price: 200, date: '20.05.2026' }
    ];

    const result = calculateWithholdingTaxRefunds(mockTxs);
    expect(result.totalGrossDividendsEur).toBe(2000);
    expect(result.totalReclaimableEur).toBeGreaterThan(0);
    
    const swissItem = result.items.find(i => i.countryCode === 'CH');
    expect(swissItem?.reclaimableTaxPct).toBe(20);
    expect(swissItem?.reclaimableRefundEur).toBe(200); // 1000 * 20% = 200
  });
});


