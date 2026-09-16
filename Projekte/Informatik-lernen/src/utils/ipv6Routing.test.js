import { describe, it, expect } from 'vitest';
import {
  expandIpv6,
  compressIpv6,
  generateEui64,
  matchRoutingTable
} from './ipv6Routing';

describe('ipv6Routing', () => {
  it('expandiert und komprimiert IPv6 Adressen', () => {
    const original = '2001:db8::1';
    const expanded = expandIpv6(original);
    expect(expanded).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');

    const compressed = compressIpv6(expanded);
    expect(compressed).toBe('2001:db8::1');

    const loopback = expandIpv6('::1');
    expect(loopback).toBe('0000:0000:0000:0000:0000:0000:0000:0001');
    expect(compressIpv6(loopback)).toBe('::1');
  });

  it('generiert EUI-64 SLAAC Adresse aus MAC-Adresse', () => {
    // Standard-Beispiel: 00:1A:2B:3C:4D:5E -> U/L Bit invertiert -> 021A:2BFF:FE3C:4D5E
    const res = generateEui64('00:1A:2B:3C:4D:5E', 'fe80::');
    expect(res.error).toBeUndefined();
    expect(res.interfaceId).toBe('021a:2bff:fe3c:4d5e');
    expect(res.fullIpv6).toBe('fe80::21a:2bff:fe3c:4d5e');
  });

  it('findet den Longest Prefix Match in einer Routing-Tabelle', () => {
    const routes = [
      { destination: '0.0.0.0/0', nextHop: '192.168.1.1', iface: 'wan0' },
      { destination: '10.0.0.0/8', nextHop: '10.254.0.1', iface: 'eth1' },
      { destination: '10.1.0.0/16', nextHop: '10.1.254.1', iface: 'eth2' },
      { destination: '10.1.5.0/24', nextHop: '10.1.5.254', iface: 'eth3' }
    ];

    // 10.1.5.42 matcht /24, /16, /8, /0 -> Best match ist /24 (eth3)
    const res = matchRoutingTable('10.1.5.42', routes);
    expect(res.bestMatch.prefixLength).toBe(24);
    expect(res.bestMatch.iface).toBe('eth3');

    // 10.1.99.5 matcht /16, /8, /0 -> Best match ist /16 (eth2)
    const res2 = matchRoutingTable('10.1.99.5', routes);
    expect(res2.bestMatch.prefixLength).toBe(16);
    expect(res2.bestMatch.iface).toBe('eth2');

    // 8.8.8.8 matcht nur Default-Route /0 (wan0)
    const res3 = matchRoutingTable('8.8.8.8', routes);
    expect(res3.bestMatch.prefixLength).toBe(0);
    expect(res3.bestMatch.iface).toBe('wan0');
  });
});
