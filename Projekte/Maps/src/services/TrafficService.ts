import { TrafficIncident, LocationPoint } from '../types/navigation';

export class TrafficService {
  // Mock sample real-time traffic alerts simulating feeds from Radio Bayern, Police, and Komoot Community
  private static mockIncidents: TrafficIncident[] = [
    {
      id: 'inc-01',
      type: 'jam',
      severity: 'high',
      title: 'Stau auf A99 Richtung Salzburg',
      description: 'Zähfließender Verkehr und 4 km Stau zwischen AK München-Nord und Haar. Verzögerung ca. 18 Minuten.',
      locationName: 'A99 AK München-Nord',
      coordinate: { latitude: 48.2255, longitude: 11.6251 },
      delayMinutes: 18,
      source: 'Radio Bayen',
      timestamp: 'Vor 4 Min.',
    },
    {
      id: 'inc-02',
      type: 'construction',
      severity: 'medium',
      title: 'Baustelle B2 Mittlerer Ring',
      description: 'Spurverengung wegen Fahrbahnsanierung. Nur eine Spur befahrbar.',
      locationName: 'München, Mittlerer Ring Süd',
      coordinate: { latitude: 48.1189, longitude: 11.5542 },
      delayMinutes: 8,
      source: 'Verkehrszentrale',
      timestamp: 'Vor 12 Min.',
    },
    {
      id: 'inc-03',
      type: 'accident',
      severity: 'critical',
      title: 'Unfall auf A8 Richtung Stuttgart',
      description: 'Rechter Fahrstreifen blockiert. Rettungskräfte vor Ort. Bitte Rettungsgasse bilden!',
      locationName: 'A8 Sulzemoos',
      coordinate: { latitude: 48.2912, longitude: 11.2618 },
      delayMinutes: 25,
      source: 'Polizei News',
      timestamp: 'Vor 2 Min.',
    },
    {
      id: 'inc-04',
      type: 'hazard',
      severity: 'low',
      title: 'Komoot Hinweis: Umgestürzter Baum auf Wanderweg',
      description: 'Trail-Abschnitt Isarauen Süd schwer passierbar für Biker und Wanderer.',
      locationName: 'Isarauen Schäftlarn',
      coordinate: { latitude: 47.9856, longitude: 11.4589 },
      delayMinutes: 5,
      source: 'Komoot Community',
      timestamp: 'Vor 25 Min.',
    },
  ];

  public static getActiveIncidents(): TrafficIncident[] {
    return this.mockIncidents;
  }

  public static getIncidentsNearLocation(userLocation: LocationPoint, radiusKm: number = 25): TrafficIncident[] {
    return this.mockIncidents.filter(inc => {
      const distance = this.calculateDistanceKm(userLocation, inc.coordinate);
      return distance <= radiusKm;
    });
  }

  public static calculateDistanceKm(p1: LocationPoint, p2: LocationPoint): number {
    const R = 6371; // Earth radius in KM
    const dLat = this.deg2rad(p2.latitude - p1.latitude);
    const dLon = this.deg2rad(p2.longitude - p1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(p1.latitude)) *
        Math.cos(this.deg2rad(p2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
