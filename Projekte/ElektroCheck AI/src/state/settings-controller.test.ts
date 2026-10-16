import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsController } from "./settings-controller";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

function fakeElement() {
  const attrs = new Map<string, string>();
  const classes = new Set<string>();
  return {
    attrs,
    classes,
    setAttribute: (k: string, v: string) => void attrs.set(k, v),
    classList: {
      toggle: (c: string, on: boolean) => void (on ? classes.add(c) : classes.delete(c)),
    },
  };
}

let root: ReturnType<typeof fakeElement>;
let host: ReturnType<typeof fakeElement> & { addController: () => void; requestUpdate: ReturnType<typeof vi.fn> };

function createController(prefersDark = false) {
  vi.stubGlobal("window", { matchMedia: () => ({ matches: prefersDark }) });
  return new SettingsController(host as unknown as ConstructorParameters<typeof SettingsController>[0]);
}

beforeEach(() => {
  root = fakeElement();
  host = { ...fakeElement(), addController: () => undefined, requestUpdate: vi.fn() };
  vi.stubGlobal("localStorage", memoryStorage());
  vi.stubGlobal("document", { documentElement: root });
});

describe("SettingsController", () => {
  it("übernimmt ohne gespeicherte Wahl das System-Theme", () => {
    const controller = createController(true);
    controller.load();
    expect(controller.isDarkMode).toBe(true);
    expect(root.attrs.get("theme")).toBe("dark");
  });

  it("bevorzugt das gespeicherte Theme vor dem System-Theme", () => {
    localStorage.setItem("electrocheck_theme", "light");
    const controller = createController(true);
    controller.load();
    expect(controller.isDarkMode).toBe(false);
  });

  it("speichert und lädt Einstellungen und Prüferprofil", () => {
    const first = createController();
    first.save({ backendUrl: "https://api.example", inspectorName: "Erika", inspectorCompany: "Prüf GmbH", inspectorId: "P-1" });

    const second = createController();
    second.load();
    expect(second.backendUrl).toBe("https://api.example");
    expect(second.inspector).toEqual({ name: "Erika", company: "Prüf GmbH", id: "P-1" });
  });

  it("merkt sich die DSGVO-Zustimmung", () => {
    createController().acceptGdpr();
    const reloaded = createController();
    reloaded.load();
    expect(reloaded.hasAcceptedGdpr).toBe(true);
  });

  it("schaltet den barrierefreien Modus um und stellt ihn wieder her", () => {
    createController().setAccessibleMode(true);
    expect(root.classes.has("accessible-reading")).toBe(true);

    root.classes.clear();
    const reloaded = createController();
    reloaded.load();
    expect(reloaded.accessibleMode).toBe(true);
    expect(root.classes.has("accessible-reading")).toBe(true);
  });

  it("setzt Werte im Speicher zurück", () => {
    const controller = createController();
    controller.save({ apiKey: "k", backendUrl: "u", inspectorName: "n" });
    controller.resetInMemory();
    expect(controller.apiKey).toBe("");
    expect(controller.backendUrl).toBe("");
    expect(controller.inspector.name).toBe("");
  });

  it("fordert nach Änderungen ein Re-Rendern an", () => {
    const controller = createController();
    controller.toggleGloveMode();
    expect(host.requestUpdate).toHaveBeenCalled();
    expect(root.attrs.get("glove-mode")).toBe("true");
  });
});
