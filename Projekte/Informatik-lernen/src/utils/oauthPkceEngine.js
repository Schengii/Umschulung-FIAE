/**
 * OAuth 2.0 with PKCE & OpenID Connect (OIDC) Flow Engine
 * RFC 7636 (PKCE) & OIDC Core 1.0 Specification
 */

// Simple SHA-256 for browser/node environments without async requirement for pure logic tests
export function sha256Sync(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  let lengthProperty = 'length';
  let i, j;

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < ascii[lengthProperty]; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] |= (code & 0xff) << (24 - (i % 4) * 8);
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words[lengthProperty]; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);

    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const S1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + S1 + ch + k[j] + (w[j] | 0)) | 0;
      const S0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (S0 + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  // Convert hash to uint8 bytes
  const bytes = [];
  for (i = 0; i < 8; i++) {
    bytes.push((hash[i] >>> 24) & 0xff);
    bytes.push((hash[i] >>> 16) & 0xff);
    bytes.push((hash[i] >>> 8) & 0xff);
    bytes.push(hash[i] & 0xff);
  }
  return new Uint8Array(bytes);
}

// Convert bytes to Base64URL
export function base64UrlEncode(uint8Array) {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate random PKCE Code Verifier (RFC 7636: 43 - 128 unreserved chars)
 */
export function generateCodeVerifier(length = 64) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  for (let i = 0; i < length; i++) {
    verifier += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return verifier;
}

/**
 * Calculate S256 Code Challenge
 * code_challenge = BASE64URL-ENCODE(SHA256(ASCII(code_verifier)))
 */
export function computeCodeChallengeS256(verifier) {
  const hashBytes = sha256Sync(verifier);
  return base64UrlEncode(hashBytes);
}

/**
 * Verify PKCE Challenge on Token Request
 */
export function verifyPkce(codeVerifier, expectedChallenge, method = 'S256') {
  if (method === 'plain') {
    return codeVerifier === expectedChallenge;
  }
  if (method === 'S256') {
    const computed = computeCodeChallengeS256(codeVerifier);
    return computed === expectedChallenge;
  }
  return false;
}

/**
 * Build Authorization URL with PKCE & OIDC Parameters
 */
export function buildAuthorizationUrl(config) {
  const {
    authEndpoint,
    clientId,
    redirectUri,
    scope = 'openid profile email',
    state,
    nonce,
    codeChallenge,
    codeChallengeMethod = 'S256'
  } = config;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod
  });

  if (nonce) {
    params.set('nonce', nonce);
  }

  return `${authEndpoint}?${params.toString()}`;
}

/**
 * Mock Issue Tokens (Access Token, ID Token [JWT], Refresh Token)
 */
export function issueTokens({ clientId, scope, nonce, user, issuer = 'https://auth.devgame.it' }) {
  const now = Math.floor(Date.now() / 1000);
  
  // Access Token Payload
  const accessTokenPayload = {
    iss: issuer,
    sub: user.id,
    aud: [clientId, 'https://api.devgame.it'],
    scope: scope,
    iat: now,
    exp: now + 3600,
    jti: 'at_' + Math.random().toString(36).substring(2, 10)
  };

  // OIDC ID Token Payload
  const idTokenPayload = {
    iss: issuer,
    sub: user.id,
    aud: clientId,
    iat: now,
    exp: now + 3600,
    auth_time: now,
    nonce: nonce || undefined,
    name: user.name,
    email: user.email,
    roles: user.roles || ['USER']
  };

  const jwtHeader = { alg: 'RS256', typ: 'JWT', kid: 'rsa-key-auth-2026' };
  
  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(jwtHeader)));
  const encodedAccessPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(accessTokenPayload)));
  const encodedIdPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(idTokenPayload)));
  
  const mockSignature = 'kX7z8_mockRS256Signature_e891XjY910vA';

  return {
    access_token: `${encodedHeader}.${encodedAccessPayload}.${mockSignature}`,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'rt_' + Math.random().toString(36).substring(2, 18),
    id_token: `${encodedHeader}.${encodedIdPayload}.${mockSignature}`,
    scope,
    decoded: {
      accessToken: accessTokenPayload,
      idToken: idTokenPayload,
      header: jwtHeader
    }
  };
}

/**
 * Perform Token Exchange Request Simulation
 */
export function exchangeCodeForTokens({
  code,
  codeVerifier,
  authSession,
  clientId,
  redirectUri
}) {
  if (!authSession || authSession.code !== code) {
    return { success: false, error: 'invalid_grant', error_description: 'Authorization code ist ungültig oder abgelaufen.' };
  }

  if (authSession.redirectUri !== redirectUri) {
    return { success: false, error: 'invalid_grant', error_description: 'Redirect URI stimmt nicht überein.' };
  }

  // PKCE Validation
  const isValidPkce = verifyPkce(codeVerifier, authSession.codeChallenge, authSession.codeChallengeMethod);
  if (!isValidPkce) {
    return { 
      success: false, 
      error: 'invalid_grant', 
      error_description: 'PKCE Verification fehlgeschlagen: SHA256(code_verifier) stimmt nicht mit code_challenge überein!' 
    };
  }

  const tokens = issueTokens({
    clientId,
    scope: authSession.scope,
    nonce: authSession.nonce,
    user: authSession.user
  });

  return {
    success: true,
    tokens
  };
}
