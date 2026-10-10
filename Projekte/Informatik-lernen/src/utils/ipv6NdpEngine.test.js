import { describe, it, expect } from 'vitest';
import { generateEui64, generatePrivacyAddress, simulateIpv6NdLifecycle } from './ipv6NdpEngine';

describe('ipv6NdpEngine', () => {
  it('erzeugt korrekte EUI-64 Identifier mit invertiertem u/l Bit', () => {
    // 00:1a:2b:3c:4d:5e -> 00 XOR 0x02 = 02 -> 021a:2bff:fe3c:4d5e
    const eui64 = generateEui64('00:1a:2b:3c:4d:5e');
    expect(eui64).toBe('021a:2bff:fe3c:4d5e');
  });

  it('wirft Fehler bei unvollständiger MAC-Adresse', () => {
    expect(() => generateEui64('00:1a:2b')).toThrow();
  });

  it('generiert Privacy Extension Adressen mit korrektem Prefix', () => {
    const addr = generatePrivacyAddress('2001:db8:acad:1');
    expect(addr.startsWith('2001:db8:acad:1:')).toBe(true);
    expect(addr.split(':').length).toBe(8);
  });

  it('simuliert DAD-Konflikt erfolgreich', () => {
    const result = simulateIpv6NdLifecycle({ dadConflict: true });
    expect(result.success).toBe(false);
    expect(result.reason).toBe('DAD_CONFLICT');
  });

  it('simuliert vollen SLAAC Lifecycle mit Privacy Extension', () => {
    const result = simulateIpv6NdLifecycle({
      mac: '00:1a:2b:3c:4d:5e',
      prefix: '2001:db8:1234:1',
      usePrivacy: true,
      mFlag: false,
      oFlag: true,
      dadConflict: false
    });

    expect(result.success).toBe(true);
    expect(result.linkLocal).toBe('fe80::021a:2bff:fe3c:4d5e');
    expect(result.globalAddresses.length).toBe(2); // EUI-64 + Privacy
    expect(result.steps.length).toBe(5);
  });

  it('schaltet bei gesetztem M-Flag auf Stateful DHCPv6 um', () => {
    const result = simulateIpv6NdLifecycle({
      mFlag: true,
      oFlag: true
    });

    expect(result.success).toBe(true);
    expect(result.globalAddresses[0].type).toContain('DHCPv6');
  });
});
