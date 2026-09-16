import { describe, it, expect } from 'vitest';
import {
  generateChallenge,
  registerPasskey,
  authenticatePasskey
} from './webAuthnEngine';

describe('webAuthnEngine', () => {
  it('should generate a cryptographic challenge string', () => {
    const chal = generateChallenge(32);
    expect(typeof chal).toBe('string');
    expect(chal.length).toBe(32);
  });

  it('should register a passkey and return attestation object with public key', () => {
    const cred = registerPasskey({
      username: 'marie.curie@science.org',
      rpId: 'science.org',
      origin: 'https://science.org',
      userVerification: 'required',
      authenticatorType: 'platform'
    });

    expect(cred.isRegistered).toBe(true);
    expect(cred.credentialId).toContain('cred_');
    expect(cred.storedPublicKey).toBeDefined();
    expect(cred.attestationObject.authData.flags.userPresent).toBe(true);
    expect(cred.attestationObject.authData.flags.userVerified).toBe(true);
  });

  it('should authenticate successfully with valid origin and user presence', () => {
    const cred = registerPasskey({
      username: 'turing@bletchley.uk',
      rpId: 'bletchley.uk',
      origin: 'https://bletchley.uk'
    });

    const authRes = authenticatePasskey({
      registeredCredential: cred,
      clientOrigin: 'https://bletchley.uk',
      simulatedUserPresence: true,
      simulatedUserVerified: true
    });

    expect(authRes.success).toBe(true);
    expect(authRes.assertion.signatureValid).toBe(true);
    expect(authRes.newSignCount).toBe(1);
    expect(authRes.isPhishingBlocked).toBe(false);
  });

  it('should block authentication and flag phishing when origin does not match', () => {
    const cred = registerPasskey({
      username: 'victim@mybank.de',
      rpId: 'mybank.de',
      origin: 'https://mybank.de'
    });

    // Attacker tries to authenticate from fake phishing domain
    const authRes = authenticatePasskey({
      registeredCredential: cred,
      clientOrigin: 'https://mybank-fake-login.com',
      simulatedUserPresence: true
    });

    expect(authRes.success).toBe(false);
    expect(authRes.isPhishingBlocked).toBe(true);
    expect(authRes.error).toContain('Phishing-Angriff erkannt');
  });

  it('should reject authentication if user presence is false', () => {
    const cred = registerPasskey({
      username: 'test@domain.com',
      rpId: 'domain.com',
      origin: 'https://domain.com'
    });

    const authRes = authenticatePasskey({
      registeredCredential: cred,
      clientOrigin: 'https://domain.com',
      simulatedUserPresence: false
    });

    expect(authRes.success).toBe(false);
    expect(authRes.error).toContain('Keine physische Benutzer-Anwesenheit');
  });
});
