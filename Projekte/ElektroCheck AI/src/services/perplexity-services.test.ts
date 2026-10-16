import { beforeEach, describe, expect, it, vi } from "vitest";
import { PerplexityService } from "./perplexity-services";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe("PerplexityService", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
  });

  it("sendet Query und liefert Antwort erfolgreich zurück", async () => {
    let capturedUrl = "";
    let capturedBody = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        capturedUrl = url;
        capturedBody = String(init.body);
        return new Response(JSON.stringify({ answer: "Antwort auf DIN VDE Frage" }), { status: 200 });
      }),
    );

    const service = new PerplexityService("https://test.example");
    const answer = await service.search("DIN VDE 0100");

    expect(answer).toBe("Antwort auf DIN VDE Frage");
    expect(capturedUrl).toBe("https://test.example/api/perplexity/search");
    expect(JSON.parse(capturedBody)).toEqual({ query: "DIN VDE 0100" });
  });

  it("verwendet Backend-URL und API-Key aus dem LocalStorage", async () => {
    localStorage.setItem("electrocheck_backend_url", "https://custom.backend");
    localStorage.setItem("electrocheck_perplexity_api_key", "pplx-test-key-123");

    let capturedHeaders: Record<string, string> = {};
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        capturedHeaders = init.headers as Record<string, string>;
        return new Response(JSON.stringify({ answer: "Ergebnis" }), { status: 200 });
      }),
    );

    const service = new PerplexityService();
    const result = await service.search("Test");

    expect(result).toBe("Ergebnis");
    expect(capturedHeaders["x-perplexity-api-key"]).toBe("pplx-test-key-123");
  });

  it("wirft Fehlermeldung aus JSON bei HTTP-Fehlerstatus", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "Quota überschritten." }), { status: 429 }),
      ),
    );

    const service = new PerplexityService();
    await expect(service.search("Fehler")).rejects.toThrow("Quota überschritten.");
  });

  it("fällt bei HTTP-Fehler ohne error-Feld auf Standardfehler zurück", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({}), { status: 500 }),
      ),
    );

    const service = new PerplexityService();
    await expect(service.search("Serverfehler")).rejects.toThrow("Fehler bei der Perplexity-Suche über das Backend.");
  });

  it("fängt ungültiges JSON bei 200 ab und wirft passenden Fehler", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const resp = new Response("kein json", { status: 200 });
        // Erzwinge Fehler beim zweiten response.json() Aufruf
        let callCount = 0;
        resp.json = async () => {
          callCount++;
          if (callCount >= 1) throw new Error("JSON Parse Error");
          return {};
        };
        return resp;
      }),
    );

    const service = new PerplexityService();
    await expect(service.search("Frage")).rejects.toThrow("Suche fehlgeschlagen. Ungültige Antwort vom Server.");
  });

  it("leitet Netzwerk-/Timeout-Fehler weiter", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Netzwerk-Timeout");
      }),
    );

    const service = new PerplexityService();
    await expect(service.search("Timeout")).rejects.toThrow("Netzwerk-Timeout");
  });
});
