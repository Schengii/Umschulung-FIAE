import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AudioPlayerService } from '../services/AudioPlayerService';
import { AudioTrack } from '../types/navigation';
import { Play, Pause, SkipForward, SkipBack, Music, Radio } from 'lucide-react-native';

export const NavigationAudioPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(AudioPlayerService.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState(AudioPlayerService.getIsPlaying());

  useEffect(() => {
    const unsub = AudioPlayerService.subscribe(() => {
      setCurrentTrack(AudioPlayerService.getCurrentTrack());
      setIsPlaying(AudioPlayerService.getIsPlaying());
    });
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.trackInfo}>
        <View style={styles.iconBadge}>
          {currentTrack.streamType === 'radio' ? <Radio color="#38BDF8" size={14} /> : <Music color="#10B981" size={14} />}
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.trackArtist} numberOfLines={1}>{currentTrack.artist}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => AudioPlayerService.prevTrack()}>
          <SkipBack color="#94A3B8" size={16} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.pauseBtn]}
          onPress={() => AudioPlayerService.togglePlayPause()}
        >
          {isPlaying ? <Pause color="#FFFFFF" size={16} fill="#FFFFFF" /> : <Play color="#FFFFFF" size={16} fill="#FFFFFF" />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.ctrlBtn} onPress={() => AudioPlayerService.nextTrack()}>
          <SkipForward color="#94A3B8" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
    marginHorizontal: 12,
    marginBottom: 8,
    elevation: 6,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTitle: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  trackArtist: {
    color: '#94A3B8',
    fontSize: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctrlBtn: {
    padding: 6,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtn: {
    backgroundColor: '#10B981',
  },
});
