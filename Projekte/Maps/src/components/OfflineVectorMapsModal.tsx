import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { VectorMapService } from '../services/VectorMapService';
import { VectorMapRegion } from '../types/navigation';
import { Map, Download, Trash2, CheckCircle2, HardDrive, X } from 'lucide-react-native';

interface OfflineVectorMapsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const OfflineVectorMapsModal: React.FC<OfflineVectorMapsModalProps> = ({ visible, onClose }) => {
  const [regions, setRegions] = useState<VectorMapRegion[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = async () => {
    const list = await VectorMapService.getAvailableRegions();
    setRegions([...list]);
  };

  useEffect(() => {
    if (visible) load();
  }, [visible]);

  const handleDownload = async (region: VectorMapRegion) => {
    setLoadingId(region.id);
    await VectorMapService.downloadRegion(region.id);
    await load();
    setLoadingId(null);
  };

  const handleDelete = async (region: VectorMapRegion) => {
    await VectorMapService.deleteRegion(region.id);
    await load();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <HardDrive color="#38BDF8" size={24} />
              <Text style={styles.title}>Offline-Vektorkarten (MBTiles)</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Vektorkarten ermöglichen gestochen scharfes Zoomen und Offline-Navigation ohne Funkverbindung bei minimalem Speicherbedarf.
          </Text>

          <FlatList
            data={regions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSub}>{item.country} • {item.sizeMb} MB • {item.format.toUpperCase()}</Text>
                  {item.lastUpdated && <Text style={styles.cardDate}>Aktualisiert: {item.lastUpdated}</Text>}
                </View>

                {item.isDownloaded ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.downloadedBadge}>
                      <CheckCircle2 color="#10B981" size={16} />
                      <Text style={styles.downloadedText}>Bereit</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                      <Trash2 color="#EF4444" size={16} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownload(item)}
                    disabled={loadingId === item.id}
                  >
                    {loadingId === item.id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Download color="#FFFFFF" size={15} style={{ marginRight: 4 }} />
                        <Text style={styles.downloadText}>Laden</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  desc: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  cardSub: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  cardDate: { color: '#64748B', fontSize: 10, marginTop: 2 },
  downloadBtn: { backgroundColor: '#0284C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  downloadText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  downloadedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  downloadedText: { color: '#10B981', fontWeight: '700', fontSize: 11 },
  deleteBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
});
