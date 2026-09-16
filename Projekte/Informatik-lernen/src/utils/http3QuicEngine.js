/**
 * HTTP/3 & QUIC Protocol Engine
 * Simuliert UDP-basiertes QUIC-Multiplexing, Head-of-Line-Blocking-Verhalten bei Paketverlust,
 * 0-RTT/1-RTT Handshakes und Connection-ID Migration im Vergleich zu HTTP/1.1 und HTTP/2 (TCP).
 */

export const PROTOCOL_SPECS = {
  'HTTP/1.1': {
    name: 'HTTP/1.1 (TCP)',
    transport: 'TCP + TLS 1.2/1.3',
    maxParallelSockets: 6,
    handshakeRttInitial: 3, // TCP SYN/ACK (1 RTT) + TLS (1-2 RTT)
    handshakeRttResumed: 2,
    headOfLineBlockingScope: 'Verbindungs-Ebene (FIFO Queue pro Socket)',
    multiplexing: 'Kein echtes Multiplexing (6 parallele TCP-Sockets)',
    connectionMigration: false,
    color: '#94a3b8'
  },
  'HTTP/2': {
    name: 'HTTP/2 (TCP)',
    transport: 'Single TCP Socket + TLS 1.3',
    maxParallelSockets: 1,
    handshakeRttInitial: 2, // TCP (1 RTT) + TLS 1.3 (1 RTT)
    handshakeRttResumed: 1,
    headOfLineBlockingScope: 'TCP-Transport-Ebene (1 Paketverlust blockiert ALLE Streams)',
    multiplexing: 'Single-TCP Stream Multiplexing',
    connectionMigration: false,
    color: '#f59e0b'
  },
  'HTTP/3': {
    name: 'HTTP/3 (QUIC / UDP)',
    transport: 'QUIC über UDP',
    maxParallelSockets: 1,
    handshakeRttInitial: 1, // Kombinierter QUIC- & TLS 1.3-Handshake (1 RTT)
    handshakeRttResumed: 0, // 0-RTT (Early Data mit pre-shared keys)
    headOfLineBlockingScope: 'Kein HoL-Blocking (Verlust isoliert auf betroffenen Stream)',
    multiplexing: 'Unabhängige Transport-Streams auf UDP-Ebene',
    connectionMigration: true, // Erhält Verbindung via 64-Bit Connection ID (CID)
    color: '#38bdf8'
  }
};

/**
 * Simuliert Handshake-Latenz
 */
export function calculateHandshakeLatency(protocol, baseRttMs = 50, isResumed = false) {
  const spec = PROTOCOL_SPECS[protocol] || PROTOCOL_SPECS['HTTP/3'];
  const rtts = isResumed ? spec.handshakeRttResumed : spec.handshakeRttInitial;
  return {
    protocol,
    rttCount: rtts,
    latencyMs: rtts * baseRttMs,
    is0RttPossible: protocol === 'HTTP/3' && isResumed
  };
}

/**
 * Simuliert parallele Ressourcenübertragungen unter Paketverlust
 */
export function simulateStreamTransfer({
  protocol = 'HTTP/3',
  streamCount = 4,
  packetLossRate = 0.1, // 10%
  baseRttMs = 40,
  packetsPerStream = 8,
  seed = null
}) {
  const spec = PROTOCOL_SPECS[protocol] || PROTOCOL_SPECS['HTTP/3'];
  const streams = [];

  let pseudoRand = seed !== null ? seed : Math.random();
  const getNextRand = () => {
    pseudoRand = (pseudoRand * 9301 + 49297) % 233280;
    return pseudoRand / 233280;
  };

  let anyPacketLost = false;
  const lostPacketsByStream = [];

  for (let s = 0; s < streamCount; s++) {
    let streamLostPackets = 0;
    for (let p = 0; p < packetsPerStream; p++) {
      if (getNextRand() < packetLossRate) {
        streamLostPackets++;
        anyPacketLost = true;
      }
    }
    lostPacketsByStream.push(streamLostPackets);
  }

  // Übertragungszeiten berechnen
  const baseTransferTime = (packetsPerStream / 2) * (baseRttMs / 2);
  const retransmitDelay = baseRttMs * 1.5;

  let totalHolPenaltyMs = 0;

  for (let s = 0; s < streamCount; s++) {
    const lostCount = lostPacketsByStream[s];
    let streamTime = baseTransferTime + (lostCount * retransmitDelay);
    let isStalledByHoL = false;

    if (protocol === 'HTTP/2') {
      // In HTTP/2: Wenn irgendein Paket im TCP-Stream verloren geht,
      // müssen ALLE nachfolgenden Streams warten bis TCP retransmittiert hat!
      if (anyPacketLost && lostCount === 0) {
        const maxLoss = Math.max(...lostPacketsByStream);
        const holStall = maxLoss * retransmitDelay * 0.75;
        streamTime += holStall;
        isStalledByHoL = true;
        totalHolPenaltyMs += holStall;
      }
    } else if (protocol === 'HTTP/1.1') {
      // In HTTP/1.1: 6 Sockets parallel, Verlust betrifft nur den jeweiligen Socket
      if (s >= 6) {
        // Queueing delay für Verbindungen > 6
        streamTime += baseTransferTime * 0.8;
      }
    } else {
      // HTTP/3 (QUIC): Unabhängige Streams! Verlust in Stream X betrifft nur Stream X.
      isStalledByHoL = false;
    }

    streams.push({
      streamId: s + 1,
      name: `Resource-${s + 1}.${['js', 'css', 'webp', 'json', 'woff2', 'svg'][s % 6]}`,
      packetsTotal: packetsPerStream,
      packetsLost: lostCount,
      durationMs: Math.round(streamTime),
      isStalledByHoL
    });
  }

  const maxDuration = Math.max(...streams.map(st => st.durationMs));
  const avgDuration = Math.round(streams.reduce((acc, st) => acc + st.durationMs, 0) / streams.length);

  return {
    protocol,
    spec,
    streamCount,
    packetLossRate,
    anyPacketLost,
    streams,
    totalDurationMs: maxDuration,
    avgDurationMs: avgDuration,
    totalHolPenaltyMs: Math.round(totalHolPenaltyMs),
    isHoLEliminated: protocol === 'HTTP/3'
  };
}

/**
 * Simuliert Connection Migration (z.B. Wechsel von WLAN zu 5G Mobilfunk)
 */
export function simulateConnectionMigration(protocol) {
  if (protocol === 'HTTP/3') {
    return {
      protocol,
      success: true,
      description: 'Unterbrechungsfreier Wechsel durch 64-Bit Connection-ID (CID) im QUIC-Header. Keine Neu-Initialisierung nötig.',
      handshakeDelayMs: 0,
      socketsRebuilt: 0
    };
  }

  return {
    protocol,
    success: false,
    description: 'Verbindung bricht ab! TCP 4-Tupel (SrcIP, SrcPort, DstIP, DstPort) ist an die IP gebunden. Kompletter TCP- & TLS-Neuaufbau erforderlich.',
    handshakeDelayMs: 120,
    socketsRebuilt: protocol === 'HTTP/1.1' ? 6 : 1
  };
}
