import { describe, it, expect } from 'vitest';
import {
  generateCodeVerifier,
  computeCodeChallengeS256,
  verifyPkce,
  buildAuthorizationUrl,
  issueTokens,
  exchangeCodeForTokens
} from './oauthPkceEngine';

describe('OAuth2 PKCE & OIDC Flow Engine', () => {
  it('generates valid code verifier with proper length and unreserved characters', () => {
    const verifier = generateCodeVerifier(64);
    expect(verifier.length).toBe(64);
    expect(/^[A-Za-z0-9\-._~]+$/.test(verifier)).toBe(true);
  });

  it('computes deterministic S256 code challenge from verifier', () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    const challenge = computeCodeChallengeS256(verifier);
    expect(typeof challenge).toBe('string');
    expect(challenge.length).toBeGreaterThan(30);
    // Same input must give same output
    expect(computeCodeChallengeS256(verifier)).toBe(challenge);
  });

  it('verifies PKCE matching verifier and challenge correctly', () => {
    const verifier = generateCodeVerifier(50);
    const challenge = computeCodeChallengeS256(verifier);
    
    expect(verifyPkce(verifier, challenge, 'S256')).toBe(true);
    expect(verifyPkce('wrong-verifier', challenge, 'S256')).toBe(false);
  });

  it('builds RFC 7636 compliant authorization URL with all required query params', () => {
    const url = buildAuthorizationUrl({
      authEndpoint: 'https://auth.devgame.it/oauth/authorize',
      clientId: 'client_123',
      redirectUri: 'https://app.devgame.it/callback',
      scope: 'openid profile email',
      state: 'st_xyz89',
      nonce: 'nc_abc12',
      codeChallenge: 'chall_999',
      codeChallengeMethod: 'S256'
    });

    expect(url).toContain('https://auth.devgame.it/oauth/authorize?');
    expect(url).toContain('response_type=code');
    expect(url).toContain('client_id=client_123');
    expect(url).toContain('code_challenge=chall_999');
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain('nonce=nc_abc12');
  });

  it('issues valid JWT tokens and decoded structures', () => {
    const tokens = issueTokens({
      clientId: 'client_123',
      scope: 'openid profile email',
      nonce: 'nc_abc12',
      user: { id: 'usr_42', name: 'Dev Student', email: 'student@ihk.de', roles: ['ADMIN'] }
    });

    expect(tokens.token_type).toBe('Bearer');
    expect(tokens.access_token.split('.').length).toBe(3);
    expect(tokens.id_token.split('.').length).toBe(3);
    expect(tokens.decoded.idToken.sub).toBe('usr_42');
    expect(tokens.decoded.idToken.nonce).toBe('nc_abc12');
  });

  it('exchanges code for tokens when PKCE matches, fails otherwise', () => {
    const verifier = generateCodeVerifier(48);
    const challenge = computeCodeChallengeS256(verifier);

    const authSession = {
      code: 'auth_code_secret_123',
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      redirectUri: 'https://app.devgame.it/callback',
      scope: 'openid profile',
      nonce: 'nonce_111',
      user: { id: 'usr_99', name: 'Alice', email: 'alice@ihk.de' }
    };

    // Valid exchange
    const result = exchangeCodeForTokens({
      code: 'auth_code_secret_123',
      codeVerifier: verifier,
      authSession,
      clientId: 'client_123',
      redirectUri: 'https://app.devgame.it/callback'
    });
    expect(result.success).toBe(true);
    expect(result.tokens.access_token).toBeDefined();

    // Invalid PKCE code verifier
    const failResult = exchangeCodeForTokens({
      code: 'auth_code_secret_123',
      codeVerifier: 'tampered_code_verifier',
      authSession,
      clientId: 'client_123',
      redirectUri: 'https://app.devgame.it/callback'
    });
    expect(failResult.success).toBe(false);
    expect(failResult.error).toBe('invalid_grant');
  });
});
