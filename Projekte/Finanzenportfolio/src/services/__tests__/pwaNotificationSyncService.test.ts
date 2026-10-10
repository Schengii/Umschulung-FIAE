import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkUpcomingExDividends,
  checkUpcomingDepositMaturities,
  sendDesktopPushNotification
} from '../pwaNotificationSyncService';
import type { Holding, DepositLadderItem } from '../../types';

describe('pwaNotificationSyncService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects upcoming Ex-Dividend dates within threshold', () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);
    const dateStr = `${nextWeek.getDate().toString().padStart(2, '0')}.${(nextWeek.getMonth() + 1).toString().padStart(2, '0')}.${nextWeek.getFullYear()}`;

    const dummyHoldings: Holding[] = [
      {
        ticker: 'KO',
        name: 'Coca-Cola Co.',
        category: 'Stock',
        shares: 50,
        averageBuyPrice: 60,
        currentPrice: 62,
        totalCost: 3000,
        currentValue: 3100,
        totalGain: 100,
        totalGainPercent: 3.3,
        portfolioWeight: 100,
        yieldOnCost: 3.1,
        notes: `Ex: ${dateStr}`
      },
      {
        ticker: 'MSFT',
        name: 'Microsoft Corp.',
        category: 'Stock',
        shares: 10,
        averageBuyPrice: 400,
        currentPrice: 420,
        totalCost: 4000,
        currentValue: 4200,
        totalGain: 200,
        totalGainPercent: 5.0,
        portfolioWeight: 100,
        yieldOnCost: 0.8
      }
    ];

    const alerts = checkUpcomingExDividends(dummyHoldings, 7);
    expect(alerts.length).toBe(1);
    expect(alerts[0].ticker).toBe('KO');
    expect(alerts[0].type).toBe('EX_DIVIDEND');
  });

  it('detects upcoming deposit maturities accurately', () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);
    const dateStr = `${nextWeek.getDate().toString().padStart(2, '0')}.${(nextWeek.getMonth() + 1).toString().padStart(2, '0')}.${nextWeek.getFullYear()}`;

    const dummyDeposits: DepositLadderItem[] = [
      {
        id: 'dep-1',
        bankName: 'Santander Consumer Bank',
        principalEur: 25000,
        interestRatePercent: 3.6,
        startDate: '2025-01-01',
        maturityDate: dateStr,
        depositType: 'FESTGELD',
        payoutInterval: 'AT_MATURITY',
        isAutoRenew: false
      },
      {
        id: 'dep-2',
        bankName: 'ING Diba',
        principalEur: 10000,
        interestRatePercent: 3.0,
        startDate: '2025-01-01',
        maturityDate: '01.01.2030', // Far in future
        depositType: 'FESTGELD',
        payoutInterval: 'ANNUAL',
        isAutoRenew: false
      }
    ];

    const alerts = checkUpcomingDepositMaturities(dummyDeposits, 14);
    expect(alerts.length).toBe(1);
    expect(alerts[0].title).toContain('Santander');
    expect(alerts[0].type).toBe('DEPOSIT_MATURITY');
  });

  it('handles desktop push notification safely in test environment', async () => {
    const sent = await sendDesktopPushNotification({
      id: 'test-1',
      type: 'PRICE_ALERT',
      title: 'Test',
      body: 'Body',
      targetDate: '2026-10-01',
      isUrgent: false
    });
    expect(typeof sent).toBe('boolean');
  });
});
