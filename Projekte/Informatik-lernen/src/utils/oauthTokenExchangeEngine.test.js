import { describe, it, expect } from 'vitest';
import { OAuthTokenExchangeSimulator } from './oauthTokenExchangeEngine';

describe('OAuth 2.0 Token Exchange Engine (RFC 8693)', () => {
  it('generates compliant delegation request with act claim in downstream JWT', () => {
    const sts = new OAuthTokenExchangeSimulator();
    sts.exchangeMode = 'DELEGATION';

    const res = sts.performExchange('bob_user', 'order_bff_service');
    expect(res.requestPayload.grant_type).toBe('urn:ietf:params:oauth:grant-type:token-exchange');
    expect(res.issuedJwtClaims.sub).toBe('bob_user');
    expect(res.issuedJwtClaims.act).toBeDefined();
    expect(res.issuedJwtClaims.act.sub).toBe('order_bff_service');
  });

  it('omits actor claim in impersonation mode', () => {
    const sts = new OAuthTokenExchangeSimulator();
    sts.exchangeMode = 'IMPERSONATION';

    const res = sts.performExchange('bob_user', 'order_bff_service');
    expect(res.issuedJwtClaims.act).toBeUndefined();
    expect(res.requestPayload.actor_token).toBeUndefined();
  });
});
