import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { NavigationStep } from '../types/navigation';
import { ArrowUpRight, Navigation, X, ShieldAlert } from 'lucide-react-native';

export const CarPlayOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { selectedRoute, theme, stopNavigation } = useNavigation();

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const currentStep: NavigationStep | undefined = selectedRoute?.steps[0];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: '#000000' }]}>
      {/* Auto Screen Simulated Banner */}
      <View style={styles.carPlayHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Navigation size={24} color="#3B82F6" />
          <Text style={styles.carPlayTitle}>Apple CarPlay / Android Auto Display</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Automotive HUD */}
      <View style={styles.hudContainer}>
        {currentStep ? (
          <View style={styles.stepCard}>
            <ArrowUpRight size={64} color="#22C55E" />
            <View style={{ flex: 1 }}>
              <Text style={styles.distText}>{currentStep.distanceMeter} m</Text>
              <Text style={styles.instructionText}>{currentStep.instruction}</Text>
            </View>
          </View>
        ) : (
          <Text style={{ color: '#94A3B8', fontSize: 18 }}>Bereit für Fahrzeug-Navigation</Text>
        )}

        {/* Route Overview Info */}
        {selectedRoute && (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Ankunft in {selectedRoute.durationMinutes} Min.</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{selectedRoute.distanceKm} km</Text>
          </View>
        )}

        <TouchableOpacity style={styles.stopBtn} onPress={stopNavigation}>
          <Text style={styles.stopBtnText}>Navigation beenden</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  carPlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  carPlayTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  hudContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
  stepCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#1E293B', padding: 24, borderRadius: 20, width: '100%' },
  distText: { color: '#FFFFFF', fontSize: 32, fontWeight: '800' },
  instructionText: { color: '#CBD5E1', fontSize: 20, fontWeight: '600', marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  metaText: { color: '#38BDF8', fontSize: 22, fontWeight: '700' },
  stopBtn: { backgroundColor: '#EF4444', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14, width: '100%', alignItems: 'center' },
  stopBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
