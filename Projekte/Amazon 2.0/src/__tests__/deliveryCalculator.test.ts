import { describe, it, expect } from 'vitest';
import { calculateDeliveryEstimate } from '../utils/deliveryCalculator';

describe('Delivery Calculator & Express Countdown', () => {
  it('calculates standard and express delivery for Berlin zip code (10115)', () => {
    // Mock morning time: 10:30 AM
    const morningDate = new Date('2026-09-01T10:30:00');
    const estimate = calculateDeliveryEstimate('10115', morningDate);

    expect(estimate.zipCode).toBe('10115');
    expect(estimate.city).toBe('Berlin');
    expect(estimate.isSameDayEligible).toBe(true);
    expect(estimate.sameDayDate).toContain('Heute zwischen 18:00 – 21:00 Uhr');
    expect(estimate.hoursLeft).toBe(7);
    expect(estimate.minutesLeft).toBe(30);
    expect(estimate.countdownFormatted).toBe('7 Std. 30 Min.');
  });

  it('handles non-metro zip codes correctly', () => {
    const morningDate = new Date('2026-09-01T10:30:00');
    const estimate = calculateDeliveryEstimate('99817', morningDate);

    expect(estimate.zipCode).toBe('99817');
    expect(estimate.isSameDayEligible).toBe(false);
    expect(estimate.sameDayDate).toBeUndefined();
    expect(estimate.shippingCarrier).toBe('DHL Express');
  });

  it('handles cutoff passed (evening)', () => {
    const eveningDate = new Date('2026-09-01T20:15:00');
    const estimate = calculateDeliveryEstimate('10115', eveningDate);

    expect(estimate.isSameDayEligible).toBe(false);
    expect(estimate.hoursLeft).toBeGreaterThan(0);
  });
});
