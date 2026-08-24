import { OfflineRoutingEngineService } from '../src/services/OfflineRoutingEngineService';
import { AITourGuideService } from '../src/services/AITourGuideService';
import { CarPlaySyncService } from '../src/services/CarPlaySyncService';

describe('Phase 4 Enterprise & AI Features Unit Tests', () => {

  describe('1. OfflineRoutingEngineService Tests', () => {
    it('sollte on-device A*-Routen mit Schritten und Höhenprofil generieren', async () => {
      const origin = { latitude: 48.137, longitude: 11.576 };
      const dest = { latitude: 48.175, longitude: 11.551 };

      const route = await OfflineRoutingEngineService.calculateOfflineRoute(origin, dest, 'cycling');

      expect(route.id).toContain('offline-engine');
      expect(route.distanceKm).toBeGreaterThan(0);
      expect(route.coordinates.length).toBeGreaterThan(5);
      expect(route.steps.length).toBeGreaterThanOrEqual(3);
      expect(route.elevationProfile?.length).toBeGreaterThan(0);
      expect(route.warnings[0]).toContain('100% Offline');
    });
  });

  describe('2. AITourGuideService Tests', () => {
    it('sollte historische POI-Geschichten laden und Geofence-Erkennung durchführen', () => {
      const stories = AITourGuideService.getStories();
      expect(stories.length).toBeGreaterThanOrEqual(3);

      const olympiaStory = stories[0];
      expect(olympiaStory.title).toContain('Olympiapark');
      expect(olympiaStory.storyText.length).toBeGreaterThan(50);

      // Geofence-Erkennung nahe Olympiapark (~50m)
      const nearLoc = { latitude: 48.1752, longitude: 11.5519 };
      const detected = AITourGuideService.checkGeofenceStories(nearLoc);
      expect(detected).toBeDefined();
      expect(detected?.id).toBe(olympiaStory.id);

      // Audio Wiedergabe testen
      AITourGuideService.playStoryAudio(olympiaStory);
      expect(AITourGuideService.getCurrentlyPlayingId()).toBe(olympiaStory.id);

      AITourGuideService.stopStoryAudio();
      expect(AITourGuideService.getCurrentlyPlayingId()).toBeNull();
    });
  });

  describe('3. CarPlaySyncService Tests', () => {
    it('sollte Display-Modi wechseln und Quick-POI Filter aktualisieren', () => {
      const state = CarPlaySyncService.getState();
      expect(state.isConnected).toBe(true);

      const nextMode = CarPlaySyncService.toggleDisplayMode();
      expect(nextMode).toBe('android_auto');

      CarPlaySyncService.setQuickPOIFilter('gas_station');
      expect(CarPlaySyncService.getState().quickPOIFilter).toBe('gas_station');
    });
  });
});
