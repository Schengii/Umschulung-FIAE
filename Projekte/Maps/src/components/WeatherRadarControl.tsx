import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WeatherRadarService } from '../services/WeatherRadarService';
import { WeatherRadarFrame } from '../types/navigation';
import { CloudRain, Play, Pause, X } from 'lucide-react-native';

interface WeatherRadarControlProps {
  onClose: () => void;
}

export const WeatherRadarControl: React.FC<WeatherRadarControlProps> = ({ onClose }) => {
  const [frames, setFrames] = useState<WeatherRadarFrame[]>(WeatherRadarService.getFrames());
  const [activeIndex, setActiveIndex] = useState(WeatherRadarService.getActiveFrameIndex());
  const [isPlaying, setIsPlaying] = useState(WeatherRadarService.getIsPlaying());

  useEffect(() => {
    const unsub = WeatherRadarService.subscribe(() => {
      setActiveIndex(WeatherRadarService.getActiveFrameIndex());
      setIsPlaying(WeatherRadarService.getIsPlaying());
    });
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header & Play Button */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <CloudRain color="#38BDF8" size={16} />
          <Text style={styles.title}>Live Wetter- & Regenradar</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={[styles.playBtn, isPlaying && styles.pauseBtn]}
            onPress={() => WeatherRadarService.togglePlay()}
          >
            {isPlaying ? <Pause color="#FFFFFF" size={12} fill="#FFFFFF" /> : <Play color="#FFFFFF" size={12} fill="#FFFFFF" />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X color="#94A3B8" size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Frame Timeline Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timelineScroll}>
        {frames.map((f, idx) => {
          const isActive = idx === activeIndex;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.framePill,
                isActive && (f.isForecast ? styles.forecastPillActive : styles.framePillActive),
              ]}
              onPress={() => WeatherRadarService.setActiveFrameIndex(idx)}
            >
              <Text style={[styles.frameLabel, isActive && styles.frameLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Niederschlags-Legende */}
      <View style={styles.legendRow}>
        <Text style={styles.legendText}>Intensität:</Text>
        <View style={styles.legendBar}>
          <View style={[styles.legendColor, { backgroundColor: '#60A5FA' }]} />
          <View style={[styles.legendColor, { backgroundColor: '#34D399' }]} />
          <View style={[styles.legendColor, { backgroundColor: '#FBBF24' }]} />
          <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
          <View style={[styles.legendColor, { backgroundColor: '#A855F7' }]} />
        </View>
        <Text style={styles.legendText}>Leicht ➔ Hagel/Gewitter</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70,
    left: 12,
    right: 12,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    zIndex: 300,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  playBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtn: {
    backgroundColor: '#10B981',
  },
  closeBtn: {
    padding: 2,
  },
  timelineScroll: {
    gap: 6,
    paddingBottom: 6,
  },
  framePill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  framePillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  forecastPillActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#A78BFA',
  },
  frameLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  frameLabelActive: {
    color: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.2)',
    paddingTop: 6,
  },
  legendText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
  },
  legendBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 8,
  },
  legendColor: {
    flex: 1,
    height: '100%',
  },
});
