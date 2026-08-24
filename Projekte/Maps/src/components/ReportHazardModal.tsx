import React, { useState } from 'react';
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
import { HazardReportService } from '../services/HazardReportService';
import { IncidentType } from '../types/navigation';
import {
  Camera,
  AlertTriangle,
  Car,
  Construction,
  Snowflake,
  Wrench,
  CloudRain,
  X,
  CheckCircle2,
} from 'lucide-react-native';

interface ReportHazardModalProps {
  visible: boolean;
  onClose: () => void;
}

interface HazardOption {
  type: IncidentType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

export const ReportHazardModal: React.FC<ReportHazardModalProps> = ({ visible, onClose }) => {
  const { userLocation } = useLocation();
  const { refreshHazards } = useNavigation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hazardOptions: HazardOption[] = [
    {
      type: 'speed_camera',
      title: 'Blitzer',
      subtitle: 'Mobiler Geschwindigkeits-Blitzer',
      icon: <Camera color="#FFFFFF" size={24} />,
      color: '#EF4444',
    },
    {
      type: 'accident',
      title: 'Unfall',
      subtitle: 'Fahrbahn teilweise blockiert',
      icon: <AlertTriangle color="#FFFFFF" size={24} />,
      color: '#DC2626',
    },
    {
      type: 'jam',
      title: 'Stauende',
      subtitle: 'Plötzlicher Stillstand / zähfließend',
      icon: <Car color="#FFFFFF" size={24} />,
      color: '#F59E0B',
    },
    {
      type: 'construction',
      title: 'Baustelle',
      subtitle: 'Tagesbaustelle / Fahrstreifen verengt',
      icon: <Construction color="#FFFFFF" size={24} />,
      color: '#F97316',
    },
    {
      type: 'ice',
      title: 'Glatteis',
      subtitle: 'Schneeglätte oder Blitzeis',
      icon: <Snowflake color="#FFFFFF" size={24} />,
      color: '#3B82F6',
    },
    {
      type: 'breakdown',
      title: 'Panne',
      subtitle: 'Fahrzeug auf Standstreifen/Fahrbahn',
      icon: <Wrench color="#FFFFFF" size={24} />,
      color: '#8B5CF6',
    },
  ];

  const handleReport = async (option: HazardOption) => {
    try {
      await HazardReportService.reportHazard(option.type, userLocation);
      await refreshHazards();
      setSuccessMessage(`Danke! "${option.title}" für die Community gemeldet.`);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    } catch {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>⚠️ Gefahr / Blitzer melden</Text>
              <Text style={styles.subtitle}>1-Tap Meldung für die Maps-Community</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>

          {successMessage ? (
            <View style={styles.successBox}>
              <CheckCircle2 color="#10B981" size={48} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {hazardOptions.map(opt => (
                <TouchableOpacity
                  key={opt.type}
                  style={[styles.hazardCard, { borderColor: opt.color }]}
                  onPress={() => handleReport(opt)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconWrap, { backgroundColor: opt.color }]}>
                    {opt.icon}
                  </View>
                  <Text style={styles.cardTitle}>{opt.title}</Text>
                  <Text style={styles.cardSub} numberOfLines={2}>{opt.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  hazardCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  cardSub: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  successBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
});
