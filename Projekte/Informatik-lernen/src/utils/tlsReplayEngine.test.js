import { describe, it, expect } from 'vitest';
import { 
  createTlsSession, 
  processTls0RttRequest, 
  auditTls0RttConfiguration, 
  ANTI_REPLAY_MECHANISMS, 
  REQUEST_METHODS 
} from './tlsReplayEngine';

describe('tlsReplayEngine', () => {
  it('erstellt eine gültige TLS 1.3 Session mit Ticket', () => {
    const session = createTlsSession({ maxTicketAge: 600 });
    expect(session.sessionId).toContain('tls-sess-');
    expect(session.psk).toBeDefined();
    expect(session.maxTicketAge).toBe(600);
    expect(session.isUsed).toBe(false);
  });

  it('erkennt erfolgreichen Replay-Angriff auf POST ohne Schutz', () => {
    const session = createTlsSession();
    const result = processTls0RttRequest({
      session,
      request: REQUEST_METHODS.POST_PAYMENT,
      antiReplay: ANTI_REPLAY_MECHANISMS.NONE,
      isReplayed: true
    });

    expect(result.accepted0Rtt).toBe(true);
    expect(result.executedRequest).toBe(true);
    expect(result.riskLevel).toBe('critical');
    expect(result.message).toContain('REPLAY-ANGRIFF ERFOLGREICH');
  });

  it('wehrt Replay-Angriff mit Single-Use Ticket erfolgreich ab', () => {
    const session = createTlsSession();
    session.isUsed = true; // Bereits verbraucht

    const result = processTls0RttRequest({
      session,
      request: REQUEST_METHODS.POST_PAYMENT,
      antiReplay: ANTI_REPLAY_MECHANISMS.SINGLE_USE_TICKETS,
      isReplayed: true
    });

    expect(result.accepted0Rtt).toBe(false);
    expect(result.rttCount).toBe(1);
    expect(result.rejectionReason).toBe('SINGLE_USE_TICKET_ALREADY_CONSUMED');
    expect(result.riskLevel).toBe('safe');
  });

  it('wehrt Replay-Angriff über Server Strike-Register ab', () => {
    const session = createTlsSession();
    const strikeRegister = new Set();

    // 1. Reguläre Anfrage
    const res1 = processTls0RttRequest({
      session,
      request: REQUEST_METHODS.GET,
      antiReplay: ANTI_REPLAY_MECHANISMS.STRIKE_REGISTER,
      serverStrikeRegister: strikeRegister,
      isReplayed: false
    });
    expect(res1.accepted0Rtt).toBe(true);
    expect(res1.strikeRegisterUpdated).toBe(true);

    // 2. Replayed Anfrage
    const res2 = processTls0RttRequest({
      session,
      request: REQUEST_METHODS.GET,
      antiReplay: ANTI_REPLAY_MECHANISMS.STRIKE_REGISTER,
      serverStrikeRegister: strikeRegister,
      isReplayed: true
    });
    expect(res2.accepted0Rtt).toBe(false);
    expect(res2.rejectionReason).toBe('STRIKE_REGISTER_DUPLICATE_FOUND');
  });

  it('auditiert unsichere 0-RTT Konfiguration korrekt', () => {
    const badConfig = auditTls0RttConfiguration({
      allowNonIdempotent0Rtt: true,
      antiReplay: ANTI_REPLAY_MECHANISMS.NONE,
      maxEarlyDataBytes: 32768
    });
    expect(badConfig.isCompliant).toBe(false);
    expect(badConfig.score).toBeLessThan(50);
    expect(badConfig.grade).toBe('F');
    expect(badConfig.issues.length).toBeGreaterThanOrEqual(3);

    const goodConfig = auditTls0RttConfiguration({
      allowNonIdempotent0Rtt: false,
      antiReplay: ANTI_REPLAY_MECHANISMS.SINGLE_USE_TICKETS,
      maxEarlyDataBytes: 4096
    });
    expect(goodConfig.isCompliant).toBe(true);
    expect(goodConfig.grade).toBe('A+');
    expect(goodConfig.issues.length).toBe(0);
  });
});
