import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { useLocation } from '../context/LocationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { GeocodingService, GeocodingResult } from '../services/GeocodingService';
import { LocationPoint } from '../types/navigation';
import { ArrowLeft, MapPin, Plus, Trash2, Search, Navigation, Flag, ArrowUp, ArrowDown } from 'lucide-react-native';

interface WaypointManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WaypointManagerModal: React.FC<WaypointManagerModalProps> = ({ visible, onClose }) => {
  const { theme, waypoints, addWaypoint, removeWaypoint, clearWaypoints, destination } = useNavigation();
  const { userLocation } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await GeocodingService.searchPlaces(text, userLocation);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectWaypoint = (result: GeocodingResult) => {
    addWaypoint(result.coordinate);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderColor: colors.surfaceBorder }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Zurück">
            <ArrowLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Zwischenstopps & Wegpunkte</Text>
        </View>

        <View style={styles.content}>
          {/* Waypoint Hinzufügen Suche */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ZWISCHENSTOPP HINZUFÜGEN</Text>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Search color={colors.primary} size={18} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Ort oder Adresse für Zwischenstopp..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          {/* Suchergebnisse */}
          {searchResults.length > 0 && (
            <View style={[styles.resultsList, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              {searchResults.map(res => (
                <TouchableOpacity
                  key={res.placeId}
                  style={[styles.resultItem, { borderColor: colors.surfaceBorder }]}
                  onPress={() => handleSelectWaypoint(res)}
                >
                  <Plus color={colors.primary} size={18} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultName, { color: colors.textPrimary }]}>{res.shortName}</Text>
                    <Text style={[styles.resultSub, { color: colors.textSecondary }]} numberOfLines={1}>{res.displayName}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Start, Zwischenstopps & Ziel Liste */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>ROUTENVERLAUF</Text>

          {/* Startpunkt */}
          <View style={[styles.pointRow, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Navigation color={colors.primary} size={20} />
            <Text style={[styles.pointText, { color: colors.textPrimary }]}>Start: Mein aktueller Standort</Text>
          </View>

          {/* Zwischenstopps */}
          {waypoints.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Noch keine Zwischenstopps hinzugefügt. Suche oben nach einem Ort.
            </Text>
          ) : (
            <FlatList
              data={waypoints}
              keyExtractor={(_, index) => `wp-${index}`}
              renderItem={({ item, index }) => (
                <View style={[styles.pointRow, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                  <MapPin color={colors.accentHiking} size={20} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pointText, { color: colors.textPrimary }]}>
                      Stopp {index + 1}: {item.name ?? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeWaypoint(index)} style={styles.deleteBtn}>
                    <Trash2 color={colors.trafficJam} size={18} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {/* Zielpunkt */}
          {destination && (
            <View style={[styles.pointRow, { backgroundColor: colors.surface, borderColor: colors.secondary, marginTop: 8 }]}>
              <Flag color={colors.secondary} size={20} />
              <Text style={[styles.pointText, { color: colors.textPrimary }]}>
                Ziel: {destination.name ?? destination.address ?? 'Gewähltes Ziel'}
              </Text>
            </View>
          )}

          {/* Clear Waypoints Button */}
          {waypoints.length > 0 && (
            <TouchableOpacity
              style={[styles.clearBtn, { borderColor: colors.trafficJam }]}
              onPress={clearWaypoints}
            >
              <Trash2 color={colors.trafficJam} size={16} />
              <Text style={[styles.clearBtnText, { color: colors.trafficJam }]}>Alle Zwischenstopps entfernen</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
  },
  backBtn: { paddingRight: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, height: '100%', fontWeight: '500' },
  resultsList: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    maxHeight: 180,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  resultName: { fontWeight: '600', fontSize: 14 },
  resultSub: { fontSize: 11, marginTop: 1 },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  pointText: { fontWeight: '600', fontSize: 14 },
  deleteBtn: { padding: 4 },
  emptyText: { fontSize: 12, fontStyle: 'italic', marginVertical: 10, textAlign: 'center' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  clearBtnText: { fontWeight: '700', fontSize: 13 },
});
