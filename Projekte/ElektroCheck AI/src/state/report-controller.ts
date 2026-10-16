import type { ReactiveController, ReactiveControllerHost } from "lit";
import {
  createPdfPreviewUrl,
  downloadLegendPdf,
  downloadReportPdf,
  exportZvehCsv,
  exportZvehXml,
  sendReportEmail,
  type ReportContext,
} from "../utils/report-actions";
import { getErrorMessage } from "../utils/error";
import { showToast } from "../utils/toast";

export interface ReportControllerOptions {
  /** Liefert den aktuellen Berichtskontext (null, solange es kein Ergebnis gibt). */
  getContext: () => ReportContext | null;
  /** Zeigt/entfernt den Ladehinweis der Shell (Meldung = an, null = aus). */
  setBusy: (message: string | null) => void;
  /** Wird nach einem erfolgreichen Export aufgerufen (z. B. Prüffrist vormerken). */
  onExported: (ctx: ReportContext) => void;
  /** Header für den E-Mail-Versand (Zugriffstoken, eigene API-Schlüssel). */
  getHeaders: () => Record<string, string>;
  /** Abfrage der Empfängeradresse; null = abgebrochen. */
  askRecipient?: () => string | null;
}

const defaultAskRecipient = (): string | null =>
  prompt("An welche E-Mail-Adresse soll der Prüfbericht gesendet werden?", "kunde@beispiel.de");

/**
 * Berichts-Aktionen der Prüfung: PDF-Vorschau und -Download, ZVEH-Export, Stromkreisverzeichnis
 * und E-Mail-Versand. Hält die URL der PDF-Vorschau (Blob) und gibt sie beim Schließen frei.
 */
export class ReportController implements ReactiveController {
  pdfPreviewUrl: string | null = null;

  constructor(
    private readonly host: ReactiveControllerHost,
    private readonly options: ReportControllerOptions,
  ) {
    host.addController(this);
  }

  hostConnected(): void {
    // nichts zu tun
  }

  hostDisconnected(): void {
    this.closePreview();
  }

  async openPreview(): Promise<void> {
    const ctx = this.options.getContext();
    if (!ctx) return;
    this.options.setBusy("Lade Vorschau...");
    try {
      this.pdfPreviewUrl = await createPdfPreviewUrl(ctx);
      this.host.requestUpdate();
    } catch {
      showToast("Fehler bei der PDF-Vorschau.", "error");
    } finally {
      this.options.setBusy(null);
    }
  }

  closePreview(): void {
    if (this.pdfPreviewUrl) URL.revokeObjectURL(this.pdfPreviewUrl);
    this.pdfPreviewUrl = null;
    this.host.requestUpdate();
  }

  async downloadPdf(): Promise<void> {
    const ctx = this.options.getContext();
    if (!ctx) return;
    try {
      await downloadReportPdf(ctx);
      this.options.onExported(ctx);
    } catch {
      showToast("Fehler beim PDF-Download.", "error");
    }
  }

  exportZveh(format: "csv" | "xml"): void {
    const ctx = this.options.getContext();
    if (!ctx) return;
    try {
      if (format === "csv") {
        exportZvehCsv(ctx);
        showToast("ZVEH-CSV erfolgreich exportiert!", "success");
      } else {
        exportZvehXml(ctx);
        showToast("ZVEH-XML (E-CHECK) erfolgreich exportiert!", "success");
      }
      this.options.onExported(ctx);
    } catch (err) {
      showToast(`Export-Fehler: ${getErrorMessage(err)}`, "error");
    }
  }

  async downloadLegend(): Promise<void> {
    const ctx = this.options.getContext();
    if (!ctx) return;
    try {
      await downloadLegendPdf(ctx);
      showToast("Stromkreisverzeichnis als PDF heruntergeladen!", "success");
    } catch (err) {
      showToast(`Fehler beim Erstellen der Legende: ${getErrorMessage(err)}`, "error");
    }
  }

  async sendEmail(): Promise<void> {
    const ctx = this.options.getContext();
    if (!ctx) return;
    const recipient = (this.options.askRecipient ?? defaultAskRecipient)();
    if (!recipient || !recipient.includes("@")) {
      if (recipient !== null) showToast("Ungültige E-Mail-Adresse eingegeben.", "warning");
      return;
    }

    this.options.setBusy("Sende Prüfbericht per E-Mail...");
    try {
      const message = await sendReportEmail(ctx, {
        recipient,
        backendUrl: localStorage.getItem("electrocheck_backend_url") || "",
        headers: this.options.getHeaders(),
      });
      this.options.onExported(ctx);
      showToast(message || `Prüfbericht an ${recipient} versendet!`, "success", 4500);
    } catch (e) {
      showToast(`Fehler beim E-Mail-Versand: ${getErrorMessage(e)}`, "error");
    } finally {
      this.options.setBusy(null);
    }
  }
}
