import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { SmartwatchSyncService } from '../services/SmartwatchSyncService';
import { SmartwatchSyncState } from '../types/navigation';
import { Watch, Heart, Navigation, Vibrate, Battery, CheckCircle2, X } from 'lucide-react-native';

interface SmartwatchCompanionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SmartwatchCompanionModal: React.FC<SmartwatchCompanionModalProps> = ({
  visible,
  onClose,
}) => {
  const [syncState, setSyncState] = useState<SmartwatchSyncState>(SmartwatchSyncService.getSyncState());

  useEffect(() => {
    if (visible) {
      const unsub = SmartwatchSyncService.subscribe(setSyncState);
      return () => unsub();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Watch color="#38BDF8" size={24} />
              <Text style={styles.title}>Smartwatch Begleiter-Sync</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>

          {/* Smartwatch Simulator Rahmen */}
          <View style={styles.watchWrapper}>
            <View style={styles.watchBezel}>
              <View style={styles.watchScreen}>
                {/* Watch Top Bar */}
                <View style={styles.watchTopBar}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Heart color="#EF4444" size={12} />
                    <Text style={styles.watchHrText}>{syncState.currentHeartRate || 132}</Text>
                  </View>
                  <Text style={styles.watchEtaText}>{syncState.estimatedArrival}</Text>
                </View>

                {/* Main Instruction */}
                <View style={styles.watchNavBody}>
                  <Navigation color="#38BDF8" size={28} />
                  <Text style={styles.watchDist}>{syncState.distanceToTurnMeters} m</Text>
                  <Text style={styles.watchInst} numberOfLines={2}>{syncState.nextTurnInstruction}</Text>
                </View>

                {/* Haptik Indikator */}
                <View style={styles.watchHapticRow}>
                  <Vibrate color="#10B981" size={12} />
                  <Text style={styles.watchHapticText}>Haptik: {syncState.hapticPattern}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Details & Status */}
          <View style={styles.statusBox}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Gekoppelte Smartwatch:</Text>
              <Text style={styles.statusVal}>{syncState.watchModel}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Akku-Stand:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Battery color="#10B981" size={14} />
                <Text style={styles.statusVal}>{syncState.batteryPercent}%</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Turn-by-Turn Haptik:</Text>
              <Text style={[styles.statusVal, { color: '#10B981' }]}>Aktiviert (Vibration am Handgelenk)</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  watchWrapper: { alignItems: 'center', marginVertical: 14 },
  watchBezel: {
    width: 170,
    height: 190,
    borderRadius: 36,
    backgroundColor: '#1E293B',
    borderWidth: 4,
    borderColor: '#334155',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  watchScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 26,
    padding: 10,
    justifyContent: 'space-between',
  },
  watchTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  watchHrText: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
  watchEtaText: { color: '#94A3B8', fontSize: 10, fontWeight: '700' },
  watchNavBody: { alignItems: 'center', marginVertical: 4 },
  watchDist: { color: '#38BDF8', fontSize: 18, fontWeight: '900', marginTop: 2 },
  watchInst: { color: '#FFFFFF', fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  watchHapticRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  watchHapticText: { color: '#10B981', fontSize: 8, fontWeight: '700' },
  statusBox: { backgroundColor: '#1E293B', borderRadius: 14, padding: 14, gap: 8, marginBottom: 10 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { color: '#94A3B8', fontSize: 12 },
  statusVal: { color: '#F8FAFC', fontWeight: '700', fontSize: 12 },
});
