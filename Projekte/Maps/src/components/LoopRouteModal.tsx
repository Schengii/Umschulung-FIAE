import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { useLocation } from '../context/LocationContext';
import { LoopPlannerService } from '../services/LoopPlannerService';
import { TransportMode } from '../types/navigation';
import {
  RotateCcw,
  Compass,
  Bike,
  Footprints,
  X,
  Check,
  Zap,
} from 'lucide-react-native';

interface LoopRouteModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LoopRouteModal: React.FC<LoopRouteModalProps> = ({ visible, onClose }) => {
  const { userLocation } = useLocation();
  const { setSelectedRoute, setDestination, setTransportMode } = useNavigation();

  const [distanceKm, setDistanceKm] = useState<number>(25);
  const [mode, setMode] = useState<TransportMode>('cycling');
  const [direction, setDirection] = useState<number>(0); // 0 = Nord, 90 = Ost, 180 = Süd, 270 = West
  const [isLoading, setIsLoading] = useState(false);

  const directions = [
    { label: 'Norden ⬆️', angle: 0 },
    { label: 'Osten ➡️', angle: 90 },
    { label: 'Süden ⬇️', angle: 180 },
    { label: 'Westen ⬅️', angle: 270 },
  ];

  const distances = mode === 'cycling' ? [15, 25, 45, 75] : [5, 10, 15, 22];

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const loopRoute = await LoopPlannerService.generateLoopRoute(
        userLocation,
        distanceKm,
        mode,
        direction
      );

      if (loopRoute) {
        setTransportMode(mode);
        setSelectedRoute(loopRoute);
        setDestination({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          name: `Rundtour (${distanceKm} km)`,
          address: 'Start & Ziel am aktuellen Standort',
        });
        onClose();
      }
    } catch (e) {
      console.warn('[LoopRouteModal] Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <RotateCcw color="#38BDF8" size={24} />
              <Text style={styles.title}>Rundtouren-Generator</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Generiert eine perfekte Schleife ab deinem aktuellen Standort und führt dich automatisch zurück.
          </Text>

          {/* Modus-Auswahl */}
          <Text style={styles.sectionLabel}>Aktivität:</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'cycling' && styles.modeBtnActive]}
              onPress={() => { setMode('cycling'); setDistanceKm(25); }}
            >
              <Bike color={mode === 'cycling' ? '#FFFFFF' : '#94A3B8'} size={20} />
              <Text style={[styles.modeBtnText, mode === 'cycling' && styles.modeBtnTextActive]}>Fahrrad</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, mode === 'hiking' && styles.modeBtnActive]}
              onPress={() => { setMode('hiking'); setDistanceKm(10); }}
            >
              <Footprints color={mode === 'hiking' ? '#FFFFFF' : '#94A3B8'} size={20} />
              <Text style={[styles.modeBtnText, mode === 'hiking' && styles.modeBtnTextActive]}>Wandern / Trail</Text>
            </TouchableOpacity>
          </View>

          {/* Distanz-Auswahl */}
          <Text style={styles.sectionLabel}>Ziel-Distanz: {distanceKm} km</Text>
          <View style={styles.pillsRow}>
            {distances.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.pill, distanceKm === d && styles.pillActive]}
                onPress={() => setDistanceKm(d)}
              >
                <Text style={[styles.pillText, distanceKm === d && styles.pillTextActive]}>{d} km</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Himmelsrichtung */}
          <Text style={styles.sectionLabel}>Haupt-Richtung:</Text>
          <View style={styles.pillsRow}>
            {directions.map(dir => (
              <TouchableOpacity
                key={dir.angle}
                style={[styles.pill, direction === dir.angle && styles.pillActive]}
                onPress={() => setDirection(dir.angle)}
              >
                <Text style={[styles.pillText, direction === dir.angle && styles.pillTextActive]}>{dir.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generieren Button */}
          <TouchableOpacity
            style={[styles.generateBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Zap color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.generateBtnText}>Rundtour berechnen</Text>
              </>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  sectionLabel: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 10,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  modeBtnText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 13,
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  pillText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 12,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  generateBtn: {
    marginTop: 24,
    marginBottom: 12,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
