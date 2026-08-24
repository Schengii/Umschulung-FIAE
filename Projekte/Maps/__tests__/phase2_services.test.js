import { BLESensorService } from '../src/services/BLESensorService';
import { IndoorMapService } from '../src/services/IndoorMapService';
import { VectorMapService } from '../src/services/VectorMapService';
import { CloudSyncService } from '../src/services/CloudSyncService';

describe('Phase 2 High-End Services Unit Tests', () => {

  describe('1. BLESensorService Tests', () => {
    it('sollte Bluetooth LE Sensoren finden und Pulszonen berechnen', async () => {
      const devices = await BLESensorService.scanForDevices();
      expect(devices.length).toBeGreaterThanOrEqual(2);

      const polar = devices.find(d => d.type === 'heart_rate');
      expect(polar).toBeDefined();

      const connected = await BLESensorService.connectDevice(polar);
      expect(connected).toBe(true);
      expect(BLESensorService.getConnectedDevices().length).toBe(1);

      // Pulszonen-Kalkulation
      expect(BLESensorService.calculateHeartRateZone(110)).toBe('Regeneration');
      expect(BLESensorService.calculateHeartRateZone(130)).toBe('Fettverbrennung');
      expect(BLESensorService.calculateHeartRateZone(150)).toBe('Ausdauer');
      expect(BLESensorService.calculateHeartRateZone(165)).toBe('Schwellentraining');
      expect(BLESensorService.calculateHeartRateZone(185)).toBe('Maximal');

      await BLESensorService.disconnectDevice(polar.id);
      expect(BLESensorService.getConnectedDevices().length).toBe(0);
    });
  });

  describe('2. IndoorMapService Tests', () => {
    it('sollte Indoor-Gebaeude und Etagen-Features korrekt erkennen', () => {
      // München Hbf Koordinaten
      const loc = { latitude: 48.1405, longitude: 11.5600 };
      const building = IndoorMapService.findBuildingAtLocation(loc);

      expect(building).toBeDefined();
      expect(building ? building.name : '').toBe('München Hauptbahnhof');
      expect(building ? building.levels.length : 0).toBe(4);

      if (building) {
        // Features für Etage -2 (U-Bahn) abrufen
        const uBahnFeatures = IndoorMapService.getFeaturesForLevel(building, -2);
        expect(uBahnFeatures.length).toBeGreaterThan(0);
        expect(uBahnFeatures[0].type).toBe('platform');
      }
    });

    it('sollte null zurueckgeben fuer Koordinaten ausserhalb von Indoor-Gebaeuden', () => {
      const loc = { latitude: 47.0, longitude: 10.0 };
      const building = IndoorMapService.findBuildingAtLocation(loc);
      expect(building).toBeNull();
    });
  });

  describe('3. VectorMapService Tests', () => {
    it('sollte Vektorkarten-Regionen auflisten, laden und loeschen koennen', async () => {
      const regions = await VectorMapService.getAvailableRegions();
      expect(regions.length).toBeGreaterThan(0);

      const target = regions.find(r => !r.isDownloaded) || regions[0];
      const downloaded = await VectorMapService.downloadRegion(target.id);
      expect(downloaded).toBe(true);

      const deleted = await VectorMapService.deleteRegion(target.id);
      expect(deleted).toBe(true);
    });
  });

  describe('4. CloudSyncService Tests', () => {
    it('sollte verschluesselte Backups erstellen und Metadaten persistieren', async () => {
      const themeMock = { isDark: true, isHighContrast: false, fontSizeMultiplier: 1.0 };
      const payload = await CloudSyncService.createBackupPayload(themeMock);

      expect(payload.version).toBe('2.0.0');
      expect(payload.encryptedBlob).toBeDefined();
      expect(payload.themeSettings.isDark).toBe(true);

      const lastSync = await CloudSyncService.getLastSyncTime();
      expect(lastSync).toBeGreaterThan(0);

      const restored = await CloudSyncService.restoreFromBackup(payload);
      expect(restored).toBe(true);
    });
  });
});
