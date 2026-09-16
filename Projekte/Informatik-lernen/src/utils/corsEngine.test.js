import { describe, it, expect } from 'vitest';
import { evaluateCorsRequest } from './corsEngine';

describe('CORS Pitfalls Engine', () => {
  it('reflects an attacker origin and lets the browser through when the server blindly mirrors Origin', () => {
    const res = evaluateCorsRequest({
      requestOrigin: 'https://evil-attacker.com',
      serverConfig: 'reflect_wildcard',
      withCredentials: true
    });
    expect(res.allowOriginHeader).toBe('https://evil-attacker.com');
    expect(res.allowCredentialsHeader).toBe(true);
    expect(res.browserAllows).toBe(true);
  });

  it('blocks an unlisted origin under a strict allowlist', () => {
    const res = evaluateCorsRequest({
      requestOrigin: 'https://evil-attacker.com',
      serverConfig: 'strict_allowlist'
    });
    expect(res.allowOriginHeader).toBeNull();
    expect(res.browserAllows).toBe(false);
  });

  it('allows a known origin under a strict allowlist', () => {
    const res = evaluateCorsRequest({
      requestOrigin: 'https://app.devgame.it',
      serverConfig: 'strict_allowlist'
    });
    expect(res.allowOriginHeader).toBe('https://app.devgame.it');
    expect(res.browserAllows).toBe(true);
  });

  it('exposes the suffix-matching bypass of a loose regex allowlist', () => {
    const res = evaluateCorsRequest({
      requestOrigin: 'https://evil-devgame.it',
      serverConfig: 'loose_regex'
    });
    expect(res.allowOriginHeader).toBe('https://evil-devgame.it');
    expect(res.browserAllows).toBe(true);
  });

  it('rejects an origin that does not even match the loose regex suffix', () => {
    const res = evaluateCorsRequest({
      requestOrigin: 'https://totally-unrelated.com',
      serverConfig: 'loose_regex'
    });
    expect(res.allowOriginHeader).toBeNull();
    expect(res.browserAllows).toBe(false);
  });

  it('flags the forbidden wildcard + credentials combination', () => {
    const res = evaluateCorsRequest({
      requestOrigin: '*',
      serverConfig: 'reflect_wildcard',
      withCredentials: true
    });
    // requestOrigin itself is "*" here only to exercise the conflict branch directly
    expect(res.isWildcardCredentialConflict).toBe(true);
    expect(res.browserAllows).toBe(false);
  });
});
