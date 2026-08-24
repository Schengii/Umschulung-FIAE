import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Switch } from 'react-native';
import { GdprService } from '../services/GdprService';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { ShieldCheck, Lock, Eye, Check } from 'lucide-react-native';

export const GdprBanner: React.FC = () => {
  const { theme } = useNavigation();
  const [consentState, setConsentState] = useState(GdprService.getConsent());
  const [visible, setVisible] = useState(!consentState.hasAnswered);

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  if (!visible) return null;

  const handleAcceptAll = () => {
    GdprService.saveConsent({
      locationServices: true,
      trafficAnalytics: true,
      mediaNewsFeed: true,
      localStorageOnly: true,
    });
    setVisible(false);
  };

  const handleSavePreferences = () => {
    GdprService.saveConsent(consentState);
    setVisible(false);
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.surfaceBorder }]}>
          <View style={styles.headerRow}>
            <ShieldCheck color={colors.primary} size={28} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Datenschutz & DSGVO Transparenz
            </Text>
          </View>

          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Ihre Privatsphäre hat bei uns oberste Priorität. Maps verarbeitet Standortdaten gemäß EU-DSGVO primär lokal auf Ihrem Gerät zur Routenführung & Echtzeitverkehrmeldung.
          </Text>

          {/* Granular Option Switches */}
          <View style={styles.switchSection}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabelBox}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Standort-Navigation</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>Erforderlich für Routenführung</Text>
              </View>
              <Switch
                value={consentState.locationServices}
                onValueChange={val => setConsentState(prev => ({ ...prev, locationServices: val }))}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelBox}>
                <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Anonyme Stau-Meldungen</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>Empfang von Live-Radio & Baustellen</Text>
              </View>
              <Switch
                value={consentState.trafficAnalytics}
                onValueChange={val => setConsentState(prev => ({ ...prev, trafficAnalytics: val }))}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.outlineButton, { borderColor: colors.surfaceBorder }]}
              onPress={handleSavePreferences}
            >
              <Text style={[styles.outlineButtonText, { color: colors.textPrimary }]}>
                Auswahl speichern
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: colors.primary }]}
              onPress={handleAcceptAll}
            >
              <Check color="#FFFFFF" size={18} style={{ marginRight: 4 }} />
              <Text style={styles.acceptButtonText}>Alle akzeptieren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  switchSection: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabelBox: {
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  switchSub: {
    fontSize: 12,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  outlineButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  acceptButton: {
    flex: 1.2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
