import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Image, Alert, TextInput } from 'react-native';
import { useNavigation } from '../context/NavigationContext';
import { lightTheme, darkTheme, highContrastTheme } from '../theme/colors';
import { LocationPoint } from '../types/navigation';
import { Camera, MapPin, Star, Heart, X, Plus, Image as ImageIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CommunityHighlight {
  id: string;
  title: string;
  description: string;
  category: 'viewpoint' | 'water' | 'trail' | 'photo_spot';
  coordinate: LocationPoint;
  likes: number;
  author: string;
  createdAt: string;
}

const STORAGE_KEY = '@maps_community_highlights_v1';

export const CommunityHighlightsModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { theme } = useNavigation();
  const [highlights, setHighlights] = useState<CommunityHighlight[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const colors = theme.isHighContrast
    ? highContrastTheme
    : theme.isDark
    ? darkTheme
    : lightTheme;

  const loadHighlights = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setHighlights(JSON.parse(raw));
      } else {
        // Initial Demo Highlights
        const initial: CommunityHighlight[] = [
          {
            id: 'hl-1',
            title: 'Panoramablick Isartal',
            description: 'Traumhafter Ausblick über die Flussbiegung. Bänke zum Rast machen vorhanden.',
            category: 'viewpoint',
            coordinate: { latitude: 48.137, longitude: 11.576 },
            likes: 24,
            author: 'KomootExplorer89',
            createdAt: '12.08.2026',
          },
          {
            id: 'hl-2',
            title: 'Trinkwasser-Refill Station',
            description: 'Kostenloses frisches Quellwasser direkt am Wanderweg.',
            category: 'water',
            coordinate: { latitude: 48.142, longitude: 11.581 },
            likes: 41,
            author: 'HikerDave',
            createdAt: '10.08.2026',
          },
        ];
        setHighlights(initial);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (e) {
      console.warn('Error loading highlights:', e);
    }
  };

  useEffect(() => {
    if (visible) loadHighlights();
  }, [visible]);

  const handleAddHighlight = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Titel für den Highlight-Punkt ein.');
      return;
    }

    const newItem: CommunityHighlight = {
      id: `hl-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      category: 'viewpoint',
      coordinate: { latitude: 48.137, longitude: 11.576 },
      likes: 1,
      author: 'Du (Lokal)',
      createdAt: new Date().toLocaleDateString('de-DE'),
    };

    const updated = [newItem, ...highlights];
    setHighlights(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  const handleLike = async (id: string) => {
    const updated = highlights.map(h => (h.id === id ? { ...h, likes: h.likes + 1 } : h));
    setHighlights(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Camera size={24} color={colors.accentHiking} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Community Highlights</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {isAdding ? (
          <View style={[styles.addCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Neues Highlight hinzufügen</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.surfaceBorder }]}
              placeholder="Titel (z. B. Schöne Aussicht)..."
              placeholderTextColor={colors.textSecondary}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.textPrimary, borderColor: colors.surfaceBorder }]}
              placeholder="Beschreibung..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={newDesc}
              onChangeText={setNewDesc}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, flex: 1 }]} onPress={handleAddHighlight}>
                <Text style={styles.btnText}>Speichern</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.trafficJam, flex: 1 }]} onPress={() => setIsAdding(false)}>
                <Text style={styles.btnText}>Abbrechen</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setIsAdding(true)}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.btnText}>Highlight an aktiver Position teilen</Text>
          </TouchableOpacity>
        )}

        {/* List of Highlights */}
        <FlatList
          data={highlights}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>{item.description}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6 }}>
                  Von {item.author} • {item.createdAt}
                </Text>
              </View>

              <TouchableOpacity style={styles.likeBtn} onPress={() => handleLike(item.id)}>
                <Heart size={20} color="#EF4444" fill="#EF4444" />
                <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 14 }}>{item.likes}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, marginTop: 12 },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  addCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 12, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  textArea: { height: 70, textAlignVertical: 'top' },
  btn: { padding: 12, borderRadius: 10, alignItems: 'center' },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700' },
  likeBtn: { alignItems: 'center', gap: 4, paddingLeft: 12 },
});
