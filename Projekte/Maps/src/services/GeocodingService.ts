import { LocationPoint } from '../types/navigation';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const HEADERS = {
  'User-Agent': 'Maps-App/1.0 (github.com/Schengii/Maps)',
  'Accept-Language': 'de,en',
};

export interface GeocodingResult {
  placeId: string;
  displayName: string;
  shortName: string;
  coordinate: LocationPoint;
  type: string;      // 'city', 'street', 'amenity', etc.
  icon?: string;
}

export class GeocodingService {
  /**
   * Sucht Orte via Nominatim OpenStreetMap (kostenlos, kein API-Key)
   * Gibt max. 5 Ergebnisse zurück
   */
  public static async searchPlaces(
    query: string,
    nearLocation?: LocationPoint
  ): Promise<GeocodingResult[]> {
    if (!query || query.trim().length < 2) return [];

    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      addressdetails: '1',
      limit: '6',
      countrycodes: 'de,at,ch', // DACH-Raum bevorzugen
    });

    // Suche nahe am Nutzer-Standort priorisieren
    if (nearLocation) {
      params.set('viewbox', [
        nearLocation.longitude - 0.5,
        nearLocation.latitude + 0.3,
        nearLocation.longitude + 0.5,
        nearLocation.latitude - 0.3,
      ].join(','));
      params.set('bounded', '0');
    }

    try {
      const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, { headers: HEADERS });
      if (!response.ok) throw new Error(`Nominatim HTTP ${response.status}`);

      const data: NominatimResult[] = await response.json();

      return data.map(item => ({
        placeId: item.place_id.toString(),
        displayName: item.display_name,
        shortName: GeocodingService.extractShortName(item),
        coordinate: {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          name: GeocodingService.extractShortName(item),
          address: item.display_name,
        },
        type: item.type ?? item.class ?? 'place',
        icon: GeocodingService.getIconForType(item.type ?? item.class),
      }));
    } catch (error) {
      console.warn('[GeocodingService] Nominatim-Fehler:', error);
      return [];
    }
  }

  /**
   * Reverse-Geocoding: Koordinaten → Adresse
   */
  public static async reverseGeocode(location: LocationPoint): Promise<string> {
    const params = new URLSearchParams({
      lat: location.latitude.toString(),
      lon: location.longitude.toString(),
      format: 'json',
    });

    try {
      const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, { headers: HEADERS });
      if (!response.ok) return 'Unbekannte Adresse';

      const data: { display_name: string; address: Record<string, string> } = await response.json();
      const addr = data.address;

      // Kurze, lesbare Adresse zusammenstellen
      const parts = [
        addr.road ?? addr.pedestrian ?? addr.path,
        addr.house_number,
        addr.city ?? addr.town ?? addr.village ?? addr.municipality,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(' ') : data.display_name;
    } catch (error) {
      return 'Unbekannte Adresse';
    }
  }

  private static extractShortName(item: NominatimResult): string {
    const addr = item.address ?? {};
    const primary =
      item.namedetails?.name ??
      addr.amenity ??
      addr.road ??
      addr.pedestrian ??
      addr.leisure ??
      addr.tourism ??
      addr.city ??
      addr.town ??
      addr.village ??
      item.display_name.split(',')[0];
    return primary?.trim() ?? item.display_name.split(',')[0];
  }

  private static getIconForType(type?: string): string {
    const iconMap: Record<string, string> = {
      restaurant: 'utensils',
      cafe: 'coffee',
      hotel: 'bed',
      hospital: 'heart-pulse',
      pharmacy: 'pill',
      school: 'school',
      university: 'graduation-cap',
      museum: 'landmark',
      park: 'trees',
      fuel: 'fuel',
      parking: 'parking-square',
      supermarket: 'shopping-cart',
      bus_stop: 'bus',
      railway: 'train',
      street: 'road',
      city: 'building-2',
      town: 'building',
      village: 'home',
    };
    return iconMap[type ?? ''] ?? 'map-pin';
  }
}

// Nominatim API Typen
interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
  address?: Record<string, string>;
  namedetails?: { name?: string };
}
