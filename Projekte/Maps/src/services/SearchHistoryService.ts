import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationPoint } from '../types/navigation';

const HISTORY_KEY = '@maps_search_history_v1';
const MAX_HISTORY_ITEMS = 8;

export interface SearchHistoryItem {
  id: string;
  query: string;
  destination: LocationPoint;
  timestamp: number;
}

export class SearchHistoryService {
  public static async getHistory(): Promise<SearchHistoryItem[]> {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static async addSearch(query: string, destination: LocationPoint): Promise<void> {
    try {
      const history = await SearchHistoryService.getHistory();
      const filtered = history.filter(h => h.query.toLowerCase() !== query.toLowerCase());

      const newItem: SearchHistoryItem = {
        id: `search-hist-${Date.now()}`,
        query,
        destination,
        timestamp: Date.now(),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('[SearchHistoryService] Error saving search:', error);
    }
  }

  public static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.warn('[SearchHistoryService] Error clearing history:', error);
    }
  }
}
