export const ACCESS_TOKEN_STORAGE_KEY = "electrocheck_access_token";
/** Session-Token aus dem Magic-Link-Login */
export const SESSION_STORAGE_KEY = "electrocheck_session";

/**
 * Ergänzt Authorization: Bearer – bevorzugt die Session des Magic-Link-Logins,
 * sonst den in den Einstellungen hinterlegten Dienst-Zugriffstoken.
 */
export function withAccessToken(headers: Record<string, string> = {}): Record<string, string> {
  let token: string | null = null;
  try {
    token = localStorage.getItem(SESSION_STORAGE_KEY)?.trim() || localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)?.trim() || null;
  } catch {
    token = null;
  }
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

/** Standard-Header für Backend-Aufrufe: JSON, optionale eigene API-Keys und Zugriffstoken. */
export function buildApiHeaders(keys: { apiKey?: string; perplexityApiKey?: string } = {}): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (keys.apiKey) headers["x-gemini-api-key"] = keys.apiKey;
  if (keys.perplexityApiKey) headers["x-perplexity-api-key"] = keys.perplexityApiKey;
  return withAccessToken(headers);
}
