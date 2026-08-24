import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { useLocation } from '../context/LocationContext';
import { ARNavigationService } from '../services/ARNavigationService';
import { ARWaymarker } from '../types/navigation';
import {
  Camera,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  MapPin,
  Compass,
  X,
  Eye,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ARNavigationOverlayModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ARNavigationOverlayModal: React.FC<ARNavigationOverlayModalProps> = ({
  visible,
  onClose,
}) => {
  const { userLocation } = useLocation();
  const { selectedRoute, destination } = useNavigation();
  const [markers, setMarkers] = useState<ARWaymarker[]>([]);
  const [simulatedHeading, setSimulatedHeading] = useState<number>(userLocation.heading || 45);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      // Simuliert leichte Kopfbewegungen / Kompassausrichtung
      const currentHead = userLocation.heading !== undefined ? userLocation.heading : simulatedHeading;
      const res = ARNavigationService.calculateARMarkers(
        userLocation,
        currentHead,
        selectedRoute?.steps || [],
        destination
      );
      setMarkers(res);
    }, 400);

    return () => clearInterval(interval);
  }, [visible, userLocation, selectedRoute, destination, simulatedHeading]);

  const renderARIcon = (type: ARWaymarker['iconType']) => {
    switch (type) {
      case 'turn_left': return <CornerUpLeft color="#FFFFFF" size={28} />;
      case 'turn_right': return <CornerUpRight color="#FFFFFF" size={28} />;
      case 'destination': return <MapPin color="#FFFFFF" size={32} />;
      default: return <ArrowUp color="#FFFFFF" size={28} />;
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <View style={styles.cameraBackground}>
        {/* Simulierter Kamera-Sucher / HUD Grid */}
        <View style={styles.gridOverlay}>
          <View style={styles.horizonLine} />
          <View style={styles.crosshair} />
        </View>

        <SafeAreaView style={styles.safeArea}>
          {/* Header Info */}
          <View style={styles.header}>
            <View style={styles.arBadge}>
              <Eye color="#38BDF8" size={16} />
              <Text style={styles.arBadgeText}>AR LIVE WEGWEISER (3D HUD)</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>

          {/* Schwebende 3D AR-Marker */}
          <View style={styles.markersContainer} pointerEvents="none">
            {markers.map(m => (
              <View
                key={m.id}
                style={[
                  styles.arMarkerBox,
                  {
                    left: `${m.screenXPercent}%`,
                    top: `${m.screenYPercent}%`,
                    transform: [{ translateX: -70 }, { translateY: -40 }],
                  },
                ]}
              >
                <View style={[styles.arIconWrap, m.iconType === 'destination' ? styles.destIcon : styles.stepIcon]}>
                  {renderARIcon(m.iconType)}
                </View>

                <View style={styles.arContentWrap}>
                  <Text style={styles.arDist}>{m.distanceMeters} m</Text>
                  <Text style={styles.arTitle} numberOfLines={1}>{m.title}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Footer Kompass & Instruktion */}
          <View style={styles.footer}>
            <View style={styles.compassRow}>
              <Compass color="#38BDF8" size={20} />
              <Text style={styles.compassText}>Peilung: {Math.round(userLocation.heading || simulatedHeading)}° N</Text>
            </View>
            <Text style={styles.instructionPrompt}>
              Halte das Smartphone aufrecht vor dich, um Abbiegehinweise direkt auf der Straße zu sehen.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cameraBackground: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizonLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  crosshair: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderRadius: 12,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  arBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markersContainer: {
    flex: 1,
    position: 'relative',
  },
  arMarkerBox: {
    position: 'absolute',
    alignItems: 'center',
    width: 140,
  },
  arIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  stepIcon: {
    backgroundColor: '#0284C7',
  },
  destIcon: {
    backgroundColor: '#EF4444',
  },
  arContentWrap: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  arDist: {
    color: '#38BDF8',
    fontWeight: '900',
    fontSize: 13,
  },
  arTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  footer: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  compassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  compassText: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 13,
  },
  instructionPrompt: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
});
