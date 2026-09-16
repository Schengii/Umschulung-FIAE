import { describe, it, expect } from 'vitest';
import {
  PROTOCOL_SPECS,
  calculateHandshakeLatency,
  simulateStreamTransfer,
  simulateConnectionMigration
} from './http3QuicEngine';

describe('http3QuicEngine', () => {
  it('should define protocol specs with accurate transport layers', () => {
    expect(PROTOCOL_SPECS['HTTP/3'].transport).toContain('QUIC über UDP');
    expect(PROTOCOL_SPECS['HTTP/2'].transport).toContain('Single TCP');
    expect(PROTOCOL_SPECS['HTTP/3'].connectionMigration).toBe(true);
    expect(PROTOCOL_SPECS['HTTP/2'].connectionMigration).toBe(false);
  });

  it('should calculate 0-RTT handshake for resumed HTTP/3 connection', () => {
    const resumedH3 = calculateHandshakeLatency('HTTP/3', 40, true);
    expect(resumedH3.rttCount).toBe(0);
    expect(resumedH3.latencyMs).toBe(0);
    expect(resumedH3.is0RttPossible).toBe(true);

    const initialH3 = calculateHandshakeLatency('HTTP/3', 40, false);
    expect(initialH3.rttCount).toBe(1);
    expect(initialH3.latencyMs).toBe(40);
  });

  it('should demonstrate Head-of-Line blocking in HTTP/2 under packet loss', () => {
    // Seed configured so packet loss occurs
    const h2Sim = simulateStreamTransfer({
      protocol: 'HTTP/2',
      streamCount: 4,
      packetLossRate: 0.25,
      baseRttMs: 50,
      packetsPerStream: 10,
      seed: 42
    });

    const h3Sim = simulateStreamTransfer({
      protocol: 'HTTP/3',
      streamCount: 4,
      packetLossRate: 0.25,
      baseRttMs: 50,
      packetsPerStream: 10,
      seed: 42
    });

    expect(h3Sim.isHoLEliminated).toBe(true);
    expect(h2Sim.isHoLEliminated).toBe(false);
    expect(h2Sim.streams.length).toBe(4);
    expect(h3Sim.streams.length).toBe(4);
  });

  it('should simulate seamless connection migration in HTTP/3 via Connection ID', () => {
    const h3Migration = simulateConnectionMigration('HTTP/3');
    expect(h3Migration.success).toBe(true);
    expect(h3Migration.handshakeDelayMs).toBe(0);
    expect(h3Migration.description).toContain('Connection-ID');

    const h2Migration = simulateConnectionMigration('HTTP/2');
    expect(h2Migration.success).toBe(false);
    expect(h2Migration.handshakeDelayMs).toBeGreaterThan(0);
    expect(h2Migration.description).toContain('4-Tupel');
  });
});
