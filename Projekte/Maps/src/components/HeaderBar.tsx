import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { TransportMode } from '../types/navigation';
import { POICategory } from '../services/POIService';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  Radio,
  Footprints,
  Bike,
  Car,
  Compass,
  PlusCircle,
  Sparkles,
  Train,
  Zap,
  RotateCcw,
  Bluetooth,
  HardDrive,
  Cloud,
  CloudRain,
  Users,
} from 'lucide-react-native';
import { SearchBar } from './SearchBar';

interface HeaderBarProps {
  onOpenFavorites: () => void;
  onOpenWaypoints: () => void;
  onOpenTrackRecorder: () => void;
  onOpenHighlights: () => void;
}

const MODES: { id: TransportMode; label: string; icon: any }[] = [
  { id: 'driving', label: 'Auto', icon: Car },
  { id: 'ev', label: 'Elektro (EV)', icon: Zap },
  { id: 'cycling', label: 'Fahrrad', icon: Bike },
  { id: 'hiking', label: 'Wandern', icon: Footprints },
  { id: 'transit', label: 'ÖPNV', icon: Train },
];

const POI_QUICK_FILTERS: { id: POICategory; label: string; icon: string }[] = [
  { id: 'drinking_water', label: 'Trinkwasser', icon: '🚰' },
  { id: 'bicycle_repair', label: 'Fahrrad-Reparatur', icon: '🔧' },
  { id: 'viewpoint', label: 'Aussichtspunkt', icon: '🌄' },
  { id: 'pharmacy', label: 'Apotheke', icon: '💊' },
  { id: 'fuel', label: 'Tankstelle', icon: '⛽' },
  { id: 'campsite', label: 'Camping', icon: '⛺' },
  { id: 'restaurant', label: 'Gastro', icon: '🍽️' },
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenFavorites,
  onOpenWaypoints,
  onOpenTrackRecorder,
  onOpenHighlights,
}) => {
  const {
    transportMode,
    setTransportMode,
    waypoints,
    setIsTrafficPanelOpen,
    setIsSettingsOpen,
    setIsLoopModalOpen,
    setIsBLEModalOpen,
    setIsVectorMapsModalOpen,
    setIsCloudSyncModalOpen,
    setIsAITourOpen,
    setIsCarPlayOpen,
    isWeatherRadarOpen,
    setIsWeatherRadarOpen,
    setIsGroupRideOpen,
    activePOICategories,
    togglePOICategory,
    theme,
    isBatterySaverMode,
  } = useNavigation();

  const colors = theme.isHighContrast || isBatterySaverMode
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.surfaceBorder }]}>
      {/* Obere Leiste: Quick Actions */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={onOpenFavorites}
          accessibilityLabel="Gespeicherte Favoriten & GPX-Import"
          accessibilityRole="button"
        >
          <Bookmark color={colors.primary} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: waypoints.length > 0 ? colors.secondary : colors.surfaceBorder },
          ]}
          onPress={onOpenWaypoints}
          accessibilityLabel={`Zwischenstopps (${waypoints.length} aktiv)`}
          accessibilityRole="button"
        >
          <PlusCircle color={waypoints.length > 0 ? '#FFFFFF' : colors.textPrimary} size={18} />
          {waypoints.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{waypoints.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Live-Wetterradar Overlay */}
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: isWeatherRadarOpen ? '#0284C7' : colors.surfaceBorder },
          ]}
          onPress={() => setIsWeatherRadarOpen(prev => !prev)}
          accessibilityLabel="Live-Wetterradar einblenden"
          accessibilityRole="button"
        >
          <CloudRain color={isWeatherRadarOpen ? '#FFFFFF' : '#38BDF8'} size={18} />
        </TouchableOpacity>

        {/* Social Group Ride & Live-Tracking */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={() => setIsGroupRideOpen(true)}
          accessibilityLabel="Social Group Ride & Live-Tracking"
          accessibilityRole="button"
        >
          <Users color="#10B981" size={18} />
        </TouchableOpacity>

        {/* Rundtouren Generator */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={() => setIsLoopModalOpen(true)}
          accessibilityLabel="Rundtouren-Generator"
          accessibilityRole="button"
        >
          <RotateCcw color="#38BDF8" size={18} />
        </TouchableOpacity>

        {/* KI-Tour-Guide Audioguide */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={() => setIsAITourOpen(true)}
          accessibilityLabel="KI-Tour-Guide Audioguide"
          accessibilityRole="button"
        >
          <Sparkles color="#F59E0B" size={18} />
        </TouchableOpacity>

        {/* Apple CarPlay & Android Auto Sync */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={() => setIsCarPlayOpen(true)}
          accessibilityLabel="CarPlay Display Simulator"
          accessibilityRole="button"
        >
          <Car color="#38BDF8" size={18} />
        </TouchableOpacity>

        {/* Bluetooth BLE Sensoren */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={() => setIsBLEModalOpen(true)}
          accessibilityLabel="Bluetooth BLE Sport-Sensoren"
          accessibilityRole="button"
        >
          <Bluetooth color="#EF4444" size={18} />
        </TouchableOpacity>

        {/* Offline Vektorkarten */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={() => setIsVectorMapsModalOpen(true)}
          accessibilityLabel="Offline-Vektorkarten Pakete"
          accessibilityRole="button"
        >
          <HardDrive color="#10B981" size={18} />
        </TouchableOpacity>

        {/* Cloud-Sync & Backup */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={() => setIsCloudSyncModalOpen(true)}
          accessibilityLabel="Cloud-Sync & Backup"
          accessibilityRole="button"
        >
          <Cloud color="#6366F1" size={18} />
        </TouchableOpacity>

        {/* Outdoor Tour-Recorder */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={onOpenTrackRecorder}
          accessibilityLabel="GPS Tour-Aufzeichnung"
          accessibilityRole="button"
        >
          <Compass color={colors.accentHiking} size={18} />
        </TouchableOpacity>

        {/* Live-Verkehrsradio */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={() => setIsTrafficPanelOpen(true)}
          accessibilityLabel="Verkehrsmeldungen & Radio"
          accessibilityRole="button"
        >
          <Radio color={colors.trafficJam} size={18} />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surfaceBorder }]}
          onPress={() => setIsSettingsOpen(true)}
          accessibilityLabel="Einstellungen & Barrierefreiheit"
          accessibilityRole="button"
        >
          <SlidersHorizontal color={colors.textSecondary} size={18} />
        </TouchableOpacity>
      </View>

      {/* Suchleiste */}
      <View style={styles.searchRow}>
        <SearchBar />
      </View>

      {/* Transport-Modus Tabs (Auto, EV, Fahrrad, Wandern, ÖPNV) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.modeTabsScroll}
      >
        {MODES.map(m => {
          const Icon = m.icon;
          const isActive = transportMode === m.id;
          const modeColor =
            m.id === 'hiking'
              ? colors.accentHiking
              : m.id === 'cycling'
              ? colors.accentCycling
              : m.id === 'transit'
              ? '#8B5CF6'
              : m.id === 'ev'
              ? '#10B981'
              : colors.accentDriving;

          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.modeTab,
                {
                  backgroundColor: isActive ? modeColor : colors.surfaceBorder,
                  borderColor: isActive ? modeColor : 'transparent',
                },
              ]}
              onPress={() => setTransportMode(m.id)}
              accessibilityLabel={`Modus: ${m.label}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Icon color={isActive ? '#FFFFFF' : colors.textSecondary} size={15} />
              <Text
                style={[
                  styles.modeLabel,
                  {
                    color: isActive ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* POI Quick-Filter Leiste */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.poiScroll}
      >
        {POI_QUICK_FILTERS.map(poi => {
          const isActive = activePOICategories.includes(poi.id);
          return (
            <TouchableOpacity
              key={poi.id}
              style={[
                styles.poiChip,
                {
                  backgroundColor: isActive ? colors.primary : colors.surfaceBorder,
                  borderColor: isActive ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => togglePOICategory(poi.id)}
              accessibilityLabel={`Filter: ${poi.label}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text style={styles.poiChipIcon}>{poi.icon}</Text>
              <Text
                style={[
                  styles.poiChipLabel,
                  { color: isActive ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                {poi.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    zIndex: 100,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800' },
  searchRow: {
    marginBottom: 8,
  },
  modeTabsScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  modeLabel: {
    fontSize: 12,
  },
  poiScroll: {
    gap: 6,
    paddingTop: 2,
  },
  poiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  poiChipIcon: { fontSize: 12 },
  poiChipLabel: { fontSize: 11, fontWeight: '600' },
});
