import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '../context/NavigationContext';
import { useLocation } from '../context/LocationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { VoiceService } from '../services/VoiceService';
import { WeatherService, WeatherCondition } from '../services/WeatherService';
import { SpeedAlertService } from '../services/SpeedAlertService';
import { SmartwatchSyncService } from '../services/SmartwatchSyncService';
import { AudioPlayerService } from '../services/AudioPlayerService';
import { NavigationStep } from '../types/navigation';
import { NavigationAudioPlayer } from './NavigationAudioPlayer';
import {
  X,
  Navigation,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  MapPin,
  RotateCw,
  Merge,
  Volume2,
  VolumeX,
  Sun,
  CloudRain,
  AlertTriangle,
  FlipHorizontal,
  Camera,
  Layers,
  Eye,
  Watch,
} from 'lucide-react-native';

export const ActiveNavigationOverlay: React.FC = () => {
  const {
    selectedRoute,
    stopNavigation,
    theme,
    transportMode,
    setIsHUDOpen,
    setIsAROpen,
    setIsSmartwatchOpen,
    setIsHazardModalOpen,
    is3DMode,
    setIs3DMode,
  } = useNavigation();

  const { userLocation } = useLocation();
  const [isMuted, setIsMuted] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);

  const speedAlert = SpeedAlertService.checkSpeedAndRoute(
    userLocation,
    transportMode,
    selectedRoute?.coordinates ?? []
  );

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const steps = selectedRoute?.steps ?? [];
  const currentStep: NavigationStep | undefined = steps[currentStepIndex] ?? steps[0];
  const nextStep: NavigationStep | undefined = steps[currentStepIndex + 1];

  // Smartwatch-Synchronisation bei Standortwechsel & Schritten
  useEffect(() => {
    if (selectedRoute) {
      const eta = `${selectedRoute.durationMinutes} min`;
      SmartwatchSyncService.updateNavigationData(currentStep, eta, userLocation.speed ? Math.round(110 + userLocation.speed * 4) : 124);
    }
  }, [currentStep, selectedRoute, userLocation]);

  // Wetter beim Start der Navigation laden
  useEffect(() => {
    if (userLocation) {
      WeatherService.getWeatherForLocation(userLocation).then(res => setWeather(res));
    }
  }, [userLocation.latitude, userLocation.longitude]);

  // Sprachausgabe mit Audio-Ducking (Musik wird leiser während Sprache)
  useEffect(() => {
    if (currentStep && !isMuted) {
      AudioPlayerService.setAudioDucking(true);
      VoiceService.speakInstruction(currentStep.instruction);
      setTimeout(() => AudioPlayerService.setAudioDucking(false), 2500);
    }
  }, [currentStepIndex, isMuted, currentStep?.instruction]);

  // Haptics Alert Trigger bei Geschwindigkeits- / Off-Route Warnung
  useEffect(() => {
    if (speedAlert.isSpeeding || speedAlert.isOffRoute) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // Fallback
      }
    }
  }, [speedAlert.isSpeeding, speedAlert.isOffRoute]);

  if (!selectedRoute || !currentStep) return null;

  const renderIcon = (iconName: string, size = 32, color = '#FFFFFF') => {
    switch (iconName) {
      case 'corner-up-left': return <CornerUpLeft color={color} size={size} />;
      case 'corner-up-right': return <CornerUpRight color={color} size={size} />;
      case 'rotate-cw': return <RotateCw color={color} size={size} />;
      case 'merge': return <Merge color={color} size={size} />;
      case 'map-pin': return <MapPin color={color} size={size} />;
      default: return <ArrowUp color={color} size={size} />;
    }
  };

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      {/* Oberer Banner: Aktuelle Abbiegeanweisung & Spurassistent */}
      <View style={[styles.topCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
            {renderIcon(currentStep.iconName, 36, '#FFFFFF')}
          </View>
          <View style={styles.instructionBox}>
            <Text style={[styles.distanceText, { color: colors.primary }]}>
              in {currentStep.distanceMeter > 0 ? `${currentStep.distanceMeter} m` : 'Kürze'}
            </Text>
            <Text
              style={[styles.instructionText, { color: colors.textPrimary, fontSize: 16 * theme.fontSizeMultiplier }]}
              numberOfLines={2}
            >
              {currentStep.instruction}
            </Text>
          </View>
        </View>

        {/* Spurassistent (Lane Guidance) */}
        {currentStep.lanes && currentStep.lanes.length > 0 && (
          <View style={styles.laneGuidanceRow}>
            {currentStep.lanes.map((lane, idx) => (
              <View
                key={idx}
                style={[
                  styles.laneBox,
                  {
                    backgroundColor: lane.active ? colors.primary : 'rgba(100, 116, 139, 0.3)',
                    borderColor: lane.active ? '#FFFFFF' : 'transparent',
                  },
                ]}
              >
                <ArrowUp
                  color={lane.active ? '#FFFFFF' : '#94A3B8'}
                  size={16}
                  style={lane.directions.includes('left') ? { transform: [{ rotate: '-45deg' }] } : lane.directions.includes('right') ? { transform: [{ rotate: '45deg' }] } : {}}
                />
              </View>
            ))}
          </View>
        )}

        {/* Nächster Schritt Vorschau */}
        {nextStep && (
          <View style={[styles.nextStepRow, { borderTopColor: colors.surfaceBorder }]}>
            <Text style={[styles.nextLabel, { color: colors.textSecondary }]}>Danach: </Text>
            <Text style={[styles.nextText, { color: colors.textPrimary }]} numberOfLines={1}>
              {nextStep.instruction}
            </Text>
          </View>
        )}

        {/* Speed / Off-route Warning Banner */}
        {speedAlert.isOffRoute && (
          <View style={[styles.alertBanner, { backgroundColor: colors.trafficJam }]}>
            <AlertTriangle color="#FFFFFF" size={16} />
            <Text style={styles.alertBannerText}>⚠️ Route verlassen – Neuberechnung...</Text>
          </View>
        )}
      </View>

      {/* Tacho-Widget */}
      <View style={[
        styles.speedometerContainer,
        { backgroundColor: colors.surface, borderColor: speedAlert.isSpeeding ? colors.trafficJam : colors.surfaceBorder }
      ]}>
        <Text style={[styles.speedValue, { color: speedAlert.isSpeeding ? colors.trafficJam : colors.textPrimary }]}>
          {speedAlert.currentSpeedKmh}
        </Text>
        <Text style={[styles.speedUnit, { color: colors.textSecondary }]}>km/h</Text>
        <View style={[styles.speedLimitBadge, { borderColor: colors.trafficJam }]}>
          <Text style={[styles.speedLimitText, { color: colors.textPrimary }]}>{speedAlert.speedLimitKmh}</Text>
        </View>
      </View>

      {/* Floating Action Buttons während Navigation (AR, Smartwatch, HUD, 3D, Hazard) */}
      <View style={styles.floatingNavControls}>
        {/* AR Fußgänger Modus (Besonders genial für Wandern/Stadt) */}
        <TouchableOpacity
          style={[styles.floatingActionBtn, { backgroundColor: '#38BDF8' }]}
          onPress={() => setIsAROpen(true)}
          accessibilityLabel="AR Live-Kamera Wegweiser"
        >
          <Eye color="#FFFFFF" size={20} />
        </TouchableOpacity>

        {/* Smartwatch Companion Sync Status */}
        <TouchableOpacity
          style={[styles.floatingActionBtn, { backgroundColor: '#6366F1' }]}
          onPress={() => setIsSmartwatchOpen(true)}
          accessibilityLabel="Smartwatch Begleiter-Sync"
        >
          <Watch color="#FFFFFF" size={20} />
        </TouchableOpacity>

        {/* 1-Tap Gefahr/Blitzer melden */}
        <TouchableOpacity
          style={[styles.floatingActionBtn, { backgroundColor: '#EF4444' }]}
          onPress={() => setIsHazardModalOpen(true)}
          accessibilityLabel="Gefahr oder Blitzer melden"
        >
          <Camera color="#FFFFFF" size={20} />
        </TouchableOpacity>

        {/* 3D-Kamera Toggle */}
        <TouchableOpacity
          style={[styles.floatingActionBtn, { backgroundColor: is3DMode ? colors.primary : colors.surfaceBorder }]}
          onPress={() => setIs3DMode(prev => !prev)}
          accessibilityLabel="3D-Kamera umschalten"
        >
          <Layers color="#FFFFFF" size={20} />
        </TouchableOpacity>

        {/* Windshield HUD Modus */}
        <TouchableOpacity
          style={[styles.floatingActionBtn, { backgroundColor: '#0F172A' }]}
          onPress={() => setIsHUDOpen(true)}
          accessibilityLabel="HUD Windschutzscheiben-Modus"
        >
          <FlipHorizontal color="#00FF66" size={20} />
        </TouchableOpacity>
      </View>

      {/* Unterer Bereich: Audio Player + Metriken & Stop-Button */}
      <View>
        <NavigationAudioPlayer />

        <View style={[styles.bottomCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {selectedRoute.durationMinutes} min
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Restzeit</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {selectedRoute.distanceKm} km
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Strecke</Text>
            </View>

            {weather && (
              <>
                <View style={styles.divider} />
                <View style={styles.metricItem}>
                  <View style={styles.weatherRow}>
                    {weather.isRainy ? <CloudRain size={16} color={colors.secondary} /> : <Sun size={16} color="#F59E0B" />}
                    <Text style={[styles.metricValue, { color: colors.textPrimary, marginLeft: 4 }]}>
                      {weather.temperatureC}°C
                    </Text>
                  </View>
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    {weather.weatherDescription}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.surfaceBorder }]}
              onPress={() => {
                const muted = !isMuted;
                setIsMuted(muted);
                if (muted) VoiceService.stop();
              }}
              accessibilityLabel={isMuted ? 'Ton einschalten' : 'Ton stummschalten'}
            >
              {isMuted ? <VolumeX color={colors.textPrimary} size={22} /> : <Volume2 color={colors.primary} size={22} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: colors.trafficJam }]}
              onPress={stopNavigation}
              accessibilityLabel="Navigation beenden"
            >
              <X color="#FFFFFF" size={20} style={{ marginRight: 6 }} />
              <Text style={styles.stopText}>Beenden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    bottom: 24,
    justifyContent: 'space-between',
    zIndex: 900,
  },
  topCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  instructionBox: {
    flex: 1,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  instructionText: {
    fontWeight: '700',
    lineHeight: 22,
  },
  laneGuidanceRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  laneBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  nextText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  bottomCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    marginHorizontal: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
  },
  stopText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  alertBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },
  speedometerContainer: {
    position: 'absolute',
    left: 12,
    bottom: 150,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  speedValue: { fontSize: 20, fontWeight: '800', lineHeight: 22 },
  speedUnit: { fontSize: 9, fontWeight: '700' },
  speedLimitBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedLimitText: { fontSize: 9, fontWeight: '800' },
  floatingNavControls: {
    position: 'absolute',
    right: 12,
    bottom: 150,
    gap: 10,
  },
  floatingActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
