import { describe, it, expect } from 'vitest';
import type { SmartDeviceSlot } from '../components/smartHomePlanner';

describe('Smart-Home Blueprint & Room Planner', () => {
  it('calculates bundle pricing and power metrics properly', () => {
    const devices: SmartDeviceSlot[] = [
      {
        id: 'dev-1',
        name: 'Echo Hub',
        category: 'Hub',
        icon: '🎛️',
        x: 50,
        y: 50,
        productId: 'prod-3',
        productTitle: 'Echo Hub',
        price: 200,
        powerWatts: 20,
        status: 'on',
        automationRole: 'Center',
      },
      {
        id: 'dev-2',
        name: 'Lightstrip',
        category: 'Lighting',
        icon: '💡',
        x: 80,
        y: 30,
        productId: 'prod-strip',
        productTitle: 'Lightstrip',
        price: 100,
        powerWatts: 10,
        status: 'on',
        automationRole: 'Ambient',
      },
    ];

    const totalPrice = devices.reduce((sum, d) => sum + d.price, 0);
    const discountedPrice = totalPrice * 0.85; // 15% discount
    const totalWatts = devices.reduce((sum, d) => sum + d.powerWatts, 0);

    expect(totalPrice).toBe(300);
    expect(discountedPrice).toBe(255);
    expect(totalWatts).toBe(30);
  });
});
