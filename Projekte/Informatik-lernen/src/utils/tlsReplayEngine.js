// @ts-check
/**
 * TLS 1.3 0-RTT Replay Attack & Anti-Replay Mechanism Engine
 * Simuliert Early Data (0-RTT), Replay-Angriffe und serverseitige Gegenmaßnahmen nach RFC 8446.
 */

/**
 * @typedef {'none' | 'single_use_tickets' | 'client_timestamps' | 'strike_register'} AntiReplayMechanism
 *
 * @typedef {object} TlsSession
 * @property {string} sessionId
 * @property {string} psk
 * @property {number} ticketAge
 * @property {number} maxTicketAge
 * @property {number} createdAt
 * @property {boolean} isUsed
 *
 * @typedef {object} TlsRequest
 * @property {string} method
 * @property {string} path
 * @property {string} [body]
 * @property {boolean} idempotent
 * @property {boolean} safe
 *
 * @typedef {object} ProcessTls0RttInput
 * @property {TlsSession} session
 * @property {TlsRequest} request
 * @property {AntiReplayMechanism} [antiReplay]
 * @property {Set<string> | string[]} [serverStrikeRegister]
 * @property {number} [clientTimestampSkewMs]
 * @property {boolean} [isReplayed]
 *
 * @typedef {object} ProcessTls0RttResult
 * @property {boolean} accepted0Rtt
 * @property {boolean} executedRequest
 * @property {number} status
 * @property {number} rttCount
 * @property {'safe' | 'low' | 'high' | 'critical'} riskLevel
 * @property {string} message
 * @property {string | null} rejectionReason
 * @property {boolean} strikeRegisterUpdated
 *
 * @typedef {object} AuditTls0RttInput
 * @property {boolean} allowNonIdempotent0Rtt
 * @property {AntiReplayMechanism} antiReplay
 * @property {number} maxEarlyDataBytes
 *
 * @typedef {object} AuditTls0RttResult
 * @property {number} score
 * @property {'A+' | 'B' | 'C' | 'F'} grade
 * @property {boolean} isCompliant
 * @property {string[]} issues
 */

/** @type {Record<'NONE' | 'SINGLE_USE_TICKETS' | 'CLIENT_TIMESTAMPS' | 'STRIKE_REGISTER', AntiReplayMechanism>} */
export const ANTI_REPLAY_MECHANISMS = {
  NONE: 'none',
  SINGLE_USE_TICKETS: 'single_use_tickets',
  CLIENT_TIMESTAMPS: 'client_timestamps',
  STRIKE_REGISTER: 'strike_register'
};

export const REQUEST_METHODS = {
  GET: { method: 'GET', path: '/api/v1/user/profile', idempotent: true, safe: true },
  POST_PAYMENT: { method: 'POST', path: '/api/v1/transfers', body: '{"amount": 500, "to": "DE44123"}', idempotent: false, safe: false },
  PUT_CONFIG: { method: 'PUT', path: '/api/v1/settings', body: '{"theme": "dark"}', idempotent: true, safe: false }
};

/**
 * Erstellt eine neue TLS 1.3 0-RTT Session
 * @param {{ sessionId?: string, psk?: string, ticketAge?: number, maxTicketAge?: number }} [options]
 * @returns {TlsSession}
 */
export function createTlsSession(options = {}) {
  const sessionId = options.sessionId || 'tls-sess-' + Math.random().toString(36).substring(2, 9);
  const psk = options.psk || 'psk_' + Math.random().toString(36).substring(2, 12);
  const ticketAge = options.ticketAge || 0; // Sekunden
  const maxTicketAge = options.maxTicketAge || 300; // 5 Minuten

  return {
    sessionId,
    psk,
    ticketAge,
    maxTicketAge,
    createdAt: Date.now() - (ticketAge * 1000),
    isUsed: false
  };
}

/**
 * Simuliert das Senden einer 0-RTT Early-Data Anfrage an den Server
 * @param {ProcessTls0RttInput} input
 * @returns {ProcessTls0RttResult}
 */
export function processTls0RttRequest({
  session,
  request,
  antiReplay = ANTI_REPLAY_MECHANISMS.NONE,
  serverStrikeRegister = new Set(),
  clientTimestampSkewMs = 0,
  isReplayed = false
}) {
  /** @type {ProcessTls0RttResult} */
  const result = {
    accepted0Rtt: false,
    executedRequest: false,
    status: 200,
    rttCount: 0,
    riskLevel: 'safe', // 'safe' | 'low' | 'high' | 'critical'
    message: '',
    rejectionReason: null,
    strikeRegisterUpdated: false
  };

  const registerSet = serverStrikeRegister instanceof Set ? serverStrikeRegister : new Set(serverStrikeRegister);

  // 1. Grundlegende Ticket-Gültigkeit prüfen
  const ageInSeconds = (Date.now() - session.createdAt) / 1000;
  if (ageInSeconds > session.maxTicketAge) {
    result.accepted0Rtt = false;
    result.rttCount = 1; // Fallback auf 1-RTT Handshake
    result.rejectionReason = 'TICKET_EXPIRED';
    result.message = `Session-Ticket abgelaufen (${Math.round(ageInSeconds)}s > ${session.maxTicketAge}s). Fallback auf regulären 1-RTT TLS 1.3 Handshake.`;
    return result;
  }

  // 2. Anti-Replay Mechanismen prüfen
  if (antiReplay === ANTI_REPLAY_MECHANISMS.SINGLE_USE_TICKETS) {
    if (session.isUsed || isReplayed) {
      result.accepted0Rtt = false;
      result.rttCount = 1;
      result.rejectionReason = 'SINGLE_USE_TICKET_ALREADY_CONSUMED';
      result.message = 'Single-Use Ticket bereits verbraucht! Replay erfolgreich geblockt. Fallback auf 1-RTT.';
      result.riskLevel = 'safe';
      return result;
    }
  } else if (antiReplay === ANTI_REPLAY_MECHANISMS.CLIENT_TIMESTAMPS) {
    const absSkew = Math.abs(clientTimestampSkewMs);
    // Toleranzfenster z.B. max 5 Sekunden
    if (absSkew > 5000) {
      result.accepted0Rtt = false;
      result.rttCount = 1;
      result.rejectionReason = 'TIMESTAMP_WINDOW_EXCEEDED';
      result.message = `Client-Timestamp Skew (${absSkew}ms) außerhalb des 5s-Fensters. 0-RTT abgelehnt. Fallback auf 1-RTT.`;
      result.riskLevel = 'safe';
      return result;
    }
    if (isReplayed) {
      // Wenn der Angreifer das Paket nach Ablauf des Fensters replayt
      result.accepted0Rtt = false;
      result.rttCount = 1;
      result.rejectionReason = 'REPLAYED_AFTER_TIMESTAMP_WINDOW';
      result.message = 'Replay außerhalb des Zeitfensters abgewehrt.';
      result.riskLevel = 'safe';
      return result;
    }
  } else if (antiReplay === ANTI_REPLAY_MECHANISMS.STRIKE_REGISTER) {
    const ticketFingerprint = `${session.sessionId}_${session.psk.substring(0, 6)}`;
    if (registerSet.has(ticketFingerprint) || isReplayed) {
      result.accepted0Rtt = false;
      result.rttCount = 1;
      result.rejectionReason = 'STRIKE_REGISTER_DUPLICATE_FOUND';
      result.message = 'Ticket-Hash im Server Strike-Register gefunden! Replay-Angriff sicher verhindert. Fallback auf 1-RTT.';
      result.riskLevel = 'safe';
      return result;
    }
    registerSet.add(ticketFingerprint);
    result.strikeRegisterUpdated = true;
  }

  // Wenn kein Schutz aktiv ist und ein Replay stattfindet:
  if (antiReplay === ANTI_REPLAY_MECHANISMS.NONE && isReplayed) {
    result.accepted0Rtt = true;
    result.executedRequest = true;
    result.rttCount = 0;
    
    if (!request.idempotent) {
      result.riskLevel = 'critical';
      result.message = `⚠️ REPLAY-ANGRIFF ERFOLGREICH! Nicht-idempotenter Request (${request.method} ${request.path}) wurde doppelt ausgeführt! Möglicher finanzieller Schaden / Data Corruption!`;
    } else {
      result.riskLevel = 'low';
      result.message = `Replay ausgeführt für idempotenten Request (${request.method} ${request.path}). Kein Datenverlust, aber unnötige Serverlast.`;
    }
    return result;
  }

  // Regulärer erfolgreicher 0-RTT Request
  result.accepted0Rtt = true;
  result.executedRequest = true;
  result.rttCount = 0;
  result.riskLevel = request.idempotent ? 'safe' : 'high';
  result.message = request.idempotent
    ? `0-RTT Early Data (${request.method} ${request.path}) in 0 Millisekunden verarbeitet. Sicher, da idempotent.`
    : `0-RTT Early Data (${request.method} ${request.path}) verarbeitet. WARNUNG: Nicht-idempotente Operation in 0-RTT birgt Replay-Risiko!`;

  return result;
}

/**
 * Bewertet das Gesamtrisiko einer Serverkonfiguration für TLS 1.3 0-RTT
 * @param {AuditTls0RttInput} input
 * @returns {AuditTls0RttResult}
 */
export function auditTls0RttConfiguration({ allowNonIdempotent0Rtt, antiReplay, maxEarlyDataBytes }) {
  /** @type {string[]} */
  const issues = [];
  let score = 100;

  if (allowNonIdempotent0Rtt) {
    issues.push('Kritisch: Nicht-idempotente Anfragen (POST/DELETE) in 0-RTT Early Data zugelassen. Verstoß gegen RFC 8446.');
    score -= 45;
  }

  if (antiReplay === ANTI_REPLAY_MECHANISMS.NONE) {
    issues.push('Kritisch: Kein serverseitiger Anti-Replay-Mechanismus konfiguriert.');
    score -= 40;
  } else if (antiReplay === ANTI_REPLAY_MECHANISMS.CLIENT_TIMESTAMPS) {
    issues.push('Hinweis: Zeitfenster schützt nicht gegen Replay-Angriffe innerhalb des Fensters (Burst-Replay).');
    score -= 10;
  }

  if (maxEarlyDataBytes > 16384) {
    issues.push('Warnung: MaxEarlyDataSize sehr groß gewählt (>16KB). Erhöht Risiko für DoS-Angriffe.');
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    grade: score >= 90 ? 'A+' : score >= 75 ? 'B' : score >= 50 ? 'C' : 'F',
    isCompliant: !allowNonIdempotent0Rtt && antiReplay !== ANTI_REPLAY_MECHANISMS.NONE,
    issues
  };
}
