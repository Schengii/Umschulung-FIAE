import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { CarPlaySyncService } from '../services/CarPlaySyncService';
import { useNavigation } from '../context/NavigationContext';
import { CarPlayDisplayState } from '../types/navigation';
import { Car, Fuel, Coffee, Utensils, Navigation, X, ShieldAlert, Zap } from 'lucide-react-native';

interface CarPlayModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CarPlayModal: React.FC<CarPlayModalProps> = ({ visible, onClose }) => {
  const { selectedRoute } = useNavigation();
  const [carState, setCarState] = useState<CarPlayDisplayState>(CarPlaySyncService.getState());

  useEffect(() => {
    if (visible) {
      const unsub = CarPlaySyncService.subscribe(setCarState);
      return () => unsub();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* CarPlay Widescreen Header */}
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Car color="#38BDF8" size={24} />
            <Text style={styles.displayModeTitle}>
              {carState.displayMode === 'carplay' ? 'Apple CarPlay' : 'Android Auto'} Infotainment
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={styles.switchModeBtn}
              onPress={() => CarPlaySyncService.toggleDisplayMode()}
            >
              <Text style={styles.switchModeText}>Modus wechseln</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Simulierte Auto-Display Ansicht */}
        <View style={styles.carScreenWrapper}>
          <View style={styles.dashboard}>
            {/* Linke Seite: Navigation & Spuranweisung */}
            <View style={styles.leftNavCard}>
              <Navigation color="#38BDF8" size={40} />
              <Text style={styles.nextTurnDist}>In 450 m</Text>
              <Text style={styles.nextTurnInst} numberOfLines={2}>
                {selectedRoute?.steps[0]?.instruction || 'Dem Straßenverlauf auf der Autobahn folgen'}
              </Text>

              {/* Tacho & Speed Limit */}
              <View style={styles.carSpeedRow}>
                <Text style={styles.carSpeedVal}>{carState.currentSpeedKmh}</Text>
                <Text style={styles.carSpeedUnit}>km/h</Text>
                <View style={styles.carLimitBadge}>
                  <Text style={styles.carLimitText}>{carState.speedLimitKmh}</Text>
                </View>
              </View>
            </View>

            {/* Rechte Seite: Schnelltasten (Tankstellen, Rastplätze, Schnelllader) */}
            <View style={styles.rightActionPanel}>
              <Text style={styles.panelTitle}>Schnellsuche entlang Route</Text>

              <TouchableOpacity
                style={[styles.quickBtn, carState.quickPOIFilter === 'gas_station' && styles.quickBtnActive]}
                onPress={() => CarPlaySyncService.setQuickPOIFilter('gas_station')}
              >
                <Fuel color="#F59E0B" size={20} />
                <Text style={styles.quickBtnText}>Günstigste Tankstellen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickBtn, carState.quickPOIFilter === 'rest_area' && styles.quickBtnActive]}
                onPress={() => CarPlaySyncService.setQuickPOIFilter('rest_area')}
              >
                <Coffee color="#38BDF8" size={20} />
                <Text style={styles.quickBtnText}>Rastplätze & WCs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickBtn, carState.quickPOIFilter === 'fast_food' && styles.quickBtnActive]}
                onPress={() => CarPlaySyncService.setQuickPOIFilter('fast_food')}
              >
                <Zap color="#10B981" size={20} />
                <Text style={styles.quickBtnText}>HPC Schnelllader (350kW)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  displayModeTitle: { color: '#F8FAFC', fontWeight: '800', fontSize: 16 },
  switchModeBtn: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  switchModeText: { color: '#38BDF8', fontWeight: '700', fontSize: 12 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  carScreenWrapper: { flex: 1, backgroundColor: '#0B1120', borderRadius: 20, borderWidth: 3, borderColor: '#1E293B', padding: 16 },
  dashboard: { flex: 1, flexDirection: 'row', gap: 16 },
  leftNavCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 16, padding: 16, justifyContent: 'space-between', borderWidth: 1, borderColor: '#334155' },
  nextTurnDist: { color: '#38BDF8', fontSize: 28, fontWeight: '900', marginTop: 8 },
  nextTurnInst: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginTop: 4 },
  carSpeedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  carSpeedVal: { color: '#FFFFFF', fontSize: 36, fontWeight: '900' },
  carSpeedUnit: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  carLimitBadge: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: '#EF4444', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  carLimitText: { color: '#000000', fontSize: 14, fontWeight: '900' },
  rightActionPanel: { flex: 1, backgroundColor: '#1E293B', borderRadius: 16, padding: 16, justifyContent: 'space-around', borderWidth: 1, borderColor: '#334155' },
  panelTitle: { color: '#94A3B8', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0F172A', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  quickBtnActive: { borderColor: '#38BDF8', backgroundColor: 'rgba(56, 189, 248, 0.1)' },
  quickBtnText: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
});
