import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";
import {
  addProject,
  getProjects,
  deleteProject,
  startProject,
  stopProject,
  loadProjects,
} from "../projects";

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
  loadProjects();
});

describe("Projects Management Module", () => {
  it("should add a new project", () => {
    const proj = addProject("Frontend Refactoring");
    expect(proj.name).toBe("Frontend Refactoring");
    expect(proj.isRunning).toBe(false);
    const all = getProjects();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(proj.id);
  });

  it("should start and stop project timer", async () => {
    const proj = addProject("Meeting Client");
    startProject(proj.id);
    const running = getProjects().find(p => p.id === proj.id);
    expect(running?.isRunning).toBe(true);

    // simulate time passing
    await new Promise(res => setTimeout(res, 50));

    stopProject(proj.id);
    const stopped = getProjects().find(p => p.id === proj.id);
    expect(stopped?.isRunning).toBe(false);
    expect(stopped?.totalMs).toBeGreaterThan(0);
  });

  it("should delete a project", () => {
    const proj = addProject("Old Task");
    expect(getProjects().length).toBe(1);
    deleteProject(proj.id);
    expect(getProjects().length).toBe(0);
  });
});
