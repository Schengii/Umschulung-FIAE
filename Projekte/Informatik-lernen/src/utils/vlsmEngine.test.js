import { describe, it, expect } from 'vitest';
import { calculateVlsm, intToIp, ipToInt, getRequiredHostBits, DEFAULT_VLSM_SUBNETS } from './vlsmEngine';

describe('vlsmEngine (IHK Subnetting & VLSM Planer)', () => {
  it('konvertiert IPv4 zu Integer und zurück', () => {
    const ip = '192.168.1.100';
    const num = ipToInt(ip);
    expect(intToIp(num)).toBe(ip);
  });

  it('ermittelt korrekte Host-Bits für gegebene Host-Anzahl', () => {
    expect(getRequiredHostBits(2)).toBe(2); // 2^2 - 2 = 2 Hosts
    expect(getRequiredHostBits(14)).toBe(4); // 2^4 - 2 = 14 Hosts
    expect(getRequiredHostBits(25)).toBe(5); // 2^5 - 2 = 30 Hosts
    expect(getRequiredHostBits(60)).toBe(6); // 2^6 - 2 = 62 Hosts
  });

  it('teilt ein /24 Netzwerk optimal nach VLSM auf ohne Überlappungen', () => {
    const res = calculateVlsm({
      baseIp: '192.168.10.0',
      basePrefix: 24,
      subnets: DEFAULT_VLSM_SUBNETS
    });

    expect(res.isValid).toBe(true);
    expect(res.isOverflow).toBe(false);
    expect(res.subnets.length).toBe(5);

    // Erstes Subnetz muss für 60 Hosts sein (/26, 62 nutzbare Hosts)
    const first = res.subnets[0];
    expect(first.requiredHosts).toBe(60);
    expect(first.prefix).toBe('/26');
    expect(first.networkAddress).toBe('192.168.10.0');
    expect(first.broadcastAddress).toBe('192.168.10.63');

    // Zweites Subnetz muss für 28 Hosts sein (/27, 30 nutzbare Hosts)
    const second = res.subnets[1];
    expect(second.requiredHosts).toBe(28);
    expect(second.prefix).toBe('/27');
    expect(second.networkAddress).toBe('192.168.10.64');
    expect(second.broadcastAddress).toBe('192.168.10.95');

    // WAN Link muss /30 sein
    const wan = res.subnets[4];
    expect(wan.requiredHosts).toBe(2);
    expect(wan.prefix).toBe('/30');
    expect(wan.allocatedHosts).toBe(2);
  });

  it('erkennt Adressüberlauf wenn Subnetze die Basisnetz-Kapazität überschreiten', () => {
    const res = calculateVlsm({
      baseIp: '192.168.1.0',
      basePrefix: 26, // Nur 64 Adressen
      subnets: [
        { id: '1', name: 'Großes Subnetz', requiredHosts: 100 }
      ]
    });

    expect(res.isOverflow).toBe(true);
  });
});
