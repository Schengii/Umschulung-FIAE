import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiAIService } from "./gemini-services";

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

const result = { deviceName: "Lampe", safetyLevel: "SAFE" };

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("localStorage", memoryStorage());
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GeminiAIService", () => {
  it("sendet die Diagnose an den Proxy und liefert das Ergebnis", async () => {
    const fetchMock = vi.fn(async () => json(result));
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("electrocheck_backend_url", " https://api.example ");

    const diagnosis = await new GeminiAIService().getDiagnosis("img", "Lampe flackert");

    expect(diagnosis).toEqual(result);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example/api/gemini/diagnosis");
    expect(JSON.parse(String(init.body))).toEqual({ imageBase64: "img", description: "Lampe flackert" });
  });

  it("wiederholt bei Serverfehler 500 und gelingt dann", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ error: "kurz down" }, 500))
      .mockResolvedValueOnce(json(result));
    vi.stubGlobal("fetch", fetchMock);

    const promise = new GeminiAIService().getDiagnosis(null, "x");
    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toEqual(result);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("zeigt die Fehlermeldung des Servers bei Client-Fehlern ohne Wiederholung", async () => {
    const fetchMock = vi.fn(async () => json({ error: "Ungültige Eingabe" }, 400));
    vi.stubGlobal("fetch", fetchMock);

    await expect(new GeminiAIService().getDiagnosis(null, "")).rejects.toThrow("Ungültige Eingabe");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("wiederholt bei Zeitüberschreitung nicht", async () => {
    const fetchMock = vi.fn((_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const promise = new GeminiAIService().getDiagnosis(null, "x");
    const assertion = expect(promise).rejects.toMatchObject({ name: "TimeoutError" });
    await vi.advanceTimersByTimeAsync(70_000);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reicht einen Abbruch des Aufrufers ohne Wiederholung durch", async () => {
    const fetchMock = vi.fn((_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    const promise = new GeminiAIService().getDiagnosis(null, "x", controller.signal);
    const assertion = expect(promise).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("scanTypePlate sendet Bild und liefert OCR-Ergebnis", async () => {
    const mockOcr = { componentName: "Schütz K1", extractedText: "230V 50Hz", datasheetSearchUrl: "https://example.com" };
    const fetchMock = vi.fn(async (_url: string) => json(mockOcr));
    vi.stubGlobal("fetch", fetchMock);

    const service = new GeminiAIService("https://api.example");
    const res = await service.scanTypePlate("img_base64_data");

    expect(res).toEqual(mockOcr);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.example/api/gemini/scan-type-plate");
  });

  it("analyzeThermal analysiert Wärmebilder und liefert Hotspots", async () => {
    const mockThermal = {
      overallStatus: "CRITICAL",
      generalRecommendation: "Klemme nachziehen",
      detectedHotspots: [{ label: "Klemme 1", temperature: "85°C", severity: "CRITICAL", box_2d: [10, 10, 50, 50] }],
      actionSteps: [{ id: 1, text: "Abschalten", completed: false }],
      safetyTips: ["Spannungsfreiheit prüfen"]
    };
    const fetchMock = vi.fn(async (_url: string) => json(mockThermal));
    vi.stubGlobal("fetch", fetchMock);

    const service = new GeminiAIService("https://api.example");
    const res = await service.analyzeThermal("thermal_img", "Verteilerkasten");

    expect(res).toEqual(mockThermal);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.example/api/gemini/thermal-analysis");
  });

  it("analyzeSchematic prüft Stromlaufpläne und liefert VDE-Befunde", async () => {
    const mockSchematic = {
      diagramTitle: "Hauptverteilung UV-1",
      identifiedComponents: [{ tag: "Q1", name: "Hauptschalter", terminals: "1, 3, 5" }],
      detectedErrors: [{ severity: "CRITICAL", description: "Fehlender RCD", vdeReference: "DIN VDE 0100-410" }],
      summary: "Schaltung erfordert Nachrüstung."
    };
    const fetchMock = vi.fn(async (_url: string) => json(mockSchematic));
    vi.stubGlobal("fetch", fetchMock);

    const service = new GeminiAIService("https://api.example");
    const res = await service.analyzeSchematic("schematic_img", "Notiz");

    expect(res).toEqual(mockSchematic);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.example/api/gemini/schematic-analysis");
  });

  it("scanMultimeter liest Messwerte und Einheit vom Display ab", async () => {
    const mockReading = { value: 230.5, unit: "V" };
    const fetchMock = vi.fn(async (_url: string) => json(mockReading));
    vi.stubGlobal("fetch", fetchMock);

    const service = new GeminiAIService("https://api.example");
    const res = await service.scanMultimeter("multimeter_img");

    expect(res).toEqual(mockReading);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.example/api/gemini/scan-multimeter");
  });

  it("sendChatMessage sendet Chat-Verlauf und liefert Antwort", async () => {
    const mockReply = { reply: "Prüfe bitte zuerst die Sicherung F1." };
    const fetchMock = vi.fn(async (_url: string) => json(mockReply));
    vi.stubGlobal("fetch", fetchMock);

    const service = new GeminiAIService("https://api.example");
    const text = await service.sendChatMessage([{ role: "user", content: "Was nun?" }]);

    expect(text).toBe("Prüfe bitte zuerst die Sicherung F1.");
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.example/api/gemini/chat");
  });
});
