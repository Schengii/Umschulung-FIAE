import { AIService, DiagnosisResult } from './ai-types';
import { REPAIR_DATA } from '../data/repair-database';

export class MockAIService implements AIService {
  async getDiagnosis(_image: File, description: string): Promise<DiagnosisResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Wir suchen in unseren NotebookLM-Daten nach einem passenden Stichwort
    const foundIssue = REPAIR_DATA.find(item => 
      description.toLowerCase().includes(item.errorCode.toLowerCase()) ||
      description.toLowerCase().includes(item.model.toLowerCase())
    );

    if (foundIssue) {
      return {
        deviceName: foundIssue.model,
        identifiedDefect: foundIssue.diagnosis,
        safetyLevel: 'WARNING',
        estimatedRepairCost: "ca. 20-50 €",
        repairDifficulty: 3,
        recommendation: foundIssue.action,
        additionalTips: ["Vorher spannungsfrei schalten", "Auf Querschnitt achten"],
        sparePartSearchTerm: "Kabel 3x1.5",
        customerExperience: "Tritt oft nach 5 Jahren auf"
      };
    }

    // Fallback, wenn nichts gefunden wurde
    return {
      deviceName: "Unbekanntes Gerät",
      identifiedDefect: "Analyse unvollständig",
      safetyLevel: 'DANGER',
      estimatedRepairCost: "Unbekannt",
      repairDifficulty: 5,
      recommendation: "Bitte kontaktieren Sie eine Fachkraft. Keine passenden Daten gefunden.",
      additionalTips: ["Vorher spannungsfrei schalten", "Auf Querschnitt achten"],
      sparePartSearchTerm: "Kabel 3x1.5",
      customerExperience: "Tritt oft nach 5 Jahren auf"
    };
  }
}