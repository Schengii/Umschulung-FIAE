import { beforeEach, describe, expect, it, vi } from "vitest";

const idb = vi.hoisted(() => ({
  store: [] as Array<Record<string, unknown> & { id: number }>,
  failSave: false,
}));
const network = vi.hoisted(() => ({ connected: true }));

vi.mock("@capacitor/network", () => ({
  Network: { getStatus: async () => ({ connected: network.connected }) },
}));
vi.mock("../utils/indexed-db", () => ({
  saveOfflineTicket: async (t: object) => {
    if (idb.failSave) throw new Error("idb down");
    const id = idb.store.length + 1;
    idb.store.push({ ...(t as Record<string, unknown>), id });
    return id;
  },
  getOfflineTickets: async () => [...idb.store],
  deleteOfflineTicket: async (id: number) => {
    idb.store = idb.store.filter((t) => t.id !== id);
  },
}));

import { TicketService } from "./ticket-service";
import type { DiagnosisResult } from "./ai-types";

const diagnosis = (name: string) => ({ deviceName: name } as unknown as DiagnosisResult);

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe("TicketService Offline-Queue", () => {
  beforeEach(() => {
    idb.store = [];
    idb.failSave = false;
    network.connected = true;
    vi.stubGlobal("localStorage", memoryStorage());
  });

  it("legt Offline-Tickets nur in IndexedDB ab", async () => {
    network.connected = false;
    await expect(new TicketService().createMaintenanceTicket(diagnosis("A"))).rejects.toThrow(/Offline/);
    expect(idb.store).toHaveLength(1);
    expect(localStorage.getItem("electrocheck_offline_tickets")).toBeNull();
  });

  it("fällt bei IndexedDB-Ausfall auf LocalStorage zurück", async () => {
    network.connected = false;
    idb.failSave = true;
    await expect(new TicketService().createMaintenanceTicket(diagnosis("A"))).rejects.toThrow(/Offline/);
    expect(JSON.parse(localStorage.getItem("electrocheck_offline_tickets") || "[]")).toHaveLength(1);
  });

  it("synchronisiert einzeln und behält Fehlgeschlagene", async () => {
    idb.store = [
      { id: 1, deviceName: "ok", queuedAt: "x" },
      { id: 2, deviceName: "fail", queuedAt: "x" },
    ];
    const sent: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        const body = JSON.parse(String(init.body));
        sent.push(body);
        return new Response("{}", { status: body.deviceName === "fail" ? 500 : 201 });
      }),
    );
    const count = await new TicketService().syncOfflineTickets();
    expect(count).toBe(1);
    expect(idb.store.map((t) => t.deviceName)).toEqual(["fail"]);
    // Queue-Metadaten werden nicht zum Server gesendet
    expect(sent[0]).toEqual({ deviceName: "ok" });
  });

  it("überträgt alte LocalStorage-Einträge und leert sie", async () => {
    localStorage.setItem("electrocheck_offline_tickets", JSON.stringify([diagnosis("legacy")]));
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 201 })));
    expect(await new TicketService().syncOfflineTickets()).toBe(1);
    expect(localStorage.getItem("electrocheck_offline_tickets")).toBeNull();
  });

  it("bricht bei Netzwerkfehler nicht ab und behält das Ticket", async () => {
    idb.store = [{ id: 1, deviceName: "x" }];
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("net"); }));
    expect(await new TicketService().syncOfflineTickets()).toBe(0);
    expect(idb.store).toHaveLength(1);
  });
});

describe("TicketService CRUD Operations", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
  });

  it("lädt Tickets bei direktem Array-Response", async () => {
    const mockList = [{ id: "TKT-1", deviceName: "Motor" }];
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(mockList), { status: 200 })));

    const service = new TicketService();
    const tickets = await service.getTickets();
    expect(tickets).toEqual(mockList);
  });

  it("lädt Tickets bei Enveloppe-Response", async () => {
    const mockList = [{ id: "TKT-2", deviceName: "Pumpe" }];
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ tickets: mockList, total: 1 }), { status: 200 })));

    const service = new TicketService();
    const tickets = await service.getTickets({ limit: 10, page: 1 });
    expect(tickets).toEqual(mockList);
  });

  it("wirft Fehler bei fehlerhaftem getTickets-Response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })));

    const service = new TicketService();
    await expect(service.getTickets()).rejects.toThrow("Unauthorized");
  });

  it("aktualisiert ein Ticket erfolgreich", async () => {
    const updated = { id: "TKT-1", status: "closed" };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(updated), { status: 200 })));

    const service = new TicketService();
    const res = await service.updateTicket("TKT-1", { status: "closed" });
    expect(res).toEqual(updated);
  });

  it("wirft Fehler bei updateTicket ohne ID oder bei Serverfehler", async () => {
    const service = new TicketService();
    await expect(service.updateTicket("", { status: "closed" })).rejects.toThrow("Ticket-ID erforderlich.");

    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Not Found" }), { status: 404 })));
    await expect(service.updateTicket("TKT-99", { status: "closed" })).rejects.toThrow("Not Found");
  });

  it("löscht ein Ticket erfolgreich", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));

    const service = new TicketService();
    const ok = await service.deleteTicket("TKT-1");
    expect(ok).toBe(true);
  });

  it("wirft Fehler bei deleteTicket ohne ID oder bei Serverfehler", async () => {
    const service = new TicketService();
    await expect(service.deleteTicket("")).rejects.toThrow("Ticket-ID erforderlich.");

    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })));
    await expect(service.deleteTicket("TKT-1")).rejects.toThrow("Forbidden");
  });
});
