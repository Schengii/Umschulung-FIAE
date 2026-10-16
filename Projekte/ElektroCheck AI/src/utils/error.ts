/** Liefert eine lesbare Fehlermeldung aus einem unbekannten Fehlerwert (catch-Klauseln). */
export function getErrorMessage(error: unknown, fallback = "Unbekannter Fehler"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
