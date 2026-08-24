import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationPoint } from '../types/navigation';

export interface FavoritePlace {
  id: string;
  name: string;
  address: string;
  coordinate: LocationPoint;
  icon: 'home' | 'briefcase' | 'star' | 'heart' | 'map-pin';
  color: string;
  createdAt: string;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  shortName: string;
  coordinate: LocationPoint;
  timestamp: string;
}

const STORAGE_KEYS = {
  FAVORITES: 'maps_favorites_v1',
  SEARCH_HISTORY: 'maps_search_history_v1',
  HOME: 'maps_home_place_v1',
  WORK: 'maps_work_place_v1',
} as const;

const MAX_HISTORY_ENTRIES = 20;

export class FavoritesService {
  // ─── Favoriten ───────────────────────────────────────────────────────────

  public static async getFavorites(): Promise<FavoritePlace[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      return raw ? (JSON.parse(raw) as FavoritePlace[]) : [];
    } catch {
      return [];
    }
  }

  public static async addFavorite(place: Omit<FavoritePlace, 'id' | 'createdAt'>): Promise<FavoritePlace> {
    const favorites = await FavoritesService.getFavorites();
    const newFav: FavoritePlace = {
      ...place,
      id: `fav_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify([newFav, ...favorites])
    );
    return newFav;
  }

  public static async removeFavorite(id: string): Promise<void> {
    const favorites = await FavoritesService.getFavorites();
    const updated = favorites.filter(f => f.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  }

  public static async isFavorite(coordinate: LocationPoint): Promise<boolean> {
    const favorites = await FavoritesService.getFavorites();
    return favorites.some(
      f =>
        Math.abs(f.coordinate.latitude - coordinate.latitude) < 0.0001 &&
        Math.abs(f.coordinate.longitude - coordinate.longitude) < 0.0001
    );
  }

  // ─── Home & Arbeit ───────────────────────────────────────────────────────

  public static async getHome(): Promise<FavoritePlace | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.HOME);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public static async setHome(place: Omit<FavoritePlace, 'id' | 'createdAt' | 'icon' | 'color'>): Promise<void> {
    const home: FavoritePlace = {
      ...place,
      id: 'home',
      icon: 'home',
      color: '#3B82F6',
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.HOME, JSON.stringify(home));
  }

  public static async getWork(): Promise<FavoritePlace | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.WORK);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public static async setWork(place: Omit<FavoritePlace, 'id' | 'createdAt' | 'icon' | 'color'>): Promise<void> {
    const work: FavoritePlace = {
      ...place,
      id: 'work',
      icon: 'briefcase',
      color: '#8B5CF6',
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.WORK, JSON.stringify(work));
  }

  // ─── Suchverlauf ─────────────────────────────────────────────────────────

  public static async getSearchHistory(): Promise<SearchHistoryEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async addToHistory(entry: Omit<SearchHistoryEntry, 'id' | 'timestamp'>): Promise<void> {
    const history = await FavoritesService.getSearchHistory();
    // Duplikate entfernen (gleiche Koordinate)
    const filtered = history.filter(
      h =>
        Math.abs(h.coordinate.latitude - entry.coordinate.latitude) > 0.0001 ||
        Math.abs(h.coordinate.longitude - entry.coordinate.longitude) > 0.0001
    );
    const newEntry: SearchHistoryEntry = {
      ...entry,
      id: `hist_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
  }

  public static async clearHistory(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  }

  // ─── Alle Daten löschen (DSGVO Art. 17) ─────────────────────────────────

  public static async clearAllData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
  }
}
