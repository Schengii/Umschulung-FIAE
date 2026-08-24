import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IndoorBuilding, IndoorLevel } from '../types/navigation';
import { Layers } from 'lucide-react-native';

interface IndoorLevelSelectorProps {
  building: IndoorBuilding;
  activeLevel: number;
  onSelectLevel: (level: number) => void;
}

export const IndoorLevelSelector: React.FC<IndoorLevelSelectorProps> = ({
  building,
  activeLevel,
  onSelectLevel,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerBadge}>
        <Layers color="#38BDF8" size={14} />
        <Text style={styles.headerText} numberOfLines={1}>{building.name}</Text>
      </View>

      <View style={styles.levelsColumn}>
        {building.levels.map(lvl => {
          const isActive = lvl.level === activeLevel;
          return (
            <TouchableOpacity
              key={lvl.level}
              style={[styles.levelBtn, isActive && styles.levelBtnActive]}
              onPress={() => onSelectLevel(lvl.level)}
              accessibilityLabel={`Etage ${lvl.name}`}
            >
              <Text style={[styles.levelText, isActive && styles.levelTextActive]}>
                {lvl.shortName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    top: 100,
    zIndex: 200,
    alignItems: 'flex-start',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 6,
    maxWidth: 160,
  },
  headerText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  levelsColumn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 4,
    gap: 4,
    elevation: 6,
  },
  levelBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  levelBtnActive: {
    backgroundColor: '#0284C7',
  },
  levelText: {
    color: '#94A3B8',
    fontWeight: '800',
    fontSize: 12,
  },
  levelTextActive: {
    color: '#FFFFFF',
  },
});
