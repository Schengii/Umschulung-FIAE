import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { GpxService } from '../services/GpxService';
import { ElevationProfileChart } from './ElevationProfileChart';
import {
  Mountain,
  Clock,
  AlertTriangle,
  Play,
  Square,
  Navigation,
  CheckCircle2,
  RefreshCw,
  Share2,
  Train,
  Zap,
  Fuel,
  TrendingUp,
} from 'lucide-react-native';

import { WeatherService, WeatherCondition } from '../services/WeatherService';
import { Sun, CloudRain } from 'lucide-react-native';

export const RouteDetailsCard: React.FC = () => {
  const {
    transportMode,
    selectedRoute,
    availableRoutes,
    setSelectedRoute,
    destination,
    isNavigating,
    startNavigation,
    stopNavigation,
    isRouteLoading,
    routeError,
    theme,
  } = useNavigation();

  const [destWeather, setDestWeather] = React.useState<WeatherCondition | null>(null);

  React.useEffect(() => {
    if (destination) {
      WeatherService.getWeatherForLocation(destination).then(res => setDestWeather(res));
    }
  }, [destination?.latitude, destination?.longitude]);

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  // Ladeindikator
  if (isRouteLoading) {
    return (
      <View style={[styles.cardContainer, { backgroundColor: colors.cardBg, borderColor: colors.surfaceBorder, alignItems: 'center', paddingVertical: 20 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Route wird berechnet…</Text>
      </View>
    );
  }

  // Fehler-Anzeige
  if (routeError) {
    return (
      <View style={[styles.cardContainer, { backgroundColor: colors.cardBg, borderColor: colors.surfaceBorder, alignItems: 'center', paddingVertical: 16 }]}>
        <RefreshCw color={colors.trafficJam} size={24} />
        <Text style={[styles.loadingText, { color: colors.trafficJam, marginTop: 8 }]}>{routeError}</Text>
      </View>
    );
  }

  if (!selectedRoute) return null;

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.cardBg, borderColor: colors.surfaceBorder }]}>
      {/* Route Switcher Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routeSelectorScroll}>
        {availableRoutes.map(rt => (
          <TouchableOpacity
            key={rt.id}
            style={[
              styles.routePill,
              { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
              selectedRoute.id === rt.id && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSelectedRoute(rt)}
            accessibilityLabel={`Route ${rt.title} wählen`}
          >
            <Text
              style={[
                styles.routePillText,
                { color: colors.textSecondary },
                selectedRoute.id === rt.id && { color: '#FFFFFF' },
              ]}
            >
              {rt.title} • {rt.durationMinutes} Min
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Main Details Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.mainTimeText, { color: colors.textPrimary, fontSize: 24 * theme.fontSizeMultiplier }]}>
            {selectedRoute.durationMinutes} Min
          </Text>
          <Text style={[styles.subText, { color: colors.textSecondary, fontSize: 13 * theme.fontSizeMultiplier }]}>
            {selectedRoute.distanceKm} km • Ankunft ca. {new Date(Date.now() + selectedRoute.durationMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          {/* Spritpreis / EV-Kosten oder ÖPNV Ticket-Badge */}
          <View style={styles.costBadgeRow}>
            {selectedRoute.estimatedFuelCostEur !== undefined && (
              <View style={[styles.costBadge, { backgroundColor: colors.surfaceBorder }]}>
                <Fuel size={12} color={colors.textSecondary} />
                <Text style={[styles.costBadgeText, { color: colors.textPrimary }]}>
                  ~{selectedRoute.estimatedFuelCostEur} € Sprit
                </Text>
              </View>
            )}

            {selectedRoute.estimatedEnergyKwh !== undefined && (
              <View style={[styles.costBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Zap size={12} color="#10B981" />
                <Text style={[styles.costBadgeText, { color: '#10B981' }]}>
                  ~{selectedRoute.estimatedEnergyKwh} kWh Energie
                </Text>
              </View>
            )}

            {selectedRoute.transitFareEur !== undefined && (
              <View style={[styles.costBadge, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Train size={12} color="#8B5CF6" />
                <Text style={[styles.costBadgeText, { color: '#8B5CF6' }]}>
                  Ticket: {selectedRoute.transitFareEur.toFixed(2)} € ({selectedRoute.transitChanges} Umstiege)
                </Text>
              </View>
            )}
          </View>

          {destWeather && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
              {destWeather.isRainy ? <CloudRain size={13} color={colors.secondary} /> : <Sun size={13} color="#F59E0B" />}
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontWeight: '600' }}>
                {destWeather.temperatureC}°C, {destWeather.weatherDescription}
              </Text>
            </View>
          )}
        </View>

        {/* Start / Stop Navigation & GPX Export Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.gpxButton, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
            onPress={() => GpxService.exportAndShareGpx(selectedRoute)}
            accessibilityLabel="Route als GPX exportieren"
          >
            <Share2 color={colors.primary} size={18} />
          </TouchableOpacity>

          {!isNavigating ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={startNavigation}
              accessibilityLabel="Navigation jetzt starten"
              accessibilityRole="button"
            >
              <Play color="#FFFFFF" size={18} fill="#FFFFFF" />
              <Text style={styles.actionButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.trafficJam }]}
              onPress={stopNavigation}
              accessibilityLabel="Navigation beenden"
              accessibilityRole="button"
            >
              <Square color="#FFFFFF" size={16} fill="#FFFFFF" />
              <Text style={styles.actionButtonText}>Stopp</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Komoot Outdoor Profile (Höhenprofil & Scrubber) */}
      {(transportMode === 'hiking' || transportMode === 'cycling') && (
        <View style={[styles.komootProfileBox, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <ElevationProfileChart />

          {/* Surface Breakdown */}
          {selectedRoute.surfaceBreakdown && (
            <View style={[styles.surfaceBarContainer, { marginTop: 8 }]}>
              <View style={[styles.surfaceSegment, { width: `${selectedRoute.surfaceBreakdown.pavedPercent}%`, backgroundColor: '#3B82F6' }]} />
              <View style={[styles.surfaceSegment, { width: `${selectedRoute.surfaceBreakdown.unpavedPercent}%`, backgroundColor: '#EAB308' }]} />
              <View style={[styles.surfaceSegment, { width: `${selectedRoute.surfaceBreakdown.trailPercent}%`, backgroundColor: '#10B981' }]} />
            </View>
          )}

          <View style={styles.surfaceLegendRow}>
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Asphalt: {selectedRoute.surfaceBreakdown?.pavedPercent}%
            </Text>
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Schotter: {selectedRoute.surfaceBreakdown?.unpavedPercent}%
            </Text>
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Trail: {selectedRoute.surfaceBreakdown?.trailPercent}%
            </Text>
          </View>
        </View>
      )}

      {/* ÖPNV Transit Etappen Liste */}
      {transportMode === 'transit' && selectedRoute.steps && (
        <View style={[styles.transitBox, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.transitTitle, { color: colors.textPrimary }]}>ÖPNV Verbindungsschritte:</Text>
          {selectedRoute.steps.slice(0, 3).map((st, i) => (
            <View key={i} style={styles.transitStepRow}>
              <View style={[styles.transitStepDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={[styles.transitStepText, { color: colors.textSecondary }]} numberOfLines={1}>
                {st.instruction}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* EV Ladesäulen Information */}
      {transportMode === 'ev' && selectedRoute.evStops && selectedRoute.evStops.length > 0 && (
        <View style={[styles.evInfoBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: '#10B981' }]}>
          <Zap color="#10B981" size={16} />
          <Text style={[styles.evInfoText, { color: '#10B981' }]}>
            {selectedRoute.evStops[0].name} ({selectedRoute.evStops[0].chargeTimeMinutes} Min. Schnellladen)
          </Text>
        </View>
      )}

      {/* Live Warnings */}
      {selectedRoute.warnings && selectedRoute.warnings.length > 0 && (
        <View style={[styles.warningBanner, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.trafficJam }]}>
          <AlertTriangle color={colors.trafficJam} size={16} />
          <Text style={[styles.warningText, { color: colors.trafficJam }]}>
            {selectedRoute.warnings[0]}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  routeSelectorScroll: {
    marginBottom: 10,
  },
  routePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
  },
  routePillText: {
    fontWeight: '600',
    fontSize: 11,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainTimeText: {
    fontWeight: '800',
  },
  subText: {
    marginTop: 1,
  },
  costBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  costBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  costBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 3,
  },
  gpxButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  komootProfileBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  surfaceBarContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  surfaceSegment: {
    height: '100%',
  },
  surfaceLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
  },
  transitBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  transitTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  transitStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  transitStepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  transitStepText: {
    fontSize: 11,
    flex: 1,
  },
  evInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  evInfoText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  warningText: {
    fontWeight: '600',
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
});
