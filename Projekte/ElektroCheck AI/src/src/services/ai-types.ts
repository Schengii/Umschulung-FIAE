export interface DiagnosisResult {
  deviceName: string;
  identifiedDefect: string;
  safetyLevel: 'SAFE' | 'WARNING' | 'DANGER'; // VDE-orientiert
  estimatedRepairCost: string;
  repairDifficulty: 1 | 2 | 3 | 4 | 5;
  recommendation: string;

  actionSteps?: { 
    id: number; 
    text: string; 
    completed: boolean 
  }[];
  
  additionalTips: string[];
  sparePartSearchTerm: string;
  customerExperience: string;
  boundingBoxes?: {
    label: string;
    box_2d: number[]; // [ymin, xmin, ymax, xmax] normiert auf 0 bis 1000
  }[];
}

export interface AIService {
  getDiagnosis(image: File | string, description: string): Promise<DiagnosisResult>;
}

export interface ThermalHotspot {
  label: string;
  temperature: string;
  severity: 'OK' | 'MONITOR' | 'CRITICAL';
  box_2d: number[]; // [ymin, xmin, ymax, xmax]
}

export interface ThermalAnalysisResult {
  overallStatus: 'SAFE' | 'MONITOR' | 'CRITICAL';
  generalRecommendation: string;
  detectedHotspots: ThermalHotspot[];
  actionSteps: {
    id: number;
    text: string;
    completed: boolean;
  }[];
  safetyTips: string[];
}