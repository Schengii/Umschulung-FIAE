// @ts-check
/**
 * Fachlogik-Engine für das OAuth2 & OpenID Connect (OIDC) Lab.
 * Validiert Auth-Requests, PKCE-Code-Verifikation, JWT-Claims-Dekodierung
 * und Refresh-Token-Rotation.
 */

/**
 * Validiert einen OAuth 2.0 / OIDC Authorization Request.
 * @param {{
 *   response_type: string,
 *   client_id: string,
 *   redirect_uri: string,
 *   scope: string,
 *   state?: string,
 *   code_challenge?: string,
 *   code_challenge_method?: string
 * }} params
 */
export function validateAuthRequest(params) {
  const issues = [];

  if (params.response_type !== 'code') {
    if (params.response_type === 'token') {
      issues.push("Sicherheitsrisiko (OAuth 2.1): Der Implicit Flow ('response_type=token') ist veraltet und unsicher. Nutze den Authorization Code Flow ('code').");
    } else {
      issues.push(`Ungültiger response_type '${params.response_type}' (erwartet: 'code').`);
    }
  }

  if (!params.client_id) {
    issues.push('Fehlende client_id.');
  }

  if (!params.redirect_uri || !params.redirect_uri.startsWith('http')) {
    issues.push('redirect_uri fehlt oder ist keine absolute URI.');
  }

  const scopes = (params.scope || '').split(/\s+/).filter(Boolean);
  if (!scopes.includes('openid')) {
    issues.push("Hinweis: Für OpenID Connect (OIDC) Authentifizierung muss der Scope 'openid' enthalten sein.");
  }

  if (!params.state || params.state.length < 8) {
    issues.push("Best Practice: Ein kryptografisch zufälliger 'state'-Parameter (CSRF-Schutz) wird zwingend empfohlen.");
  }

  if (!params.code_challenge) {
    issues.push('PKCE Schutz fehlt: code_challenge erforderlich (RFC 7636).');
  } else if (params.code_challenge_method !== 'S256') {
    issues.push("PKCE Methode 'S256' (SHA-256) erforderlich ('plain' ist unsicher).");
  }

  const hardErrors = issues.filter((i) => !i.startsWith('Hinweis:') && !i.startsWith('Best Practice:'));

  return {
    isValid: hardErrors.length === 0,
    isOidc: scopes.includes('openid'),
    scopes,
    issues,
    hardErrors
  };
}

/**
 * Dekodiert Base64URL-String in UTF-8 Text.
 * @param {string} str
 */
export function base64UrlDecode(str) {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    // Browser & Node kompatibel via global atob
    const atobFn = typeof atob === 'function' ? atob : (typeof globalThis !== 'undefined' ? globalThis.atob : null);
    if (atobFn) {
      return decodeURIComponent(escape(atobFn(base64)));
    }
    throw new Error('Base64-Decoder nicht verfügbar.');
  } catch {
    throw new Error('Ungültiges Base64URL Format.');
  }
}

/**
 * Dekodiert und validiert einen JWT Token (Header, Payload, Signatur).
 * @param {string} tokenString
 */
export function parseAndValidateJwt(tokenString) {
  const parts = (tokenString || '').trim().split('.');
  if (parts.length !== 3) {
    return {
      isValid: false,
      error: 'Ein JWT muss aus genau drei Teilen bestehen: header.payload.signature',
      header: null,
      payload: null,
      isExpired: false
    };
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    const now = Math.floor(Date.now() / 1000);
    const isExpired = typeof payload.exp === 'number' && payload.exp < now;

    return {
      isValid: true,
      header,
      payload,
      isExpired,
      signatureSnippet: parts[2].substring(0, 16) + '...'
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      error: `JSON Parsing Fehler im JWT: ${msg}`,
      header: null,
      payload: null,
      isExpired: false
    };
  }
}

/**
 * Simuliert Token-Rotation beim Aufruf des Token-Endpoints mit Refresh-Token.
 * @param {string} incomingRefreshToken
 * @param {string} currentActiveRefreshToken
 */
export function simulateTokenRotation(incomingRefreshToken, currentActiveRefreshToken) {
  if (incomingRefreshToken !== currentActiveRefreshToken) {
    return {
      success: false,
      error: 'invalid_grant: Refresh Token ungültig oder wurde bereits wiederverwendet (Replay-Angriff erkannt!).',
      tokens: null
    };
  }

  const newAccessToken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
    sub: 'user_1029',
    scope: 'openid profile read:data',
    exp: Math.floor(Date.now() / 1000) + 3600
  }))}.simulated_signature_${Math.random().toString(36).substring(2, 8)}`;

  const newRefreshToken = `rt_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

  return {
    success: true,
    tokens: {
      access_token: newAccessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: newRefreshToken
    }
  };
}

export const OAUTH_OIDC_DRILL_QUESTIONS = [
  {
    id: 'oauth-q1',
    question: 'Welcher grundlegende Unterschied besteht zwischen OAuth 2.0 und OpenID Connect (OIDC)?',
    options: [
      'OAuth 2.0 ist für Authentifizierung (Wer bist du?), OIDC für Autorisierung (Was darfst du?).',
      'OAuth 2.0 ist ein reines Autorisierungs-Framework (liefert Access Token für APIs); OIDC setzt darauf auf und ergänzt eine standardisierte Identitätsschicht (liefert ID Token).',
      'OIDC funktioniert nur mit XML, während OAuth 2.0 JSON nutzt.',
      'Es gibt keinen technischen Unterschied; OIDC ist lediglich ein Markenname der OpenID Foundation.'
    ],
    correct: 1,
    explanation: 'OAuth 2.0 regelt den Zugriff auf Ressourcen (APIs via Access Token). OIDC erweitert OAuth 2.0 um Identitätsübermittlung und Profilinformationen über ein signiertes JWT (ID Token).'
  },
  {
    id: 'oauth-q2',
    question: 'Warum ist PKCE (Proof Key for Code Exchange) bei Single-Page-Apps (SPAs) und Mobile-Apps unverzichtbar?',
    options: [
      'Weil SPAs und mobile Apps kein Client-Secret sicher geheim halten können (Public Clients) und PKCE das Abfangen des Authorization Codes verhindert.',
      'Weil PKCE den HTTP-Traffic automatisch über TLS 1.3 tunnelt.',
      'Damit der Server keine Datenbankabfragen mehr ausführen muss.',
      'Weil PKCE Passwörter durch biometrische Daten ersetzt.'
    ],
    correct: 0,
    explanation: 'Public Clients (SPAs, Mobile Apps) können kein Client-Secret schützen. Durch PKCE erzeugt der Client dynamisch einen geheimen Verifier und sendet nur den Hash (Challenge) mit. Nur der echte Initiator kann den Code einlösen.'
  },
  {
    id: 'oauth-q3',
    question: 'Wozu dient der `state`-Parameter im initialen Authorization Request zwingend?',
    options: [
      'Er legt fest, ob der Benutzer im Dark Mode angemeldet wird.',
      'Er schützt vor Cross-Site Request Forgery (CSRF) bei der Rückleitung (Redirect) vom Auth-Server zur Client-App.',
      'Er definiert die Gültigkeitsdauer des Refresh Tokens in Minuten.',
      'Er enthält die verschlüsselte Benutzer-ID.'
    ],
    correct: 1,
    explanation: 'Der State ist ein Nonce, den der Client vor dem Redirect generiert und speichert. Beim Callback prüft der Client, ob der empfangene State übereinstimmt, um Login-CSRF-Angriffe abzuwehren.'
  },
  {
    id: 'oauth-q4',
    question: 'Was versteht man unter „Refresh Token Rotation“ und welchem Schutzzweck dient sie?',
    options: [
      'Tokens werden alle 24 Stunden per Cronjob in der Datenbank gelöscht.',
      'Bei jeder Verwendung eines Refresh Tokens wird dieser sofort ungültig und durch einen neuen ersetzt. Wird ein alter Token erneut eingereicht, werden alle zugehörigen Tokens widerrufen.',
      'Der Access Token rotiert zwischen verschiedenen APIs.',
      'Die Signatur des ID Tokens wechselt dynamisch zwischen HMAC und RSA.'
    ],
    correct: 1,
    explanation: 'Refresh Token Rotation verhindert den Missbrauch gestohlener langlebiger Tokens: Ein Refresh Token darf nur genau einmal eingelöst werden. Versucht ein Angreifer einen bereits verwendeten Token zu nutzen, erkennt der Server den Diebstahl und sperrt die gesamte Session.'
  }
];

