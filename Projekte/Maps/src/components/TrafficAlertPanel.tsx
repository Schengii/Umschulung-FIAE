import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { TrafficIncident } from '../types/navigation';
import { Radio, AlertOctagon, Construction, AlertTriangle, X, Clock, MapPin } from 'lucide-react-native';

export const TrafficAlertPanel: React.FC = () => {
  const { trafficIncidents, isTrafficPanelOpen, setIsTrafficPanelOpen, theme } = useNavigation();

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  if (!isTrafficPanelOpen) return null;

  const renderIncidentItem = ({ item }: { item: TrafficIncident }) => {
    let icon = <AlertTriangle color="#FFFFFF" size={18} />;
    let badgeBg = colors.trafficJam;

    if (item.type === 'construction') {
      icon = <Construction color="#FFFFFF" size={18} />;
      badgeBg = colors.trafficConstruction;
    } else if (item.type === 'accident') {
      icon = <AlertOctagon color="#FFFFFF" size={18} />;
      badgeBg = colors.trafficAccident;
    }

    return (
      <View style={[styles.incidentCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBadge, { backgroundColor: badgeBg }]}>
            {icon}
          </View>
          <View style={styles.headerTitleBox}>
            <Text style={[styles.incidentTitle, { color: colors.textPrimary, fontSize: 15 * theme.fontSizeMultiplier }]}>
              {item.title}
            </Text>
            <View style={styles.metaRow}>
              <MapPin color={colors.textSecondary} size={13} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.locationName}</Text>
              <Text style={[styles.sourceTag, { color: colors.primary }]}> • {item.source}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary, fontSize: 13 * theme.fontSizeMultiplier }]}>
          {item.description}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.timeTag}>
            <Clock color={colors.textSecondary} size={12} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{item.timestamp}</Text>
          </View>
          {item.delayMinutes > 0 && (
            <View style={[styles.delayBadge, { backgroundColor: colors.trafficJam }]}>
              <Text style={styles.delayText}>+{item.delayMinutes} Min Verzögerung</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.overlayDrawer, { backgroundColor: colors.overlayBg }]}>
      <View style={[styles.drawerHeader, { borderColor: colors.surfaceBorder }]}>
        <View style={styles.headerTitleContainer}>
          <Radio color={colors.trafficJam} size={22} />
          <Text style={[styles.drawerTitle, { color: colors.textPrimary }]}>
            Echtzeit-Verkehr & Radiomeldungen
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsTrafficPanelOpen(false)}
          accessibilityLabel="Verkehrsmeldungen schließen"
          accessibilityRole="button"
        >
          <X color={colors.textPrimary} size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={trafficIncidents}
        keyExtractor={item => item.id}
        renderItem={renderIncidentItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlayDrawer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    paddingTop: 50,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  listContent: {
    padding: 16,
  },
  incidentCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    marginLeft: 12,
    flex: 1,
  },
  incidentTitle: {
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  sourceTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    marginTop: 8,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    marginLeft: 4,
  },
  delayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  delayText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
});
