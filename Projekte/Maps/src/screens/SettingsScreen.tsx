import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { GdprService } from '../services/GdprService';
import { OfflineTileService, OfflineRegion } from '../services/OfflineTileService';
import {
  Moon, Sun, Eye, Type, Shield, ChevronRight,
  Map, Info, Trash2, RefreshCw, ArrowLeft,
  Accessibility, BatteryCharging, DownloadCloud, HardDrive,
} from 'lucide-react-native';

interface SettingsScreenProps {
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const {
    theme,
    toggleDarkTheme,
    toggleHighContrast,
    setFontScale,
    setMapStyle,
    mapStyle,
    isBatterySaverMode,
    toggleBatterySaver,
  } = useNavigation();

  const [gdprState, setGdprState] = useState(GdprService.getConsent());
  const [regions, setRegions] = useState<OfflineRegion[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  React.useEffect(() => {
    OfflineTileService.getRegions().then(res => setRegions(res));
  }, []);

  const handleDownloadRegion = async (regionId: string) => {
    await OfflineTileService.downloadRegion(regionId, progress => {
      setDownloadProgress(prev => ({ ...prev, [regionId]: progress }));
    });
    const updated = await OfflineTileService.getRegions();
    setRegions(updated);
  };

  const handleDeleteRegion = async (regionId: string) => {
    await OfflineTileService.deleteRegion(regionId);
    const updated = await OfflineTileService.getRegions();
    setRegions(updated);
  };

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const handleGdprToggle = (key: keyof typeof gdprState, val: boolean) => {
    const updated = GdprService.saveConsent({ [key]: val });
    setGdprState({ ...updated });
  };

  const handleResetGdpr = () => {
    const reset = GdprService.resetConsent();
    setGdprState({ ...reset });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.surfaceBorder }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          accessibilityLabel="Einstellungen schließen"
          accessibilityRole="button"
        >
          <ArrowLeft color={colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Einstellungen
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── DARSTELLUNG ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DARSTELLUNG & ENERGIE</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {/* Dark Mode */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              {theme.isDark
                ? <Moon color={colors.primary} size={20} />
                : <Sun color={colors.primary} size={20} />}
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Dunkler Modus</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Augen schonen bei Nacht</Text>
              </View>
            </View>
            <Switch
              value={theme.isDark}
              onValueChange={toggleDarkTheme}
              trackColor={{ false: '#64748B', true: colors.primary }}
              accessibilityLabel="Dunkler Modus umschalten"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />

          {/* Akkusparmodus (Outdoor OLED) */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <BatteryCharging color={colors.accentHiking} size={20} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Outdoor Akkuspar-Modus</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Minimalistisches OLED-Design für lange Touren</Text>
              </View>
            </View>
            <Switch
              value={isBatterySaverMode}
              onValueChange={toggleBatterySaver}
              trackColor={{ false: '#64748B', true: colors.accentHiking }}
              accessibilityLabel="Akkuspar-Modus umschalten"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />

          {/* Hochkontrast */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Eye color={colors.primary} size={20} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Hochkontrast (WCAG)</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Für Sehbeeinträchtigte optimiert</Text>
              </View>
            </View>
            <Switch
              value={theme.isHighContrast}
              onValueChange={toggleHighContrast}
              trackColor={{ false: '#64748B', true: colors.primary }}
              accessibilityLabel="Hochkontrast-Modus umschalten"
            />
          </View>
        </View>

        {/* ── OFFLINE KARTEN-PAKETE ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>OFFLINE KARTEN-PAKETE</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {regions.map((reg, idx) => (
            <React.Fragment key={reg.id}>
              {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />}
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <HardDrive color={reg.isDownloaded ? colors.primary : colors.textSecondary} size={20} />
                  <View style={styles.rowText}>
                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{reg.name}</Text>
                    <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                      Ca. {reg.estimatedSizeMb} MB • {reg.isDownloaded ? '✅ Heruntergeladen' : 'Nicht gespeichert'}
                    </Text>
                  </View>
                </View>

                {reg.isDownloaded ? (
                  <TouchableOpacity onPress={() => handleDeleteRegion(reg.id)} style={{ padding: 6 }}>
                    <Trash2 color={colors.trafficJam} size={18} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleDownloadRegion(reg.id)}
                  >
                    <DownloadCloud color="#FFFFFF" size={16} />
                    <Text style={styles.downloadBtnText}>
                      {downloadProgress[reg.id] !== undefined
                        ? `${Math.round(downloadProgress[reg.id] * 100)}%`
                        : 'Laden'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* ── SCHRIFTGRÖSSE ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SCHRIFTGRÖSSE</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={styles.row}>
            <Type color={colors.primary} size={20} />
            <Text style={[styles.rowTitle, { color: colors.textPrimary, marginLeft: 12 }]}>Textgröße</Text>
          </View>
          <View style={styles.fontScaleRow}>
            {[
              { label: 'Klein', value: 0.9 },
              { label: 'Normal', value: 1.0 },
              { label: 'Groß', value: 1.25 },
              { label: 'Sehr Groß', value: 1.5 },
            ].map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.fontPill,
                  { borderColor: colors.surfaceBorder },
                  theme.fontSizeMultiplier === opt.value && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setFontScale(opt.value)}
                accessibilityLabel={`Schriftgröße ${opt.label} auswählen`}
                accessibilityState={{ selected: theme.fontSizeMultiplier === opt.value }}
              >
                <Text style={[
                  styles.fontPillText,
                  { color: theme.fontSizeMultiplier === opt.value ? '#FFFFFF' : colors.textSecondary },
                  { fontSize: 13 * opt.value },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── KARTE ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>KARTE</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {(['standard', 'outdoors', 'satellite', 'high_contrast'] as const).map((style, i) => {
            const labels: Record<string, string> = {
              standard: 'Standard (OpenStreetMap)',
              outdoors: 'Outdoors (Wandern & Rad)',
              satellite: 'Satellit',
              high_contrast: 'Hochkontrast (WCAG)',
            };
            return (
              <React.Fragment key={style}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />}
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => setMapStyle(style)}
                  accessibilityLabel={`Kartenstil ${labels[style]} auswählen`}
                  accessibilityState={{ selected: mapStyle === style }}
                >
                  <View style={styles.rowLeft}>
                    <Map color={mapStyle === style ? colors.primary : colors.textSecondary} size={20} />
                    <Text style={[styles.rowTitle, { color: mapStyle === style ? colors.primary : colors.textPrimary, marginLeft: 12 }]}>
                      {labels[style]}
                    </Text>
                  </View>
                  {mapStyle === style && (
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* ── DATENSCHUTZ DSGVO ── */}

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATENSCHUTZ (DSGVO)</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Shield color={colors.primary} size={20} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Standort-Navigation</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Erforderlich für Routenführung</Text>
              </View>
            </View>
            <Switch
              value={gdprState.locationServices}
              onValueChange={val => handleGdprToggle('locationServices', val)}
              trackColor={{ false: '#64748B', true: colors.primary }}
              accessibilityLabel="Standort-Einwilligung"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Shield color={colors.primary} size={20} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Anonyme Verkehrsdaten</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Stau- und Radio-Meldungen</Text>
              </View>
            </View>
            <Switch
              value={gdprState.trafficAnalytics}
              onValueChange={val => handleGdprToggle('trafficAnalytics', val)}
              trackColor={{ false: '#64748B', true: colors.primary }}
              accessibilityLabel="Verkehrsdaten-Einwilligung"
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.surfaceBorder }]} />
          <TouchableOpacity
            style={styles.row}
            onPress={handleResetGdpr}
            accessibilityLabel="Alle Einwilligungen zurücksetzen"
            accessibilityRole="button"
          >
            <View style={styles.rowLeft}>
              <Trash2 color={colors.trafficJam} size={20} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.trafficJam }]}>Einwilligungen zurücksetzen</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Recht auf Vergessenwerden (DSGVO Art. 17)</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── ÜBER DIE APP ── */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ÜBER DIE APP</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={styles.row}>
            <Info color={colors.textSecondary} size={18} />
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Maps App</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>Version 1.0.1 · github.com/Schengii/Maps</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Navigation: OSRM (OpenRouteService)
                {'\n'}Karten: OpenStreetMap-Mitwirkende
                {'\n'}Suche: Nominatim · POI: Overpass API
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowText: { marginLeft: 12, flex: 1 },
  rowTitle: { fontWeight: '600', fontSize: 15 },
  rowSub: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  fontScaleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  fontPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  fontPillText: { fontWeight: '600' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  downloadBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});

