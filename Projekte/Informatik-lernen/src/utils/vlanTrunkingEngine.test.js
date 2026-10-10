import { describe, it, expect } from 'vitest';
import {
  DEFAULT_VLANS,
  build8021qTag,
  processFrameForwarding,
  VLAN_DRILL_QUESTIONS
} from './vlanTrunkingEngine';

describe('vlanTrunkingEngine', () => {
  it('enthält Standard-VLANs und Drill-Fragen', () => {
    expect(DEFAULT_VLANS.length).toBe(4);
    expect(VLAN_DRILL_QUESTIONS.length).toBe(4);
  });

  describe('build8021qTag', () => {
    it('erzeugt korrekte TCI-Bits für VLAN 10', () => {
      const tag = build8021qTag(10, 0, 0);
      expect(tag.isValid).toBe(true);
      expect(tag.vid).toBe(10);
      expect(tag.tagHex).toBe('8100000A');
    });

    it('setzt PCP Prioritäts-Bits korrekt', () => {
      // PCP = 5 (Voice Traffic) -> 5 << 13 = 0xA000
      const tag = build8021qTag(20, 5, 0);
      expect(tag.isValid).toBe(true);
      expect(tag.pcp).toBe(5);
      expect(tag.tagHex.startsWith('8100A')).toBe(true);
    });

    it('weist ungültige VLAN-IDs (< 1 oder > 4094) ab', () => {
      expect(build8021qTag(0).isValid).toBe(false);
      expect(build8021qTag(4095).isValid).toBe(false);
    });
  });

  describe('processFrameForwarding', () => {
    it('leitet Frame zwischen gleichen Access-VLANs ungetaggt weiter', () => {
      const ingressPort = { id: 'Fa0/1', mode: 'access', accessVlan: 10 };
      const egressPort = { id: 'Fa0/2', mode: 'access', accessVlan: 10 };
      const frame = {
        srcMac: 'AA:BB:CC:DD:EE:01',
        dstMac: 'AA:BB:CC:DD:EE:02',
        vlanTag: null,
        ethertype: '0x0800',
        payload: 'ICMP Echo'
      };

      const res = processFrameForwarding(frame, ingressPort, egressPort);
      expect(res.forwarded).toBe(true);
      expect(res.isEgressTagged).toBe(false);
      expect(res.outputFrame?.vlanTag).toBeNull();
    });

    it('verwirft Frame bei unterschiedlichen Access-VLANs (Broadcast Isolation)', () => {
      const ingressPort = { id: 'Fa0/1', mode: 'access', accessVlan: 10 };
      const egressPort = { id: 'Fa0/3', mode: 'access', accessVlan: 20 };
      const frame = {
        srcMac: 'AA:BB:CC:DD:EE:01',
        dstMac: 'FF:FF:FF:FF:FF:FF',
        vlanTag: null,
        ethertype: '0x0800',
        payload: 'ARP Who has'
      };

      const res = processFrameForwarding(frame, ingressPort, egressPort);
      expect(res.forwarded).toBe(false);
      expect(res.explanation).toContain('VERWORFEN');
    });

    it('taggt Frame beim Verlassen über einen Trunk-Port', () => {
      const ingressPort = { id: 'Fa0/1', mode: 'access', accessVlan: 10 };
      const egressPort = { id: 'Gi0/1', mode: 'trunk', allowedVlans: [10, 20], nativeVlan: 1 };
      const frame = {
        srcMac: 'AA:BB:CC:DD:EE:01',
        dstMac: 'AA:BB:CC:DD:EE:99',
        vlanTag: null,
        ethertype: '0x0800',
        payload: 'TCP Data'
      };

      const res = processFrameForwarding(frame, ingressPort, egressPort);
      expect(res.forwarded).toBe(true);
      expect(res.isEgressTagged).toBe(true);
      expect(res.outputFrame?.vlanTag).toBe(10);
      expect(res.outputFrame?.ethertype).toBe('0x8100');
    });
  });
});
