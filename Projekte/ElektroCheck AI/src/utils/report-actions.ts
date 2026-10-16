import type { DiagnosisResult } from "../services/ai-types";
import { fetchWithTimeout } from "./fetch-timeout";
import { evaluateBasicDguv } from "./basic-dguv-check";
import { downloadDistributionLegend } from "./distribution-legend-generator";
import { buildPdfDocDefinition, downloadPdf, generatePdfBlob } from "./pdf-generator";
import { downloadFile, generateZvehCsv, generateZvehXml } from "./zveh-export";

type PdfArgs = Parameters<typeof buildPdfDocDefinition>;
export type DguvPayload = NonNullable<PdfArgs[3]>;
export type InspectorData = NonNullable<PdfArgs[4]>;
export type RoiData = NonNullable<PdfArgs[5]>;
export type GbuData = NonNullable<PdfArgs[6]>;

/** Alles, was für Protokoll-PDF, ZVEH-Export, Legende und E-Mail-Versand gebraucht wird. */
export interface ReportContext {
  result: DiagnosisResult;
  /** Diagnosebild inkl. Markierungen (Data-URL) */
  image: string | null;
  disclaimerText: string;
  dguv?: DguvPayload;
  inspector: InspectorData;
  roi?: RoiData | null;
  gbu?: GbuData | null;
}

/** Auswertung des DGUV-Prüfassistenten (Detail des "dguv-changed"-Events von ec-dguv-form). */
export interface DguvFormChange {
  protectionClass?: string;
  rPe?: string;
  rIso?: string;
  iLeak?: string;
  iTouch?: string;
  rcdTripTimeMs?: string;
  rcdTripCurrentMa?: string;
  loopImpedanceZs?: string;
  equipmentName?: string;
  inventoryNumber?: string;
  signatureUrl?: string | null;
  status?: string;
  details?: string[];
  nextInspectionDate?: string;
}

/**
 * Baut die DGUV-Daten fürs Protokoll. Liegt die Auswertung des Prüfassistenten vor (form), wird sie
 * übernommen (Schutzklasse, Status, nächste Prüfung, Gerätedaten); sonst gilt die Schnellbewertung
 * der Handeingaben. Rückgabe undefined, wenn nichts gemessen wurde.
 */
export function buildDguvPayload(input: {
  rPe: string;
  rIso: string;
  iLeak: string;
  signatureUrl: string | null;
  form?: DguvFormChange | null;
}): DguvPayload | undefined {
  const form = input.form ?? null;
  const hasBasicValues = Boolean(input.rPe.trim() || input.rIso.trim() || input.iLeak.trim());
  const formHasResult = Boolean(form && form.status && form.status !== "KEINE MESSDATEN");
  if (!hasBasicValues && !formHasResult) return undefined;

  const basic = evaluateBasicDguv(input);
  return {
    protectionClass: form?.protectionClass || "SK_I",
    rPe: input.rPe,
    rIso: input.rIso,
    iLeak: input.iLeak,
    iTouch: form?.iTouch ?? "",
    rcdTripTimeMs: form?.rcdTripTimeMs,
    rcdTripCurrentMa: form?.rcdTripCurrentMa,
    loopImpedanceZs: form?.loopImpedanceZs,
    equipmentName: form?.equipmentName ?? "",
    inventoryNumber: form?.inventoryNumber ?? "",
    nextInspectionDate: form?.nextInspectionDate ?? "",
    status: formHasResult ? form!.status! : basic.message,
    details: formHasResult && form!.details ? form!.details : basic.details,
    signatureUrl: input.signatureUrl,
  };
}

const safeName = (name: string): string => name.replace(/\s+/g, "_");

function buildDocument(ctx: ReportContext) {
  return buildPdfDocDefinition(
    ctx.result,
    ctx.image,
    ctx.disclaimerText,
    ctx.dguv,
    ctx.inspector,
    ctx.roi ?? undefined,
    ctx.gbu ?? undefined,
  );
}

/** Erzeugt eine Object-URL für die PDF-Vorschau (vom Aufrufer mit URL.revokeObjectURL freizugeben). */
export async function createPdfPreviewUrl(ctx: ReportContext): Promise<string> {
  return URL.createObjectURL(await generatePdfBlob(buildDocument(ctx)));
}

export async function downloadReportPdf(ctx: ReportContext): Promise<void> {
  await downloadPdf(buildDocument(ctx), `Protokoll_${safeName(ctx.result.deviceName)}.pdf`);
}

export function exportZvehCsv(ctx: ReportContext): void {
  const csv = generateZvehCsv({ diagnosis: ctx.result, dguvData: ctx.dguv, inspectorData: ctx.inspector });
  downloadFile(csv, `ZVEH_Export_${safeName(ctx.result.deviceName)}.csv`, "text/csv;charset=utf-8;");
}

export function exportZvehXml(ctx: ReportContext): void {
  const xml = generateZvehXml({ diagnosis: ctx.result, dguvData: ctx.dguv, inspectorData: ctx.inspector });
  downloadFile(xml, `ZVEH_ECHECK_${safeName(ctx.result.deviceName)}.xml`, "application/xml;charset=utf-8;");
}

/** Stromkreisverzeichnis (Schaltschrank-Legende) mit Beispielstromkreisen als PDF. */
export async function downloadLegendPdf(ctx: ReportContext): Promise<void> {
  const deviceName = ctx.result.deviceName;
  await downloadDistributionLegend(
    {
      boardName: ctx.dguv?.equipmentName || (deviceName ? `Verteilung ${deviceName}` : "Unterverteiler UV-01"),
      location: ctx.result.location || "Hauptgebäude / Technikraum",
      ratedVoltage: "230/400V 50Hz",
      incomingFeed: "NYM-J 5x10 mm² / 50A",
      circuits: [
        { circuitNumber: "F1", name: "Licht Flur / Eingang", mcbRating: "B10A", cableType: "NYM-J 3x1.5", rcdGroup: "RCD 1 (30mA)", room: "Flur" },
        { circuitNumber: "F2", name: "Steckdosen Arbeitsplatz 1", mcbRating: "B16A", cableType: "NYM-J 3x2.5", rcdGroup: "RCD 1 (30mA)", room: "Büro" },
        { circuitNumber: "F3", name: "Steckdosen Prüfplatz", mcbRating: "B16A", cableType: "NYM-J 3x2.5", rcdGroup: "RCD 1 (30mA)", room: "Werkstatt" },
        { circuitNumber: "F4", name: "Heizung / Lüftung", mcbRating: "B16A", cableType: "NYM-J 3x2.5", rcdGroup: "RCD 2 (30mA)", room: "Technik" },
        { circuitNumber: "F5", name: "Kraftsteckdose CEE 16A", mcbRating: "C16A", cableType: "NYM-J 5x2.5", rcdGroup: "RCD 2 (30mA)", room: "Werkstatt" },
        { circuitNumber: "F6", name: "Reserve / Freiraum", mcbRating: "-", cableType: "-", rcdGroup: "-", room: "-" },
      ],
    },
    `Stromkreisverzeichnis_${deviceName ? safeName(deviceName) : "Verteilung"}.pdf`,
  );
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Versendet den Prüfbericht samt PDF per Backend-E-Mail-Endpoint. Rückgabe: Meldung des Servers (falls vorhanden). */
export async function sendReportEmail(
  ctx: ReportContext,
  options: { recipient: string; backendUrl: string; headers: Record<string, string> },
): Promise<string | undefined> {
  const pdfBase64 = await blobToDataUrl(await generatePdfBlob(buildDocument(ctx)));

  const response = await fetchWithTimeout(`${options.backendUrl}/api/reports/send-email`, {
    method: "POST",
    headers: options.headers,
    body: JSON.stringify({
      recipientEmail: options.recipient.trim(),
      recipientName: ctx.inspector.company ? `Kunde von ${ctx.inspector.company}` : "Auftraggeber",
      reportTitle: `Prüfbericht ${ctx.result.deviceName} (${ctx.dguv?.status || "Geprüft"})`,
      reportSummary: `Befund: ${ctx.result.identifiedDefect}. Empfehlung: ${ctx.result.recommendation}`,
      pdfBase64,
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Server antwortete mit Fehler.");
  }
  const data = await response.json();
  return typeof data.message === "string" ? data.message : undefined;
}
