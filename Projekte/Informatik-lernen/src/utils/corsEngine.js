/**
 * CORS (Cross-Origin Resource Sharing) Pitfalls Engine
 * Simulates the browser-side preflight/response evaluation for a
 * cross-origin fetch() call, including the classic misconfigurations:
 * a reflected wildcard combined with credentials, and a permissive
 * Access-Control-Allow-Origin regex that accidentally trusts an
 * attacker-controlled subdomain.
 */

export function evaluateCorsRequest({
  requestOrigin = 'https://evil-attacker.com',
  targetSite = 'https://api.devgame.it',
  withCredentials = true,
  serverConfig = 'reflect_wildcard' // 'reflect_wildcard' | 'strict_allowlist' | 'loose_regex'
}) {
  const allowlist = ['https://app.devgame.it', 'https://admin.devgame.it'];
  const looseRegex = /devgame\.it$/; // intentionally naive: matches "evil-devgame.it" too!

  let allowOriginHeader = null;
  let allowCredentialsHeader = false;
  let serverExplanation = '';

  if (serverConfig === 'reflect_wildcard') {
    // Vulnerable pattern: server blindly reflects whatever Origin the
    // client sent back into Access-Control-Allow-Origin.
    allowOriginHeader = requestOrigin;
    allowCredentialsHeader = withCredentials;
    serverExplanation = 'Server spiegelt den Origin-Header ungeprüft zurück ("Access-Control-Allow-Origin: <beliebiger Origin>") — jede Seite darf Requests mit Credentials senden.';
  } else if (serverConfig === 'strict_allowlist') {
    const isAllowed = allowlist.includes(requestOrigin);
    allowOriginHeader = isAllowed ? requestOrigin : null;
    allowCredentialsHeader = isAllowed && withCredentials;
    serverExplanation = isAllowed
      ? `Origin "${requestOrigin}" steht auf der festen Allowlist und wird explizit erlaubt.`
      : `Origin "${requestOrigin}" steht NICHT auf der Allowlist — kein CORS-Header gesetzt, Browser blockiert die Antwort.`;
  } else if (serverConfig === 'loose_regex') {
    const matches = looseRegex.test(requestOrigin.replace('https://', ''));
    allowOriginHeader = matches ? requestOrigin : null;
    allowCredentialsHeader = matches && withCredentials;
    serverExplanation = matches
      ? `Server prüft nur "endet mit devgame.it" per Regex — "${requestOrigin}" erfüllt das (Suffix-Bypass!), obwohl es eine fremde, vom Angreifer registrierte Domain ist.`
      : `Origin "${requestOrigin}" erfüllt nicht einmal die laxe Regex-Prüfung.`;
  }

  // The actual browser-enforced rule that trips up many developers:
  // Access-Control-Allow-Origin: * is explicitly forbidden together with
  // Access-Control-Allow-Credentials: true by the Fetch spec.
  const isWildcardCredentialConflict = allowOriginHeader === '*' && allowCredentialsHeader;

  const browserAllows = Boolean(allowOriginHeader) && !isWildcardCredentialConflict &&
    (allowOriginHeader === requestOrigin || allowOriginHeader === '*');

  return {
    requestOrigin,
    targetSite,
    withCredentials,
    serverConfig,
    allowOriginHeader,
    allowCredentialsHeader,
    isWildcardCredentialConflict,
    browserAllows,
    serverExplanation,
    verdict: browserAllows
      ? '❌ Browser lässt die cross-origin Response durch — der Angreifer-Origin kann die Antwort (inkl. Cookies/Session) lesen.'
      : '✅ Browser blockiert die Response im JavaScript (Netzwerk-Request geht raus, aber die Antwort ist für den Angreifer unlesbar).'
  };
}

export const CORS_SCENARIOS = [
  { id: 'reflect_wildcard', label: 'Origin-Reflection ("Access-Control-Allow-Origin: <Origin>")' },
  { id: 'strict_allowlist', label: 'Feste Allowlist bekannter Origins' },
  { id: 'loose_regex', label: 'Laxe Suffix-Regex (".endsWith(devgame.it)")' }
];
