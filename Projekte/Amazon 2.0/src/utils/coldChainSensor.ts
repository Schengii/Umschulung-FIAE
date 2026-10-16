// ============================================================
// Amazon 2.0 – Cold-Chain & IoT Sensor Telemetry Engine
// ============================================================

export interface ColdChainTelemetry {
  shipmentId: string;
  category: 'fresh-food' | 'pharma' | 'precision-tech';
  targetTempRange: string;
  currentTempCelsius: number;
  minRecordedTempCelsius: number;
  maxRecordedTempCelsius: number;
  humidityPercent: number;
  shockImpactG: number;
  tamperSealIntact: boolean;
  isColdChainUnbroken: boolean;
  tempHistory: { timeOffsetMinutes: number; temp: number }[];
}

export function getColdChainTelemetry(shipmentId: string = 'COLD-SENSOR-#4819'): ColdChainTelemetry {
  return {
    shipmentId,
    category: 'fresh-food',
    targetTempRange: '2,0°C bis 6,0°C (Kühlkette)',
    currentTempCelsius: 3.4,
    minRecordedTempCelsius: 2.8,
    maxRecordedTempCelsius: 4.1,
    humidityPercent: 62,
    shockImpactG: 0.2, // normal
    tamperSealIntact: true,
    isColdChainUnbroken: true,
    tempHistory: [
      { timeOffsetMinutes: 180, temp: 3.8 },
      { timeOffsetMinutes: 120, temp: 3.2 },
      { timeOffsetMinutes: 60, temp: 3.6 },
      { timeOffsetMinutes: 0, temp: 3.4 },
    ],
  };
}
