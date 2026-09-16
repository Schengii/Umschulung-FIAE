/**
 * Linux Virtual Bridge & VXLAN Overlay Engine
 * Simulates veth pairs, Linux Bridge (br0) forwarding database (FDB),
 * 802.1Q VLAN tagging, and VXLAN L2-over-L3 UDP 4789 packet encapsulation.
 */

export class LinuxBridgeVxlanSimulator {
  constructor() {
    this.vni = 100; // VXLAN Network Identifier
    this.vxlanPort = 4789;
    this.bridgeFdb = [
      { mac: '02:42:ac:11:00:02', interface: 'veth-ns1', vlanId: 10 },
      { mac: '02:42:ac:11:00:03', interface: 'veth-ns2', vlanId: 10 },
      { mac: '02:42:ac:11:00:04', interface: 'vxlan100', vlanId: 10 }
    ];
  }

  encapsulateVxlanPacket({
    innerMacSrc = '02:42:ac:11:00:02',
    innerMacDst = '02:42:ac:11:00:04',
    innerIpSrc = '10.0.0.2',
    innerIpDst = '10.0.0.4',
    outerIpSrc = '192.168.1.10',
    outerIpDst = '192.168.1.20'
  }) {
    return {
      outerHeader: {
        ethernet: { src: '52:54:00:12:34:56', dst: '52:54:00:65:43:21' },
        ip: { src: outerIpSrc, dst: outerIpDst, protocol: 'UDP' },
        udp: { srcPort: 54321, dstPort: this.vxlanPort }
      },
      vxlanHeader: {
        flags: '0x08 (Valid VNI)',
        vni: this.vni
      },
      innerPayload: {
        ethernet: { src: innerMacSrc, dst: innerMacDst },
        ip: { src: innerIpSrc, dst: innerIpDst }
      },
      overheadBytes: 50, // 14 (Eth) + 20 (IP) + 8 (UDP) + 8 (VXLAN) = 50 bytes
      mtuRecommendation: 1450 // 1500 - 50 bytes
    };
  }
}
