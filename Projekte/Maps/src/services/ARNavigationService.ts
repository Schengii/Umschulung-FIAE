import { LocationPoint, ARWaymarker, NavigationStep } from '../types/navigation';

export class ARNavigationService {
  /**
   * Berechnet relative AR-Marker Positionen auf dem Smartphone-Bildschirm
   * basierend auf GPS-Position, aktuellem Kompass-Heading und Neigungswinkel (Pitch).
   */
  public static calculateARMarkers(
    currentLocation: LocationPoint,
    currentHeadingDeg: number,
    steps: NavigationStep[],
    destination: LocationPoint | null
  ): ARWaymarker[] {
    const markers: ARWaymarker[] = [];
    const FOV_HORIZONTAL_DEG = 60; // Standard Smartphone Kamera Öffnungswinkel

    // 1. Nächster Abbiegeschritt
    if (steps.length > 0 && steps[0].coordinate) {
      const step = steps[0];
      const dist = this.calculateDistanceMeters(currentLocation, step.coordinate);
      const bearing = this.calculateBearing(currentLocation, step.coordinate);
      let relAngle = (bearing - currentHeadingDeg + 540) % 360 - 180;

      // In Bildschirm-Koordinaten projizieren (0-100%)
      const screenXPercent = 50 + (relAngle / (FOV_HORIZONTAL_DEG / 2)) * 40;
      const screenYPercent = Math.max(25, Math.min(65, 50 - (dist / 100) * 10));

      let iconType: ARWaymarker['iconType'] = 'straight';
      if (step.iconName.includes('left')) iconType = 'turn_left';
      else if (step.iconName.includes('right')) iconType = 'turn_right';

      markers.push({
        id: 'ar-next-step',
        title: step.instruction,
        distanceMeters: Math.round(dist),
        bearingDeg: relAngle,
        pitchDeg: 0,
        screenXPercent: Math.max(10, Math.min(90, screenXPercent)),
        screenYPercent,
        iconType,
      });
    }

    // 2. Großes Ziel-Pin im Raum
    if (destination) {
      const destDist = this.calculateDistanceMeters(currentLocation, destination);
      const destBearing = this.calculateBearing(currentLocation, destination);
      const relDestAngle = (destBearing - currentHeadingDeg + 540) % 360 - 180;

      const screenX = 50 + (relDestAngle / (FOV_HORIZONTAL_DEG / 2)) * 40;

      markers.push({
        id: 'ar-dest-pin',
        title: destination.name || 'Zielort',
        distanceMeters: Math.round(destDist),
        bearingDeg: relDestAngle,
        pitchDeg: 10,
        screenXPercent: Math.max(10, Math.min(90, screenX)),
        screenYPercent: 30,
        iconType: 'destination',
      });
    }

    return markers;
  }

  public static calculateBearing(from: LocationPoint, to: LocationPoint): number {
    const lat1 = (from.latitude * Math.PI) / 180;
    const lat2 = (to.latitude * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  }

  public static calculateDistanceMeters(from: LocationPoint, to: LocationPoint): number {
    const R = 6371000;
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((from.latitude * Math.PI) / 180) *
        Math.cos((to.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
