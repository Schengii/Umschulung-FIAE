import { ElevationService } from '../src/services/ElevationService';
import { SpeedAlertService } from '../src/services/SpeedAlertService';
import { EVChargingService } from '../src/services/EVChargingService';
import { TransitService } from '../src/services/TransitService';
import { FuelPriceService } from '../src/services/FuelPriceService';
import { LoopPlannerService } from '../src/services/LoopPlannerService';
import { HazardReportService } from '../src/services/HazardReportService';

describe('Maps App Core Services & New High-End Features', () => {

  describe('1. ElevationService Tests', () => {
    it('sollte ein synthetisches Höhenprofil generieren und Gradienten berechnen', () => {
      const coords = [
        { latitude: 48.137, longitude: 11.576 },
        { latitude: 48.140, longitude: 11.580 },
        { latitude: 48.145, longitude: 11.585 },
      ];
      const result = ElevationService.generateSyntheticProfile(coords, 10.0);

      expect(result.profile.length).toBe(3);
      expect(result.minElevation).toBeGreaterThan(0);
      expect(result.maxElevation).toBeGreaterThanOrEqual(result.minElevation);
      expect(typeof result.elevationGain).toBe('number');
      expect(typeof result.elevationLoss).toBe('number');
      expect(result.profile[1].gradientPercent).toBeDefined();
    });
  });

  describe('2. SpeedAlertService Tests', () => {
    it('sollte Geschwindigkeitsüberschreitungen für verschiedene Modi erkennen', () => {
      // Wandern Limit = 15 km/h
      const hikingAlert = SpeedAlertService.checkSpeedAndRoute(
        { latitude: 48.1, longitude: 11.5, speed: 5.5 }, // ~19.8 km/h
        'hiking'
      );
      expect(hikingAlert.isSpeeding).toBe(true);
      expect(hikingAlert.speedLimitKmh).toBe(15);

      // Auto Limit = 130 km/h
      const drivingAlert = SpeedAlertService.checkSpeedAndRoute(
        { latitude: 48.1, longitude: 11.5, speed: 27.7 }, // ~100 km/h
        'driving'
      );
      expect(drivingAlert.isSpeeding).toBe(false);
      expect(drivingAlert.speedLimitKmh).toBe(130);
    });

    it('sollte Off-Route Abweichungen (>120m) korrekt erkennen', () => {
      const routeCoords = [
        { latitude: 48.1370, longitude: 11.5760 },
        { latitude: 48.1380, longitude: 11.5770 },
      ];

      // Nutzer nahe an der Route (~10m)
      const nearAlert = SpeedAlertService.checkSpeedAndRoute(
        { latitude: 48.1371, longitude: 11.5761, speed: 5 },
        'cycling',
        routeCoords
      );
      expect(nearAlert.isOffRoute).toBe(false);

      // Nutzer weit weg von der Route (>1 km)
      const farAlert = SpeedAlertService.checkSpeedAndRoute(
        { latitude: 48.2000, longitude: 11.6500, speed: 5 },
        'cycling',
        routeCoords
      );
      expect(farAlert.isOffRoute).toBe(true);
    });
  });

  describe('3. EVChargingService Tests', () => {
    it('sollte bei unzureichender Akkukapazität für die Distanz Ladestopps einplanen', () => {
      const longRoute = {
        id: 'test-ev-route',
        mode: 'driving',
        title: 'Schnellste Route',
        distanceKm: 500, // 500 km erfordert Ladestopp bei 77 kWh Akku
        durationMinutes: 300,
        trafficDelayMinutes: 0,
        coordinates: [
          { latitude: 48.1, longitude: 11.5 },
          { latitude: 49.0, longitude: 11.0 },
          { latitude: 50.0, longitude: 10.0 },
          { latitude: 51.0, longitude: 9.0 },
          { latitude: 52.0, longitude: 8.0 },
          { latitude: 52.5, longitude: 13.4 },
        ],
        steps: [],
        isFastest: true,
        isScenic: false,
        warnings: [],
      };

      const evRoute = EVChargingService.optimizeRouteForEV(longRoute, 77, 50, 19.0);
      expect(evRoute.mode).toBe('ev');
      expect(evRoute.evStops).toBeDefined();
      expect(evRoute.evStops.length).toBeGreaterThan(0);
      expect(evRoute.evStops[0].powerKw).toBe(350);
      expect(evRoute.estimatedEnergyKwh).toBe(95);
      expect(evRoute.durationMinutes).toBeGreaterThan(longRoute.durationMinutes);
    });
  });

  describe('4. TransitService Tests', () => {
    it('sollte multimodale ÖPNV-Routen mit Haltestellen und Linien generieren', async () => {
      const origin = { latitude: 48.137, longitude: 11.576, name: 'Marienplatz' };
      const dest = { latitude: 48.175, longitude: 11.551, name: 'Olympiapark' };

      const transitRoutes = await TransitService.calculateTransitRoute(origin, dest);

      expect(transitRoutes.length).toBeGreaterThanOrEqual(1);
      const mainRoute = transitRoutes[0];
      expect(mainRoute.mode).toBe('transit');
      expect(mainRoute.transitFareEur).toBeGreaterThan(0);
      expect(mainRoute.steps.length).toBeGreaterThan(2);

      const subwayStep = mainRoute.steps.find(s => s.transitDetails?.vehicleType === 'subway');
      expect(subwayStep).toBeDefined();
      expect(subwayStep.transitDetails.lineName).toBe('U3');
    });
  });

  describe('5. FuelPriceService Tests', () => {
    it('sollte Tankstellen mit Preisen für Diesel, E5 und E10 zurückgeben', async () => {
      const center = { latitude: 48.137, longitude: 11.576 };
      const stations = await FuelPriceService.getNearbyFuelPrices(center);

      expect(stations.length).toBe(3);
      expect(stations[0].brand).toBe('Aral');
      expect(stations[0].diesel).toBeGreaterThan(1.4);
      expect(stations[0].e5).toBeGreaterThan(stations[0].e10);
    });
  });

  describe('6. GPX Serialization & Parsing', () => {
    it('sollte GPX-XML Strings korrekt serialisieren und parsen', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <gpx version="1.1">
        <trk><trkseg>
          <trkpt lat="48.137" lon="11.576"><ele>520</ele></trkpt>
          <trkpt lat="48.140" lon="11.580"><ele>525</ele></trkpt>
        </trkseg></trk>
      </gpx>`;

      const points = [];
      const trkptRegex = /<trkpt\s+lat=["']([^"']+)["']\s+lon=["']([^"']+)["']/g;
      let match;
      while ((match = trkptRegex.exec(xml)) !== null) {
        points.push({ latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) });
      }

      expect(points.length).toBe(2);
      expect(points[0].latitude).toBe(48.137);
      expect(points[1].longitude).toBe(11.580);
    });
  });
});
