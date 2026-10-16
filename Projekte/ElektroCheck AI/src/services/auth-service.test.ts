import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkAuth, clearSession, getCachedUser, getSessionToken, loginWithAccessToken, logout, requestLoginLink, verifyLoginCode } from "./auth-service";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const user = { email: "a@b.de", role: "member" as const };

beforeEach(() => {
  vi.stubGlobal("localStorage", memoryStorage());
});

describe("Login", () => {
  it("speichert Session und Nutzer nach erfolgreicher Code-Eingabe", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ sessionToken: "tok", user })));
    await expect(verifyLoginCode("a@b.de", "123456")).resolves.toEqual(user);
    expect(getSessionToken()).toBe("tok");
    expect(getCachedUser()).toEqual(user);
  });

  it("wirft die Fehlermeldung des Servers bei falschem Code", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ error: "Code ungültig" }, 401)));
    await expect(verifyLoginCode("a@b.de", "000000")).rejects.toThrow("Code ungültig");
    expect(getSessionToken()).toBeNull();
  });

  it("meldet Fehler beim Anfordern des Links", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ error: "Zu viele Anfragen" }, 429)));
    await expect(requestLoginLink("a@b.de")).rejects.toThrow("Zu viele Anfragen");
  });
});

describe("checkAuth", () => {
  it("verwirft die Session bei 401", async () => {
    localStorage.setItem("electrocheck_session", "alt");
    vi.stubGlobal("fetch", vi.fn(async () => json({}, 401)));
    expect(await checkAuth()).toEqual({ status: "login-required", user: null });
    expect(getSessionToken()).toBeNull();
  });

  it("behält die lokale Session bei Netzwerkfehler (offline)", async () => {
    localStorage.setItem("electrocheck_session", "tok");
    localStorage.setItem("electrocheck_user", JSON.stringify(user));
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    expect(await checkAuth()).toEqual({ status: "authenticated", user });
  });

  it("verlangt Login bei Netzwerkfehler ohne Session", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    expect((await checkAuth()).status).toBe("login-required");
  });

  it("behält die Session bei Serverfehler 503", async () => {
    localStorage.setItem("electrocheck_session", "tok");
    vi.stubGlobal("fetch", vi.fn(async () => json({}, 503)));
    expect((await checkAuth()).status).toBe("authenticated");
    expect(getSessionToken()).toBe("tok");
  });

  it("erkennt den Modus ohne Login-Pflicht", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ user: null })));
    expect(await checkAuth()).toEqual({ status: "anonymous", user: null });
  });
});

describe("logout", () => {
  it("entfernt die Session auch wenn der Server nicht erreichbar ist", async () => {
    localStorage.setItem("electrocheck_session", "tok");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("offline"); }));
    await logout();
    expect(getSessionToken()).toBeNull();
  });

  it("clearSession leert Token und Nutzer", () => {
    localStorage.setItem("electrocheck_session", "tok");
    localStorage.setItem("electrocheck_user", JSON.stringify(user));
    clearSession();
    expect(getSessionToken()).toBeNull();
    expect(getCachedUser()).toBeNull();
  });
});

describe("Zugangscode", () => {
  const service = { email: "service", role: "service" as const };

  it("speichert einen gültigen Zugangscode und erkennt ihn beim nächsten Start", async () => {
    const fetchMock = vi.fn(async () => json({ user: service }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(loginWithAccessToken(" geheim ")).resolves.toEqual(service);
    expect(localStorage.getItem("electrocheck_access_token")).toBe("geheim");
    expect((await checkAuth()).status).toBe("authenticated");
    expect(fetchMock.mock.calls[1]).toMatchObject([expect.any(String), { headers: { Authorization: "Bearer geheim" } }]);
  });

  it("lehnt einen falschen Zugangscode ab und speichert nichts", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ error: "Nicht autorisiert." }, 401)));
    await expect(loginWithAccessToken("falsch")).rejects.toThrow("Zugangscode ungültig.");
    expect(localStorage.getItem("electrocheck_access_token")).toBeNull();
  });

  it("clearSession entfernt auch den Zugangscode", () => {
    localStorage.setItem("electrocheck_access_token", "geheim");
    clearSession();
    expect(localStorage.getItem("electrocheck_access_token")).toBeNull();
  });
});
