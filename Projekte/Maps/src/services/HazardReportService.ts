import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrafficIncident, IncidentType, LocationPoint } from '../types/navigation';

const HAZARDS_STORAGE_KEY = '@maps_community_hazards_v1';

export class HazardReportService {
  private static cachedReports: TrafficIncident[] = [];

  /**
   * Lädt alle aktiven Community-Gefahrenmeldungen
   */
  public static async getActiveHazards(): Promise<TrafficIncident[]> {
    try {
      const stored = await AsyncStorage.getItem(HAZARDS_STORAGE_KEY);
      const now = Date.now();

      let reports: TrafficIncident[] = stored ? JSON.parse(stored) : [];

      // Filter abgelaufene Meldungen (Standard: 2 Stunden Lebensdauer)
      reports = reports.filter(r => !r.expiresAt || r.expiresAt > now);

      this.cachedReports = reports;
      return reports;
    } catch {
      return this.cachedReports;
    }
  }

  /**
   * Erstellt eine neue 1-Tap Gefahrenmeldung
   */
  public static async reportHazard(
    type: IncidentType,
    coordinate: LocationPoint,
    customTitle?: string
  ): Promise<TrafficIncident> {
    const titles: Record<IncidentType, string> = {
      speed_camera: '📸 Mobiler Blitzer gemeldet',
      accident: '💥 Unfall auf der Fahrbahn',
      jam: '🚗 Stauende / zähfließender Verkehr',
      construction: '🚧 Tagesbaustelle / Engstelle',
      hazard: '⚠️ Hindernis auf der Fahrbahn',
      weather: '🌧️ Aquaplaning / Starkregen',
      breakdown: '🛑 Liegengebliebenes Fahrzeug',
      ice: '❄️ Glatteis / Schneeglätte',
    };

    const newIncident: TrafficIncident = {
      id: `hazard-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      severity: type === 'accident' || type === 'ice' ? 'high' : 'medium',
      title: customTitle || titles[type] || 'Gefahr gemeldet',
      description: `Von Community-Mitglied vor wenigen Augenblicken bestätigt.`,
      locationName: coordinate.name || coordinate.address || 'Auf aktueller Route',
      coordinate,
      delayMinutes: type === 'jam' ? 8 : type === 'accident' ? 12 : 0,
      source: 'Community Report',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2h gültig
      confirmations: 1,
    };

    const existing = await this.getActiveHazards();
    const updated = [newIncident, ...existing];

    try {
      await AsyncStorage.setItem(HAZARDS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[HazardReportService] Error saving report:', e);
    }

    this.cachedReports = updated;
    return newIncident;
  }
}
