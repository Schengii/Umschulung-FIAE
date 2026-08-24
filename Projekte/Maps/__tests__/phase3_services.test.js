import { ARNavigationService } from '../src/services/ARNavigationService';
import { SmartwatchSyncService } from '../src/services/SmartwatchSyncService';
import { AudioPlayerService } from '../src/services/AudioPlayerService';

describe('Phase 3 Next-Gen Features Unit Tests', () => {

  describe('1. ARNavigationService Tests', () => {
    it('sollte 3D-AR Marker mit Distanz und relativer Peilung berechnen', () => {
      const loc = { latitude: 48.137, longitude: 11.576 };
      const steps = [
        {
          instruction: 'In 150m links abbiegen',
          distanceMeter: 150,
          durationSeconds: 120,
          iconName: 'corner-up-left',
          coordinate: { latitude: 48.138, longitude: 11.577 },
        },
      ];
      const dest = { latitude: 48.175, longitude: 11.551, name: 'Olympiapark' };

      const markers = ARNavigationService.calculateARMarkers(loc, 45, steps, dest);

      expect(markers.length).toBe(2);
      expect(markers[0].iconType).toBe('turn_left');
      expect(markers[0].screenXPercent).toBeGreaterThanOrEqual(10);
      expect(markers[0].screenXPercent).toBeLessThanOrEqual(90);

      expect(markers[1].iconType).toBe('destination');
      expect(markers[1].title).toBe('Olympiapark');
    });

    it('sollte Peilung (Bearing) und Distanz exakt berechnen', () => {
      const p1 = { latitude: 48.137, longitude: 11.576 };
      const p2 = { latitude: 48.147, longitude: 11.576 }; // Reiner Norden

      const bearing = ARNavigationService.calculateBearing(p1, p2);
      expect(Math.round(bearing)).toBe(0);

      const dist = ARNavigationService.calculateDistanceMeters(p1, p2);
      expect(dist).toBeGreaterThan(1000);
      expect(dist).toBeLessThan(1200);
    });
  });

  describe('2. SmartwatchSyncService Tests', () => {
    it('sollte Turn-by-Turn Daten für Apple Watch und WearOS synchronisieren', () => {
      let state = SmartwatchSyncService.getSyncState();
      expect(state.isConnected).toBe(true);

      const step = {
        instruction: 'Scharf rechts abbiegen auf Isarstraße',
        distanceMeter: 80,
        durationSeconds: 60,
        iconName: 'corner-up-right',
        coordinate: { latitude: 48.1, longitude: 11.5 },
      };

      SmartwatchSyncService.updateNavigationData(step, '15:20', 142);
      state = SmartwatchSyncService.getSyncState();

      expect(state.nextTurnInstruction).toBe('Scharf rechts abbiegen auf Isarstraße');
      expect(state.distanceToTurnMeters).toBe(80);
      expect(state.estimatedArrival).toBe('15:20');
      expect(state.currentHeartRate).toBe(142);
      expect(state.hapticPattern).toBe('triple_right');
    });
  });

  describe('3. AudioPlayerService Tests', () => {
    it('sollte Wiedergabesteuerung, Audio-Ducking und Track-Wechsel verwalten', () => {
      expect(AudioPlayerService.getTracks().length).toBeGreaterThanOrEqual(3);

      const initialTrack = AudioPlayerService.getCurrentTrack();
      expect(initialTrack.title).toBeDefined();

      const isPlaying = AudioPlayerService.togglePlayPause();
      expect(typeof isPlaying).toBe('boolean');

      AudioPlayerService.nextTrack();
      const nextTrack = AudioPlayerService.getCurrentTrack();
      expect(nextTrack.id).not.toBe(initialTrack.id);

      AudioPlayerService.setAudioDucking(true);
      AudioPlayerService.setAudioDucking(false);
    });
  });
});
