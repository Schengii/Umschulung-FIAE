import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { AITourGuideService } from '../services/AITourGuideService';
import { AITourStory } from '../types/navigation';
import { Sparkles, Volume2, Square, Landmark, TreePine, Mountain, X, BookOpen } from 'lucide-react-native';

interface AITourGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AITourGuideModal: React.FC<AITourGuideModalProps> = ({ visible, onClose }) => {
  const [stories, setStories] = useState<AITourStory[]>(AITourGuideService.getStories());
  const [playingId, setPlayingId] = useState<string | null>(AITourGuideService.getCurrentlyPlayingId());

  useEffect(() => {
    if (visible) {
      const unsub = AITourGuideService.subscribe(() => {
        setPlayingId(AITourGuideService.getCurrentlyPlayingId());
      });
      return () => unsub();
    }
  }, [visible]);

  const toggleAudio = (story: AITourStory) => {
    if (playingId === story.id) {
      AITourGuideService.stopStoryAudio();
    } else {
      AITourGuideService.playStoryAudio(story);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'castle': return <Landmark color="#F59E0B" size={18} />;
      case 'nature': return <TreePine color="#10B981" size={18} />;
      default: return <Mountain color="#38BDF8" size={18} />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sparkles color="#F59E0B" size={24} />
              <Text style={styles.title}>KI-Tour-Guide & Audioguide</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X color="#94A3B8" size={20} />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Dein persönlicher Reiseführer: Erhalte spannende Geschichten zu historischen Orten, Schlössern und Naturdenkmälern entlang deiner Route.
          </Text>

          <FlatList
            data={stories}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isPlaying = playingId === item.id;
              return (
                <View style={[styles.storyCard, isPlaying && styles.storyCardPlaying]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      {getCategoryIcon(item.category)}
                      <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.audioBtn, isPlaying && styles.audioBtnPlaying]}
                      onPress={() => toggleAudio(item)}
                    >
                      {isPlaying ? (
                        <Square color="#FFFFFF" size={14} fill="#FFFFFF" />
                      ) : (
                        <Volume2 color="#FFFFFF" size={16} />
                      )}
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.storyText}>{item.storyText}</Text>

                  <View style={styles.metaRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <BookOpen color="#64748B" size={12} />
                      <Text style={styles.metaText}>{item.estimatedReadTimeMinutes} Min. Lesezeit</Text>
                    </View>
                    <Text style={styles.metaText}>Audio: {item.audioDurationSeconds}s</Text>
                  </View>
                </View>
              );
            }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F172A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  desc: { color: '#94A3B8', fontSize: 12, lineHeight: 18, marginBottom: 16 },
  storyCard: { backgroundColor: '#1E293B', padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  storyCardPlaying: { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.08)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#F8FAFC', fontWeight: '700', fontSize: 13, flex: 1, marginRight: 8 },
  audioBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0284C7', alignItems: 'center', justifyContent: 'center' },
  audioBtnPlaying: { backgroundColor: '#EF4444' },
  storyText: { color: '#CBD5E1', fontSize: 12, lineHeight: 18 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(100, 116, 139, 0.2)', paddingTop: 8 },
  metaText: { color: '#64748B', fontSize: 11 },
});
