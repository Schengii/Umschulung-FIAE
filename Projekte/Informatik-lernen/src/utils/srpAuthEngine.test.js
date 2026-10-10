import { describe, it, expect } from 'vitest';
import {
  srpRegister,
  srpClientHello,
  srpServerChallenge,
  srpComputeSharedKey
} from './srpAuthEngine';

describe('srpAuthEngine', () => {
  it('successfully authenticates with matching password via Zero-Knowledge proof', () => {
    // 1. Registrierung
    const reg = srpRegister('alice', 'superSecret123', 55n);
    expect(reg.verifier).toBeGreaterThan(0n);

    // 2. Client Hello
    const client = srpClientHello(7n);
    expect(client.A).toBeGreaterThan(0n);

    // 3. Server Challenge
    const server = srpServerChallenge(reg.verifier, 11n);
    expect(server.B).toBeGreaterThan(0n);

    // 4. Shared Key Berechnung
    const handshake = srpComputeSharedKey(
      client.A,
      server.B,
      client.a,
      server.b,
      reg.x,
      reg.verifier
    );

    expect(handshake.clientS).toBe(handshake.serverS);
    expect(handshake.isAuthenticated).toBe(true);
    expect(handshake.clientProofM1).toBeGreaterThan(0n);
  });

  it('fails authentication if password (x) is incorrect', () => {
    const reg = srpRegister('alice', 'correctPassword', 55n);
    const client = srpClientHello(7n);
    const server = srpServerChallenge(reg.verifier, 11n);

    // Falsches Passwort führt zu anderem x
    const fakeX = 9999n;

    const handshake = srpComputeSharedKey(
      client.A,
      server.B,
      client.a,
      server.b,
      fakeX,
      reg.verifier
    );

    expect(handshake.clientS).not.toBe(handshake.serverS);
    expect(handshake.isAuthenticated).toBe(false);
  });
});
