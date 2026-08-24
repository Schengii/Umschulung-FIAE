import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { TrackRecordingService } from '../services/TrackRecordingService';
import { BLESensorService } from '../services/BLESensorService';
import { RecordedTrack, BLESensorMetrics } from '../types/navigation';
import { Play, Square, Share2, Trash2, X, Compass, MapPin, Heart, RotateCw, Zap } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const TrackRecorderModal: React.FC<Props> = ({ visible, onClose }) => {
  const { theme } = useNavigation();
  const [isRecording, setIsRecording] = useState(TrackRecordingService.getIsRecording());
  const [currentTrack, setCurrentTrack] = useState<RecordedTrack | null>(TrackRecordingService.getCurrentTrack());
  const [savedTracks, setSavedTracks] = useState<RecordedTrack[]>([]);
  const [bleMetrics, setBleMetrics] = useState<BLESensorMetrics>({});

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const loadSavedTracks = async () => {
    const tracks = await TrackRecordingService.getSavedTracks();
    setSavedTracks(tracks);
  };

  useEffect(() => {
    if (visible) {
      loadSavedTracks();
      setIsRecording(TrackRecordingService.getIsRecording());
      setCurrentTrack(TrackRecordingService.getCurrentTrack());
      const unsub = BLESensorService.subscribeMetrics(setBleMetrics);
      return () => unsub();
    }
  }, [visible]);

  // Intervall zum Aktualisieren des aktiven Recording-Status
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setCurrentTrack(TrackRecordingService.getCurrentTrack());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStart = () => {
    const track = TrackRecordingService.startRecording();
    setIsRecording(true);
    setCurrentTrack(track);
  };

  const handleStop = async () => {
    const finished = await TrackRecordingService.stopRecording();
    setIsRecording(false);
    setCurrentTrack(null);
    if (finished) {
      Alert.alert('Tour gespeichert', `Tour "${finished.title}" mit ${finished.distanceKm} km wurde erfolgreich gespeichert.`);
      await loadSavedTracks();
    }
  };

  const handleDelete = async (id: string) => {
    await TrackRecordingService.deleteTrack(id);
    await loadSavedTracks();
  };

  const handleExport = async (track: RecordedTrack) => {
    const success = await TrackRecordingService.exportTrackToGpx(track);
    if (!success) {
      Alert.alert('Export fehlgeschlagen', 'GPX Datei konnte nicht geteilt werden.');
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Compass size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Outdoor Tour-Recorder</Text>
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Live Recording Panel */}
        <View style={[styles.recordingCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>AKTUELLE AUFZEICHNUNG</Text>

          {isRecording && currentTrack ? (
            <View style={{ gap: 12, marginTop: 8 }}>
              <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700' }}>{currentTrack.title}</Text>
              
              <View style={styles.statsRow}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>DISTANZ</Text>
                  <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800' }}>{currentTrack.distanceKm} km</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>DAUER</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '800' }}>{formatDuration(currentTrack.durationSeconds)}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>HÖHE</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '800' }}>+{currentTrack.elevationGainMeters} m</Text>
                </View>
              </View>

              {/* Live BLE Fitness-Sensoren Integration */}
              {(bleMetrics.heartRateBpm || bleMetrics.cadenceRpm || bleMetrics.powerWatts) && (
                <View style={styles.bleRow}>
                  {bleMetrics.heartRateBpm && (
                    <View style={styles.bleItem}>
                      <Heart color="#EF4444" size={14} />
                      <Text style={styles.bleText}>{bleMetrics.heartRateBpm} bpm</Text>
                    </View>
                  )}
                  {bleMetrics.cadenceRpm && (
                    <View style={styles.bleItem}>
                      <RotateCw color="#38BDF8" size={14} />
                      <Text style={styles.bleText}>{bleMetrics.cadenceRpm} rpm</Text>
                    </View>
                  )}
                  {bleMetrics.powerWatts && (
                    <View style={styles.bleItem}>
                      <Zap color="#EAB308" size={14} />
                      <Text style={styles.bleText}>{bleMetrics.powerWatts} W</Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.trafficJam }]} onPress={handleStop}>
                <Square size={20} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.btnText}>Aufzeichnung stoppen & speichern</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12, marginTop: 8 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Zeichne deine eigene Wander- oder Radtour auf, erhalte Höhendaten, Geschwindigkeit und exportiere sie als GPX-Track.
              </Text>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleStart}>
                <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.btnText}>Neue Tour aufzeichnen</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Saved Tracks List */}
        <View style={{ flex: 1, marginTop: 16 }}>
          <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>GESPEICHERTE TOUREN ({savedTracks.length})</Text>

          {savedTracks.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={40} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Noch keine Touren aufgezeichnet.</Text>
            </View>
          ) : (
            <FlatList
              data={savedTracks}
              keyExtractor={item => item.id}
              contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
              renderItem={({ item }) => (
                <View style={[styles.trackItem, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.trackTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                      {item.distanceKm} km • {formatDuration(item.durationSeconds)} • +{item.elevationGainMeters} m • Max {item.maxSpeedKmh} km/h
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => handleExport(item)}>
                      <Share2 size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Trash2 size={20} color={colors.trafficJam} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: '700' },
  recordingCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 16 },
  cardSubtitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  bleRow: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 8 },
  bleItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bleText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, marginTop: 8 },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  sectionHeader: { fontSize: 13, fontWeight: '700', marginBottom: 12, letterSpacing: 1 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  trackItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  trackTitle: { fontSize: 16, fontWeight: '600' },
});
