import { beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  createPdfPreviewUrl: vi.fn(),
  downloadLegendPdf: vi.fn(),
  downloadReportPdf: vi.fn(),
  exportZvehCsv: vi.fn(),
  exportZvehXml: vi.fn(),
  sendReportEmail: vi.fn(),
}));
const toast = vi.hoisted(() => ({ showToast: vi.fn() }));

vi.mock("../utils/report-actions", () => actions);
vi.mock("../utils/toast", () => toast);

import { ReportController } from "./report-controller";
import type { ReportContext } from "../utils/report-actions";

const ctx = { result: { deviceName: "Lampe" } } as unknown as ReportContext;

function setup(overrides: { context?: ReportContext | null; recipient?: string | null } = {}) {
  const host = { addController: vi.fn(), removeController: vi.fn(), requestUpdate: vi.fn(), updateComplete: Promise.resolve(true) };
  const setBusy = vi.fn();
  const onExported = vi.fn();
  const controller = new ReportController(host, {
    getContext: () => (overrides.context === undefined ? ctx : overrides.context),
    setBusy,
    onExported,
    getHeaders: () => ({ "Content-Type": "application/json" }),
    askRecipient: () => (overrides.recipient === undefined ? "kunde@firma.de" : overrides.recipient),
  });
  return { host, setBusy, onExported, controller };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("localStorage", { getItem: () => null });
  vi.stubGlobal("URL", { ...URL, revokeObjectURL: vi.fn() });
});

describe("ReportController", () => {
  it("registriert sich am Host", () => {
    const { host, controller } = setup();
    expect(host.addController).toHaveBeenCalledWith(controller);
  });

  it("öffnet die PDF-Vorschau und schaltet den Ladehinweis ein und wieder aus", async () => {
    actions.createPdfPreviewUrl.mockResolvedValue("blob:preview");
    const { controller, setBusy, host } = setup();
    await controller.openPreview();
    expect(controller.pdfPreviewUrl).toBe("blob:preview");
    expect(setBusy).toHaveBeenNthCalledWith(1, "Lade Vorschau...");
    expect(setBusy).toHaveBeenLastCalledWith(null);
    expect(host.requestUpdate).toHaveBeenCalled();
  });

  it("meldet Fehler der Vorschau und beendet den Ladehinweis trotzdem", async () => {
    actions.createPdfPreviewUrl.mockRejectedValue(new Error("kaputt"));
    const { controller, setBusy } = setup();
    await controller.openPreview();
    expect(controller.pdfPreviewUrl).toBeNull();
    expect(toast.showToast).toHaveBeenCalledWith("Fehler bei der PDF-Vorschau.", "error");
    expect(setBusy).toHaveBeenLastCalledWith(null);
  });

  it("gibt die Vorschau-URL beim Schließen frei", async () => {
    actions.createPdfPreviewUrl.mockResolvedValue("blob:preview");
    const { controller } = setup();
    await controller.openPreview();
    controller.closePreview();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    expect(controller.pdfPreviewUrl).toBeNull();
  });

  it("tut ohne Berichtskontext nichts", async () => {
    const { controller, setBusy } = setup({ context: null });
    await controller.openPreview();
    await controller.downloadPdf();
    controller.exportZveh("csv");
    await controller.sendEmail();
    expect(actions.createPdfPreviewUrl).not.toHaveBeenCalled();
    expect(actions.downloadReportPdf).not.toHaveBeenCalled();
    expect(setBusy).not.toHaveBeenCalled();
  });

  it("merkt die Prüfung nach PDF-Download und ZVEH-Export vor", async () => {
    actions.downloadReportPdf.mockResolvedValue(undefined);
    const { controller, onExported } = setup();
    await controller.downloadPdf();
    controller.exportZveh("csv");
    controller.exportZveh("xml");
    expect(actions.exportZvehCsv).toHaveBeenCalledWith(ctx);
    expect(actions.exportZvehXml).toHaveBeenCalledWith(ctx);
    expect(onExported).toHaveBeenCalledTimes(3);
  });

  it("merkt nichts vor, wenn der Export fehlschlägt", () => {
    actions.exportZvehCsv.mockImplementation(() => {
      throw new Error("Format");
    });
    const { controller, onExported } = setup();
    controller.exportZveh("csv");
    expect(onExported).not.toHaveBeenCalled();
    expect(toast.showToast).toHaveBeenCalledWith(expect.stringContaining("Export-Fehler"), "error");
  });

  it("verschickt den Bericht an die eingegebene Adresse", async () => {
    actions.sendReportEmail.mockResolvedValue("");
    const { controller, onExported, setBusy } = setup();
    await controller.sendEmail();
    expect(actions.sendReportEmail).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ recipient: "kunde@firma.de", headers: { "Content-Type": "application/json" } }),
    );
    expect(onExported).toHaveBeenCalledWith(ctx);
    expect(setBusy).toHaveBeenLastCalledWith(null);
  });

  it("lehnt ungültige Adressen ab, ohne zu senden", async () => {
    const { controller } = setup({ recipient: "keine-adresse" });
    await controller.sendEmail();
    expect(actions.sendReportEmail).not.toHaveBeenCalled();
    expect(toast.showToast).toHaveBeenCalledWith("Ungültige E-Mail-Adresse eingegeben.", "warning");
  });

  it("bleibt bei abgebrochener Eingabe still", async () => {
    const { controller } = setup({ recipient: null });
    await controller.sendEmail();
    expect(actions.sendReportEmail).not.toHaveBeenCalled();
    expect(toast.showToast).not.toHaveBeenCalled();
  });

  it("meldet Versandfehler und beendet den Ladehinweis", async () => {
    actions.sendReportEmail.mockRejectedValue(new Error("503"));
    const { controller, onExported, setBusy } = setup();
    await controller.sendEmail();
    expect(onExported).not.toHaveBeenCalled();
    expect(toast.showToast).toHaveBeenCalledWith(expect.stringContaining("E-Mail-Versand"), "error");
    expect(setBusy).toHaveBeenLastCalledWith(null);
  });
});
