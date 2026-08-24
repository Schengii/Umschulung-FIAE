import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { FavoritesService, FavoritePlace } from '../services/FavoritesService';
import { GpxService } from '../services/GpxService';
import { ArrowLeft, Home, Briefcase, Star, MapPin, Navigation, Trash2, Heart, Share2 } from 'lucide-react-native';

interface FavoritesManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FavoritesManagerModal: React.FC<FavoritesManagerModalProps> = ({ visible, onClose }) => {
  const { theme, setDestination, setSelectedRoute } = useNavigation();

  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [homePlace, setHomePlace] = useState<FavoritePlace | null>(null);
  const [workPlace, setWorkPlace] = useState<FavoritePlace | null>(null);

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const loadData = async () => {
    const favs = await FavoritesService.getFavorites();
    const home = await FavoritesService.getHome();
    const work = await FavoritesService.getWork();
    setFavorites(favs);
    setHomePlace(home);
    setWorkPlace(work);
  };

  useEffect(() => {
    if (visible) loadData();
  }, [visible]);

  const handleSelectPlace = (place: FavoritePlace) => {
    setDestination(place.coordinate);
    onClose();
  };

  const handleRemove = async (id: string) => {
    await FavoritesService.removeFavorite(id);
    loadData();
  };

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'home': return <Home color={colors.primary} size={20} />;
      case 'briefcase': return <Briefcase color={colors.primary} size={20} />;
      case 'heart': return <Heart color={colors.secondary} size={20} />;
      default: return <Star color={colors.accentHiking} size={20} />;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderColor: colors.surfaceBorder }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Schließen">
            <ArrowLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Gespeicherte Orte & Favoriten</Text>
        </View>

        <View style={styles.content}>
          {/* Schnellzugriff Home & Arbeit */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SCHNELLZUGRIFF</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              onPress={() => homePlace && handleSelectPlace(homePlace)}
              accessibilityLabel="Zuhause navigieren"
            >
              <Home color={colors.primary} size={24} />
              <Text style={[styles.quickTitle, { color: colors.textPrimary }]}>Zuhause</Text>
              <Text style={[styles.quickSub, { color: colors.textSecondary }]} numberOfLines={1}>
                {homePlace ? homePlace.address : 'Nicht gesetzt'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              onPress={() => workPlace && handleSelectPlace(workPlace)}
              accessibilityLabel="Arbeit navigieren"
            >
              <Briefcase color={colors.secondary} size={24} />
              <Text style={[styles.quickTitle, { color: colors.textPrimary }]}>Arbeit</Text>
              <Text style={[styles.quickSub, { color: colors.textSecondary }]} numberOfLines={1}>
                {workPlace ? workPlace.address : 'Nicht gesetzt'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* GPX Import Card */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 16 }]}>OUTDOOR TRACKS (KOMOOT)</Text>
          <TouchableOpacity
            style={[styles.gpxImportBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]}
            onPress={async () => {
              const importedRoute = await GpxService.importGpxFile();
              if (importedRoute) {
                setSelectedRoute(importedRoute);
                setDestination(importedRoute.coordinates[importedRoute.coordinates.length - 1]);
                onClose();
              }
            }}
            accessibilityLabel="GPX-Track aus Datei importieren"
          >
            <Share2 color={colors.primary} size={20} />
            <Text style={[styles.gpxImportBtnText, { color: colors.primary }]}>📥 GPX Track Datei importieren</Text>
          </TouchableOpacity>

          {/* Favoriten-Liste */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 20 }]}>MEINE FAVORITEN</Text>
          {favorites.length === 0 ? (
            <View style={styles.emptyState}>
              <Star color={colors.textSecondary} size={36} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Noch keine Favoriten gespeichert. Suche einen Ort und füge ihn hinzu.
              </Text>
            </View>
          ) : (
            <FlatList
              data={favorites}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={[styles.favItem, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                  <View style={styles.favLeft}>
                    {renderIcon(item.icon)}
                    <View style={styles.favText}>
                      <Text style={[styles.favName, { color: colors.textPrimary }]}>{item.name}</Text>
                      <Text style={[styles.favAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.address}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.favActions}>
                    <TouchableOpacity
                      style={[styles.navBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleSelectPlace(item)}
                      accessibilityLabel={`${item.name} annavigieren`}
                    >
                      <Navigation color="#FFFFFF" size={16} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleRemove(item.id)}
                      accessibilityLabel={`${item.name} löschen`}
                    >
                      <Trash2 color={colors.trafficJam} size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
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
  quickRow: { flexDirection: 'row', gap: 12 },
  quickCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickTitle: { fontWeight: '700', fontSize: 14, marginTop: 6 },
  quickSub: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  favLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  favText: { marginLeft: 10, flex: 1 },
  favName: { fontWeight: '600', fontSize: 14 },
  favAddress: { fontSize: 12, marginTop: 1 },
  favActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { padding: 6 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 10, fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },
  gpxImportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  gpxImportBtnText: { fontWeight: '700', fontSize: 14 },
});


