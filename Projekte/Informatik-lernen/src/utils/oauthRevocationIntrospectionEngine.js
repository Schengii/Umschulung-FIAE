// @ts-check
/**
 * OAuth 2.0 Token Revocation (RFC 7009) & Token Introspection (RFC 7662) Engine
 * Simulates API Gateway token validation, token lifetime, status checks, and token revocation.
 */

/**
 * @typedef {Object} OAuthToken
 * @property {string} token
 * @property {'access_token' | 'refresh_token'} tokenType
 * @property {string} clientId
 * @property {string} sub
 * @property {string} scope
 * @property {number} exp
 * @property {number} iat
 * @property {boolean} active
 * @property {number|null} revokedAt
 */

export class OAuthRevocationIntrospectionEngine {
  constructor() {
    /** @type {Map<string, OAuthToken>} */
    this.tokens = new Map();
    this.initDefaultTokens();
  }

  initDefaultTokens() {
    const now = Math.floor(Date.now() / 1000);
    // Active Token
    this.tokens.set('at_valid_9921', {
      token: 'at_valid_9921',
      tokenType: 'access_token',
      clientId: 'mobile_banking_client',
      sub: 'user_4812@bank.de',
      scope: 'accounts:read payments:create',
      iat: now - 300,
      exp: now + 3300,
      active: true,
      revokedAt: null
    });

    // Expired Token
    this.tokens.set('at_expired_3110', {
      token: 'at_expired_3110',
      tokenType: 'access_token',
      clientId: 'portal_spa_client',
      sub: 'dev_analyst@company.internal',
      scope: 'reports:read',
      iat: now - 7200,
      exp: now - 3600,
      active: true,
      revokedAt: null
    });

    // Refresh Token
    this.tokens.set('rt_secure_8874', {
      token: 'rt_secure_8874',
      tokenType: 'refresh_token',
      clientId: 'mobile_banking_client',
      sub: 'user_4812@bank.de',
      scope: 'offline_access accounts:read payments:create',
      iat: now - 3600,
      exp: now + 86400 * 30,
      active: true,
      revokedAt: null
    });
  }

  /**
   * Introspect a token according to RFC 7662
   * @param {string} token
   * @param {string} callerClientId
   * @returns {{ active: boolean, [key: string]: any }}
   */
  introspect(token, callerClientId = 'api_gateway') {
    const entry = this.tokens.get(token);
    const now = Math.floor(Date.now() / 1000);

    // RFC 7662 Section 2.2: If the token is not active, invalid, or expired, return { active: false }
    if (!entry) {
      return {
        active: false,
        reason: 'Token unknown or unissued'
      };
    }

    if (entry.revokedAt !== null) {
      return {
        active: false,
        reason: 'Token was revoked at ' + new Date(entry.revokedAt * 1000).toISOString()
      };
    }

    if (now >= entry.exp) {
      return {
        active: false,
        reason: 'Token expired at ' + new Date(entry.exp * 1000).toISOString()
      };
    }

    // Active Token Meta according to RFC 7662 Section 2.2
    return {
      active: true,
      scope: entry.scope,
      client_id: entry.clientId,
      sub: entry.sub,
      exp: entry.exp,
      iat: entry.iat,
      token_type: entry.tokenType === 'access_token' ? 'Bearer' : 'RefreshToken',
      iss: 'https://auth.company.internal/oauth',
      aud: 'https://api.company.internal/v1',
      inspected_by: callerClientId
    };
  }

  /**
   * Revoke a token according to RFC 7009
   * @param {string} token
   * @param {'access_token' | 'refresh_token' | 'unspecified'} [_tokenTypeHint]
   * @returns {{ success: boolean, httpStatus: number, message: string }}
   */
  revoke(token, _tokenTypeHint = 'unspecified') {
    const entry = this.tokens.get(token);
    const now = Math.floor(Date.now() / 1000);

    // RFC 7009 Section 2.2: The authorization server responds with HTTP 200 even if the token did not exist
    if (!entry) {
      return {
        success: true,
        httpStatus: 200,
        message: 'RFC 7009: Token not found or already inactive. Responding HTTP 200 OK.'
      };
    }

    entry.active = false;
    entry.revokedAt = now;

    // Cascade: If a refresh token is revoked, all associated access tokens of that user and client can also be invalidated
    if (entry.tokenType === 'refresh_token') {
      let cascadedCount = 0;
      this.tokens.forEach((tok) => {
        if (tok.sub === entry.sub && tok.clientId === entry.clientId && tok.tokenType === 'access_token') {
          tok.active = false;
          tok.revokedAt = now;
          cascadedCount++;
        }
      });
      return {
        success: true,
        httpStatus: 200,
        message: `RFC 7009: Refresh-Token ${token} und ${cascadedCount} zugehörige Access-Tokens erfolgreich revidiert.`
      };
    }

    return {
      success: true,
      httpStatus: 200,
      message: `RFC 7009: Token ${token} (${entry.tokenType}) erfolgreich revidiert.`
    };
  }

  /**
   * Helper: create new token on demand
   * @param {string} sub
   * @param {string} scope
   * @param {'access_token' | 'refresh_token'} tokenType
   * @param {number} [ttlSeconds]
   */
  issueToken(sub, scope, tokenType = 'access_token', ttlSeconds = 3600) {
    const now = Math.floor(Date.now() / 1000);
    const token = (tokenType === 'access_token' ? 'at_' : 'rt_') + Math.random().toString(36).substring(2, 10);
    /** @type {OAuthToken} */
    const obj = {
      token,
      tokenType,
      clientId: 'mobile_banking_client',
      sub,
      scope,
      iat: now,
      exp: now + ttlSeconds,
      active: true,
      revokedAt: null
    };
    this.tokens.set(token, obj);
    return obj;
  }

  /**
   * Get all registered tokens for overview
   */
  getAllTokens() {
    return Array.from(this.tokens.values());
  }
}
