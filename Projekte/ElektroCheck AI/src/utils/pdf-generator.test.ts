import { describe, expect, it } from "vitest";
import { buildPdfDocDefinition, buildThermalPdfDocDefinition } from "./pdf-generator";
import type { DiagnosisResult, ThermalAnalysisResult } from "../services/ai-types";

/** Sammelt rekursiv alle Texte einer pdfmake-Definition, damit Inhalte geprüft werden können. */
function collectText(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collectText(n, out));
  else if (node && typeof node === "object") Object.values(node as Record<string, unknown>).forEach((v) => collectText(v, out));
  return out;
}

const diagnosis: DiagnosisResult = {
  deviceName: "Bohrmaschine XY-100",
  identifiedDefect: "Defekte Netzanschlussleitung",
  safetyLevel: "DANGER",
  estimatedRepairCost: "25 €",
  repairDifficulty: 2,
  recommendation: "Leitung tauschen",
  additionalTips: ["Gerät vom Netz trennen"],
  sparePartSearchTerm: "Netzkabel XY-100",
  customerExperience: "Gerät wird heiß",
  actionSteps: [{ id: 1, text: "Leitung ersetzen", completed: false }],
};

const thermal: ThermalAnalysisResult = {
  overallStatus: "CRITICAL",
  generalRecommendation: "Klemme nachziehen",
  detectedHotspots: [{ label: "Klemme L1", temperature: "92 °C", severity: "CRITICAL", box_2d: [0, 0, 10, 10] }],
  actionSteps: [{ id: 1, text: "Klemme nachziehen", completed: false }],
  safetyTips: ["Anlage freischalten"],
};

describe("buildPdfDocDefinition", () => {
  it("enthält Gerät, Mangel, Empfehlung und Haftungshinweis", () => {
    const text = collectText(buildPdfDocDefinition(diagnosis, null, "Haftungshinweis-Text")).join("\n");
    expect(text).toContain("Bohrmaschine XY-100");
    expect(text).toContain("Defekte Netzanschlussleitung");
    expect(text).toContain("Leitung tauschen");
    expect(text).toContain("Haftungshinweis-Text");
  });

  it("übernimmt DGUV-Messwerte und Prüferdaten", () => {
    const text = collectText(
      buildPdfDocDefinition(
        diagnosis,
        null,
        "x",
        { status: "BESTANDEN", details: ["Schutzleiter ok"], protectionClass: "SK_I", rPe: "0,12", equipmentName: "Bohrmaschine" },
        { name: "Erika Prüfer", company: "Prüf GmbH" },
      ),
    ).join("\n");
    expect(text).toContain("BESTANDEN");
    expect(text).toContain("0,12");
    expect(text).toContain("Erika Prüfer");
    expect(text).toContain("Prüf GmbH");
  });

  it("zeigt R_PE nur bei Schutzklasse I", () => {
    const sk2 = collectText(
      buildPdfDocDefinition(diagnosis, null, "x", { status: "BESTANDEN", details: [], protectionClass: "SK_II", rPe: "0,12" }),
    ).join("\n");
    expect(sk2).not.toContain("0,12 Ω");
  });

  it("bindet ein Foto nur ein, wenn eines vorhanden ist", () => {
    const png = "data:image/png;base64,iVBORw0KGgo=";
    const withImage = JSON.stringify(buildPdfDocDefinition(diagnosis, png, "x"));
    const without = JSON.stringify(buildPdfDocDefinition(diagnosis, null, "x"));
    expect(withImage).toContain(png);
    expect(without).not.toContain("data:image");
  });

  it("erzeugt auch mit minimalen Daten (ohne optionale Felder) ein Dokument", () => {
    const minimal = { ...diagnosis, actionSteps: undefined, additionalTips: [] };
    const doc = buildPdfDocDefinition(minimal, null, "");
    expect(Array.isArray(doc.content)).toBe(true);
  });
});

describe("buildThermalPdfDocDefinition", () => {
  it("listet Hotspots, Maßnahmen und Sicherheitshinweise", () => {
    const text = collectText(buildThermalPdfDocDefinition(thermal, null, "Hinweis", { name: "Max" })).join("\n");
    expect(text).toContain("Klemme L1");
    expect(text).toContain("92 °C");
    expect(text).toContain("Klemme nachziehen");
    expect(text).toContain("Anlage freischalten");
    expect(text).toContain("Max");
  });
});
