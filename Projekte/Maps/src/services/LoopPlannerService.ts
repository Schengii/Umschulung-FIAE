import { LocationPoint, TransportMode, RouteOption } from '../types/navigation';
import { RoutingService } from './RoutingService';

export class LoopPlannerService {
  /**
   * Generiert eine abwechslungsreiche Rundtour ab dem aktuellen Standort.
   * Berechnet Wegpunkte in einer polygonalen Schleife (z. B. Kreis/Dreieck) basierend auf der gewünschten Distanz.
   */
  public static async generateLoopRoute(
    origin: LocationPoint,
    targetDistanceKm: number,
    mode: TransportMode = 'cycling',
    directionAngleDeg: number = 0 // 0 = Nord, 90 = Ost, 180 = Süd, 270 = West
  ): Promise<RouteOption | null> {
    const radiusKm = targetDistanceKm / (2 * Math.PI) * 0.9;
    const centerOffsetDist = radiusKm;

    // Zentrum des Rundwegs versetzt vom Startpunkt
    const dirRad = (directionAngleDeg * Math.PI) / 180;
    const centerLat = origin.latitude + (centerOffsetDist / 111.32) * Math.cos(dirRad);
    const centerLon = origin.longitude + (centerOffsetDist / (111.32 * Math.cos((origin.latitude * Math.PI) / 180))) * Math.sin(dirRad);

    // 3 Wegpunkte auf dem Kreisbogen generieren
    const waypoints: LocationPoint[] = [];
    const numWaypoints = 3;

    for (let i = 1; i <= numWaypoints; i++) {
      const angle = dirRad + Math.PI + (i * (2 * Math.PI)) / (numWaypoints + 1);
      const wpLat = centerLat + (radiusKm / 111.32) * Math.cos(angle);
      const wpLon = centerLon + (radiusKm / (111.32 * Math.cos((centerLat * Math.PI) / 180))) * Math.sin(angle);

      waypoints.push({
        latitude: parseFloat(wpLat.toFixed(5)),
        longitude: parseFloat(wpLon.toFixed(5)),
        name: `Rundtour Zwischenziel ${i}`,
      });
    }

    try {
      const routes = await RoutingService.calculateRoutes(origin, origin, mode, waypoints);
      if (routes && routes.length > 0) {
        const loopRoute = routes[0];
        return {
          ...loopRoute,
          title: `🔄 Rundtour (${targetDistanceKm} km ${mode === 'cycling' ? 'Rennrad/Tour' : 'Wanderung'})`,
          isScenic: true,
        };
      }
      return null;
    } catch (e) {
      console.warn('[LoopPlannerService] Error generating loop:', e);
      return null;
    }
  }
}
