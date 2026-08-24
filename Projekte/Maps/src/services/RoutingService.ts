import { RouteOption, TransportMode, LocationPoint, NavigationStep, LaneInfo } from '../types/navigation';
import { ElevationService } from './ElevationService';
import { EVChargingService } from './EVChargingService';
import { TransitService } from './TransitService';

// Öffentliches OSRM Demo-Backend (keine API-Key nötig, fair-use)
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';

// OSRM-Profil je Transportmodus
const OSRM_PROFILE: Record<TransportMode, string> = {
  driving: 'driving',
  cycling: 'bike',
  hiking: 'foot',
  transit: 'driving',
  ev: 'driving',
};

// Durchschnittliche Geschwindigkeit (km/h) je Modus
const MODE_SPEED_KMH: Record<TransportMode, number> = {
  driving: 85,
  cycling: 18,
  hiking: 4.5,
  transit: 35,
  ev: 85,
};

interface OSRMRoute {
  distance: number;      // Meter
  duration: number;      // Sekunden
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
  legs: OSRMLeg[];
}

interface OSRMLeg {
  distance: number;
  duration: number;
  steps: OSRMStep[];
}

interface OSRMStep {
  distance: number;
  duration: number;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    instruction?: string;
  };
  intersections?: {
    lanes?: {
      valid: boolean;
      indications: string[];
    }[];
  }[];
  geometry: {
    coordinates: [number, number][];
  };
}

/**
 * Wandelt OSRM-Manöver in lesbare deutsche Anweisung um
 */
function parseOSRMInstruction(step: OSRMStep): { instruction: string; iconName: string; lanes?: LaneInfo[] } {
  const type = step.maneuver.type;
  const mod = step.maneuver.modifier ?? '';
  const street = step.name || 'die Straße';

  const turnMap: Record<string, { instruction: string; iconName: string }> = {
    'turn-left': { instruction: `Links abbiegen auf ${street}`, iconName: 'corner-up-left' },
    'turn-right': { instruction: `Rechts abbiegen auf ${street}`, iconName: 'corner-up-right' },
    'turn-slight left': { instruction: `Leicht links halten auf ${street}`, iconName: 'corner-up-left' },
    'turn-slight right': { instruction: `Leicht rechts halten auf ${street}`, iconName: 'corner-up-right' },
    'turn-sharp left': { instruction: `Scharf links abbiegen auf ${street}`, iconName: 'corner-up-left' },
    'turn-sharp right': { instruction: `Scharf rechts abbiegen auf ${street}`, iconName: 'corner-up-right' },
    'depart-': { instruction: `Start – Folge ${street}`, iconName: 'navigation' },
    'arrive-': { instruction: 'Ziel erreicht', iconName: 'map-pin' },
    'roundabout-': { instruction: `Kreisverkehr – ${street}`, iconName: 'rotate-cw' },
    'continue-': { instruction: `Weiter auf ${street}`, iconName: 'arrow-up' },
    'merge-': { instruction: `Einfädeln auf ${street}`, iconName: 'merge' },
  };

  const key = `${type}-${mod}`;
  const fallback = turnMap[`${type}-`] ?? { instruction: `Weiter auf ${street}`, iconName: 'arrow-up' };

  // Lane Guidance extrahieren oder synthetisch für Abbiegungen anlegen
  let lanes: LaneInfo[] | undefined;
  if (step.intersections && step.intersections[0]?.lanes) {
    lanes = step.intersections[0].lanes.map(l => ({
      valid: l.valid,
      active: l.valid,
      directions: (l.indications as any) || ['straight'],
    }));
  } else if (type === 'turn' || type === 'fork') {
    // 3-Spur Assistenz Simulation
    const isLeft = mod.includes('left');
    lanes = [
      { valid: isLeft, active: isLeft, directions: ['left'] },
      { valid: !isLeft, active: !isLeft, directions: ['straight'] },
      { valid: false, active: false, directions: ['right'] },
    ];
  }

  return {
    instruction: turnMap[key]?.instruction ?? fallback.instruction,
    iconName: turnMap[key]?.iconName ?? fallback.iconName,
    lanes,
  };
}

export class RoutingService {
  /**
   * Berechnet Routen via OSRM oder Spezial-Services (Transit, EV)
   */
  public static async calculateRoutes(
    origin: LocationPoint,
    destination: LocationPoint,
    mode: TransportMode,
    waypoints: LocationPoint[] = []
  ): Promise<RouteOption[]> {
    // 1. ÖPNV / Transit Spezialfall
    if (mode === 'transit') {
      return TransitService.calculateTransitRoute(origin, destination);
    }

    const profile = OSRM_PROFILE[mode] || 'driving';
    const allPoints = [origin, ...waypoints, destination];
    const coords = allPoints.map(p => `${p.longitude},${p.latitude}`).join(';');
    const url = `${OSRM_BASE_URL}/${profile}/${coords}?overview=full&geometries=geojson&steps=true&alternatives=${waypoints.length === 0 ? 'true' : 'false'}&annotations=false`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Maps-App/1.0 (github.com/Schengii/Maps)' },
      });

      if (!response.ok) {
        throw new Error(`OSRM HTTP ${response.status}`);
      }

      const data: { routes: OSRMRoute[]; code: string } = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('OSRM keine Route gefunden');
      }

      const routePromises = data.routes.slice(0, 2).map(async (route, index) => {
        const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
        const durationMinutes = Math.round(route.duration / 60);

        // Koordinaten der Route für Polyline
        const coordinates: LocationPoint[] = route.geometry.coordinates.map(
          ([lon, lat]) => ({ latitude: lat, longitude: lon })
        );

        // Echte Höhendaten abrufen
        const elevationData = await ElevationService.getElevationProfile(coordinates, distanceKm);

        // Abbiegeschritte
        const steps: NavigationStep[] = route.legs
          .flatMap(leg => leg.steps)
          .filter(step => step.distance > 0 || step.maneuver.type === 'arrive')
          .map(step => {
            const { instruction, iconName, lanes } = parseOSRMInstruction(step);
            const stepCoord = step.geometry.coordinates[0];
            return {
              instruction,
              distanceMeter: Math.round(step.distance),
              durationSeconds: Math.round(step.duration),
              iconName,
              lanes,
              coordinate: {
                latitude: stepCoord?.[1] ?? destination.latitude,
                longitude: stepCoord?.[0] ?? destination.longitude,
              },
            };
          });

        const surfaceBreakdown =
          mode === 'hiking'
            ? { pavedPercent: 20, unpavedPercent: 45, trailPercent: 35 }
            : mode === 'cycling'
            ? { pavedPercent: 70, unpavedPercent: 25, trailPercent: 5 }
            : { pavedPercent: 100, unpavedPercent: 0, trailPercent: 0 };

        const warnings: string[] = [];
        if (mode === 'hiking' && elevationData.elevationGain > 300) {
          warnings.push(`Starker Anstieg: +${elevationData.elevationGain} m Höhenmeter auf der Strecke.`);
        }

        // Geschätzte Spritkosten für Verbrenner (7.2 L/100km @ 1.75 €/L)
        const estimatedFuelCostEur = (mode === 'driving')
          ? parseFloat(((distanceKm / 100) * 7.2 * 1.75).toFixed(2))
          : undefined;

        let baseRouteOption: RouteOption = {
          id: `route-osrm-${mode}-${index}`,
          mode,
          title:
            index === 0
              ? mode === 'hiking'
                ? 'Komoot Wanderroute (Schnellste)'
                : mode === 'cycling'
                ? 'Fahrradroute (Direktweg)'
                : 'Schnellste Route'
              : mode === 'hiking'
              ? 'Gemütlicher Wanderweg'
              : mode === 'cycling'
              ? 'Grüne Fluss-Route'
              : 'Ausweichroute (Mautfrei)',
          distanceKm,
          durationMinutes,
          elevationGainMeters: elevationData.elevationGain,
          elevationLossMeters: elevationData.elevationLoss,
          elevationProfile: elevationData.profile,
          surfaceBreakdown,
          trafficDelayMinutes: 0,
          coordinates,
          steps,
          isFastest: index === 0,
          isScenic: index > 0,
          warnings,
          estimatedFuelCostEur,
        };

        // Wenn EV-Modus aktiv ist: Durch EV-Charging Optimizer veredeln
        if (mode === 'ev') {
          baseRouteOption = EVChargingService.optimizeRouteForEV(baseRouteOption);
        }

        return baseRouteOption;
      });

      return await Promise.all(routePromises);
    } catch (error) {
      console.warn('[RoutingService] OSRM-Fehler, verwende Fallback:', error);
      return RoutingService.fallbackRoute(origin, destination, mode);
    }
  }

  /**
   * Fallback-Route wenn OSRM nicht erreichbar
   */
  private static fallbackRoute(
    origin: LocationPoint,
    destination: LocationPoint,
    mode: TransportMode
  ): RouteOption[] {
    const R = 6371;
    const dLat = ((destination.latitude - origin.latitude) * Math.PI) / 180;
    const dLon = ((destination.longitude - origin.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((origin.latitude * Math.PI) / 180) *
        Math.cos((destination.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const directKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = parseFloat((directKm * 1.25).toFixed(1));
    const avgSpeed = MODE_SPEED_KMH[mode] || 50;
    const durationMinutes = Math.round((distanceKm / avgSpeed) * 60);

    const coords: LocationPoint[] = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      coords.push({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * t,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * t,
      });
    }

    const synthElev = ElevationService.generateSyntheticProfile(coords, distanceKm);

    return [{
      id: `route-fallback-${mode}`,
      mode,
      title: 'Offline-Route (Schätzung)',
      distanceKm,
      durationMinutes,
      elevationGainMeters: synthElev.elevationGain,
      elevationLossMeters: synthElev.elevationLoss,
      elevationProfile: synthElev.profile,
      surfaceBreakdown: { pavedPercent: 70, unpavedPercent: 20, trailPercent: 10 },
      trafficDelayMinutes: 0,
      coordinates: coords,
      steps: [
        { instruction: 'Starten Sie in Richtung Ziel', distanceMeter: Math.round(distanceKm * 1000), durationSeconds: durationMinutes * 60, iconName: 'navigation', coordinate: origin },
        { instruction: 'Ziel erreicht', distanceMeter: 0, durationSeconds: 0, iconName: 'map-pin', coordinate: destination },
      ],
      isFastest: true,
      isScenic: false,
      warnings: ['⚠️ Offline-Modus: Route ist eine Luftlinien-Schätzung.'],
    }];
  }
}
