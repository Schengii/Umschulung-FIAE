// @ts-check
/**
 * Fachlogik-Engine für das WebSockets & Realtime Lab.
 * Implementiert RFC 6455 Handshake-Validierung, Frame-Parsing (Opcodes, Masking)
 * und Verbindungs-Zustandsautomaten.
 */

export const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

export const WS_OPCODES = {
  CONTINUATION: { code: 0x0, name: 'Continuation Frame', isControl: false },
  TEXT: { code: 0x1, name: 'Text Frame (UTF-8)', isControl: false },
  BINARY: { code: 0x2, name: 'Binary Frame', isControl: false },
  CLOSE: { code: 0x8, name: 'Connection Close', isControl: true },
  PING: { code: 0x9, name: 'Heartbeat Ping', isControl: true },
  PONG: { code: 0xa, name: 'Heartbeat Pong', isControl: true }
};

/**
 * Validiert die HTTP-Upgrade-Header eines WebSocket-Handshakes (RFC 6455).
 * @param {Record<string, string>} headers
 */
export function validateHandshakeHeaders(headers) {
  const issues = [];
  const normalized = Object.entries(headers).reduce((acc, [k, v]) => {
    acc[k.toLowerCase()] = v.trim();
    return acc;
  }, /** @type {Record<string, string>} */ ({}));

  if (normalized['upgrade']?.toLowerCase() !== 'websocket') {
    issues.push("Header 'Upgrade: websocket' fehlt oder ist inkorrekt.");
  }
  if (!normalized['connection']?.toLowerCase().includes('upgrade')) {
    issues.push("Header 'Connection: Upgrade' fehlt.");
  }
  if (!normalized['sec-websocket-key']) {
    issues.push("Header 'Sec-WebSocket-Key' fehlt (erforderlich für Handshake-Integrität).");
  }
  if (normalized['sec-websocket-version'] !== '13') {
    issues.push("Header 'Sec-WebSocket-Version: 13' erforderlich (RFC 6455 Standard).");
  }

  const isValid = issues.length === 0;

  return {
    isValid,
    issues,
    key: normalized['sec-websocket-key'] || '',
    version: normalized['sec-websocket-version'] || ''
  };
}

/**
 * Validiert und berechnet die Struktur eines WebSocket-Frames (RFC 6455 Sec 5.2).
 * @param {{
 *   fin: boolean,
 *   opcode: number,
 *   masked: boolean,
 *   isClientToServer: boolean,
 *   payloadText: string
 * }} params
 */
export function buildFrameAnalysis({ fin, opcode, masked, isClientToServer, payloadText }) {
  const issues = [];
  const payloadBytes = new TextEncoder().encode(payloadText).length;

  // RFC 6455 Sec 5.1: Client-an-Server MUSS zwingend maskiert sein
  if (isClientToServer && !masked) {
    issues.push('RFC 6455 Verstoß: Client-an-Server Frames MÜSSEN mit 4-Byte Masking-Key maskiert sein (Schutz vor Cache-Poisoning).');
  }
  if (!isClientToServer && masked) {
    issues.push('RFC 6455 Verstoß: Server-an-Client Frames dürfen NICHT maskiert sein.');
  }

  // Control Frames dürfen maximal 125 Bytes Payload haben und FIN muss true sein
  const isControl = (opcode & 0x8) !== 0;
  if (isControl) {
    if (!fin) {
      issues.push('Control-Frames (Ping/Pong/Close) dürfen nicht fragmentiert werden (FIN muss true sein).');
    }
    if (payloadBytes > 125) {
      issues.push(`Control-Frames dürfen maximal 125 Bytes Nutzlast tragen (aktuell: ${payloadBytes} Bytes).`);
    }
  }

  // Header-Größe berechnen
  let headerSize = 2; // Fin/Opcode Byte + Mask/Len Byte
  if (payloadBytes > 125 && payloadBytes <= 65535) {
    headerSize += 2; // 16-Bit Extended Length
  } else if (payloadBytes > 65535) {
    headerSize += 8; // 64-Bit Extended Length
  }
  if (masked) {
    headerSize += 4; // 4-Byte Masking Key
  }

  const totalSize = headerSize + payloadBytes;

  return {
    isValid: issues.length === 0,
    issues,
    isControl,
    headerSize,
    payloadBytes,
    totalSize,
    overheadPercentage: Math.round((headerSize / Math.max(1, totalSize)) * 100)
  };
}

/**
 * Zustandsübergänge der WebSocket-Verbindung.
 * @param {'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'} currentState
 * @param {'HANDSHAKE_OK' | 'SEND_DATA' | 'START_CLOSE' | 'CLOSE_FRAME_RECEIVED' | 'ERROR'} event
 */
export function transitionWsState(currentState, event) {
  switch (currentState) {
    case 'CONNECTING':
      if (event === 'HANDSHAKE_OK') return 'OPEN';
      if (event === 'ERROR') return 'CLOSED';
      return currentState;
    case 'OPEN':
      if (event === 'START_CLOSE') return 'CLOSING';
      if (event === 'CLOSE_FRAME_RECEIVED') return 'CLOSING';
      if (event === 'ERROR') return 'CLOSED';
      return currentState;
    case 'CLOSING':
      if (event === 'CLOSE_FRAME_RECEIVED' || event === 'HANDSHAKE_OK' || event === 'ERROR') return 'CLOSED';
      return currentState;
    case 'CLOSED':
      return 'CLOSED';
    default:
      return 'CLOSED';
  }
}

export const WEBSOCKETS_DRILL_QUESTIONS = [
  {
    id: 'ws-q1',
    question: 'Welcher HTTP-Statuscode wird vom Server zurückgegeben, um den erfolgreichen WebSocket-Upgrade-Handshake zu bestätigen?',
    options: [
      '200 OK',
      '101 Switching Protocols',
      '301 Moved Permanently',
      '204 No Content'
    ],
    correct: 1,
    explanation: 'Der Server antwortet mit Statuscode 101 (Switching Protocols), wenn er den Handshake akzeptiert. Ab diesem Moment wechselt das Protokoll auf dem bestehenden TCP-Socket von HTTP zu WebSocket.'
  },
  {
    id: 'ws-q2',
    question: 'Warum MÜSSEN Frames vom Client zum Server laut RFC 6455 zwingend mit einem 4-Byte-XOR-Schlüssel maskiert werden?',
    options: [
      'Zur Verschlüsselung der Nutzdaten gegen Lauschangriffe im LAN.',
      'Um unberechtigte Zwischen-Proxies daran zu hindern, WebSocket-Frames fälschlicherweise als HTTP-Requests zu cachen (Verhinderung von Cache Poisoning).',
      'Weil TCP keine unmaskierten Binärdaten übertragen kann.',
      'Zur Komprimierung der übertragenen Zeichenketten.'
    ],
    correct: 1,
    explanation: 'Das Masking verhindert, dass böswillige Scripts über den Browser HTTP-Header in Frames injizieren, die von transparenten Proxies fehlinterpretiert und gecacht werden könnten (Proxy Cache Poisoning).'
  },
  {
    id: 'ws-q3',
    question: 'Welcher Opcode wird für Heartbeat-Keepalive-Pings verwendet und welche Einschränkung gilt für Control-Frames?',
    options: [
      'Opcode 0x9 (Ping); Control-Frames dürfen maximal 125 Bytes Nutzlast haben und nicht fragmentiert werden.',
      'Opcode 0x1; Nutzlast darf unbegrenzt sein.',
      'Opcode 0x8; Control-Frames müssen immer binär codiert sein.',
      'Opcode 0x0; Ping darf nur alle 60 Sekunden gesendet werden.'
    ],
    correct: 0,
    explanation: 'Control-Frames wie Ping (0x9), Pong (0xA) und Close (0x8) haben ein 7-Bit-Längenlimit (max. 125 Bytes) und dürfen nicht durch FIN=false fragmentiert werden.'
  },
  {
    id: 'ws-q4',
    question: 'Welcher wesentliche Architekturunterschied besteht zwischen WebSockets und HTTP Polling bzw. Server-Sent Events (SSE)?',
    options: [
      'WebSockets unterstützen ausschließlich XML-Formate.',
      'WebSockets bieten eine echte bidirektionale Vollduplex-Verbindung über eine persistente TCP-Verbindung, während SSE rein unidirektional (Server zu Client) ist.',
      'HTTP Polling verbraucht weniger Server-Ressourcen bei hoher Echtzeit-Nachrichtendichte.',
      'WebSockets erfordern für jede Nachricht einen erneuten TCP-Handshake.'
    ],
    correct: 1,
    explanation: 'WebSockets erlauben gleichzeitigen bidirektionalen Vollduplex-Datenaustausch mit minimalem Frame-Overhead (2–10 Bytes), während SSE nur Server-Push liefert und Polling ständige HTTP-Header-Overheads erzeugt.'
  }
];

