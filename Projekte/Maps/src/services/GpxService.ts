import { RouteOption, LocationPoint } from '../types/navigation';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export class GpxService {
  /**
   * Generiert eine GPX XML Zeichenkette aus einer RouteOption (Komoot Kompatibilität)
   */
  public static createGpxString(route: RouteOption): string {
    const coordsXml = route.coordinates
      .map(
        c =>
          `      <trkpt lat="${c.latitude}" lon="${c.longitude}">${
            c.altitude ? `\n        <ele>${c.altitude}</ele>` : ''
          }\n      </trkpt>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Maps App - Komoot GPX Export" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${route.title}</name>
    <desc>Distanz: ${route.distanceKm} km | Anstieg: ${route.elevationGainMeters ?? 0} m</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${route.title}</name>
    <type>${route.mode}</type>
    <trkseg>
${coordsXml}
    </trkseg>
  </trk>
</gpx>`;
  }

  /**
   * Exportiert und teilt eine Route als .gpx Datei
   */
  public static async exportAndShareGpx(route: RouteOption): Promise<boolean> {
    try {
      const gpxContent = GpxService.createGpxString(route);
      const safeTitle = route.title.replace(/[^a-zA-Z0-9]/g, '_');
      const baseDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || '';
      const fileUri = `${baseDir}${safeTitle}.gpx`;

      await FileSystem.writeAsStringAsync(fileUri, gpxContent, {
        encoding: 'utf8' as any,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/gpx+xml',
          dialogTitle: `${route.title} als GPX teilen`,
          UTI: 'com.topografix.gpx',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.warn('[GpxService] GPX export failed:', error);
      return false;
    }
  }

  /**
   * Öffnet den Datei-Picker für .gpx Dateien und konvertiert die Datei in eine RouteOption
   */
  public static async importGpxFile(): Promise<RouteOption | null> {
    try {
      const DocumentPicker = require('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name || 'Importierte GPX Route';
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: 'utf8' as any });

      const coordinates = GpxService.parseGpxString(content);
      if (coordinates.length === 0) {
        throw new Error('Keine gültigen GPX-Trackpunkte gefunden.');
      }

      // Distanz berechnen
      let totalMeter = 0;
      for (let i = 0; i < coordinates.length - 1; i++) {
        const p1 = coordinates[i];
        const p2 = coordinates[i + 1];
        const R = 6371000;
        const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
        const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((p1.latitude * Math.PI) / 180) *
            Math.cos((p2.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        totalMeter += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      }

      const distanceKm = parseFloat((totalMeter / 1000).toFixed(1));
      const durationMinutes = Math.round((distanceKm / 4.5) * 60);

      return {
        id: `imported-gpx-${Date.now()}`,
        mode: 'hiking',
        title: fileName.replace(/\.gpx$/i, ''),
        distanceKm,
        durationMinutes,
        elevationGainMeters: Math.round(distanceKm * 25),
        surfaceBreakdown: { pavedPercent: 30, unpavedPercent: 50, trailPercent: 20 },
        trafficDelayMinutes: 0,
        coordinates,
        steps: [
          { instruction: 'GPX Route gestartet', distanceMeter: 0, durationSeconds: 0, iconName: 'navigation', coordinate: coordinates[0] },
          { instruction: 'GPX Ziel erreicht', distanceMeter: Math.round(totalMeter), durationSeconds: durationMinutes * 60, iconName: 'map-pin', coordinate: coordinates[coordinates.length - 1] },
        ],
        isFastest: true,
        isScenic: true,
        warnings: ['📥 Importierte GPX-Route'],
      };
    } catch (error) {
      console.warn('[GpxService] GPX import error:', error);
      return null;
    }
  }

  /**
   * Parst einfache GPX XML Zeichenkette in ein Array von LocationPoints
   */
  public static parseGpxString(gpxXml: string): LocationPoint[] {
    const points: LocationPoint[] = [];
    const trkptRegex = /<trkpt\s+lat=["']([^"']+)["']\s+lon=["']([^"']+)["']/g;
    let match: RegExpExecArray | null;

    while ((match = trkptRegex.exec(gpxXml)) !== null) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lon)) {
        points.push({ latitude: lat, longitude: lon });
      }
    }
    return points;
  }
}

