import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const geo = vi.hoisted(() => ({
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  getCurrentPosition: vi.fn(),
}));
vi.mock("@capacitor/geolocation", () => ({ Geolocation: geo }));

import { getCurrentLocation, LOCATION_TIMEOUT_MS } from "./location";

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  geo.checkPermissions.mockResolvedValue({ location: "granted" });
  geo.getCurrentPosition.mockResolvedValue({ coords: { latitude: 52.520008, longitude: 13.404954 } });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("getCurrentLocation", () => {
  it("liefert Koordinaten im Format der Dashboard-Karte", async () => {
    await expect(getCurrentLocation()).resolves.toBe("Lat: 52.52001, Lng: 13.40495");
  });

  it("meldet verweigerte Berechtigung", async () => {
    geo.checkPermissions.mockResolvedValue({ location: "prompt" });
    geo.requestPermissions.mockResolvedValue({ location: "denied" });
    await expect(getCurrentLocation()).resolves.toBe("Standort-Berechtigung verweigert");
  });

  it("liefert einen Hinweistext statt zu werfen, wenn die Ermittlung fehlschlägt", async () => {
    geo.getCurrentPosition.mockRejectedValue(new Error("unavailable"));
    await expect(getCurrentLocation()).resolves.toMatch(/nicht ermittelt/);
  });

  it("bleibt nicht hängen, wenn die Berechtigungsabfrage nie beantwortet wird", async () => {
    geo.checkPermissions.mockResolvedValue({ location: "prompt" });
    geo.requestPermissions.mockReturnValue(new Promise(() => undefined));
    const promise = getCurrentLocation();
    await vi.advanceTimersByTimeAsync(LOCATION_TIMEOUT_MS);
    await expect(promise).resolves.toMatch(/nicht ermittelt/);
  });
});
