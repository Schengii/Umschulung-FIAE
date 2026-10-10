// @ts-check
/**
 * RFC 793 Transmission Control Protocol (TCP) State Machine Engine
 * Simulates client/server TCP connection lifecycle:
 * - 3-Way Handshake: SYN -> SYN-ACK -> ACK
 * - Data Transfer: PSH-ACK, SEQ/ACK progression
 * - Connection Teardown: FIN -> ACK -> FIN -> ACK (TIME-WAIT 2MSL)
 * - Reset / Abort: RST
 * @module tcpStateMachineEngine
 */

/**
 * @typedef {'CLOSED' | 'LISTEN' | 'SYN_SENT' | 'SYN_RECEIVED' | 'ESTABLISHED' | 'FIN_WAIT_1' | 'FIN_WAIT_2' | 'TIME_WAIT' | 'CLOSE_WAIT' | 'LAST_ACK'} TcpState
 *
 * @typedef {{
 *   syn?: boolean;
 *   ack?: boolean;
 *   fin?: boolean;
 *   rst?: boolean;
 *   psh?: boolean;
 *   seq: number;
 *   ackNum: number;
 *   payloadBytes?: number;
 *   description?: string;
 * }} TcpPacket
 *
 * @typedef {{
 *   clientState: TcpState;
 *   serverState: TcpState;
 *   clientSeq: number;
 *   serverSeq: number;
 *   history: Array<{
 *     step: number;
 *     sender: 'CLIENT' | 'SERVER';
 *     packet: TcpPacket;
 *     clientStateAfter: TcpState;
 *     serverStateAfter: TcpState;
 *     note: string;
 *   }>;
 * }} TcpSession
 */

/**
 * Initializes a new TCP Session
 * @param {number} [clientInitialSeq]
 * @param {number} [serverInitialSeq]
 * @returns {TcpSession}
 */
export function createTcpSession(clientInitialSeq = 1000, serverInitialSeq = 5000) {
  return {
    clientState: 'CLOSED',
    serverState: 'LISTEN',
    clientSeq: clientInitialSeq,
    serverSeq: serverInitialSeq,
    history: [],
  };
}

/**
 * Executes a state transition by sending a packet from sender to receiver
 * @param {TcpSession} session
 * @param {'CLIENT' | 'SERVER'} sender
 * @param {Partial<TcpPacket>} packetConfig
 * @returns {TcpSession}
 */
export function sendTcpPacket(session, sender, packetConfig) {
  const newSession = {
    ...session,
    history: [...session.history],
  };

  const isClient = sender === 'CLIENT';
  let note = '';

  const packet = {
    syn: !!packetConfig.syn,
    ack: !!packetConfig.ack,
    fin: !!packetConfig.fin,
    rst: !!packetConfig.rst,
    psh: !!packetConfig.psh,
    seq: packetConfig.seq !== undefined ? packetConfig.seq : isClient ? newSession.clientSeq : newSession.serverSeq,
    ackNum: packetConfig.ackNum !== undefined ? packetConfig.ackNum : isClient ? newSession.serverSeq + 1 : newSession.clientSeq + 1,
    payloadBytes: packetConfig.payloadBytes || 0,
    description: packetConfig.description || '',
  };

  // 1. Reset handling
  if (packet.rst) {
    newSession.clientState = 'CLOSED';
    newSession.serverState = 'LISTEN';
    note = 'RST empfangen: Verbindung sofort zurückgesetzt.';
  }
  // 2. Client sends SYN (Active Open)
  else if (isClient && packet.syn && !packet.ack) {
    if (newSession.clientState === 'CLOSED') {
      newSession.clientState = 'SYN_SENT';
      newSession.clientSeq = packet.seq + 1;
      note = 'Client initiiert Active Open: SYN gesendet (SYN_SENT).';
    }
  }
  // 3. Server receives SYN and responds with SYN+ACK
  else if (!isClient && packet.syn && packet.ack) {
    if (newSession.serverState === 'LISTEN' || newSession.clientState === 'SYN_SENT') {
      newSession.serverState = 'SYN_RECEIVED';
      newSession.serverSeq = packet.seq + 1;
      note = 'Server bestätigt mit SYN+ACK (SYN_RECEIVED).';
    }
  }
  // 4. Client receives SYN+ACK and responds with ACK (Handshake complete)
  else if (isClient && packet.ack && !packet.syn && !packet.fin && newSession.clientState === 'SYN_SENT') {
    newSession.clientState = 'ESTABLISHED';
    newSession.serverState = 'ESTABLISHED';
    note = 'Client sendet finales ACK: 3-Way Handshake abgeschlossen (ESTABLISHED).';
  }
  // 5. Data Transmission
  else if (packet.psh && packet.ack) {
    if (isClient) {
      newSession.clientSeq += packet.payloadBytes || 100;
      note = `Client überträgt ${packet.payloadBytes || 100} Bytes Nutzdaten (PSH+ACK).`;
    } else {
      newSession.serverSeq += packet.payloadBytes || 100;
      note = `Server sendet ${packet.payloadBytes || 100} Bytes Antwortdaten (PSH+ACK).`;
    }
  }
  // 6. Client initiates Teardown with FIN
  else if (isClient && packet.fin && newSession.clientState === 'ESTABLISHED') {
    newSession.clientState = 'FIN_WAIT_1';
    newSession.serverState = 'CLOSE_WAIT';
    newSession.clientSeq += 1;
    note = 'Client initiiert Teardown mit FIN: Wechsel in FIN_WAIT_1, Server wechselt in CLOSE_WAIT.';
  }
  // 7. Server acknowledges client's FIN
  else if (!isClient && packet.ack && !packet.fin && newSession.clientState === 'FIN_WAIT_1') {
    newSession.clientState = 'FIN_WAIT_2';
    note = 'Server quittiert FIN mit ACK: Client wechselt in FIN_WAIT_2.';
  }
  // 8. Server sends its own FIN (Passive Close)
  else if (!isClient && packet.fin && (newSession.serverState === 'CLOSE_WAIT' || newSession.serverState === 'ESTABLISHED')) {
    newSession.serverState = 'LAST_ACK';
    newSession.clientState = 'TIME_WAIT';
    newSession.serverSeq += 1;
    note = 'Server sendet FIN: Wechsel in LAST_ACK, Client wechselt in TIME_WAIT (2MSL Timer).';
  }
  // 9. Client acknowledges Server's FIN
  else if (isClient && packet.ack && newSession.serverState === 'LAST_ACK') {
    newSession.serverState = 'CLOSED';
    note = 'Client bestätigt Server-FIN mit ACK: Server schließt Verbindung (CLOSED). Client verweilt im TIME_WAIT.';
  } else {
    note = `${sender} sendet reguläres TCP-Paket (${Object.entries(packet).filter(([k, v]) => v && ['syn', 'ack', 'fin', 'rst', 'psh'].includes(k)).map(([k]) => k.toUpperCase()).join('+') || 'ACK'}).`;
  }

  newSession.history.push({
    step: newSession.history.length + 1,
    sender,
    packet,
    clientStateAfter: newSession.clientState,
    serverStateAfter: newSession.serverState,
    note,
  });

  return newSession;
}

/** Vorkonfigurierte Handshake & Teardown Szenarien */
export const TCP_SCENARIOS = {
  threeWayHandshake: [
    { sender: /** @type {const} */ ('CLIENT'), packet: { syn: true, seq: 1000, description: 'SYN (Seq=1000)' } },
    { sender: /** @type {const} */ ('SERVER'), packet: { syn: true, ack: true, seq: 5000, ackNum: 1001, description: 'SYN-ACK (Seq=5000, Ack=1001)' } },
    { sender: /** @type {const} */ ('CLIENT'), packet: { ack: true, seq: 1001, ackNum: 5001, description: 'ACK (Seq=1001, Ack=5001)' } },
  ],
  connectionTeardown: [
    { sender: /** @type {const} */ ('CLIENT'), packet: { fin: true, ack: true, seq: 1001, ackNum: 5001, description: 'FIN-ACK (Seq=1001)' } },
    { sender: /** @type {const} */ ('SERVER'), packet: { ack: true, seq: 5001, ackNum: 1002, description: 'ACK (Seq=5001, Ack=1002)' } },
    { sender: /** @type {const} */ ('SERVER'), packet: { fin: true, ack: true, seq: 5001, ackNum: 1002, description: 'FIN-ACK (Seq=5001)' } },
    { sender: /** @type {const} */ ('CLIENT'), packet: { ack: true, seq: 1002, ackNum: 5002, description: 'ACK (Seq=1002, Ack=5002) -> TIME_WAIT' } },
  ],
};
