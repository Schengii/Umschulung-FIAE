// @ts-check
/**
 * @file oauth21DpopEngine.js
 * OAuth 2.1 & DPoP (Demonstrating Proof-of-Possession, RFC 9449) Security Engine
 * Erzwingt moderne Best Practices:
 * - Verbot von Implicit Grant & Resource Owner Password Credentials (ROPC)
 * - Erzwungenes PKCE (Proof Key for Code Exchange)
 * - Sender-Constrained DPoP Tokens gegen Token-Theft / Replay-Angriffe
 */

export const OAUTH_GRANT_TYPES = {
  authorization_code: 'Authorization Code + PKCE',
  client_credentials: 'Client Credentials (M2M)',
  refresh_token: 'Refresh Token',
  implicit: 'Implicit Grant (Legacy)',
  password: 'Password / ROPC (Legacy)'
};

export const OAUTH21_DISALLOWED_GRANTS = ['implicit', 'password'];

/**
 * Validiert die Konformität eines OAuth-Flows mit den OAuth 2.1 Richtlinien
 * @param {{
 *   grantType: string,
 *   usePkce?: boolean,
 *   pkceUsed?: boolean,
 *   pkceMethod?: string,
 *   tokenType?: 'bearer' | 'dpop',
 *   dpopUsed?: boolean,
 *   exactRedirectMatch?: boolean
 * }} config
 */
export function evaluateOauth21Flow(config) {
  const pkce = config.pkceUsed ?? config.usePkce ?? false;
  const isDpop = config.dpopUsed ?? (config.tokenType === 'dpop');
  const exactRedirect = config.exactRedirectMatch ?? true;

  /** @type {string[]} */
  const violations = [];
  /** @type {string[]} */
  const recommendations = [];
  let score = 100;

  if (config.grantType === 'implicit') {
    violations.push('OAuth 2.1 verbietet den Implicit Grant (Access Token im URL-Fragment) vollständig.');
    recommendations.push('Wechsle zum Authorization Code Flow mit PKCE.');
    score -= 40;
  }

  if (config.grantType === 'password') {
    violations.push('OAuth 2.1 verbietet Resource Owner Password Credentials (ROPC).');
    recommendations.push('Verwende federierte Authentifizierung oder Authorization Code Flow.');
    score -= 40;
  }

  if (config.grantType === 'authorization_code') {
    if (!pkce) {
      violations.push('In OAuth 2.1 ist PKCE (RFC 7636) für alle Clients (auch Confidential Clients) Pflicht.');
      recommendations.push('Aktiviere PKCE mit code_challenge und code_verifier.');
      score -= 30;
    } else if (config.pkceMethod === 'plain') {
      violations.push('code_challenge_method=plain ist verboten. Nur S256 (SHA-256) ist zulässig.');
      recommendations.push('Stelle den PKCE-Algorithmus auf S256 um.');
      score -= 20;
    }
  }

  if (!exactRedirect) {
    violations.push('OAuth 2.1 verlangt exaktes String-Matching für redirect_uri (keine Wildcards oder Pfad-Präfixe).');
    recommendations.push('Registriere Redirect-URIs buchstabengetreu ohne Wildcards.');
    score -= 15;
  }

  if (!isDpop) {
    violations.push('Bearer-Tokens sind ungebunden und anfällig für Token-Theft / Replay.');
    recommendations.push('Setze RFC 9449 DPoP Sender-Constrained Tokens für Zero-Trust API-Zugriff ein.');
    score -= 10;
  }

  return {
    isCompliant: violations.length === 0,
    isOauth21Compliant: violations.length === 0,
    violations,
    recommendations,
    score: Math.max(0, score),
    securityScore: Math.max(0, score)
  };
}

export const validateOauth21Compliance = evaluateOauth21Flow;

/**
 * Erstellt einen simulierten DPoP Proof Token
 * @param {{
 *   htm: string,
 *   htu: string,
 *   jktThumbprint: string,
 *   jti: string,
 *   issuedAtSecAgo?: number
 * }} params
 */
export function createMockDpopProof({ htm, htu, jktThumbprint, jti, issuedAtSecAgo = 0 }) {
  const iat = Math.floor(Date.now() / 1000) - issuedAtSecAgo;
  return {
    header: {
      typ: 'dpop+jwt',
      alg: 'ES256',
      jwk: {
        kty: 'EC',
        crv: 'P-256',
        x: 'f83OJ3D2xFmTbldqC...mock',
        y: 'x_da7W458pW34...mock'
      }
    },
    payload: {
      jti: jti || 'jti-mock-uuid',
      htm: htm.toUpperCase(),
      htu,
      iat,
      jkt: jktThumbprint
    }
  };
}

/**
 * Validiert einen DPoP Proof nach RFC 9449
 * @param {{
 *   proof: any,
 *   expectedHtm: string,
 *   expectedHtu: string,
 *   boundJkt?: string,
 *   seenJtis?: Set<string>,
 *   maxAgeSeconds?: number,
 *   nowSeconds?: number
 * }} params
 */
export function validateDpopProof({ proof, expectedHtm, expectedHtu, boundJkt, seenJtis, maxAgeSeconds = 300, nowSeconds }) {
  if (!proof || !proof.payload) {
    return { valid: false, isValid: false, error: 'Kein gültiger DPoP Proof übergeben.' };
  }

  const { jti, htm, htu, iat, jkt } = proof.payload;
  const nowSec = nowSeconds !== undefined ? nowSeconds : Math.floor(Date.now() / 1000);

  if (seenJtis && seenJtis.has(jti)) {
    return {
      valid: false,
      isValid: false,
      error: `DPoP Replay-Angriff erkannt! JTI '${jti}' wurde bereits in der Nonce-Historie verwendet.`
    };
  }

  const age = Math.abs(nowSec - iat);
  if (age > maxAgeSeconds) {
    return {
      valid: false,
      isValid: false,
      error: `DPoP Proof ist mit ${age}s älter als das maximale Zeitfenster von ${maxAgeSeconds}s.`
    };
  }

  if (htm.toUpperCase() !== expectedHtm.toUpperCase()) {
    return {
      valid: false,
      isValid: false,
      error: `HTTP-Method Mismatch: Token für '${htm}', Request verwendet jedoch '${expectedHtm}'.`
    };
  }

  if (htu.toLowerCase() !== expectedHtu.toLowerCase()) {
    return {
      valid: false,
      isValid: false,
      error: `Target URI Mismatch: Token für '${htu}', Request zielt auf '${expectedHtu}'.`
    };
  }

  if (boundJkt && jkt && boundJkt !== jkt) {
    return {
      valid: false,
      isValid: false,
      error: 'Token Thumbprint (jkt) stimmt nicht mit dem gebundenen Client-Zertifikat überein.'
    };
  }

  if (seenJtis) {
    seenJtis.add(jti);
  }

  return {
    valid: true,
    isValid: true,
    error: null
  };
}

/**
 * @param {any} proofPayload
 * @param {string} currentMethod
 * @param {string} currentUri
 * @param {number} currentTimeMs
 * @param {Set<string>} seenJtis
 */
export function verifyDpopProof(proofPayload, currentMethod, currentUri, currentTimeMs, seenJtis) {
  // If currentTimeMs and proofPayload.iat are provided directly (e.g. In ms):
  const ageMs = Math.abs(currentTimeMs - proofPayload.iat);
  if (ageMs > 10000) {
    return {
      isValid: false,
      error: 'DPoP Proof ist veraltet (> 10s Zeitabweichung).'
    };
  }

  // Delegate method, URI and replay checks
  const result = validateDpopProof({
    proof: { payload: { ...proofPayload, iat: 0 } },
    expectedHtm: currentMethod,
    expectedHtu: currentUri,
    boundJkt: undefined,
    seenJtis,
    nowSeconds: 0,
    maxAgeSeconds: 100000
  });

  return {
    isValid: result.valid,
    error: result.error
  };
}
