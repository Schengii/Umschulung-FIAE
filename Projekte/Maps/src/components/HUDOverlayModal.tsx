import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { useLocation } from '../context/LocationContext';
import { SpeedAlertService } from '../services/SpeedAlertService';
import {
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  RotateCw,
  Merge,
  MapPin,
  X,
  FlipHorizontal,
} from 'lucide-react-native';

interface HUDOverlayModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HUDOverlayModal: React.FC<HUDOverlayModalProps> = ({ visible, onClose }) => {
  const { selectedRoute, transportMode } = useNavigation();
  const { userLocation } = useLocation();

  const speedAlert = SpeedAlertService.checkSpeedAndRoute(
    userLocation,
    transportMode,
    selectedRoute?.coordinates ?? []
  );

  const steps = selectedRoute?.steps ?? [];
  const currentStep = steps[0];

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'corner-up-left': return <CornerUpLeft color="#00FF66" size={72} />;
      case 'corner-up-right': return <CornerUpRight color="#00FF66" size={72} />;
      case 'rotate-cw': return <RotateCw color="#00FF66" size={72} />;
      case 'merge': return <Merge color="#00FF66" size={72} />;
      case 'map-pin': return <MapPin color="#00FF66" size={72} />;
      default: return <ArrowUp color="#00FF66" size={72} />;
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Mirror Wrap: CSS scaleY(-1) spiegelt den Bildschirm perfekt für die Windschutzscheibe */}
        <View style={styles.hudMirrorWrap}>
          {/* Header Controls */}
          <View style={styles.hudHeader}>
            <View style={styles.hudBadge}>
              <FlipHorizontal color="#00FF66" size={16} />
              <Text style={styles.hudBadgeText}>HUD WINDSHIELD MODE (MIRRORED)</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>

          {/* Abbiege-Anweisung HUD */}
          <View style={styles.instructionContainer}>
            <View style={styles.iconBox}>
              {renderIcon(currentStep?.iconName)}
            </View>
            <Text style={styles.distanceHuge}>
              {currentStep && currentStep.distanceMeter > 0 ? `${currentStep.distanceMeter}m` : 'JETZT'}
            </Text>
            <Text style={styles.instructionHuge} numberOfLines={2}>
              {currentStep?.instruction || 'Dem Straßenverlauf folgen'}
            </Text>
          </View>

          {/* Riesiger Tacho & Limit */}
          <View style={styles.speedometerHUD}>
            <View style={styles.speedValueBox}>
              <Text style={[styles.speedText, speedAlert.isSpeeding && styles.speedingText]}>
                {speedAlert.currentSpeedKmh}
              </Text>
              <Text style={styles.speedUnit}>KM/H</Text>
            </View>

            <View style={styles.limitCircle}>
              <Text style={styles.limitText}>{speedAlert.speedLimitKmh}</Text>
            </View>
          </View>

          {/* Footer: ETA & Reststrecke */}
          <View style={styles.footerHUD}>
            <View style={styles.footerItem}>
              <Text style={styles.footerVal}>{selectedRoute?.durationMinutes || 0} MIN</Text>
              <Text style={styles.footerLbl}>RESTZEIT</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerVal}>{selectedRoute?.distanceKm || 0} KM</Text>
              <Text style={styles.footerLbl}>DISTANZ</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hudMirrorWrap: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    transform: [{ scaleY: -1 }], // Spiegelung für Windschutzscheibe
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#00FF66',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hudBadgeText: {
    color: '#00FF66',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#111111',
    borderRadius: 20,
  },
  instructionContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  iconBox: {
    marginBottom: 8,
  },
  distanceHuge: {
    color: '#00FF66',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 1,
  },
  instructionHuge: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
  speedometerHUD: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  speedValueBox: {
    alignItems: 'center',
  },
  speedText: {
    color: '#00FF66',
    fontSize: 84,
    fontWeight: '900',
    lineHeight: 88,
  },
  speedingText: {
    color: '#FF0033',
  },
  speedUnit: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  limitCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 6,
    borderColor: '#FF0033',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '900',
  },
  footerHUD: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    paddingTop: 16,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerVal: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  footerLbl: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
});
