/**
 * JWT (JSON Web Token) Attack & Defense Engine
 * Demonstrates classic JWT implementation flaws for educational purposes:
 * "alg: none" forgery, weak HMAC secret brute-forcing and kid-header
 * path/SQL injection — plus the correct server-side defenses.
 */

function base64UrlEncode(obj) {
  const json = JSON.stringify(obj);
  // btoa is available in browsers; encode to base64url (no padding, -/_ instead of +//)
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - (str.length % 4)) % 4, '=');
  try {
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch {
    return null;
  }
}

export function decodeJwt(token) {
  const parts = (token || '').split('.');
  if (parts.length !== 3) return { valid: false, error: 'Token besteht nicht aus 3 Teilen (header.payload.signature).' };
  const header = base64UrlDecode(parts[0]);
  const payload = base64UrlDecode(parts[1]);
  if (!header || !payload) return { valid: false, error: 'Header oder Payload konnte nicht dekodiert werden.' };
  return { valid: true, header, payload, signature: parts[2] };
}

/**
 * Attack 1: "alg: none" — some libraries historically accepted an
 * unsigned token if the header claimed alg: "none", trusting the
 * client-supplied algorithm instead of the server's expected one.
 */
export function forgeAlgNoneToken(originalToken, tamperedPayload) {
  const decoded = decodeJwt(originalToken);
  if (!decoded.valid) return { success: false, error: decoded.error };

  const forgedHeader = { ...decoded.header, alg: 'none' };
  const forgedPayload = { ...decoded.payload, ...tamperedPayload };
  const forgedToken = `${base64UrlEncode(forgedHeader)}.${base64UrlEncode(forgedPayload)}.`;

  return { success: true, forgedToken, forgedHeader, forgedPayload };
}

export function verifyAlgNoneDefense(token, { rejectAlgNone = true } = {}) {
  const decoded = decodeJwt(token);
  if (!decoded.valid) return { accepted: false, reason: decoded.error };

  if (decoded.header.alg === 'none') {
    if (rejectAlgNone) {
      return { accepted: false, reason: '✅ Server erzwingt eine feste Allowlist erlaubter Algorithmen (z. B. nur RS256) und verwirft "alg: none".' };
    }
    return { accepted: true, reason: '❌ Server vertraut dem client-gelieferten "alg" Header und akzeptiert die unsignierte Fälschung!' };
  }
  return { accepted: false, reason: 'Kein "alg: none" Angriff erkannt.' };
}

/**
 * Attack 2: weak HMAC secret brute-force. In this simulation we just
 * check the candidate secret against a small "leaked wordlist" style
 * dictionary rather than actually computing HMAC-SHA256 in the browser.
 */
const COMMON_WEAK_SECRETS = ['secret', '123456', 'password', 'changeme', 'jwt_secret', 'admin', 'qwerty'];

export function bruteForceWeakSecret(actualSecret, wordlist = COMMON_WEAK_SECRETS) {
  const attempts = [];
  for (const candidate of wordlist) {
    attempts.push({ candidate, matched: candidate === actualSecret });
    if (candidate === actualSecret) {
      return { cracked: true, secret: candidate, attempts };
    }
  }
  return { cracked: false, secret: null, attempts };
}

/**
 * Attack 3: kid (Key ID) header injection. A server that builds a file
 * path or SQL query directly from the client-supplied "kid" header
 * without sanitization can be tricked into reading an attacker-chosen
 * key (e.g. /dev/null, which HMAC-verifies as an empty-string secret).
 */
export function evaluateKidInjection(kidValue, { sanitizesKid = true } = {}) {
  const isSuspicious = /\.\.|\/|;|--|'|"/.test(kidValue);

  if (!isSuspicious) {
    return { vulnerable: false, blocked: false, reason: 'kid enthält keine Pfad-/SQL-Sonderzeichen.' };
  }

  if (sanitizesKid) {
    return {
      vulnerable: false,
      blocked: true,
      reason: '✅ Server validiert "kid" gegen eine feste Allowlist bekannter Key-IDs statt es in Pfad/Query einzusetzen.'
    };
  }

  return {
    vulnerable: true,
    blocked: false,
    reason: `❌ "kid: ${kidValue}" wird ungeprüft in einen Dateipfad/SQL-Query eingesetzt — klassische Path-Traversal / SQL-Injection über den JWT-Header.`
  };
}

export { COMMON_WEAK_SECRETS };
