import type { TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import { DiagnosisResult, ThermalAnalysisResult } from "../services/ai-types";

/**
 * Erstellt die pdfmake Dokumentendeklaration für ein Wartungsprotokoll.
 */
export function buildPdfDocDefinition(
  result: DiagnosisResult,
  capturedImage: string | null,
  disclaimerText: string,
  dguvData?: {
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
    nextInspectionDate?: string;
    status: string;
    details: string[];
    signatureUrl?: string | null;
  },
  inspectorData?: {
    name?: string;
    company?: string;
    id?: string;
  },
  roiData?: {
    totalRepairCost: number;
    replacementPrice: number;
    ratioPercent: number;
    recommendation: string;
  },
  gbuData?: {
    location: string;
    initialRiskLevel: string;
    residualRiskLevel: string;
    isAcceptable: boolean;
  }
): TDocumentDefinitions {
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Bedingte Blöcke (cond ? {...} : {}) sind für pdfmake gültig, aber nicht für dessen strenge Typen
  const docDefinition = {
    content: [
      {
        text: "ElectroCheck AI - Wartungsprotokoll",
        fontSize: 24,
        bold: true,
        color: "#005fcc",
        margin: [0, 0, 0, 5],
      },
      inspectorData && (inspectorData.name || inspectorData.company || inspectorData.id)
        ? {
            text: [
              { text: "Prüfer: ", bold: true },
              inspectorData.name || "-",
              { text: "  |  Firma: ", bold: true },
              inspectorData.company || "-",
              { text: "  |  Zertifikat/ID: ", bold: true },
              inspectorData.id || "-",
            ],
            fontSize: 10,
            margin: [0, 0, 0, 10],
            color: "#333333",
          }
        : {},
      {
        text: `Erstellt am: ${today}`,
        margin: [0, 0, 0, 20],
        color: "#666666",
        fontSize: 10,
      },
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: `KOMPONENTE: ${dguvData?.equipmentName || result.deviceName}`,
                fillColor: "#eeeeee",
                border: [false, false, false, false],
                bold: true,
                fontSize: 14,
              },
            ],
          ],
        },
        margin: [0, 0, 0, 15],
      },
      capturedImage
        ? {
            image: capturedImage,
            width: 300,
            alignment: "center",
            margin: [0, 10, 0, 20],
          }
        : {},
      {
        text: "DIAGNOSE-ERGEBNISSE",
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5],
        color: "#005fcc",
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#005fcc",
          },
        ],
      },
      { text: "Identifizierter Defekt:", bold: true, margin: [0, 15, 0, 2] },
      { text: result.identifiedDefect, margin: [0, 0, 0, 10] },
      { text: "Handlungsempfehlung:", bold: true, margin: [0, 10, 0, 2] },
      { text: result.recommendation, margin: [0, 0, 0, 10] },
      result.location
        ? {
            text: [
              { text: "📍 Anlagenstandort: ", bold: true },
              {
                text: result.location,
                color: "#005fcc",
                link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.location.replace("Lat: ", "").replace(", Lng: ", ","))}`,
              },
            ],
            margin: [0, 0, 0, 10],
          }
        : {},
      {
        columns: [
          { width: "auto", text: "Reparatur-Schwierigkeit: ", bold: true },
          {
            width: "*",
            text:
              "★".repeat(result.repairDifficulty || 1) +
              "☆".repeat(5 - (result.repairDifficulty || 1)),
            color: "#f59e0b",
            margin: [5, 0, 0, 0],
          },
        ],
        margin: [0, 5, 0, 20],
      },
      result.customerExperience
        ? [
            {
              text: "TECHNIKER-EXPERTISE:",
              bold: true,
              fontSize: 12,
              margin: [0, 10, 0, 5],
            },
            {
              text: result.customerExperience,
              italics: true,
              color: "#444444",
              margin: [10, 0, 0, 10],
            },
          ]
        : [],
      result.additionalTips && result.additionalTips.length > 0
        ? [
            {
              text: "Zusätzliche Hinweise & Sicherheitstipps:",
              bold: true,
              margin: [0, 10, 0, 5],
            },
            { ul: result.additionalTips, margin: [10, 0, 0, 10] },
          ]
        : [],
      dguvData
        ? [
            {
              text: `⚡ SICHERHEITSPRÜFUNG NACH DGUV V3 (VDE 0701-0702) - ${dguvData.protectionClass || "SK I"}`,
              fontSize: 15,
              bold: true,
              margin: [0, 20, 0, 5],
              color: "#005fcc",
            },
            {
              canvas: [
                {
                  type: "line",
                  x1: 0,
                  y1: 0,
                  x2: 515,
                  y2: 0,
                  lineWidth: 1,
                  lineColor: "#005fcc",
                },
              ],
            },
            dguvData.inventoryNumber
              ? {
                  text: `Prüflings- / Inventarnummer: ${dguvData.inventoryNumber}`,
                  bold: true,
                  fontSize: 10,
                  margin: [0, 5, 0, 5],
                }
              : {},
            {
              table: {
                widths: ["*", "auto", "auto"],
                body: [
                  [
                    { text: "Prüfparameter", bold: true, fillColor: "#eeeeee" },
                    { text: "Messwert", bold: true, fillColor: "#eeeeee" },
                    { text: "Norm-Grenzwert", bold: true, fillColor: "#eeeeee" },
                  ],
                  ...(dguvData.protectionClass === "SK_I"
                    ? [
                        [
                          { text: "Schutzleiterwiderstand (R_PE)" },
                          { text: dguvData.rPe ? `${dguvData.rPe} Ω` : "n.a." },
                          { text: "≤ 0.3 Ω (+0.1 Ω / 7.5m)" },
                        ],
                      ]
                    : []),
                  [
                    { text: "Isolationswiderstand (R_ISO)" },
                    { text: dguvData.rIso ? `${dguvData.rIso} MΩ` : "n.a." },
                    {
                      text:
                        dguvData.protectionClass === "SK_II"
                          ? "≥ 2.0 MΩ"
                          : dguvData.protectionClass === "SK_III"
                          ? "≥ 0.25 MΩ"
                          : "≥ 1.0 MΩ",
                    },
                  ],
                  ...(dguvData.protectionClass === "SK_I"
                    ? [
                        [
                          { text: "Ableitstrom (I_PE)" },
                          { text: dguvData.iLeak ? `${dguvData.iLeak} mA` : "n.a." },
                          { text: "≤ 3.5 mA" },
                        ],
                      ]
                    : []),
                  ...(dguvData.protectionClass === "SK_II"
                    ? [
                        [
                          { text: "Berührungsstrom (I_B)" },
                          { text: dguvData.iTouch ? `${dguvData.iTouch} mA` : "n.a." },
                          { text: "≤ 0.5 mA" },
                        ],
                      ]
                    : []),
                  ...(dguvData.protectionClass === "INSTALLATION_VDE0100"
                    ? [
                        ...(dguvData.rPe ? [[{ text: "PE-Durchgängigkeit (R_PE)" }, { text: `${dguvData.rPe} Ω` }, { text: "≤ 1.0 Ω" }]] : []),
                        ...(dguvData.rcdTripTimeMs ? [[{ text: "RCD Auslösezeit (t_a)" }, { text: `${dguvData.rcdTripTimeMs} ms` }, { text: "≤ 300 ms" }]] : []),
                        ...(dguvData.rcdTripCurrentMa ? [[{ text: "RCD Auslösestrom (I_ΔN)" }, { text: `${dguvData.rcdTripCurrentMa} mA` }, { text: "15 - 30 mA" }]] : []),
                        ...(dguvData.loopImpedanceZs ? [[{ text: "Schleifenimpedanz (Z_s)" }, { text: `${dguvData.loopImpedanceZs} Ω` }, { text: "≤ Grenzimp. LSS" }]] : [])
                      ]
                    : []),
                  [
                    { text: "Gesamtbewertung / Prüfsiegel", bold: true, colSpan: 2 },
                    {},
                    {
                      text: `${dguvData.status}${dguvData.nextInspectionDate ? " (Nächste Prüf.: " + dguvData.nextInspectionDate + ")" : ""}`,
                      bold: true,
                      color: dguvData.status === "BESTANDEN" ? "#0b8a5a" : "#dc2626",
                    },
                  ],
                ],
              },
              margin: [0, 10, 0, 15],
            },
            dguvData.signatureUrl
              ? [
                  {
                    text: `Unterschrift der Prüffachkraft:${inspectorData?.name ? " " + inspectorData.name : ""}`,
                    bold: true,
                    fontSize: 11,
                    margin: [0, 5, 0, 5],
                  },
                  {
                    image: dguvData.signatureUrl,
                    width: 120,
                    margin: [10, 0, 0, 10],
                  },
                ]
              : [],
          ]
        : [],
      roiData
        ? [
            {
              text: "📊 WIRTSCHAFTLICHKEITS-ANALYSE (REPARATUR VS. NEUKAUF)",
              fontSize: 14,
              bold: true,
              margin: [0, 15, 0, 5],
              color: "#005fcc",
            },
            {
              table: {
                widths: ["*", "auto"],
                body: [
                  [{ text: "Gesamte Reparaturkosten (Material + Arbeit)", bold: true }, { text: `${roiData.totalRepairCost.toFixed(2)} €` }],
                  [{ text: "Wiederbeschaffungswert (Neupreis)", bold: true }, { text: `${roiData.replacementPrice.toFixed(2)} €` }],
                  [{ text: "Reparaturquote", bold: true }, { text: `${roiData.ratioPercent}%` }],
                  [{ text: "Kundenempfehlung", bold: true }, { text: roiData.recommendation, bold: true, color: "#005fcc" }],
                ],
              },
              margin: [0, 5, 0, 15],
            },
          ]
        : [],
      gbuData
        ? [
            {
              text: "🛡️ GEFÄHRDUNGSBEURTEILUNG (BETRSICHV / ARBSCHG)",
              fontSize: 14,
              bold: true,
              margin: [0, 15, 0, 5],
              color: "#005fcc",
            },
            {
              table: {
                widths: ["*", "auto"],
                body: [
                  [{ text: "Arbeitsort / Anlage", bold: true }, { text: gbuData.location }],
                  [{ text: "Ausgangsrisiko (vor Schutzmaßnahmen)", bold: true }, { text: gbuData.initialRiskLevel }],
                  [{ text: "Restrisiko (nach 5 Sicherheitsregeln)", bold: true }, { text: gbuData.residualRiskLevel, bold: true, color: gbuData.isAcceptable ? "#0b8a5a" : "#dc2626" }],
                  [{ text: "Arbeitsfreigabe", bold: true }, { text: gbuData.isAcceptable ? "FREIGEGEBEN (Restrisiko akzeptabel)" : "SPERRE (Schutzmaßnahmen unzureichend)", bold: true, color: gbuData.isAcceptable ? "#0b8a5a" : "#dc2626" }],
                ],
              },
              margin: [0, 5, 0, 15],
            },
          ]
        : [],
      result.sparePartSearchTerm
        ? {
            stack: [
              {
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: 0,
                    x2: 515,
                    y2: 0,
                    lineWidth: 0.5,
                    lineColor: "#cccccc",
                  },
                ],
              },
              {
                text: [
                  { text: "\nEmpfohlenes Ersatzteil: ", bold: true },
                  { text: result.sparePartSearchTerm },
                ],
                margin: [0, 5, 0, 0],
              },
            ],
            margin: [0, 20, 0, 0],
          }
        : {},
      {
        text: "\n\nRECHTLICHER HINWEIS",
        fontSize: 10,
        bold: true,
        color: "#9f1239",
        margin: [0, 20, 0, 5],
      },
      {
        text: result.disclaimer || disclaimerText,
        fontSize: 9,
        color: "#444444",
        alignment: "justify",
        italics: true,
      },
    ],
    defaultStyle: { fontSize: 11, lineHeight: 1.3 },
  };

  return docDefinition as TDocumentDefinitions;
}

export function buildThermalPdfDocDefinition(
  result: ThermalAnalysisResult,
  capturedImage: string | null,
  disclaimerText: string,
  inspectorData?: {
    name?: string;
    company?: string;
    id?: string;
  }
): TDocumentDefinitions {
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const hotspotsBody: TableCell[][] = [
    [
      { text: "Bauteil / Bereich", bold: true, fillColor: "#eeeeee" },
      { text: "Temperatur", bold: true, fillColor: "#eeeeee" },
      { text: "Status", bold: true, fillColor: "#eeeeee" },
    ]
  ];

  result.detectedHotspots.forEach(h => {
    hotspotsBody.push([
      { text: h.label },
      { text: h.temperature },
      {
        text: h.severity,
        bold: true,
        color: h.severity === "CRITICAL" ? "#dc2626" : h.severity === "MONITOR" ? "#f59e0b" : "#0b8a5a"
      }
    ]);
  });

  return {
    content: [
      {
        text: "ElectroCheck AI - Thermografie-Inspektionsbericht",
        fontSize: 22,
        bold: true,
        color: "#b91c1c",
        margin: [0, 0, 0, 5],
      },
      inspectorData && (inspectorData.name || inspectorData.company || inspectorData.id)
        ? {
            text: [
              { text: "Prüfer: ", bold: true },
              inspectorData.name || "-",
              { text: "  |  Firma: ", bold: true },
              inspectorData.company || "-",
              { text: "  |  Zertifikat/ID: ", bold: true },
              inspectorData.id || "-",
            ],
            fontSize: 10,
            margin: [0, 0, 0, 10],
            color: "#333333",
          }
        : {},
      {
        text: `Erstellt am: ${today}`,
        margin: [0, 0, 0, 20],
        color: "#666666",
        fontSize: 10,
      },
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: `GESAMTPRÜFSTATUS: ${result.overallStatus}`,
                fillColor: result.overallStatus === "CRITICAL" ? "#fee2e2" : result.overallStatus === "MONITOR" ? "#fef3c7" : "#d1fae5",
                border: [false, false, false, false],
                bold: true,
                fontSize: 14,
                color: result.overallStatus === "CRITICAL" ? "#991b1b" : result.overallStatus === "MONITOR" ? "#92400e" : "#065f46",
              },
            ],
          ],
        },
        margin: [0, 0, 0, 15],
      },
      capturedImage
        ? {
            image: capturedImage,
            width: 300,
            alignment: "center",
            margin: [0, 10, 0, 20],
          }
        : {},
      {
        text: "THERMOGRAFISCHE ANOMALIEN / HOTSPOTS",
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5],
        color: "#b91c1c",
      },
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#b91c1c",
          },
        ],
      },
      {
        table: {
          widths: ["*", "auto", "auto"],
          body: hotspotsBody,
        },
        margin: [0, 15, 0, 15],
      },
      { text: "Allgemeine Bewertung:", bold: true, margin: [0, 10, 0, 2] },
      { text: result.generalRecommendation, margin: [0, 0, 0, 15] },
      result.actionSteps && result.actionSteps.length > 0
        ? [
            { text: "Empfohlene Instandsetzungsmaßnahmen:", bold: true, margin: [0, 10, 0, 5] },
            {
              ol: result.actionSteps.map(step => ({
                text: `${step.text} ${step.completed ? " (Erledigt)" : ""}`,
              })),
              margin: [10, 0, 0, 15],
            }
          ]
        : [],
      result.safetyTips && result.safetyTips.length > 0
        ? [
            { text: "Sicherheitshinweise & VDE-Regeln:", bold: true, margin: [0, 10, 0, 5] },
            { ul: result.safetyTips, margin: [10, 0, 0, 15] },
          ]
        : [],
      {
        text: "\n\nRECHTLICHER HINWEIS",
        fontSize: 10,
        bold: true,
        color: "#9f1239",
        margin: [0, 20, 0, 5],
      },
      {
        text: disclaimerText,
        fontSize: 9,
        color: "#444444",
        alignment: "justify",
        italics: true,
      },
    ],
    defaultStyle: { fontSize: 11, lineHeight: 1.3 },
  } as TDocumentDefinitions;
}

// pdfmake ≥ 0.3: Promise-basierte API (die frühere Callback-Variante wird nicht mehr aufgerufen)
interface PdfDocument {
  getBlob(): Promise<Blob>;
  download(filename?: string): Promise<void>;
}

interface PdfMakeInstance {
  vfs?: Record<string, string>;
  addVirtualFileSystem?(vfs: Record<string, string>): void;
  createPdf(docDefinition: TDocumentDefinitions): PdfDocument;
}

/** pdfmake ≥ 0.3: das Modul selbst ist das Schriftarchiv ({ "Roboto-Regular.ttf": base64, … }); ältere Versionen kapseln es in .pdfMake.vfs bzw. .vfs */
type VfsFontsModule = Record<string, unknown> & {
  default?: VfsFontsModule;
  pdfMake?: { vfs: Record<string, string> };
  vfs?: Record<string, string>;
};

let cachedPdfMake: PdfMakeInstance | null = null;

/**
 * Lädt pdfmake und vfs_fonts dynamisch (Lazy Loading) erst bei Bedarf
 */
async function loadPdfMake(): Promise<PdfMakeInstance> {
  if (cachedPdfMake) return cachedPdfMake;

  const pdfMakeMod = (await import("pdfmake/build/pdfmake")) as unknown as { default?: PdfMakeInstance } & PdfMakeInstance;
  const pdfFontsMod = (await import("pdfmake/build/vfs_fonts")) as unknown as VfsFontsModule;
  const pdfMake: PdfMakeInstance = pdfMakeMod.default || pdfMakeMod;
  const pdfFonts: VfsFontsModule = pdfFontsMod.default || pdfFontsMod;

  const vfs = pdfFonts.pdfMake?.vfs ?? pdfFonts.vfs ?? (pdfFonts as Record<string, string>);
  if (pdfMake.addVirtualFileSystem) pdfMake.addVirtualFileSystem(vfs);
  else pdfMake.vfs = vfs;

  cachedPdfMake = pdfMake;
  return pdfMake;
}

/**
 * Erstellt einen Blob für die PDF-Vorschau
 */
export async function generatePdfBlob(docDefinition: TDocumentDefinitions): Promise<Blob> {
  const pdfMake = await loadPdfMake();
  return pdfMake.createPdf(docDefinition).getBlob();
}

/**
 * Startet den direkten Download einer PDF-Datei
 */
export async function downloadPdf(docDefinition: TDocumentDefinitions, filename: string): Promise<void> {
  const pdfMake = await loadPdfMake();
  await pdfMake.createPdf(docDefinition).download(filename);
}


