import { DiagnosisResult, ThermalAnalysisResult } from "../services/ai-types";

/**
 * Erstellt die pdfmake Dokumentendeklaration für ein Wartungsprotokoll.
 */
export function buildPdfDocDefinition(
  result: DiagnosisResult,
  capturedImage: string | null,
  disclaimerText: string,
  dguvData?: {
    rPe?: string;
    rIso?: string;
    iLeak?: string;
    status: string;
    details: string[];
    signatureUrl?: string | null;
  },
  inspectorData?: {
    name?: string;
    company?: string;
    id?: string;
  }
): any {
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const docDefinition: any = {
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
                text: `KOMPONENTE: ${result.deviceName}`,
                fillColor: "#eeeeee",
                border: [false, false, false, false],
                bold: true,
                fontSize: 14,
                padding: [8, 8, 8, 8],
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
      (result as any).location
        ? {
            text: [
              { text: "📍 Anlagenstandort: ", bold: true },
              {
                text: (result as any).location,
                color: "#005fcc",
                link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((result as any).location.replace("Lat: ", "").replace(", Lng: ", ","))}`,
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
              fontStyle: "italic",
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
              text: "⚡ SICHERHEITSPRÜFUNG NACH DGUV V3 (VDE 0701-0702)",
              fontSize: 16,
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
            {
              table: {
                widths: ["*", "auto", "auto"],
                body: [
                  [
                    { text: "Prüfparameter", bold: true, fillColor: "#eeeeee" },
                    { text: "Messwert", bold: true, fillColor: "#eeeeee" },
                    { text: "Grenzwert", bold: true, fillColor: "#eeeeee" },
                  ],
                  [
                    { text: "Schutzleiterwiderstand (R_PE)" },
                    { text: dguvData.rPe ? `${dguvData.rPe} Ω` : "n.a." },
                    { text: "≤ 0.3 Ω" },
                  ],
                  [
                    { text: "Isolationswiderstand (R_ISO)" },
                    { text: dguvData.rIso ? `${dguvData.rIso} MΩ` : "n.a." },
                    { text: "≥ 1.0 MΩ" },
                  ],
                  [
                    { text: "Ableitstrom (I_leak)" },
                    { text: dguvData.iLeak ? `${dguvData.iLeak} mA` : "n.a." },
                    { text: "≤ 3.5 mA" },
                  ],
                  [
                    { text: "Gesamtbewertung", bold: true, colSpan: 2 },
                    {},
                    {
                      text: dguvData.status,
                      bold: true,
                      color: dguvData.status === "BESTANDEN" ? "#0b8a5a" : "#dc2626",
                    },
                  ],
                ],
              },
              margin: [0, 15, 0, 15],
            },
            dguvData.signatureUrl
              ? [
                  { 
                    text: `Unterschrift der Elektrofachkraft:${inspectorData?.name ? " " + inspectorData.name : ""}`, 
                    bold: true, 
                    fontSize: 11, 
                    margin: [0, 10, 0, 5] 
                  },
                  {
                    image: dguvData.signatureUrl,
                    width: 120,
                    margin: [10, 0, 0, 10]
                  }
                ]
              : []
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
        text: (result as any).disclaimer || disclaimerText,
        fontSize: 9,
        color: "#444444",
        alignment: "justify",
        fontStyle: "italic",
      },
    ],
    defaultStyle: { fontSize: 11, lineHeight: 1.3 },
  };

  return docDefinition;
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
): any {
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const hotspotsBody: any[] = [
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
                padding: [8, 8, 8, 8],
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
        fontStyle: "italic",
      },
    ],
    defaultStyle: { fontSize: 11, lineHeight: 1.3 },
  };
}

