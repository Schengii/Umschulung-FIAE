import { describe, it, expect, beforeEach } from 'vitest';
import { OAuthRevocationIntrospectionEngine } from './oauthRevocationIntrospectionEngine';

describe('OAuthRevocationIntrospectionEngine (RFC 7009 & RFC 7662)', () => {
  let engine;

  beforeEach(() => {
    engine = new OAuthRevocationIntrospectionEngine();
  });

  it('introspects a valid active token and returns RFC 7662 payload', () => {
    const res = engine.introspect('at_valid_9921');
    expect(res.active).toBe(true);
    expect(res.sub).toBe('user_4812@bank.de');
    expect(res.client_id).toBe('mobile_banking_client');
    expect(res.scope).toContain('payments:create');
  });

  it('returns active: false for an expired token', () => {
    const res = engine.introspect('at_expired_3110');
    expect(res.active).toBe(false);
    expect(res.reason).toContain('expired');
  });

  it('revokes an access token via RFC 7009 and subsequent introspection returns active: false', () => {
    const revokeRes = engine.revoke('at_valid_9921', 'access_token');
    expect(revokeRes.httpStatus).toBe(200);
    expect(revokeRes.success).toBe(true);

    const check = engine.introspect('at_valid_9921');
    expect(check.active).toBe(false);
    expect(check.reason).toContain('revoked');
  });

  it('cascades revocation from refresh token to associated access tokens', () => {
    const refreshRevoke = engine.revoke('rt_secure_8874', 'refresh_token');
    expect(refreshRevoke.httpStatus).toBe(200);

    // Refresh token must be inactive
    const checkRt = engine.introspect('rt_secure_8874');
    expect(checkRt.active).toBe(false);

    // Associated user access token must also be cascaded into revocation
    const checkAt = engine.introspect('at_valid_9921');
    expect(checkAt.active).toBe(false);
  });

  it('returns HTTP 200 even when revoking an unknown token (RFC 7009 compliant)', () => {
    const revokeUnknown = engine.revoke('unknown_token_9999');
    expect(revokeUnknown.httpStatus).toBe(200);
    expect(revokeUnknown.success).toBe(true);
  });
});
