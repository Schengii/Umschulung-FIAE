// ============================================================
// Amazon 2.0 – Neuro-Adaptive Eye-Tracking & Hands-Free Engine
// ============================================================

export interface EyeTrackingConfig {
  isEnabled: boolean;
  dwellTimeMs: number;
  gazeSmoothingPercent: number;
  autoScrollSpeedPercent: number;
  calibratedAccuracyPercent: number;
  showGazeCursor: boolean;
}

const STORAGE_KEY = 'amazon2_eyetracking_cfg';

const DEFAULT_CONFIG: EyeTrackingConfig = {
  isEnabled: false,
  dwellTimeMs: 1200,
  gazeSmoothingPercent: 85,
  autoScrollSpeedPercent: 60,
  calibratedAccuracyPercent: 96.4,
  showGazeCursor: true,
};

let inMemoryConfig: EyeTrackingConfig = { ...DEFAULT_CONFIG };

export function getEyeTrackingConfig(): EyeTrackingConfig {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        saveEyeTrackingConfig(DEFAULT_CONFIG);
        return DEFAULT_CONFIG;
      }
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return inMemoryConfig;
}

export function saveEyeTrackingConfig(cfg: EyeTrackingConfig): void {
  inMemoryConfig = cfg;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    }
  } catch (e) {
    console.error('Failed to save eye tracking config', e);
  }
}

export function simulateGazeCalibration(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const accuracy = +(95 + Math.random() * 4).toFixed(1);
      const cfg = getEyeTrackingConfig();
      cfg.calibratedAccuracyPercent = accuracy;
      cfg.isEnabled = true;
      saveEyeTrackingConfig(cfg);
      resolve(accuracy);
    }, 100);
  });
}
