import { describe, it, expect } from 'vitest';
import {
  createTcpSession,
  sendTcpPacket,
} from './tcpStateMachineEngine';

describe('tcpStateMachineEngine', () => {
  it('initializes session in CLOSED/LISTEN state', () => {
    const session = createTcpSession(1000, 5000);
    expect(session.clientState).toBe('CLOSED');
    expect(session.serverState).toBe('LISTEN');
    expect(session.clientSeq).toBe(1000);
    expect(session.serverSeq).toBe(5000);
  });

  it('completes 3-way handshake to ESTABLISHED', () => {
    let session = createTcpSession(1000, 5000);

    // 1. Client -> Server: SYN
    session = sendTcpPacket(session, 'CLIENT', { syn: true, seq: 1000 });
    expect(session.clientState).toBe('SYN_SENT');

    // 2. Server -> Client: SYN+ACK
    session = sendTcpPacket(session, 'SERVER', { syn: true, ack: true, seq: 5000, ackNum: 1001 });
    expect(session.serverState).toBe('SYN_RECEIVED');

    // 3. Client -> Server: ACK
    session = sendTcpPacket(session, 'CLIENT', { ack: true, seq: 1001, ackNum: 5001 });
    expect(session.clientState).toBe('ESTABLISHED');
    expect(session.serverState).toBe('ESTABLISHED');
  });

  it('executes 4-way teardown to TIME_WAIT & CLOSED', () => {
    let session = createTcpSession();
    // Simulate already established
    session.clientState = 'ESTABLISHED';
    session.serverState = 'ESTABLISHED';

    // 1. Client -> Server: FIN
    session = sendTcpPacket(session, 'CLIENT', { fin: true, ack: true });
    expect(session.clientState).toBe('FIN_WAIT_1');
    expect(session.serverState).toBe('CLOSE_WAIT');

    // 2. Server -> Client: ACK
    session = sendTcpPacket(session, 'SERVER', { ack: true });
    expect(session.clientState).toBe('FIN_WAIT_2');

    // 3. Server -> Client: FIN
    session = sendTcpPacket(session, 'SERVER', { fin: true, ack: true });
    expect(session.serverState).toBe('LAST_ACK');
    expect(session.clientState).toBe('TIME_WAIT');

    // 4. Client -> Server: ACK
    session = sendTcpPacket(session, 'CLIENT', { ack: true });
    expect(session.serverState).toBe('CLOSED');
    expect(session.clientState).toBe('TIME_WAIT');
  });

  it('handles RST packet by closing connection', () => {
    let session = createTcpSession();
    session.clientState = 'ESTABLISHED';
    session.serverState = 'ESTABLISHED';

    session = sendTcpPacket(session, 'SERVER', { rst: true });
    expect(session.clientState).toBe('CLOSED');
    expect(session.serverState).toBe('LISTEN');
  });
});
