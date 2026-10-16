import { describe, it, expect } from 'vitest';
import { generatePriceForecast } from '../utils/priceForecaster';
import { state } from '../store';

describe('Smart Dynamic AI Price Forecasting', () => {
  it('generates 30-day forecast trajectory and valid recommendations', () => {
    const product = state.products[0];
    const forecast = generatePriceForecast(product);

    expect(forecast.currentPrice).toBe(product.price);
    expect(forecast.expectedPrice30d).toBeGreaterThan(0);
    expect(['falling', 'rising', 'stable']).toContain(forecast.trendDirection);
    expect(['BUY_NOW', 'WAIT_FEW_DAYS', 'GOOD_DEAL']).toContain(forecast.recommendedAction);
    expect(forecast.confidenceScore).toBeGreaterThan(50);
    expect(forecast.projectedTrajectory.length).toBe(7);
  });
});
