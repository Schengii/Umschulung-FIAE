import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { BLESensorService } from '../services/BLESensorService';
import { BLESensorDevice, BLESensorMetrics } from '../types/navigation';
import {
  Bluetooth,
  Heart,
  RotateCw,
  Zap,
  Battery,
  X,
  Check,
  Activity,
} from 'lucide-react-native';

interface BLESensorModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BLESensorModal: React.FC<BLESensorModalProps> = ({ visible, onClose }) => {
  const [devices, setDevices] = useState<BLESensorDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [metrics, setMetrics] = useState<BLESensorMetrics>({});

  const scan = async () => {
    setIsScanning(true);
    const found = await BLESensorService.scanForDevices();
    setDevices(found);
    setIsScanning(false);
  };

  useEffect(() => {
    if (visible) {
      scan();
      const unsubscribe = BLESensorService.subscribeMetrics(setMetrics);
      return () => unsubscribe();
    }
  }, [visible]);

  const toggleConnect = async (dev: BLESensorDevice) => {
    if (dev.isConnected) {
      await BLESensorService.disconnectDevice(dev.id);
    } else {
      await BLESensorService.connectDevice(dev);
    }
    setDevices(prev => prev.map(d => d.id === dev.id ? { ...d, isConnected: !d.isConnected } : d));
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'heart_rate': return <Heart color="#EF4444" size={20} />;
      case 'cadence': return <RotateCw color="#38BDF8" size={20} />;
      case 'power_meter': return <Zap color="#EAB308" size={20} />;
      default: return <Activity color="#10B981" size={20} />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Bluetooth color="#38BDF8" size={24} />
              <Text style={styles.title}>Bluetooth BLE Sensoren</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>

          {/* Live Sensor Metriken Dashboard */}
          <View style={styles.metricsBox}>
            <View style={styles.metricItem}>
              <Heart color="#EF4444" size={18} />
              <Text style={styles.metricVal}>{metrics.heartRateBpm ? `${metrics.heartRateBpm} bpm` : '--'}</Text>
              <Text style={styles.metricSub}>{metrics.heartRateZone || 'Kein Puls'}</Text>
            </View>

            <View style={styles.metricItem}>
              <RotateCw color="#38BDF8" size={18} />
              <Text style={styles.metricVal}>{metrics.cadenceRpm ? `${metrics.cadenceRpm} rpm` : '--'}</Text>
              <Text style={styles.metricSub}>Trittfrequenz</Text>
            </View>

            <View style={styles.metricItem}>
              <Zap color="#EAB308" size={18} />
              <Text style={styles.metricVal}>{metrics.powerWatts ? `${metrics.powerWatts} W` : '--'}</Text>
              <Text style={styles.metricSub}>Leistung</Text>
            </View>
          </View>

          {/* Geräte-Liste */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Verfügbare Sport-Sensoren</Text>
            <TouchableOpacity style={styles.rescanBtn} onPress={scan} disabled={isScanning}>
              {isScanning ? <ActivityIndicator size="small" color="#38BDF8" /> : <Text style={styles.rescanText}>Neu scannen</Text>}
            </TouchableOpacity>
          </View>

          <FlatList
            data={devices}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.deviceRow}>
                <View style={styles.deviceIcon}>{getSensorIcon(item.type)}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceName}>{item.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Battery color="#94A3B8" size={12} />
                    <Text style={styles.deviceSub}>{item.batteryLevel}% Akku</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.connectBtn, item.isConnected && styles.connectedBtn]}
                  onPress={() => toggleConnect(item)}
                >
                  {item.isConnected ? (
                    <>
                      <Check color="#FFFFFF" size={14} style={{ marginRight: 4 }} />
                      <Text style={styles.connectText}>Verbunden</Text>
                    </>
                  ) : (
                    <Text style={styles.connectText}>Koppeln</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  metricsBox: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1E293B', padding: 14, borderRadius: 16, marginBottom: 18 },
  metricItem: { alignItems: 'center' },
  metricVal: { color: '#F8FAFC', fontWeight: '800', fontSize: 16, marginTop: 4 },
  metricSub: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { color: '#CBD5E1', fontWeight: '700', fontSize: 13 },
  rescanBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  rescanText: { color: '#38BDF8', fontWeight: '700', fontSize: 12 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 12, borderRadius: 14, marginBottom: 8 },
  deviceIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  deviceName: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  deviceSub: { color: '#94A3B8', fontSize: 11 },
  connectBtn: { backgroundColor: '#0284C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  connectedBtn: { backgroundColor: '#10B981' },
  connectText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
