import type { DiagnosisResult } from "../services/ai-types";

export type HistoryExportFormat = "json" | "csv";

export interface HistoryExportFile {
  content: string;
  mimeType: string;
  fileName: string;
}

const csvText = (value: string | undefined): string => `"${(value || "").replace(/"/g, '""')}"`;

/** Erzeugt den Export der Diagnosehistorie (DSGVO-Datenexport) als JSON oder CSV (Semikolon-getrennt). */
export function buildHistoryExport(history: DiagnosisResult[], format: HistoryExportFormat): HistoryExportFile {
  if (format === "csv") {
    const headers = ["Gerät", "Defekt", "Empfehlung", "Schwierigkeit", "Sicherheitsstufe", "Kosten"];
    const rows = history.map((h) => [
      csvText(h.deviceName),
      csvText(h.identifiedDefect),
      csvText(h.recommendation),
      h.repairDifficulty ?? "",
      h.safetyLevel ?? "",
      csvText(h.estimatedRepairCost),
    ]);
    return {
      // BOM, damit Excel die Umlaute (UTF-8) richtig erkennt
      content: "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n"),
      mimeType: "text/csv;charset=utf-8",
      fileName: "electrocheck_diagnosen_export.csv",
    };
  }
  return {
    content: JSON.stringify(history, null, 2),
    mimeType: "application/json;charset=utf-8",
    fileName: "electrocheck_diagnosen_export.json",
  };
}

/** Löst den Download einer Textdatei über einen Data-URI aus. */
export function downloadTextFile(file: HistoryExportFile): void {
  const link = document.createElement("a");
  link.setAttribute("href", `data:${file.mimeType},${encodeURIComponent(file.content)}`);
  link.setAttribute("download", file.fileName);
  link.click();
}
