import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";
import { storageService } from "../storage";

/* eslint-disable @typescript-eslint/no-explicit-any */

beforeEach(() => {
  const dom = new JSDOM("", { url: "http://localhost" });
  global.window = dom.window as any;
  (globalThis as any).window = dom.window as any;
  (globalThis as any).document = dom.window.document as any;
  const mockStorage: any = (() => {
    let store: Record<string, string> = {};
    return {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        store = {};
      },
    };
  })();
  (globalThis as any).localStorage = mockStorage;
});

describe("storageService", () => {
  it("should return default location when none is set", () => {
    const loc = storageService.getLocation();
    expect(loc).toEqual({
      name: "Büro",
      lat: 52.5162,
      lng: 13.3777,
      radius: 100,
    });
  });

  it("should save and retrieve a custom location", () => {
    const custom = { name: "Home", lat: 40.0, lng: -74.0, radius: 200 };
    storageService.saveLocation(custom);
    const retrieved = storageService.getLocation();
    expect(retrieved).toEqual(custom);
  });

  it("should manage history entries correctly", () => {
    expect(storageService.getHistory()).toEqual([]);
    const entry: any = { start: 0, end: 1, date: "2026-08-12", type: "work" };
    const added = storageService.addHistoryEntry(entry);
    expect(added).toMatchObject(entry);
    const history = storageService.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBeDefined();
    storageService.deleteHistoryEntry(added.id);
    expect(storageService.getHistory()).toEqual([]);
  });

  it("should manage settings correctly", () => {
    const settings = storageService.getSettings();
    expect(settings.dailyTarget).toBe(8);
    expect(settings.arbzgBreaksEnabled).toBe(true);

    storageService.saveSettings({ ...settings, dailyTarget: 7.5, theme: "light" });
    const updated = storageService.getSettings();
    expect(updated.dailyTarget).toBe(7.5);
    expect(updated.theme).toBe("light");
  });

  it("should manage active work session", () => {
    expect(storageService.getActiveSession()).toBeNull();
    const session: any = {
      startTime: Date.now(),
      active: true,
      isPaused: false,
      totalPauseMs: 0,
    };
    storageService.saveActiveSession(session);
    expect(storageService.getActiveSession()).toEqual(session);
    storageService.clearActiveSession();
    expect(storageService.getActiveSession()).toBeNull();
  });
});
