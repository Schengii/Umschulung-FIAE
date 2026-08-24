import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { ElevationPoint } from '../types/navigation';
import { TrendingUp, ArrowDownRight, Compass } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width - 32;
const CHART_HEIGHT = 90;
const CHART_PADDING = 8;

export const ElevationProfileChart: React.FC = () => {
  const { selectedRoute, theme, setHighlightedRoutePoint } = useNavigation();
  const [scrubberIndex, setScrubberIndex] = useState<number | null>(null);

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const profile: ElevationPoint[] = selectedRoute?.elevationProfile || [];
  const count = profile.length;

  const elevations = count > 0 ? profile.map(p => p.elevation) : [300, 320, 310, 350, 420, 390, 440];
  const minEle = Math.min(...elevations);
  const maxEle = Math.max(...elevations);
  const eleRange = Math.max(1, maxEle - minEle);

  const points = elevations.map((ele, idx) => {
    const x = CHART_PADDING + (idx / Math.max(1, elevations.length - 1)) * (SCREEN_WIDTH - 2 * CHART_PADDING);
    const y = CHART_HEIGHT - CHART_PADDING - ((ele - minEle) / eleRange) * (CHART_HEIGHT - 2 * CHART_PADDING);
    return { x, y, ele, originalPoint: profile[idx] };
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => handleTouch(evt.nativeEvent.locationX),
      onPanResponderRelease: () => {
        setScrubberIndex(null);
        setHighlightedRoutePoint(null);
      },
    })
  ).current;

  const handleTouch = (touchX: number) => {
    if (points.length === 0) return;
    const clampedX = Math.max(CHART_PADDING, Math.min(touchX, SCREEN_WIDTH - CHART_PADDING));
    const ratio = (clampedX - CHART_PADDING) / (SCREEN_WIDTH - 2 * CHART_PADDING);
    const idx = Math.min(Math.round(ratio * (points.length - 1)), points.length - 1);

    setScrubberIndex(idx);
    const pt = points[idx];
    if (pt?.originalPoint?.coordinate) {
      setHighlightedRoutePoint(pt.originalPoint.coordinate);
    }
  };

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? SCREEN_WIDTH} ${CHART_HEIGHT} L ${points[0]?.x ?? 0} ${CHART_HEIGHT} Z`;

  const activePoint = scrubberIndex !== null ? points[scrubberIndex] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceBorder }]}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.statRow}>
          <TrendingUp color={colors.accentHiking} size={15} />
          <Text style={[styles.statText, { color: colors.textPrimary }]}>
            +{selectedRoute?.elevationGainMeters ?? 0} m
          </Text>
          <ArrowDownRight color={colors.secondary} size={15} style={{ marginLeft: 8 }} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            -{selectedRoute?.elevationLossMeters ?? 0} m
          </Text>
        </View>

        {activePoint ? (
          <View style={styles.scrubberBadge}>
            <Text style={styles.scrubberBadgeText}>
              📍 {activePoint.originalPoint?.distanceKm ?? 0} km | {activePoint.ele} m ({activePoint.originalPoint?.gradientPercent ?? 0}%)
            </Text>
          </View>
        ) : (
          <Text style={[styles.rangeText, { color: colors.textSecondary }]}>
            Min: {minEle} m • Max: {maxEle} m (Scrubbar)
          </Text>
        )}
      </View>

      {/* SVG Chart mit Touch Scrubber */}
      <View {...panResponder.panHandlers} style={styles.svgWrapper}>
        <Svg width={SCREEN_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="eleGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.accentHiking} stopOpacity="0.45" />
              <Stop offset="100%" stopColor={colors.accentHiking} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Flächenfüllung */}
          <Path d={areaD} fill="url(#eleGrad)" />

          {/* Profil-Linie */}
          <Path d={pathD} stroke={colors.accentHiking} strokeWidth={2.5} fill="none" />

          {/* Aktiver Scrubber Cursor */}
          {activePoint && (
            <>
              <Line
                x1={activePoint.x}
                y1={0}
                x2={activePoint.x}
                y2={CHART_HEIGHT}
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeDasharray="4,4"
              />
              <Circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={6}
                fill={colors.accentHiking}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            </>
          )}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 3,
  },
  rangeText: {
    fontSize: 11,
  },
  scrubberBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scrubberBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  svgWrapper: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
  },
});
