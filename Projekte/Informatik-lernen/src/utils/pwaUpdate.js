// Wendet ein wartendes Service-Worker-Update an. vite-plugin-pwa 2.x erzeugt `skipWaiting` nur noch
// als Nachrichten-Handler (`SKIP_WAITING`); ohne diese Nachricht bleibt der neue Worker „installed“
// und ein Neuladen liefert weiter den alten Stand (alte Chunk-Hashes → Absturz beim Lab-Import).

export const SKIP_WAITING_MESSAGE = { type: 'SKIP_WAITING' };
export const UPDATE_FALLBACK_MS = 3000;

/**
 * @param {{ serviceWorker?: Pick<ServiceWorkerContainer, 'getRegistration'|'addEventListener'>,
 *   reload?: () => void, setTimer?: (fn: () => void, ms: number) => unknown }} [options]
 * @returns {Promise<'reloaded'|'activating'>} 'reloaded', wenn sofort neu geladen wurde
 */
export async function applyPwaUpdate(options = {}) {
  const {
    serviceWorker = typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined,
    reload = () => window.location.reload(),
    setTimer = (fn, ms) => setTimeout(fn, ms)
  } = options;

  let waiting = null;
  try {
    waiting = (await serviceWorker?.getRegistration())?.waiting ?? null;
  } catch {
    // ohne Registrierung bleibt nur das Neuladen
  }
  if (!waiting || !serviceWorker) {
    reload();
    return 'reloaded';
  }
  // Neu laden, sobald der neue Worker übernommen hat; Rückfall, falls das Ereignis ausbleibt.
  serviceWorker.addEventListener('controllerchange', () => reload(), { once: true });
  setTimer(reload, UPDATE_FALLBACK_MS);
  waiting.postMessage(SKIP_WAITING_MESSAGE);
  return 'activating';
}
