import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { GeocodingService, GeocodingResult } from '../services/GeocodingService';
import { FavoritesService } from '../services/FavoritesService';
import { SearchHistoryService, SearchHistoryItem } from '../services/SearchHistoryService';
import { useNavigation } from '../context/NavigationContext';
import { useLocation } from '../context/LocationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { Search, X, MapPin, Navigation, History, Trash2 } from 'lucide-react-native';

interface SearchBarProps {
  onResultSelect?: (result: GeocodingResult) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onResultSelect }) => {
  const { theme, setDestination } = useNavigation();
  const { userLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const loadHistory = useCallback(async () => {
    const items = await SearchHistoryService.getHistory();
    setHistory(items);
  }, []);

  useEffect(() => {
    if (isFocused && query.length === 0) {
      loadHistory();
    }
  }, [isFocused, query, loadHistory]);

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const found = await GeocodingService.searchPlaces(text, userLocation);
        setResults(found);
      } finally {
        setIsLoading(false);
      }
    }, 350); // 350ms Debounce
  }, [userLocation]);

  const handleSelect = useCallback((result: GeocodingResult) => {
    setQuery(result.shortName);
    setResults([]);
    setIsFocused(false);
    Keyboard.dismiss();
    setDestination(result.coordinate);
    SearchHistoryService.addSearch(result.shortName, result.coordinate);
    FavoritesService.addToHistory({
      query: result.displayName,
      shortName: result.shortName,
      coordinate: result.coordinate,
    });
    onResultSelect?.(result);
  }, [setDestination, onResultSelect]);

  const handleSelectHistory = useCallback((item: SearchHistoryItem) => {
    setQuery(item.query);
    setResults([]);
    setIsFocused(false);
    Keyboard.dismiss();
    setDestination(item.destination);
  }, [setDestination]);

  const handleClearHistory = useCallback(async () => {
    await SearchHistoryService.clearHistory();
    setHistory([]);
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setDestination(null);
  }, [setDestination]);

  const renderItem = useCallback(({ item }: { item: GeocodingResult }) => (
    <TouchableOpacity
      style={[styles.resultItem, { borderColor: colors.surfaceBorder }]}
      onPress={() => handleSelect(item)}
      accessibilityLabel={`Ziel auswählen: ${item.shortName}`}
      accessibilityRole="button"
    >
      <MapPin color={colors.primary} size={16} style={styles.resultIcon} />
      <View style={styles.resultText}>
        <Text
          style={[styles.resultName, { color: colors.textPrimary, fontSize: 14 * theme.fontSizeMultiplier }]}
          numberOfLines={1}
        >
          {item.shortName}
        </Text>
        <Text
          style={[styles.resultAddress, { color: colors.textSecondary, fontSize: 11 * theme.fontSizeMultiplier }]}
          numberOfLines={1}
        >
          {item.displayName}
        </Text>
      </View>
    </TouchableOpacity>
  ), [colors, theme, handleSelect]);

  return (
    <View style={styles.wrapper}>
      {/* Suchfeld */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: isFocused ? colors.primary : colors.surfaceBorder }]}>
        <Search color={isFocused ? colors.primary : colors.textSecondary} size={20} />
        <TextInput
          style={[styles.input, { color: colors.textPrimary, fontSize: 15 * theme.fontSizeMultiplier }]}
          placeholder="Ziel suchen (Adresse, Ort, POI)..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          returnKeyType="search"
          clearButtonMode="never"
          accessibilityLabel="Ziel suchen"
          accessibilityHint="Geben Sie eine Adresse oder einen Ort ein"
        />
        {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} accessibilityLabel="Suche löschen">
            <X color={colors.textSecondary} size={18} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suchverlauf Dropdown (wenn Eingabe leer) */}
      {isFocused && query.length === 0 && history.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: colors.textSecondary }]}>ZULETZT GESUCHT</Text>
            <TouchableOpacity onPress={handleClearHistory} accessibilityLabel="Verlauf leeren">
              <Text style={[styles.clearHistoryText, { color: colors.trafficJam }]}>Leeren</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={history}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectHistory(item)}
                accessibilityLabel={`Verlaufseintrag: ${item.query}`}
              >
                <History color={colors.textSecondary} size={16} style={styles.resultIcon} />
                <Text style={[styles.resultName, { color: colors.textPrimary, fontSize: 13 }]} numberOfLines={1}>
                  {item.query}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.resultList}
          />
        </View>
      )}

      {/* Ergebnis-Dropdown */}
      {isFocused && query.length >= 2 && results.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <FlatList
            data={results}
            keyExtractor={item => item.placeId}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            style={styles.resultList}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.surfaceBorder }]} />
            )}
          />
        </View>
      )}

      {/* Kein Ergebnis-Hinweis */}
      {isFocused && query.length >= 2 && results.length === 0 && !isLoading && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.noResults, { color: colors.textSecondary }]}>
            Keine Ergebnisse für „{query}"
          </Text>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 200,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1.5,
    gap: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 260,
    zIndex: 999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  resultList: { maxHeight: 260 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resultIcon: { marginRight: 10 },
  resultText: { flex: 1 },
  resultName: { fontWeight: '600' },
  resultAddress: { marginTop: 1 },
  separator: { height: 1, marginHorizontal: 12 },
  noResults: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 13,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  historyTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  clearHistoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

