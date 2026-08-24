import { LocationPoint } from '../types/navigation';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export type POICategory = 'restaurant' | 'cafe' | 'fuel' | 'parking' | 'hospital' | 'pharmacy' | 'supermarket' | 'hotel' | 'museum' | 'viewpoint' | 'drinking_water' | 'bicycle_repair' | 'campsite';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  coordinate: LocationPoint;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  iconName: string;
  color: string;
}

// Lucide-Icon + Farbe je POI-Kategorie
const CATEGORY_META: Record<POICategory, { icon: string; color: string; label: string }> = {
  restaurant: { icon: 'utensils', color: '#F59E0B', label: 'Restaurant' },
  cafe: { icon: 'coffee', color: '#92400E', label: 'Café' },
  fuel: { icon: 'fuel', color: '#EF4444', label: 'Tankstelle' },
  parking: { icon: 'square-parking', color: '#3B82F6', label: 'Parkplatz' },
  hospital: { icon: 'heart-pulse', color: '#DC2626', label: 'Krankenhaus' },
  pharmacy: { icon: 'pill', color: '#059669', label: 'Apotheke' },
  supermarket: { icon: 'shopping-cart', color: '#10B981', label: 'Supermarkt' },
  hotel: { icon: 'bed', color: '#8B5CF6', label: 'Hotel' },
  museum: { icon: 'landmark', color: '#6D28D9', label: 'Museum' },
  viewpoint: { icon: 'mountain', color: '#D97706', label: 'Aussichtspunkt' },
  drinking_water: { icon: 'droplet', color: '#06B6D4', label: 'Trinkwasser' },
  bicycle_repair: { icon: 'wrench', color: '#10B981', label: 'Rad-Reparatur' },
  campsite: { icon: 'tent', color: '#059669', label: 'Campingplatz' },
};

// Overpass-Filter je Kategorie
const OVERPASS_FILTERS: Record<POICategory, string> = {
  restaurant: 'amenity=restaurant',
  cafe: 'amenity=cafe',
  fuel: 'amenity=fuel',
  parking: 'amenity=parking',
  hospital: 'amenity=hospital',
  pharmacy: 'amenity=pharmacy',
  supermarket: 'shop=supermarket',
  hotel: 'tourism=hotel',
  museum: 'tourism=museum',
  viewpoint: 'tourism=viewpoint',
  drinking_water: 'amenity=drinking_water',
  bicycle_repair: 'amenity=bicycle_repair_station',
  campsite: 'tourism=camp_site',
};

export class POIService {
  /**
   * Lädt POIs via Overpass API im Radius um Nutzerstandort
   * @param center Mittelpunkt der Suche
   * @param radiusM Radius in Metern (default 1000m)
   * @param categories Gewünschte Kategorien
   */
  public static async loadPOIs(
    center: LocationPoint,
    radiusM: number = 1000,
    categories: POICategory[] = ['restaurant', 'cafe', 'fuel', 'pharmacy']
  ): Promise<POI[]> {
    const filters = categories
      .map(cat => OVERPASS_FILTERS[cat])
      .map(filter => {
        const [key, val] = filter.split('=');
        return `node["${key}"="${val}"](around:${radiusM},${center.latitude},${center.longitude});`;
      })
      .join('\n');

    const query = `[out:json][timeout:15];\n(\n${filters}\n);\nout body;`;

    try {
      const response = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Maps-App/1.0 (github.com/Schengii/Maps)',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`);
      const data: { elements: OverpassElement[] } = await response.json();

      const pois: POI[] = [];
      for (const el of data.elements) {
        if (!el.tags || !el.lat || !el.lon) continue;
        const category = POIService.detectCategory(el.tags, categories);
        if (!category) continue;
        const meta = CATEGORY_META[category];

        pois.push({
          id: `poi-${el.id}`,
          name: el.tags.name ?? meta.label,
          category,
          coordinate: { latitude: el.lat, longitude: el.lon },
          address: POIService.formatAddress(el.tags),
          phone: el.tags['contact:phone'] ?? el.tags.phone,
          website: el.tags['contact:website'] ?? el.tags.website,
          openingHours: el.tags.opening_hours,
          iconName: meta.icon,
          color: meta.color,
        });
      }
      return pois.slice(0, 50); // max 50 POIs zur Performance
    } catch (error) {
      console.warn('[POIService] Overpass-Fehler:', error);
      return [];
    }
  }

  /** Gibt die angezeigte Beschriftung einer Kategorie zurück */
  public static getCategoryLabel(category: POICategory): string {
    return CATEGORY_META[category].label;
  }

  /** Icon-Name einer Kategorie */
  public static getCategoryIcon(category: POICategory): string {
    return CATEGORY_META[category].icon;
  }

  /** Farbe einer Kategorie */
  public static getCategoryColor(category: POICategory): string {
    return CATEGORY_META[category].color;
  }

  private static detectCategory(
    tags: Record<string, string>,
    allowed: POICategory[]
  ): POICategory | null {
    for (const cat of allowed) {
      const [key, val] = OVERPASS_FILTERS[cat].split('=');
      if (tags[key] === val) return cat;
    }
    return null;
  }

  private static formatAddress(tags: Record<string, string>): string | undefined {
    const street = tags['addr:street'];
    const num = tags['addr:housenumber'];
    const city = tags['addr:city'];
    if (!street) return undefined;
    return [street, num, city].filter(Boolean).join(' ');
  }
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

// Alle verfügbaren Kategorien exportieren für UI-Picker
export const ALL_POI_CATEGORIES = Object.keys(CATEGORY_META) as POICategory[];
export { CATEGORY_META };
