/**
 * TLS 1.3 0-RTT Replay Attack & Anti-Replay Mechanism Engine
 * Simuliert Early Data (0-RTT), Replay-Angriffe und serverseitige Gegenmaßnahmen nach RFC 8446.
 */

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
 * 
 * @param {Object} params
 * @param {Object} params.session - Die TLS-Session mit PSK und Ticket
 * @param {Object} params.request - Der HTTP-Request (Methode, Pfad, Idempotenz)
 * @param {string} params.antiReplay - Ausgewählter Schutzmechanismus (none, single_use_tickets, client_timestamps, strike_register)
 * @param {Set|Array} params.serverStrikeRegister - Bisher gesehene Ticket-Hashes / IDs
 * @param {number} params.clientTimestampSkewMs - Abweichung der Client-Zeit in ms
 * @param {boolean} params.isReplayed - Ob es sich um ein abgefangenes Replay-Paket handelt
 */
export function processTls0RttRequest({
  session,
  request,
  antiReplay = ANTI_REPLAY_MECHANISMS.NONE,
  serverStrikeRegister = new Set(),
  clientTimestampSkewMs = 0,
  isReplayed = false
}) {
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
 */
export function auditTls0RttConfiguration({ allowNonIdempotent0Rtt, antiReplay, maxEarlyDataBytes }) {
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
