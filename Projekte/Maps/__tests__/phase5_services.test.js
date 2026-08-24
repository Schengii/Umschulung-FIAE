import { WeatherRadarService } from '../src/services/WeatherRadarService';
import { GroupRideService } from '../src/services/GroupRideService';

describe('Phase 5 Weather Radar & Social Group Ride Tests', () => {

  describe('1. WeatherRadarService Tests', () => {
    it('sollte Radar-Zeitleisten-Frames laden und Player umschalten', async () => {
      const frames = await WeatherRadarService.fetchRadarFrames();
      expect(frames.length).toBe(6);

      const activeFrame = WeatherRadarService.getActiveFrame();
      expect(activeFrame).toBeDefined();
      expect(activeFrame?.path).toContain('tilecache.rainviewer.com');

      const isPlaying = WeatherRadarService.togglePlay();
      expect(typeof isPlaying).toBe('boolean');
      expect(WeatherRadarService.getIsPlaying()).toBe(true);

      WeatherRadarService.togglePlay();
      expect(WeatherRadarService.getIsPlaying()).toBe(false);

      WeatherRadarService.setActiveFrameIndex(4);
      expect(WeatherRadarService.getActiveFrameIndex()).toBe(4);
    });
  });

  describe('2. GroupRideService Tests', () => {
    it('sollte Gruppenfahrten erstellen, Mitglieder verwalten und SOS triggern', () => {
      const userLoc = { latitude: 48.137, longitude: 11.576 };

      const session = GroupRideService.createSession('Isartal Gravel Ride', userLoc, 'Jan (Guide)');
      expect(session.joinCode).toContain('RIDE-');
      expect(session.members.length).toBe(3);
      expect(session.members[0].name).toBe('Jan (Guide)');
      expect(session.members[0].role).toBe('leader');

      // SOS Trigger
      const member2 = session.members[1];
      GroupRideService.triggerSOS(member2.id);

      const updated = GroupRideService.getSession();
      const sosMember = updated?.members.find(m => m.id === member2.id);
      expect(sosMember?.status).toBe('breakdown');

      // Session verlassen
      GroupRideService.leaveSession();
      expect(GroupRideService.getSession()).toBeNull();
    });

    it('sollte bestehender Session via Join-Code beitreten', () => {
      const userLoc = { latitude: 48.137, longitude: 11.576 };
      const session = GroupRideService.joinSession('RIDE-9988', userLoc, 'Alex');

      expect(session.joinCode).toBe('RIDE-9988');
      expect(session.members.length).toBe(2);
      expect(session.members.some(m => m.name === 'Alex')).toBe(true);

      GroupRideService.leaveSession();
    });
  });
});
