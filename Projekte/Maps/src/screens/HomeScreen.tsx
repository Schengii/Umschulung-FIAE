import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Modal } from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { HeaderBar } from '../components/HeaderBar';
import { MapViewComponent } from '../components/MapViewComponent';
import { RouteDetailsCard } from '../components/RouteDetailsCard';
import { TrafficAlertPanel } from '../components/TrafficAlertPanel';
import { ActiveNavigationOverlay } from '../components/ActiveNavigationOverlay';
import { GdprBanner } from '../components/GdprBanner';
import { OfflineBanner } from '../components/OfflineBanner';
import { FavoritesManagerModal } from '../components/FavoritesManagerModal';
import { WaypointManagerModal } from '../components/WaypointManagerModal';
import { TrackRecorderModal } from '../components/TrackRecorderModal';
import { CommunityHighlightsModal } from '../components/CommunityHighlightsModal';
import { HUDOverlayModal } from '../components/HUDOverlayModal';
import { ReportHazardModal } from '../components/ReportHazardModal';
import { LoopRouteModal } from '../components/LoopRouteModal';
import { BLESensorModal } from '../components/BLESensorModal';
import { OfflineVectorMapsModal } from '../components/OfflineVectorMapsModal';
import { CloudSyncModal } from '../components/CloudSyncModal';
import { ARNavigationOverlayModal } from '../components/ARNavigationOverlayModal';
import { SmartwatchCompanionModal } from '../components/SmartwatchCompanionModal';
import { AITourGuideModal } from '../components/AITourGuideModal';
import { CarPlayModal } from '../components/CarPlayModal';
import { WeatherRadarControl } from '../components/WeatherRadarControl';
import { GroupRideModal } from '../components/GroupRideModal';
import { IndoorLevelSelector } from '../components/IndoorLevelSelector';
import { SettingsScreen } from './SettingsScreen';

export const HomeScreen: React.FC = () => {
  const {
    theme,
    isSettingsOpen,
    setIsSettingsOpen,
    isHazardModalOpen,
    setIsHazardModalOpen,
    isLoopModalOpen,
    setIsLoopModalOpen,
    isBLEModalOpen,
    setIsBLEModalOpen,
    isVectorMapsModalOpen,
    setIsVectorMapsModalOpen,
    isCloudSyncModalOpen,
    setIsCloudSyncModalOpen,
    isHUDOpen,
    setIsHUDOpen,
    isAROpen,
    setIsAROpen,
    isSmartwatchOpen,
    setIsSmartwatchOpen,
    isAITourOpen,
    setIsAITourOpen,
    isCarPlayOpen,
    setIsCarPlayOpen,
    isWeatherRadarOpen,
    setIsWeatherRadarOpen,
    isGroupRideOpen,
    setIsGroupRideOpen,
    currentIndoorBuilding,
    activeIndoorLevel,
    setActiveIndoorLevel,
    activePOIs,
    destination,
    isNavigating,
  } = useNavigation();

  const [isFavoritesOpen, setIsFavoritesOpen] = React.useState(false);
  const [isWaypointsOpen, setIsWaypointsOpen] = React.useState(false);
  const [isTrackRecorderOpen, setIsTrackRecorderOpen] = React.useState(false);
  const [isHighlightsOpen, setIsHighlightsOpen] = React.useState(false);

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme.isDark || theme.isHighContrast ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Offline-Warnung */}
        <OfflineBanner />

        {/* Header */}
        <HeaderBar
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          onOpenWaypoints={() => setIsWaypointsOpen(true)}
          onOpenTrackRecorder={() => setIsTrackRecorderOpen(true)}
          onOpenHighlights={() => setIsHighlightsOpen(true)}
        />

        {/* Karte – mit 3D, Elevation-Scrubber, Indoor-Mapping, Radar & GroupRide */}
        <View style={styles.mapWrapper}>
          <MapViewComponent activePOIs={activePOIs} />

          {/* Schwebendes Wetterradar Control */}
          {isWeatherRadarOpen && (
            <WeatherRadarControl onClose={() => setIsWeatherRadarOpen(false)} />
          )}

          {/* Etagenauswahl bei erkannten Indoor-Gebäuden */}
          {currentIndoorBuilding && (
            <IndoorLevelSelector
              building={currentIndoorBuilding}
              activeLevel={activeIndoorLevel}
              onSelectLevel={setActiveIndoorLevel}
            />
          )}
        </View>

        {/* Turn-by-Turn Overlay mit AR, Smartwatch, Tacho & Audio-Player */}
        {isNavigating && <ActiveNavigationOverlay />}

        {/* Route Details Bottom-Sheet */}
        {destination && !isNavigating && <RouteDetailsCard />}
      </SafeAreaView>

      {/* Fullscreen Overlay: Traffic Radio Drawer */}
      <TrafficAlertPanel />

      {/* DSGVO Banner */}
      <GdprBanner />

      {/* Favoriten & Waypoints Modals */}
      <FavoritesManagerModal
        visible={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />

      <WaypointManagerModal
        visible={isWaypointsOpen}
        onClose={() => setIsWaypointsOpen(false)}
      />

      <TrackRecorderModal
        visible={isTrackRecorderOpen}
        onClose={() => setIsTrackRecorderOpen(false)}
      />

      <CommunityHighlightsModal
        visible={isHighlightsOpen}
        onClose={() => setIsHighlightsOpen(false)}
      />

      {/* Phase 1 & 2 Modals */}
      <ReportHazardModal
        visible={isHazardModalOpen}
        onClose={() => setIsHazardModalOpen(false)}
      />

      <LoopRouteModal
        visible={isLoopModalOpen}
        onClose={() => setIsLoopModalOpen(false)}
      />

      <BLESensorModal
        visible={isBLEModalOpen}
        onClose={() => setIsBLEModalOpen(false)}
      />

      <OfflineVectorMapsModal
        visible={isVectorMapsModalOpen}
        onClose={() => setIsVectorMapsModalOpen(false)}
      />

      <CloudSyncModal
        visible={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
      />

      <HUDOverlayModal
        visible={isHUDOpen}
        onClose={() => setIsHUDOpen(false)}
      />

      {/* Phase 3, 4 & 5 Modals */}
      <ARNavigationOverlayModal
        visible={isAROpen}
        onClose={() => setIsAROpen(false)}
      />

      <SmartwatchCompanionModal
        visible={isSmartwatchOpen}
        onClose={() => setIsSmartwatchOpen(false)}
      />

      <AITourGuideModal
        visible={isAITourOpen}
        onClose={() => setIsAITourOpen(false)}
      />

      <CarPlayModal
        visible={isCarPlayOpen}
        onClose={() => setIsCarPlayOpen(false)}
      />

      <GroupRideModal
        visible={isGroupRideOpen}
        onClose={() => setIsGroupRideOpen(false)}
      />

      {/* Settings Screen */}
      <Modal
        visible={isSettingsOpen}
        animationType="slide"
        onRequestClose={() => setIsSettingsOpen(false)}
        accessibilityViewIsModal
      >
        <SettingsScreen onClose={() => setIsSettingsOpen(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  mapWrapper: { flex: 1 },
});
