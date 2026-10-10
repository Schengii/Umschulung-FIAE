import { describe, it, expect } from 'vitest';
import {
  RFC_1918_RANGES,
  isPrivateIp,
  translateOutboundPacket,
  translateInboundPacket,
  DEFAULT_NAT_SCENARIO,
  NAT_PAT_DRILL_QUESTIONS
} from './natPatEngine';

describe('natPatEngine', () => {
  it('enthält RFC 1918 Bereiche und Drill-Fragen', () => {
    expect(RFC_1918_RANGES.length).toBe(3);
    expect(NAT_PAT_DRILL_QUESTIONS.length).toBe(4);
    expect(DEFAULT_NAT_SCENARIO.lanHosts.length).toBe(3);
  });

  describe('isPrivateIp', () => {
    it('erkennt private IPs korrekt', () => {
      expect(isPrivateIp('10.0.0.1')).toBe(true);
      expect(isPrivateIp('172.16.0.1')).toBe(true);
      expect(isPrivateIp('172.31.255.255')).toBe(true);
      expect(isPrivateIp('192.168.1.100')).toBe(true);
    });

    it('erkennt öffentliche IPs korrekt als nicht privat', () => {
      expect(isPrivateIp('8.8.8.8')).toBe(false);
      expect(isPrivateIp('172.32.0.1')).toBe(false);
      expect(isPrivateIp('192.178.1.1')).toBe(false);
      expect(isPrivateIp('93.184.216.34')).toBe(false);
      expect(isPrivateIp('')).toBe(false);
    });
  });

  describe('translateOutboundPacket & translateInboundPacket', () => {
    it('übersetzt ein ausgehendes Paket und leitet die Antwort zurück', () => {
      const initialTable = [];
      const packet = {
        srcIp: '192.168.1.10',
        srcPort: 51234,
        dstIp: '93.184.216.34',
        dstPort: 80,
        protocol: 'TCP',
        payload: 'GET / HTTP/1.1'
      };

      const outResult = translateOutboundPacket(packet, '203.0.113.1', initialTable, 40001);
      expect(outResult.wasNewEntry).toBe(true);
      expect(outResult.translatedPacket.srcIp).toBe('203.0.113.1');
      expect(outResult.translatedPacket.srcPort).toBe(40001);
      expect(outResult.updatedTable.length).toBe(1);

      // Eingehendes Antwortpaket vom Server
      const returnPacket = {
        srcIp: '93.184.216.34',
        srcPort: 80,
        dstIp: '203.0.113.1',
        dstPort: 40001,
        protocol: 'TCP',
        payload: 'HTTP/1.1 200 OK'
      };

      const inResult = translateInboundPacket(returnPacket, outResult.updatedTable);
      expect(inResult.success).toBe(true);
      expect(inResult.translatedPacket?.dstIp).toBe('192.168.1.10');
      expect(inResult.translatedPacket?.dstPort).toBe(51234);
    });

    it('verwirft unaufgeforderte eingehende Pakete ohne NAT-Eintrag', () => {
      const uninvitedPacket = {
        srcIp: '198.51.100.22',
        srcPort: 4444,
        dstIp: '203.0.113.1',
        dstPort: 40099,
        protocol: 'TCP',
        payload: 'EXPLOIT'
      };

      const res = translateInboundPacket(uninvitedPacket, []);
      expect(res.success).toBe(false);
      expect(res.translatedPacket).toBeNull();
      expect(res.explanation).toContain('DROP');
    });
  });
});
