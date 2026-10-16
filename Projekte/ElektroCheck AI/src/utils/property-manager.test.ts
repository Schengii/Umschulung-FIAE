import { beforeEach, describe, expect, it, vi } from "vitest";
import { PropertyManager } from "./property-manager";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", memoryStorage());
});

describe("PropertyManager", () => {
  it("legt beim ersten Aufruf Demo-Daten an und speichert sie", () => {
    const first = PropertyManager.getAllCustomers();
    expect(first.length).toBeGreaterThan(0);
    expect(PropertyManager.getAllCustomers()).toEqual(first);
  });

  it("fügt Kunde, Objekt und Verteilung hierarchisch hinzu", () => {
    const customer = PropertyManager.addCustomer({ name: "Bäckerei Müller" });
    const property = PropertyManager.addProperty(customer.id, { name: "Backstube", address: "Hauptstr. 1" });
    expect(property).not.toBeNull();
    const board = PropertyManager.addDistributionBoard(customer.id, property!.id, { name: "UV-01", location: "Flur" });
    expect(board?.name).toBe("UV-01");

    const stored = PropertyManager.getAllCustomers().find((c) => c.id === customer.id);
    expect(stored?.properties[0].distributionBoards[0].name).toBe("UV-01");
  });

  it("liefert null bei unbekanntem Kunden oder Objekt", () => {
    expect(PropertyManager.addProperty("gibt-es-nicht", { name: "x", address: "y" })).toBeNull();
    const customer = PropertyManager.addCustomer({ name: "K" });
    expect(PropertyManager.addDistributionBoard(customer.id, "gibt-es-nicht", { name: "x", location: "y" })).toBeNull();
  });

  it("übersteht beschädigte Speicherinhalte", () => {
    vi.stubGlobal("localStorage", memoryStorage({ electrocheck_customers_v1: "{kaputt" }));
    expect(() => PropertyManager.getAllCustomers()).not.toThrow();
  });

  it("vergibt eindeutige IDs", () => {
    const a = PropertyManager.addCustomer({ name: "A" });
    const b = PropertyManager.addCustomer({ name: "B" });
    expect(a.id).not.toBe(b.id);
  });
});
