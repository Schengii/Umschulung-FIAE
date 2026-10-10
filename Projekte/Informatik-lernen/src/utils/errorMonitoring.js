// @ts-check
/**
 * Optionale Produktions-Fehlerüberwachung (Sentry).
 * Bisher protokollierte `ErrorBoundary` Abstürze einzelner Labs nur per
 * `console.error` - auf der live deployten Vercel-Seite bekam niemand mit,
 * wenn ein Modul bei echten Nutzern crasht. Sentry wird HIER absichtlich
 * per dynamischem `import()` nachgeladen (eigener Chunk statt im Haupt-
 * Bundle), und nur initialisiert, wenn `VITE_SENTRY_DSN` gesetzt ist -
 * ohne DSN bleibt dies ein reiner No-Op und es ändert sich nichts am
 * Bundle-Budget (siehe README "Fehlerüberwachung (Sentry)").
 */

/** @type {any} */
let sentryModule = null;
let initAttempted = false;

/**
 * @returns {string | undefined}
 */
function getDsn() {
  return typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SENTRY_DSN : undefined;
}

/**
 * Initialisiert Sentry einmalig, falls eine DSN konfiguriert ist.
 * @returns {Promise<void>}
 */
export async function initErrorMonitoring() {
  if (initAttempted) return;
  initAttempted = true;

  const dsn = getDsn();
  if (!dsn) return;

  try {
    // Statischer Pfad im import() ist Pflicht: Nur dann löst Vite das Paket
    // auf und legt einen eigenen Chunk an. Ein Variablen-Pfad mit
    // `@vite-ignore` landete wörtlich als `import("@sentry/react")` im
    // Bundle, den der Browser nicht auflösen kann - Sentry startete nie.
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      environment: import.meta.env?.MODE || 'production',
      tracesSampleRate: 0
    });
    sentryModule = Sentry;
  } catch (err) {
    console.error('[errorMonitoring] Sentry konnte nicht initialisiert werden:', err);
  }
}

/**
 * Meldet einen abgefangenen Fehler an Sentry, falls initialisiert.
 * No-Op ohne konfigurierte DSN (z. B. lokale Entwicklung).
 * @param {unknown} error
 * @param {Record<string, unknown>} [context]
 * @returns {void}
 */
export function captureException(error, context) {
  if (!sentryModule) return;
  sentryModule.captureException(error, context ? { extra: context } : undefined);
}
