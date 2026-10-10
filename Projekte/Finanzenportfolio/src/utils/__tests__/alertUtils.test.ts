// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadPriceAlerts, savePriceAlerts, checkPriceAlerts } from '../alertUtils';
import type { PriceAlert, Holding } from '../../types';

describe('alertUtils', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    vi.restoreAllMocks();
  });

  const sampleHoldings: Holding[] = [
    {
      ticker: 'NVDA',
      name: 'NVIDIA Corp.',
      category: 'Stock',
      shares: 10,
      averageBuyPrice: 100,
      currentPrice: 150,
      totalCost: 1000,
      currentValue: 1500,
      totalGain: 500,
      totalGainPercent: 50.0,
      portfolioWeight: 100,
      yieldOnCost: 0.5
    },
    {
      ticker: 'TSLA',
      name: 'Tesla Inc.',
      category: 'Stock',
      shares: 5,
      averageBuyPrice: 250,
      currentPrice: 200,
      totalCost: 1250,
      currentValue: 1000,
      totalGain: -250,
      totalGainPercent: -20.0,
      portfolioWeight: 100,
      yieldOnCost: 0
    }
  ];

  it('saves and loads price alerts from localStorage', () => {
    const alert: PriceAlert = {
      id: 'a1',
      ticker: 'NVDA',
      name: 'NVIDIA Corp.',
      condition: 'ABOVE',
      targetValue: 160,
      createdAt: '01.01.2025',
      isActive: true
    };

    savePriceAlerts([alert]);
    const loaded = loadPriceAlerts();
    expect(loaded.length).toBe(1);
    expect(loaded[0].ticker).toBe('NVDA');
  });

  it('triggers ABOVE condition when price reaches or exceeds target', () => {
    const alerts: PriceAlert[] = [
      {
        id: 'a1',
        ticker: 'NVDA',
        name: 'NVIDIA Corp.',
        condition: 'ABOVE',
        targetValue: 140, // current is 150 -> trigger!
        createdAt: '01.01.2025',
        isActive: true
      }
    ];

    const { updatedAlerts, newlyTriggered } = checkPriceAlerts(alerts, sampleHoldings);
    expect(newlyTriggered.length).toBe(1);
    expect(newlyTriggered[0].id).toBe('a1');
    expect(updatedAlerts[0].isActive).toBe(false);
    expect(updatedAlerts[0].triggeredAt).toBeDefined();
  });

  it('triggers BELOW condition when price falls below target', () => {
    const alerts: PriceAlert[] = [
      {
        id: 'a2',
        ticker: 'TSLA',
        name: 'Tesla Inc.',
        condition: 'BELOW',
        targetValue: 210, // current is 200 -> trigger!
        createdAt: '01.01.2025',
        isActive: true
      }
    ];

    const { newlyTriggered } = checkPriceAlerts(alerts, sampleHoldings);
    expect(newlyTriggered.length).toBe(1);
    expect(newlyTriggered[0].id).toBe('a2');
  });

  it('triggers DAILY_DROP_PCT condition when loss exceeds threshold', () => {
    const alerts: PriceAlert[] = [
      {
        id: 'a3',
        ticker: 'TSLA',
        name: 'Tesla Inc.',
        condition: 'DAILY_DROP_PCT',
        targetValue: 15, // totalGainPercent is -20% -> triggers!
        createdAt: '01.01.2025',
        isActive: true
      }
    ];

    const { newlyTriggered } = checkPriceAlerts(alerts, sampleHoldings);
    expect(newlyTriggered.length).toBe(1);
    expect(newlyTriggered[0].id).toBe('a3');
  });

  it('does not trigger inactive alerts', () => {
    const alerts: PriceAlert[] = [
      {
        id: 'a4',
        ticker: 'NVDA',
        name: 'NVIDIA Corp.',
        condition: 'ABOVE',
        targetValue: 100,
        createdAt: '01.01.2025',
        isActive: false
      }
    ];

    const { newlyTriggered } = checkPriceAlerts(alerts, sampleHoldings);
    expect(newlyTriggered.length).toBe(0);
  });
});
