import { describe, it, expect } from 'vitest';
import { simulateQKDExchange } from '../utils/qkdKeyExchange';

describe('Quantum Key Distribution (QKD) Teleportation Engine', () => {
  it('simulates photonic entanglement key exchange and verifies no-cloning guarantee', () => {
    const qkd = simulateQKDExchange('E91 (Entangled Bell States)');
    expect(qkd.protocol).toBe('E91 (Entangled Bell States)');
    expect(qkd.qberPercent).toBeLessThan(11.0);
    expect(qkd.isNoCloningGuaranteed).toBe(true);
    expect(qkd.eavesdropperDetected).toBe(false);
    expect(qkd.sharedKeyLengthBits).toBe(4096);
  });
});
