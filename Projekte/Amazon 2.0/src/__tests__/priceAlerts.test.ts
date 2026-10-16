import { describe, it, expect } from 'vitest';
import { state, addPriceAlert, removePriceAlert, checkPriceAlerts } from '../store';

describe('Custom Price Alerts (Zielpreis-Wächter)', () => {
  it('creates and removes price alerts', () => {
    const prod = state.products[0];
    const targetPrice = Math.round(prod.price * 0.85);

    const alert = addPriceAlert(prod.id, targetPrice);
    expect(alert).not.toBeNull();
    expect(alert?.productId).toBe(prod.id);
    expect(alert?.targetPrice).toBe(targetPrice);
    expect(state.priceAlerts.some(a => a.productId === prod.id)).toBe(true);

    // Remove alert
    removePriceAlert(alert!.id);
    expect(state.priceAlerts.some(a => a.id === alert!.id)).toBe(false);
  });

  it('triggers price alert and notification when price drops to target', () => {
    const prod = state.products[1];
    const alert = addPriceAlert(prod.id, 100);
    expect(alert).not.toBeNull();

    // Simulate price drop
    checkPriceAlerts({ id: prod.id, title: prod.title, price: 95 });

    const updatedAlert = state.priceAlerts.find(a => a.id === alert!.id);
    expect(updatedAlert?.triggered).toBe(true);
    expect(state.notifications.some(n => n.type === 'price_alert')).toBe(true);
  });
});
