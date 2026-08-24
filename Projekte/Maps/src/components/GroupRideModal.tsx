import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { GroupRideService } from '../services/GroupRideService';
import { useLocation } from '../context/LocationContext';
import { GroupRideSession, GroupRideMember } from '../types/navigation';
import { Users, UserPlus, LogOut, AlertOctagon, Battery, Compass, X, Check } from 'lucide-react-native';

interface GroupRideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GroupRideModal: React.FC<GroupRideModalProps> = ({ visible, onClose }) => {
  const { userLocation } = useLocation();
  const [session, setSession] = useState<GroupRideSession | null>(GroupRideService.getSession());
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [titleInput, setTitleInput] = useState('');

  useEffect(() => {
    if (visible) {
      const unsub = GroupRideService.subscribe(setSession);
      return () => unsub();
    }
  }, [visible]);

  const handleCreate = () => {
    GroupRideService.createSession(titleInput || 'Wander- / Radgruppe', userLocation);
  };

  const handleJoin = () => {
    if (!joinCodeInput.trim()) return;
    GroupRideService.joinSession(joinCodeInput.trim(), userLocation);
    setJoinCodeInput('');
  };

  const handleLeave = () => {
    GroupRideService.leaveSession();
  };

  const handleSOS = (member: GroupRideMember) => {
    GroupRideService.triggerSOS(member.id);
    Alert.alert('SOS gemeldet', 'Panne/Notfall an die Gruppe übertragen.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Users color="#38BDF8" size={24} />
              <Text style={styles.title}>Social Group Ride & Live-Tracking</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>

          {session ? (
            <View style={{ flex: 1 }}>
              {/* Aktive Session Card */}
              <View style={styles.activeCard}>
                <View style={styles.sessionHeader}>
                  <View>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <Text style={styles.joinCodeText}>Code: {session.joinCode}</Text>
                  </View>

                  <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
                    <LogOut color="#EF4444" size={16} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.sessionSub}>
                  {session.members.length} Teilnehmer live auf der Karte verbunden.
                </Text>
              </View>

              {/* Mitgliederliste */}
              <Text style={styles.listHeading}>Gruppenmitglieder:</Text>
              <FlatList
                data={session.members}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={[styles.memberRow, item.status === 'breakdown' && styles.memberRowSOS]}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        {item.role === 'leader' && (
                          <View style={styles.leaderBadge}>
                            <Text style={styles.leaderText}>Guide</Text>
                          </View>
                        )}
                        {item.status === 'breakdown' && (
                          <View style={styles.sosBadge}>
                            <Text style={styles.sosText}>⚠️ Panne</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.memberMeta}>
                        {item.speedKmh} km/h • {item.distanceFromLeaderMeters}m Abstand • {item.batteryPercent}% Akku
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.sosBtn}
                      onPress={() => handleSOS(item)}
                    >
                      <AlertOctagon color="#EF4444" size={16} />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              <Text style={styles.desc}>
                Fahre oder wandere gemeinsam mit Freunden. Sieh alle Gruppenmitglieder mit Live-Distanz und Geschwindigkeit direkt auf der Karte.
              </Text>

              {/* Gruppe erstellen */}
              <View style={styles.inputCard}>
                <Text style={styles.cardHeading}>Neue Gruppenfahrt erstellen</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tour-Name (z.B. Isar-Trail Runde)"
                  placeholderTextColor="#64748B"
                  value={titleInput}
                  onChangeText={setTitleInput}
                />
                <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleCreate}>
                  <Users color="#FFFFFF" size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>Gruppe starten</Text>
                </TouchableOpacity>
              </View>

              {/* Gruppe beitreten */}
              <View style={styles.inputCard}>
                <Text style={styles.cardHeading}>Bestehender Gruppe beitreten</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Join-Code eingeben (z.B. RIDE-8420)"
                  placeholderTextColor="#64748B"
                  value={joinCodeInput}
                  onChangeText={setJoinCodeInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleJoin}>
                  <UserPlus color="#FFFFFF" size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>Beitreten</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  desc: { color: '#94A3B8', fontSize: 12, lineHeight: 18 },
  inputCard: { backgroundColor: '#1E293B', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#334155', gap: 10 },
  cardHeading: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  textInput: { backgroundColor: '#0F172A', color: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#334155', fontSize: 13 },
  actionBtnPrimary: { backgroundColor: '#0284C7', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionBtnSecondary: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  activeCard: { backgroundColor: '#1E293B', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#0284C7', marginBottom: 14 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionTitle: { color: '#F8FAFC', fontWeight: '800', fontSize: 15 },
  joinCodeText: { color: '#38BDF8', fontWeight: '800', fontSize: 12, marginTop: 2 },
  leaveBtn: { padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderRadius: 8 },
  sessionSub: { color: '#94A3B8', fontSize: 11, marginTop: 6 },
  listHeading: { color: '#CBD5E1', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
  memberRowSOS: { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  memberName: { color: '#F8FAFC', fontWeight: '700', fontSize: 13 },
  memberMeta: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  leaderBadge: { backgroundColor: '#0284C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  leaderText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  sosBadge: { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  sosText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  sosBtn: { padding: 8, backgroundColor: '#334155', borderRadius: 8 },
});
