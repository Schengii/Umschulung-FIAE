import { describe, it, expect } from 'vitest';
import {
  validateOauth21Compliance,
  verifyDpopProof
} from './oauth21DpopEngine';

describe('oauth21DpopEngine', () => {
  it('identifies OAuth 2.1 violations when implicit flow or plain PKCE are used', () => {
    const invalid = validateOauth21Compliance({
      grantType: 'implicit',
      usePkce: false,
      tokenType: 'bearer'
    });
    expect(invalid.isOauth21Compliant).toBe(false);
    expect(invalid.violations.some(v => v.includes('Implicit Grant'))).toBe(true);

    const valid = validateOauth21Compliance({
      grantType: 'authorization_code',
      usePkce: true,
      pkceMethod: 'S256',
      tokenType: 'dpop'
    });
    expect(valid.isOauth21Compliant).toBe(true);
    expect(valid.securityScore).toBe(100);
  });

  it('verifies valid RFC 9449 DPoP proof and blocks replay attacks', () => {
    const seenJtis = new Set();
    const proof = {
      jti: 'unique-uuid-1234',
      htm: 'POST',
      htu: 'https://api.ihk.de/v1/transfer',
      iat: 1000000
    };

    // Erster Aufruf: OK
    const res1 = verifyDpopProof(proof, 'POST', 'https://api.ihk.de/v1/transfer', 1002000, seenJtis);
    expect(res1.isValid).toBe(true);

    // Zweiter Aufruf (Replay Attack): Geblockt!
    const res2 = verifyDpopProof(proof, 'POST', 'https://api.ihk.de/v1/transfer', 1003000, seenJtis);
    expect(res2.isValid).toBe(false);
    expect(res2.error).toContain('Replay-Angriff');
  });
});
