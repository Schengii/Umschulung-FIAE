import { describe, it, expect } from 'vitest';
import {
  validateHandshakeHeaders,
  buildFrameAnalysis,
  transitionWsState,
  WS_OPCODES,
  WEBSOCKETS_DRILL_QUESTIONS
} from './webSocketsEngine';

describe('webSocketsEngine', () => {
  describe('validateHandshakeHeaders', () => {
    it('akzeptiert korrekte RFC 6455 Handshake-Header', () => {
      const headers = {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
        'Sec-WebSocket-Version': '13'
      };
      const res = validateHandshakeHeaders(headers);
      expect(res.isValid).toBe(true);
      expect(res.issues.length).toBe(0);
      expect(res.key).toBe('dGhlIHNhbXBsZSBub25jZQ==');
    });

    it('erkennt fehlende Upgrade- und Key-Header', () => {
      const headers = {
        'Connection': 'keep-alive',
        'Sec-WebSocket-Version': '12'
      };
      const res = validateHandshakeHeaders(headers);
      expect(res.isValid).toBe(false);
      expect(res.issues.some((i) => i.includes('Upgrade: websocket'))).toBe(true);
      expect(res.issues.some((i) => i.includes('Sec-WebSocket-Key'))).toBe(true);
      expect(res.issues.some((i) => i.includes('Sec-WebSocket-Version: 13'))).toBe(true);
    });
  });

  describe('buildFrameAnalysis', () => {
    it('verlangt Maskierung bei Client-to-Server Frames', () => {
      const unmaskedClientFrame = buildFrameAnalysis({
        fin: true,
        opcode: WS_OPCODES.TEXT.code,
        masked: false,
        isClientToServer: true,
        payloadText: 'Hello'
      });
      expect(unmaskedClientFrame.isValid).toBe(false);
      expect(unmaskedClientFrame.issues.some((i) => i.includes('MÜSSEN mit 4-Byte Masking-Key maskiert sein'))).toBe(true);

      const maskedClientFrame = buildFrameAnalysis({
        fin: true,
        opcode: WS_OPCODES.TEXT.code,
        masked: true,
        isClientToServer: true,
        payloadText: 'Hello'
      });
      expect(maskedClientFrame.isValid).toBe(true);
      expect(maskedClientFrame.headerSize).toBe(6); // 2 Base + 4 Masking Key
      expect(maskedClientFrame.totalSize).toBe(11); // 6 + 5 Bytes
    });

    it('verbietet Maskierung bei Server-to-Client Frames', () => {
      const maskedServerFrame = buildFrameAnalysis({
        fin: true,
        opcode: WS_OPCODES.TEXT.code,
        masked: true,
        isClientToServer: false,
        payloadText: 'Server Message'
      });
      expect(maskedServerFrame.isValid).toBe(false);
      expect(maskedServerFrame.issues.some((i) => i.includes('Server-an-Client Frames dürfen NICHT maskiert sein'))).toBe(true);
    });

    it('überprüft Beschränkungen von Control-Frames (Ping/Pong/Close)', () => {
      const fragmentedPing = buildFrameAnalysis({
        fin: false,
        opcode: WS_OPCODES.PING.code,
        masked: true,
        isClientToServer: true,
        payloadText: 'Ping'
      });
      expect(fragmentedPing.isValid).toBe(false);
      expect(fragmentedPing.issues.some((i) => i.includes('nicht fragmentiert'))).toBe(true);

      const hugePing = buildFrameAnalysis({
        fin: true,
        opcode: WS_OPCODES.PING.code,
        masked: true,
        isClientToServer: true,
        payloadText: 'A'.repeat(130)
      });
      expect(hugePing.isValid).toBe(false);
      expect(hugePing.issues.some((i) => i.includes('maximal 125 Bytes'))).toBe(true);
    });
  });

  describe('transitionWsState', () => {
    it('durchläuft den regulären Lifecycle CONNECTING -> OPEN -> CLOSING -> CLOSED', () => {
      let state = transitionWsState('CONNECTING', 'HANDSHAKE_OK');
      expect(state).toBe('OPEN');

      state = transitionWsState(state, 'START_CLOSE');
      expect(state).toBe('CLOSING');

      state = transitionWsState(state, 'CLOSE_FRAME_RECEIVED');
      expect(state).toBe('CLOSED');
    });

    it('schließt Verbindung direkt bei TCP_ERROR', () => {
      expect(transitionWsState('CONNECTING', 'ERROR')).toBe('CLOSED');
      expect(transitionWsState('OPEN', 'ERROR')).toBe('CLOSED');
    });
  });

  describe('WEBSOCKETS_DRILL_QUESTIONS', () => {
    it('liefert 4 fundierte Fragen mit Erklärungen', () => {
      expect(WEBSOCKETS_DRILL_QUESTIONS.length).toBe(4);
      WEBSOCKETS_DRILL_QUESTIONS.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.question).toBeDefined();
        expect(q.options.length).toBe(4);
        expect(typeof q.correct).toBe('number');
        expect(q.explanation).toBeDefined();
      });
    });
  });
});

