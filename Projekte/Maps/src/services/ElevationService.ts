import { LocationPoint, ElevationPoint } from '../types/navigation';

export class ElevationService {
  /**
   * Lädt echte Höhendaten für eine Koordinatensequenz via Open-Meteo Elevation API
   * Berechnet Distanzen, Min/Max Höhen und Steigungsprozentsätze (Gradient).
   */
  public static async getElevationProfile(
    coordinates: LocationPoint[],
    totalDistanceKm: number
  ): Promise<{
    profile: ElevationPoint[];
    elevationGain: number;
    elevationLoss: number;
    minElevation: number;
    maxElevation: number;
  }> {
    if (!coordinates || coordinates.length === 0) {
      return { profile: [], elevationGain: 0, elevationLoss: 0, minElevation: 0, maxElevation: 0 };
    }

    // Sample coordinates if too many (API limits)
    const sampledCoords = this.sampleCoordinates(coordinates, 40);

    try {
      const lats = sampledCoords.map(c => c.latitude.toFixed(5)).join(',');
      const lons = sampledCoords.map(c => c.longitude.toFixed(5)).join(',');
      const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`;

      const res = await fetch(url, {
        headers: { 'User-Agent': 'Maps-App/1.0 (github.com/Schengii/Maps)' },
      });

      if (!res.ok) {
        throw new Error(`Open-Meteo Elevation API status: ${res.status}`);
      }

      const data: { elevation: number[] } = await res.json();
      const rawElevations = data.elevation ?? [];

      return this.processElevationData(sampledCoords, rawElevations, totalDistanceKm);
    } catch (e) {
      console.warn('[ElevationService] Fallback auf algorithmische Höhendaten:', e);
      return this.generateSyntheticProfile(sampledCoords, totalDistanceKm);
    }
  }

  private static sampleCoordinates(coords: LocationPoint[], maxSamples: number): LocationPoint[] {
    if (coords.length <= maxSamples) return coords;
    const step = (coords.length - 1) / (maxSamples - 1);
    const result: LocationPoint[] = [];
    for (let i = 0; i < maxSamples; i++) {
      const index = Math.min(Math.round(i * step), coords.length - 1);
      result.push(coords[index]);
    }
    return result;
  }

  private static processElevationData(
    coords: LocationPoint[],
    elevations: number[],
    totalDistanceKm: number
  ): {
    profile: ElevationPoint[];
    elevationGain: number;
    elevationLoss: number;
    minElevation: number;
    maxElevation: number;
  } {
    const count = coords.length;
    let gain = 0;
    let loss = 0;
    let minEle = count > 0 ? elevations[0] ?? 200 : 0;
    let maxEle = minEle;

    const profile: ElevationPoint[] = [];

    for (let i = 0; i < count; i++) {
      const ele = Math.round(elevations[i] ?? 250);
      const dist = parseFloat(((i / Math.max(1, count - 1)) * totalDistanceKm).toFixed(2));

      if (ele < minEle) minEle = ele;
      if (ele > maxEle) maxEle = ele;

      let gradient = 0;
      if (i > 0) {
        const prev = profile[i - 1];
        const diff = ele - prev.elevation;
        if (diff > 0) gain += diff;
        else loss += Math.abs(diff);

        const segDistMeter = Math.max(10, (dist - prev.distanceKm) * 1000);
        gradient = parseFloat(((diff / segDistMeter) * 100).toFixed(1));
      }

      profile.push({
        distanceKm: dist,
        elevation: ele,
        coordinate: coords[i],
        gradientPercent: gradient,
      });
    }

    return {
      profile,
      elevationGain: Math.round(gain),
      elevationLoss: Math.round(loss),
      minElevation: Math.round(minEle),
      maxElevation: Math.round(maxEle),
    };
  }

  public static generateSyntheticProfile(
    coords: LocationPoint[],
    totalDistanceKm: number
  ): {
    profile: ElevationPoint[];
    elevationGain: number;
    elevationLoss: number;
    minElevation: number;
    maxElevation: number;
  } {
    const baseElev = 350;
    const rawElevations: number[] = coords.map((c, i) => {
      const progress = i / Math.max(1, coords.length - 1);
      const wave1 = Math.sin(progress * Math.PI * 2) * 60;
      const wave2 = Math.cos(progress * Math.PI * 4) * 30;
      return Math.round(baseElev + wave1 + wave2 + (c.latitude % 0.05) * 500);
    });

    return this.processElevationData(coords, rawElevations, totalDistanceKm);
  }
}
