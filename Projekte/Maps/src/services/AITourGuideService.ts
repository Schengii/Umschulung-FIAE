import { AITourStory, LocationPoint } from '../types/navigation';
import { VoiceService } from './VoiceService';

export class AITourGuideService {
  private static stories: AITourStory[] = [
    {
      id: 'story-olympiapark',
      title: 'Olympiapark München & Zeltdach-Architektur',
      category: 'monument',
      coordinate: { latitude: 48.1751, longitude: 11.5518 },
      storyText: 'Der Olympiapark wurde für die Olympischen Sommerspiele 1972 errichtet. Seine weltberühmte Zeltdachkonstruktion aus Acrylglas und Stahlseilen galt damals als technische Meisterleistung und symbolisierte das offene, demokratische Deutschland.',
      estimatedReadTimeMinutes: 2,
      audioDurationSeconds: 45,
      triggerDistanceMeters: 250,
    },
    {
      id: 'story-nymphenburg',
      title: 'Schloss Nymphenburg – Sommerresidenz der Wittelsbacher',
      category: 'castle',
      coordinate: { latitude: 48.1582, longitude: 11.5033 },
      storyText: 'Schloss Nymphenburg war die prunkvolle Sommerresidenz der bayerischen Kurfürsten und Könige. Hier wurde 1845 der spätere König Ludwig II. geboren. Der Schlossgarten gehört zu den schönsten barocken Parkanlagen Europas.',
      estimatedReadTimeMinutes: 3,
      audioDurationSeconds: 60,
      triggerDistanceMeters: 300,
    },
    {
      id: 'story-isar-auen',
      title: 'Die wilde Isar – Renaturierung & Flößerei',
      category: 'nature',
      coordinate: { latitude: 48.1310, longitude: 11.5830 },
      storyText: 'Die Isar entspringt im Tiroler Karwendelgebirge. Durch das Projekt "Isar-Plan" wurde der Fluss im Stadtgebiet renaturiert und bildet heute ein einzigartiges Natur- und Bade-Paradies für Mensch und Tier.',
      estimatedReadTimeMinutes: 2,
      audioDurationSeconds: 40,
      triggerDistanceMeters: 200,
    },
  ];

  private static currentlyPlayingId: string | null = null;
  private static listeners: Set<() => void> = new Set();

  public static getStories(): AITourStory[] {
    return this.stories;
  }

  /**
   * Prüft ob der Nutzer sich in der Nähe eines POI-Story Geofences befindet
   */
  public static checkGeofenceStories(location: LocationPoint): AITourStory | null {
    for (const story of this.stories) {
      const dist = this.getDistanceMeters(location, story.coordinate);
      if (dist <= story.triggerDistanceMeters) {
        return story;
      }
    }
    return null;
  }

  public static async playStoryAudio(story: AITourStory) {
    this.currentlyPlayingId = story.id;
    this.notify();
    VoiceService.speakInstruction(`Hier ist dein KI-Tour-Guide: ${story.storyText}`);
  }

  public static stopStoryAudio() {
    this.currentlyPlayingId = null;
    VoiceService.stop();
    this.notify();
  }

  public static getCurrentlyPlayingId(): string | null {
    return this.currentlyPlayingId;
  }

  public static subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notify() {
    this.listeners.forEach(cb => cb());
  }

  private static getDistanceMeters(p1: LocationPoint, p2: LocationPoint): number {
    const R = 6371000;
    const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
    const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.latitude * Math.PI) / 180) *
        Math.cos((p2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
