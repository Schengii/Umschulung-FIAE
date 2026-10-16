import { describe, it, expect } from 'vitest';
import { getNearbyAirDropDevices, executeAirDropTransfer } from '../utils/p2pAirDrop';

describe('WebRTC Peer-to-Peer Instant Receipt AirDrop Engine', () => {
  it('discovers nearby devices and completes simulated P2P file transfer', async () => {
    const devices = getNearbyAirDropDevices();
    expect(devices.length).toBeGreaterThan(0);

    const first = devices[0];
    expect(first.distanceMeters).toBeGreaterThan(0);

    const transferred = await executeAirDropTransfer(first, 'Test_Receipt.pdf');
    expect(transferred).toBe(true);
  });
});
