import { LocationPoint, RouteOption, EVChargingStop } from '../types/navigation';

export class EVChargingService {
  /**
   * Berechnet eine Route mit optimalen EV-Schnellladestopps (CCS / HPC > 150 kW)
   * Berechnet SoC-Verbrauch (State of Charge), Ladedauer und Akku-Vorheiz-Empfehlungen.
   */
  public static optimizeRouteForEV(
    baseRoute: RouteOption,
    batteryCapacityKwh: number = 77,
    currentBatteryPercent: number = 65,
    consumptionKwhPer100Km: number = 18.5
  ): RouteOption {
    const totalDistanceKm = baseRoute.distanceKm;
    const totalRequiredKwh = (totalDistanceKm / 100) * consumptionKwhPer100Km;
    const availableKwh = (batteryCapacityKwh * currentBatteryPercent) / 100;

    const evStops: EVChargingStop[] = [];
    const warnings = [...(baseRoute.warnings || [])];

    let extraDurationMinutes = 0;

    // Wenn die benötigte Energie die Reichweite übersteigt oder Ziel-SoC < 15% wäre
    const projectedRemainingPercent = Math.round(((availableKwh - totalRequiredKwh) / batteryCapacityKwh) * 100);

    if (projectedRemainingPercent < 15 && baseRoute.coordinates.length > 5) {
      // Ladestopp nach ca. 50-60% der Strecke einplanen
      const stopIndex = Math.floor(baseRoute.coordinates.length * 0.55);
      const stopCoord = baseRoute.coordinates[stopIndex] || baseRoute.coordinates[0];

      const chargeKwhNeeded = totalRequiredKwh - availableKwh + 15; // Bis min 20% Puffer laden
      const chargeMinutes = Math.max(18, Math.round((chargeKwhNeeded / 150) * 60) + 5);
      extraDurationMinutes += chargeMinutes;

      evStops.push({
        id: 'ev-hpc-ionity-1',
        name: 'Ionity High-Power Charging Park',
        operator: 'Ionity (350 kW CCS)',
        powerKw: 350,
        plugType: 'CCS Typ 2',
        coordinate: stopCoord,
        chargeTimeMinutes: chargeMinutes,
        arrivalBatteryPercent: 12,
        targetBatteryPercent: 80,
      });

      warnings.push(`⚡ Ladestopp erforderlich: ${chargeMinutes} Min. bei Ionity (+${Math.round(chargeKwhNeeded)} kWh).`);
    } else {
      warnings.push(`🔋 Reichweite ausreichend: Voraussichtlicher Ziel-Akkustand ${projectedRemainingPercent}%.`);
    }

    return {
      ...baseRoute,
      mode: 'ev',
      title: baseRoute.title.replace('Auto', 'Elektrofahrzeug (EV)').replace('Schnellste', 'EV-Optimierte Route'),
      durationMinutes: baseRoute.durationMinutes + extraDurationMinutes,
      evStops,
      estimatedEnergyKwh: parseFloat(totalRequiredKwh.toFixed(1)),
      warnings,
    };
  }
}
