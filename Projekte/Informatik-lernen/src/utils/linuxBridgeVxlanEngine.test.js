import { describe, it, expect } from 'vitest';
import { LinuxBridgeVxlanSimulator } from './linuxBridgeVxlanEngine';

describe('Linux Bridge & VXLAN Overlay Engine', () => {
  it('encapsulates L2 inner Ethernet frame inside outer UDP 4789 VXLAN packet', () => {
    const sim = new LinuxBridgeVxlanSimulator();
    const res = sim.encapsulateVxlanPacket({
      innerIpSrc: '10.0.0.2',
      innerIpDst: '10.0.0.4',
      outerIpSrc: '192.168.1.10',
      outerIpDst: '192.168.1.20'
    });

    expect(res.outerHeader.udp.dstPort).toBe(4789);
    expect(res.vxlanHeader.vni).toBe(100);
    expect(res.overheadBytes).toBe(50);
    expect(res.mtuRecommendation).toBe(1450);
  });
});
