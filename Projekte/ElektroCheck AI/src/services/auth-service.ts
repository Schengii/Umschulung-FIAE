import { ACCESS_TOKEN_STORAGE_KEY, SESSION_STORAGE_KEY } from "../utils/auth-headers";
import { fetchWithTimeout } from "../utils/fetch-timeout";

const SESSION_KEY = SESSION_STORAGE_KEY;
const USER_KEY = "electrocheck_user";
const BACKEND_URL_KEY = "electrocheck_backend_url";

export interface AuthUser {
  email: string;
  role: "member" | "admin" | "service";
}

export type AuthStatus =
  /** Angemeldet (Session gültig oder – offline – lokal vorhanden) */
  | "authenticated"
  /** Server verlangt keinen Login (lokale Entwicklung) */
  | "anonymous"
  | "login-required";

export interface LoginRequestResult {
  /** Nur im Entwicklungsmodus ohne Mailversand */
  devLink?: string;
  devCode?: string;
}

const backendUrl = (): string => {
  try {
    return localStorage.getItem(BACKEND_URL_KEY)?.trim() || "";
  } catch {
    return "";
  }
};

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/** Zugangscode (APP_ACCESS_TOKEN) aus Login-Maske oder Einstellungen */
function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export function getCachedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function storeSession(token: string, user: AuthUser): void {
  try {
    localStorage.setItem(SESSION_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn("Session konnte nicht gespeichert werden:", e);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Speicher nicht verfügbar – nichts zu löschen
  }
}

async function postJson<T>(path: string, body: unknown, token?: string | null): Promise<{ status: number; data: T }> {
  const response = await fetchWithTimeout(`${backendUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T;
  return { status: response.status, data };
}

/** Fordert den Magic-Link an. Antwortet der Server, ist die Anfrage angenommen (egal ob die Adresse freigegeben ist). */
export async function requestLoginLink(email: string): Promise<LoginRequestResult> {
  const { status, data } = await postJson<LoginRequestResult & { error?: string }>("/api/auth/request-link", { email });
  if (status !== 200) throw new Error(data.error || "Der Anmelde-Link konnte nicht angefordert werden.");
  return data;
}

async function finishLogin(body: { token: string } | { email: string; code: string }): Promise<AuthUser> {
  const { status, data } = await postJson<{ sessionToken?: string; user?: AuthUser; error?: string }>("/api/auth/verify", body);
  if (status !== 200 || !data.sessionToken || !data.user) {
    throw new Error(data.error || "Anmeldung fehlgeschlagen.");
  }
  storeSession(data.sessionToken, data.user);
  return data.user;
}

/** Meldet mit dem gemeinsamen Zugangscode (APP_ACCESS_TOKEN) an, statt per E-Mail-Link. */
export async function loginWithAccessToken(accessToken: string): Promise<AuthUser> {
  const token = accessToken.trim();
  const response = await fetchWithTimeout(`${backendUrl()}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  const data = (await response.json().catch(() => ({}))) as { user?: AuthUser | null };
  if (!response.ok || !data.user) throw new Error("Zugangscode ungültig.");
  try {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  } catch (e) {
    console.warn("Zugangscode konnte nicht gespeichert werden:", e);
  }
  return data.user;
}

export const verifyLoginToken = (token: string): Promise<AuthUser> => finishLogin({ token });
export const verifyLoginCode = (email: string, code: string): Promise<AuthUser> => finishLogin({ email, code });

/** Prüft die Anmeldung beim Server. Offline (Netzwerkfehler) zählt eine vorhandene lokale Session. */
export async function checkAuth(): Promise<{ status: AuthStatus; user: AuthUser | null }> {
  const token = getSessionToken();
  const bearer = token || getAccessToken();
  try {
    const response = await fetchWithTimeout(`${backendUrl()}/api/auth/me`, {
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
    });
    if (response.status === 401) {
      clearSession();
      return { status: "login-required", user: null };
    }
    if (!response.ok) {
      // z.B. 503 (Server nicht konfiguriert): vorhandene Session nicht verwerfen
      return bearer ? { status: "authenticated", user: getCachedUser() } : { status: "login-required", user: null };
    }
    const { user } = (await response.json()) as { user: AuthUser | null };
    if (!user) return { status: "anonymous", user: null };
    if (token) storeSession(token, user);
    return { status: "authenticated", user };
  } catch {
    return bearer ? { status: "authenticated", user: getCachedUser() } : { status: "login-required", user: null };
  }
}

export async function logout(): Promise<void> {
  const token = getSessionToken();
  clearSession();
  if (!token) return;
  try {
    await postJson("/api/auth/logout", {}, token);
  } catch {
    // offline: die lokale Session ist bereits entfernt, das Token läuft serverseitig ab
  }
}

/**
 * Meldet abgelaufene/widerrufene Sessions: Antwortet das Backend auf einen /api-Aufruf mit 401,
 * wird die lokale Session entfernt und onExpired aufgerufen (dann Login-Maske zeigen).
 * Rückgabe: Funktion zum Entfernen des Interceptors.
 */
export function installSessionExpiryHandler(onExpired: () => void): () => void {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (response.status === 401 && url.includes("/api/") && !url.includes("/api/auth/") && getSessionToken()) {
      clearSession();
      onExpired();
    }
    return response;
  };
  return () => {
    window.fetch = originalFetch;
  };
}
