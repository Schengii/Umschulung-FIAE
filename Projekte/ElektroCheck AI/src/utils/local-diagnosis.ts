import { REPAIR_DATA } from "../data/repair-database";
import type { DiagnosisResult } from "../services/ai-types";

/** Sofort-Diagnose aus der lokalen Offline-Datenbank (Modellname oder Fehlercode im Text). */
export function findLocalDiagnosis(query: string): DiagnosisResult | null {
  const lowerQuery = query.toLowerCase();
  const match = REPAIR_DATA.find(
    (item) =>
      lowerQuery.includes(item.model.toLowerCase()) ||
      lowerQuery.includes(item.errorCode.toLowerCase()),
  );
  if (!match) return null;

  return {
    deviceName: match.model,
    identifiedDefect: match.diagnosis,
    recommendation: match.action,
    estimatedRepairCost: "0 - 50 €",
    repairDifficulty: 2,
    safetyLevel: "WARNING",
    additionalTips: [match.safety],
    sparePartSearchTerm: "",
    customerExperience: "⚡ Sofort-Diagnose aus lokaler Offline-Datenbank.",
  };
}
