import { describe, it, expect } from 'vitest';
import { SAMPLE_PACKETS, formatHexDump, evaluatePacketFilter } from './packetSnifferEngine';

describe('packetSnifferEngine', () => {
  it('formats raw hex into rows with offsets and ascii', () => {
    const raw = SAMPLE_PACKETS[0].rawHex;
    const dump = formatHexDump(raw);
    expect(dump.length).toBeGreaterThan(0);
    expect(dump[0].bytes.length).toBe(16);
    expect(dump[0].offsetHex).toBe('0000');
    expect(dump[0].ascii).toBeDefined();
  });

  it('filters packets by protocol keyword', () => {
    const tcpOnly = SAMPLE_PACKETS.filter(p => evaluatePacketFilter(p, 'tcp'));
    expect(tcpOnly.length).toBe(3);

    const httpOnly = SAMPLE_PACKETS.filter(p => evaluatePacketFilter(p, 'http'));
    expect(httpOnly.length).toBe(1);
    expect(httpOnly[0].protocol).toBe('HTTP');
  });

  it('evaluates expression filters like ip.src and tcp.port', () => {
    const srcMatch = SAMPLE_PACKETS.filter(p => evaluatePacketFilter(p, 'ip.src == 192.168.1.45'));
    expect(srcMatch.length).toBe(4);

    const portMatch = SAMPLE_PACKETS.filter(p => evaluatePacketFilter(p, 'tcp.port == 443'));
    expect(portMatch.length).toBe(3);
  });
});
