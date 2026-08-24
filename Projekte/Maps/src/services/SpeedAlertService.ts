import { LocationPoint, TransportMode } from '../types/navigation';

const SPEED_LIMITS_KMH: Record<TransportMode, number> = {
  driving: 130, // Autobahn Richtgeschwindigkeit
  ev: 130,      // EV Richtgeschwindigkeit
  cycling: 35,  // E-Bike Limit
  hiking: 15,   // Trailrun Limit
  transit: 80,  // Bus/Bahn Durchschnitt
};

export interface SpeedAlert {
  isSpeeding: boolean;
  currentSpeedKmh: number;
  speedLimitKmh: number;
  isOffRoute: boolean;
}

export class SpeedAlertService {
  /**
   * Prüft aktuelle GPS-Geschwindigkeit gegen Tempolimits und stellt Warnungs-Status bereit
   */
  public static checkSpeedAndRoute(
    currentLocation: LocationPoint,
    mode: TransportMode,
    routeCoords: LocationPoint[] = []
  ): SpeedAlert {
    const currentSpeedKmh = currentLocation.speed ? Math.round(currentLocation.speed * 3.6) : 0;
    const limit = SPEED_LIMITS_KMH[mode] || 100;

    let isOffRoute = false;
    if (routeCoords.length > 0) {
      // Prüfe Mindestabstand zur Route (Haversine Schätzung)
      const minDistanceMeters = Math.min(
        ...routeCoords.map(pt => SpeedAlertService.getDistanceMeter(currentLocation, pt))
      );
      isOffRoute = minDistanceMeters > 120; // 120m Abweichung = Off Route
    }

    return {
      isSpeeding: currentSpeedKmh > limit,
      currentSpeedKmh,
      speedLimitKmh: limit,
      isOffRoute,
    };
  }

  /**
   * Prüft ob der Nutzer mehr als thresholdMeters von der geplanten Route abgewichen ist
   */
  public static isOffRoute(
    currentLocation: LocationPoint,
    routeCoords: LocationPoint[],
    thresholdMeters = 50
  ): boolean {
    if (!routeCoords || routeCoords.length === 0) return false;
    const minDistanceMeters = Math.min(
      ...routeCoords.map(pt => SpeedAlertService.getDistanceMeter(currentLocation, pt))
    );
    return minDistanceMeters > thresholdMeters;
  }

  public static getDistanceMeter(p1: LocationPoint, p2: LocationPoint): number {
    const R = 6371000;
    const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
    const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.latitude * Math.PI) / 180) *
        Math.cos((p2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
