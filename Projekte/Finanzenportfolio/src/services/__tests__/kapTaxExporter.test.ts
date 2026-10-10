import { describe, it, expect } from 'vitest';
import { generateKapTaxCertificateData } from '../kapTaxExporter';
import type { Portfolio } from '../../types';

describe('kapTaxExporter', () => {
  it('generates Anlage KAP numbers properly from portfolio transactions', () => {
    const dummyPortfolio: Portfolio = {
      id: 'p-1',
      name: 'Main Wealth Depot',
      taxLossPools: {
        stockLossPool: 250,
        generalLossPool: 100,
        vorabpauschaleEstimate: 0,
        taxExemptionUsed: 0,
        teilfreistellungTaxSaved: 0
      },
      watchlist: [],
      transactions: [
        {
          id: 'tx-1',
          date: `${new Date().getFullYear()}-03-15`,
          type: 'SELL',
          ticker: 'SAP.DE',
          name: 'SAP SE',
          category: 'Stock',
          amount: 10,
          price: 180,
          currency: 'EUR',
          fee: 0,
          tax: 0
        },
        {
          id: 'tx-2',
          date: `${new Date().getFullYear()}-05-20`,
          type: 'DIVIDEND',
          ticker: 'MSFT',
          name: 'Microsoft Corp.',
          category: 'Stock',
          amount: 1,
          price: 120,
          currency: 'EUR',
          fee: 0,
          tax: 18
        }
      ]
    };

    const res = generateKapTaxCertificateData(dummyPortfolio, [], new Date().getFullYear(), 1000);
    expect(res.portfolioName).toBe('Main Wealth Depot');
    expect(res.summary.realizedStockGainsEur).toBeGreaterThan(0);
    expect(res.summary.realizedOtherGainsEur).toBe(120);
    expect(res.lossPoolsCarryForward.stockLossPoolRemainingEur).toBe(250);
    expect(res.foreignWithholdingTax.totalForeignTaxPaidEur).toBe(18);
  });
});
