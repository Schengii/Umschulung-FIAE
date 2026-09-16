/**
 * WebRTC Peer-to-Peer & DataChannel Engine
 * RFC 8829 (JavaScript Session Establishment - JSEP), RFC 8866 (SDP), RFC 8831 (WebRTC Data Channels)
 */

export function createPeerInstance(peerId, name) {
  return {
    id: peerId,
    name: name,
    signalingState: 'stable',
    iceConnectionState: 'new',
    localDescription: null,
    remoteDescription: null,
    localCandidates: [],
    remoteCandidates: [],
    dataChannel: {
      label: 'chat-channel',
      state: 'connecting',
      messages: []
    }
  };
}

/**
 * Generate Mock SDP Offer (RFC 8866)
 */
export function generateSdpOffer(_peerId) {
  const sessionId = Math.floor(Math.random() * 1000000000);
  const ufrag = Math.random().toString(36).substring(2, 6);
  const pwd = Math.random().toString(36).substring(2, 18);
  const fingerprint = '2F:B4:9C:12:33:DE:45:90:AB:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD';

  return {
    type: 'offer',
    sdp: `v=0\r\no=- ${sessionId} 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\na=msid-semantic: WMS\r\nm=application 9 DTLS/SCTP 5000\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:${ufrag}\r\na=ice-pwd:${pwd}\r\na=fingerprint:sha-256 ${fingerprint}\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\na=rtpmap:96 VP8/90000\r\na=mid:1`,
    ufrag,
    pwd
  };
}

/**
 * Generate Mock SDP Answer
 */
export function generateSdpAnswer(_peerId, _offerSdp) {
  const sessionId = Math.floor(Math.random() * 1000000000);
  const ufrag = Math.random().toString(36).substring(2, 6);
  const pwd = Math.random().toString(36).substring(2, 18);
  const fingerprint = '4A:C5:11:99:88:77:66:55:44:33:22:11:00:FE:DC:BA:98:76:54:32:10:FE:DC:BA:98:76:54:32:10:FE:DC:BA';

  return {
    type: 'answer',
    sdp: `v=0\r\no=- ${sessionId} 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0 1\r\nm=application 9 DTLS/SCTP 5000\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:${ufrag}\r\na=ice-pwd:${pwd}\r\na=fingerprint:sha-256 ${fingerprint}\r\na=setup:active\r\na=mid:0\r\na=sctp-port:5000\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\na=rtpmap:96 VP8/90000\r\na=mid:1`,
    ufrag,
    pwd
  };
}

/**
 * Generate ICE Candidates (Host, STUN Server Reflexive, TURN Relay)
 */
export function generateIceCandidates(_peerName) {
  const port = Math.floor(Math.random() * 20000 + 40000);
  return [
    {
      candidate: `candidate:1 1 UDP 2122260223 192.168.1.45 ${port} typ host`,
      type: 'host',
      protocol: 'udp',
      address: '192.168.1.45',
      port: port,
      priority: 2122260223,
      desc: 'Lokale LAN-Adresse'
    },
    {
      candidate: `candidate:2 1 UDP 1686052607 203.0.113.199 ${port} typ srflx raddr 192.168.1.45 rport ${port}`,
      type: 'srflx',
      protocol: 'udp',
      address: '203.0.113.199',
      port: port,
      priority: 1686052607,
      desc: 'Öffentliche WAN-Adresse via STUN-Server (NAT-Traversal)'
    },
    {
      candidate: `candidate:3 1 UDP 41885439 198.51.100.80 ${port + 10} typ relay raddr 203.0.113.199 rport ${port}`,
      type: 'relay',
      protocol: 'udp',
      address: '198.51.100.80',
      port: port + 10,
      priority: 41885439,
      desc: 'Relay-Adresse via TURN-Server (Symmetric NAT Fallback)'
    }
  ];
}

/**
 * Transmit DataChannel Packet with simulated Latency & Packet Loss
 */
export function simulateDataChannelTransmit({
  message,
  senderName,
  latencyMs = 30,
  dropRatePercent = 0
}) {
  const isDropped = Math.random() * 100 < dropRatePercent;
  const seq = Math.floor(Math.random() * 9000 + 1000);
  const now = new Date().toLocaleTimeString();

  return {
    seq,
    sender: senderName,
    text: message,
    timestamp: now,
    latencyMs,
    isDropped,
    status: isDropped ? 'DROPPED (SCTP Retransmission required)' : 'DELIVERED (Ack Received)'
  };
}
