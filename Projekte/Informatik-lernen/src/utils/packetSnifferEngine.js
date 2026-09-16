/**
 * Network Packet Sniffer & Protocol Dissection Engine
 */

export const SAMPLE_PACKETS = [
  {
    id: 1,
    timestamp: '00:00:01.104',
    length: 74,
    protocol: 'TCP',
    summary: '54321 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
    layers: {
      ethernet: {
        srcMac: '00:1A:2B:3C:4D:5E',
        dstMac: 'F0:9F:C2:11:22:33',
        type: '0x0800 (IPv4)',
        byteRange: [0, 13]
      },
      ip: {
        version: 4,
        srcIp: '192.168.1.45',
        dstIp: '104.244.42.1',
        ttl: 64,
        protocolNum: 6,
        checksum: '0x7a3f',
        byteRange: [14, 33]
      },
      tcp: {
        srcPort: 54321,
        dstPort: 443,
        seq: 0,
        ack: 0,
        flags: { SYN: true, ACK: false, FIN: false, RST: false, PSH: false },
        windowSize: 64240,
        checksum: '0xb214',
        byteRange: [34, 53]
      },
      payload: {
        name: 'None (TCP Handshake SYN)',
        data: '',
        byteRange: []
      }
    },
    rawHex: 'f09fc2112233001a2b3c4d5e08004500003c1a2b400040067a3fc0a8012d68f42a01d43101bb0000000000000000a002faf0b2140000020405b40402080a'
  },
  {
    id: 2,
    timestamp: '00:00:01.128',
    length: 74,
    protocol: 'TCP',
    summary: '443 → 54321 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0',
    layers: {
      ethernet: {
        srcMac: 'F0:9F:C2:11:22:33',
        dstMac: '00:1A:2B:3C:4D:5E',
        type: '0x0800 (IPv4)',
        byteRange: [0, 13]
      },
      ip: {
        version: 4,
        srcIp: '104.244.42.1',
        dstIp: '192.168.1.45',
        ttl: 58,
        protocolNum: 6,
        checksum: '0x3c11',
        byteRange: [14, 33]
      },
      tcp: {
        srcPort: 443,
        dstPort: 54321,
        seq: 0,
        ack: 1,
        flags: { SYN: true, ACK: true, FIN: false, RST: false, PSH: false },
        windowSize: 65535,
        checksum: '0x9941',
        byteRange: [34, 53]
      },
      payload: {
        name: 'None (TCP Handshake SYN-ACK)',
        data: '',
        byteRange: []
      }
    },
    rawHex: '001a2b3c4d5ef09fc211223308004500003c000040003a063c1168f42a01c0a8012d01bbd4310000000000000001a012ffff99410000020405b40101080a'
  },
  {
    id: 3,
    timestamp: '00:00:01.130',
    length: 66,
    protocol: 'TCP',
    summary: '54321 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0',
    layers: {
      ethernet: {
        srcMac: '00:1A:2B:3C:4D:5E',
        dstMac: 'F0:9F:C2:11:22:33',
        type: '0x0800 (IPv4)',
        byteRange: [0, 13]
      },
      ip: {
        version: 4,
        srcIp: '192.168.1.45',
        dstIp: '104.244.42.1',
        ttl: 64,
        protocolNum: 6,
        checksum: '0x7a3e',
        byteRange: [14, 33]
      },
      tcp: {
        srcPort: 54321,
        dstPort: 443,
        seq: 1,
        ack: 1,
        flags: { SYN: false, ACK: true, FIN: false, RST: false, PSH: false },
        windowSize: 64240,
        checksum: '0x4312',
        byteRange: [34, 53]
      },
      payload: {
        name: 'None (TCP Handshake ACK Completed)',
        data: '',
        byteRange: []
      }
    },
    rawHex: 'f09fc2112233001a2b3c4d5e0800450000341a2c400040067a3ec0a8012d68f42a01d43101bb00000001000000018010faf0431200000101080a'
  },
  {
    id: 4,
    timestamp: '00:00:01.150',
    length: 128,
    protocol: 'HTTP',
    summary: 'GET /api/v1/status HTTP/1.1 (Host: api.it-devgame.local)',
    layers: {
      ethernet: {
        srcMac: '00:1A:2B:3C:4D:5E',
        dstMac: 'F0:9F:C2:11:22:33',
        type: '0x0800 (IPv4)',
        byteRange: [0, 13]
      },
      ip: {
        version: 4,
        srcIp: '192.168.1.45',
        dstIp: '93.184.216.34',
        ttl: 64,
        protocolNum: 6,
        checksum: '0x2210',
        byteRange: [14, 33]
      },
      tcp: {
        srcPort: 54322,
        dstPort: 80,
        seq: 1,
        ack: 1,
        flags: { SYN: false, ACK: true, FIN: false, RST: false, PSH: true },
        windowSize: 64240,
        checksum: '0x1299',
        byteRange: [34, 53]
      },
      payload: {
        name: 'Hypertext Transfer Protocol',
        data: 'GET /api/v1/status HTTP/1.1\\r\\nHost: api.it-devgame.local\\r\\nUser-Agent: ITDevGameClient/3.8\\r\\nAccept: */*\\r\\n\\r\\n',
        byteRange: [54, 127]
      }
    },
    rawHex: 'f09fc2112233001a2b3c4d5e0800450000801a2d400040062210c0a8012d5db8d822d432005000000001000000018018faf012990000474554202f6170692f76312f73746174757320485454502f312e310d0a486f73743a206170692e69742d64657667616d652e6c6f63616c0d0a557365722d4167656e743a20495444657647616d65436c69656e742f332e380d0a4163636570743a202a2f2a0d0a0d0a'
  },
  {
    id: 5,
    timestamp: '00:00:01.192',
    length: 85,
    protocol: 'DNS',
    summary: 'Standard query 0x1a2b A api.it-devgame.local',
    layers: {
      ethernet: {
        srcMac: '00:1A:2B:3C:4D:5E',
        dstMac: 'F0:9F:C2:11:22:33',
        type: '0x0800 (IPv4)',
        byteRange: [0, 13]
      },
      ip: {
        version: 4,
        srcIp: '192.168.1.45',
        dstIp: '8.8.8.8',
        ttl: 64,
        protocolNum: 17,
        checksum: '0x8891',
        byteRange: [14, 33]
      },
      udp: {
        srcPort: 60234,
        dstPort: 53,
        length: 51,
        checksum: '0xfe22',
        byteRange: [34, 41]
      },
      payload: {
        name: 'Domain Name System (Query)',
        data: 'Query: api.it-devgame.local (Type: A, Class: IN)',
        byteRange: [42, 84]
      }
    },
    rawHex: 'f09fc2112233001a2b3c4d5e0800450000551a2e400040118891c0a8012d08080808eb4a00350033fe221a2b01000001000000000000036170690b69742d64657667616d65056c6f63616c0000010001'
  }
];

/**
 * Parses raw hex string into formatted 16-byte rows with hex and ASCII
 */
export function formatHexDump(hexString) {
  if (!hexString) return [];
  const cleanHex = hexString.replace(/\s+/g, '');
  const rows = [];
  const bytes = [];
  
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(cleanHex.substring(i, i + 2));
  }

  for (let offset = 0; offset < bytes.length; offset += 16) {
    const chunk = bytes.slice(offset, offset + 16);
    const hexParts = chunk.map(b => b.toLowerCase());
    
    // ASCII representation
    const ascii = chunk.map(b => {
      const charCode = parseInt(b, 16);
      return (charCode >= 32 && charCode <= 126) ? String.fromCharCode(charCode) : '.';
    }).join('');

    rows.push({
      offsetHex: offset.toString(16).padStart(4, '0'),
      offsetStart: offset,
      offsetEnd: offset + chunk.length - 1,
      bytes: hexParts,
      ascii
    });
  }

  return rows;
}

/**
 * Filter evaluator for Wireshark-like queries
 */
export function evaluatePacketFilter(packet, filterQuery) {
  if (!filterQuery || !filterQuery.trim()) return true;
  const q = filterQuery.trim().toLowerCase();

  // Strict Protocol Keyword matches
  if (q === 'tcp') return packet.protocol === 'TCP';
  if (q === 'http') return packet.protocol === 'HTTP';
  if (q === 'dns') return packet.protocol === 'DNS';
  if (q === 'udp') return packet.protocol === 'UDP' || (packet.layers.udp !== undefined && packet.protocol !== 'HTTP');

  // Key-Value matches
  if (q.includes('ip.src ==') || q.includes('ip.src==')) {
    const target = q.split('==')[1].trim().replace(/['"]/g, '');
    return packet.layers.ip?.srcIp?.toLowerCase() === target;
  }
  if (q.includes('ip.dst ==') || q.includes('ip.dst==')) {
    const target = q.split('==')[1].trim().replace(/['"]/g, '');
    return packet.layers.ip?.dstIp?.toLowerCase() === target;
  }
  if (q.includes('tcp.port ==') || q.includes('tcp.port==')) {
    const port = parseInt(q.split('==')[1].trim(), 10);
    return packet.layers.tcp?.srcPort === port || packet.layers.tcp?.dstPort === port;
  }
  if (q.includes('length >')) {
    const minLen = parseInt(q.split('>')[1].trim(), 10);
    return packet.length > minLen;
  }

  // Fallback text search on summary and protocol
  return packet.summary.toLowerCase().includes(q) || packet.protocol.toLowerCase().includes(q);
}
