import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { CloudSyncService } from '../services/CloudSyncService';
import { useNavigation } from '../context/NavigationContext';
import { Cloud, UploadCloud, DownloadCloud, CheckCircle2, ShieldCheck, X } from 'lucide-react-native';

interface CloudSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ visible, onClose }) => {
  const { theme } = useNavigation();
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadMeta = async () => {
    const time = await CloudSyncService.getLastSyncTime();
    setLastSync(time);
  };

  useEffect(() => {
    if (visible) loadMeta();
  }, [visible]);

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const payload = await CloudSyncService.createBackupPayload(theme);
      setStatusMsg(`Backup erfolgreich erstellt (${payload.favoritesCount} Orte, ${payload.recordedTracksCount} GPX-Tracks).`);
      await loadMeta();
    } catch {
      setStatusMsg('Fehler beim Erstellen des Backups.');
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
              <Cloud color="#38BDF8" size={24} />
              <Text style={styles.title}>Cloud-Sync & Backup</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.securityBanner}>
            <ShieldCheck color="#10B981" size={18} />
            <Text style={styles.securityText}>Ende-zu-Ende verschlüsselte lokale Sicherung (DSGVO-konform)</Text>
          </View>

          <Text style={styles.desc}>
            Sichere deine gespeicherten Favoriten, Wegpunkte, aufgezeichneten GPX-Touren und Einstellungen geräteübergreifend.
          </Text>

          {lastSync && (
            <Text style={styles.syncInfo}>
              Letzter erfolgreicher Sync: {new Date(lastSync).toLocaleString()}
            </Text>
          )}

          {statusMsg && (
            <View style={styles.statusBox}>
              <CheckCircle2 color="#10B981" size={16} />
              <Text style={styles.statusText}>{statusMsg}</Text>
            </View>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.syncBtn, { backgroundColor: '#0284C7' }]}
              onPress={handleBackup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <UploadCloud color="#FFFFFF" size={18} style={{ marginRight: 6 }} />
                  <Text style={styles.syncBtnText}>Jetzt sichern</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  securityBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: 10, borderRadius: 10, marginBottom: 12 },
  securityText: { color: '#10B981', fontSize: 11, fontWeight: '700', flex: 1 },
  desc: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  syncInfo: { color: '#64748B', fontSize: 11, marginBottom: 14, fontStyle: 'italic' },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1E293B', padding: 10, borderRadius: 10, marginBottom: 14 },
  statusText: { color: '#F8FAFC', fontSize: 12, fontWeight: '600', flex: 1 },
  btnRow: { marginBottom: 12 },
  syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12 },
  syncBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
