/** Standard-Timeout für Backend-Aufrufe (Gemini darf länger, siehe `GEMINI_TIMEOUT_MS`). */
const DEFAULT_TIMEOUT_MS = 30_000;
export const GEMINI_TIMEOUT_MS = 65_000;

/**
 * `fetch` mit Timeout. Ein vom Aufrufer übergebenes `signal` bleibt wirksam:
 * Abbruch durch den Aufrufer oder Ablauf der Zeit bricht die Anfrage ab.
 * Bei Zeitablauf wird ein `Error` mit `name === "TimeoutError"` geworfen.
 */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const outer = init.signal;
  const onOuterAbort = () => controller.abort();
  if (outer) {
    if (outer.aborted) controller.abort();
    else outer.addEventListener("abort", onOuterAbort, { once: true });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) {
      const timeoutError = new Error("Zeitüberschreitung: Der Server antwortet nicht. Bitte Verbindung prüfen und erneut versuchen.");
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
    outer?.removeEventListener("abort", onOuterAbort);
  }
}
