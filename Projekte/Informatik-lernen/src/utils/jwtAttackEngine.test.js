import { describe, it, expect } from 'vitest';
import {
  decodeJwt,
  forgeAlgNoneToken,
  verifyAlgNoneDefense,
  bruteForceWeakSecret,
  evaluateKidInjection,
  COMMON_WEAK_SECRETS
} from './jwtAttackEngine';

// A minimal, syntactically valid (unsigned) sample JWT for testing decode/forge logic.
const SAMPLE_TOKEN = (() => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { sub: 'user_123', role: 'user' };
  const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64(header)}.${b64(payload)}.fakesignature`;
})();

describe('JWT Attack Engine', () => {
  it('decodes a well-formed JWT into header and payload', () => {
    const res = decodeJwt(SAMPLE_TOKEN);
    expect(res.valid).toBe(true);
    expect(res.header.alg).toBe('HS256');
    expect(res.payload.sub).toBe('user_123');
  });

  it('rejects a malformed token', () => {
    const res = decodeJwt('not.a.valid.jwt.token');
    expect(res.valid).toBe(false);
  });

  it('forges an alg:none token with tampered claims', () => {
    const res = forgeAlgNoneToken(SAMPLE_TOKEN, { role: 'admin' });
    expect(res.success).toBe(true);
    expect(res.forgedHeader.alg).toBe('none');
    expect(res.forgedPayload.role).toBe('admin');
    expect(res.forgedToken.endsWith('.')).toBe(true); // empty signature
  });

  it('accepts the forged token when the server does not enforce an algorithm allowlist', () => {
    const forged = forgeAlgNoneToken(SAMPLE_TOKEN, { role: 'admin' });
    const verdict = verifyAlgNoneDefense(forged.forgedToken, { rejectAlgNone: false });
    expect(verdict.accepted).toBe(true);
  });

  it('rejects the forged token when the server enforces an algorithm allowlist', () => {
    const forged = forgeAlgNoneToken(SAMPLE_TOKEN, { role: 'admin' });
    const verdict = verifyAlgNoneDefense(forged.forgedToken, { rejectAlgNone: true });
    expect(verdict.accepted).toBe(false);
  });

  it('cracks a weak HMAC secret present in the wordlist', () => {
    const res = bruteForceWeakSecret('secret');
    expect(res.cracked).toBe(true);
    expect(res.secret).toBe('secret');
    expect(res.attempts.length).toBeGreaterThan(0);
  });

  it('fails to crack a strong secret not in the wordlist', () => {
    const res = bruteForceWeakSecret('a9f8b7c6-strong-random-secret');
    expect(res.cracked).toBe(false);
    expect(res.attempts.length).toBe(COMMON_WEAK_SECRETS.length);
  });

  it('flags a kid header path-traversal attempt as vulnerable when unsanitized', () => {
    const res = evaluateKidInjection('../../dev/null', { sanitizesKid: false });
    expect(res.vulnerable).toBe(true);
  });

  it('blocks a kid header path-traversal attempt when the server sanitizes it', () => {
    const res = evaluateKidInjection('../../dev/null', { sanitizesKid: true });
    expect(res.vulnerable).toBe(false);
    expect(res.blocked).toBe(true);
  });

  it('treats a benign kid value as non-suspicious', () => {
    const res = evaluateKidInjection('key-2025-v1', { sanitizesKid: true });
    expect(res.vulnerable).toBe(false);
    expect(res.blocked).toBe(false);
  });
});
