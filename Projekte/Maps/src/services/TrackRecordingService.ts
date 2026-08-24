import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecordedTrack, TrackPoint } from '../types/navigation';
import { GpxService } from './GpxService';

const STORAGE_KEY = '@maps_recorded_tracks_v1';

export class TrackRecordingService {
  private static currentTrack: RecordedTrack | null = null;
  private static isRecording: boolean = false;

  /**
   * Startet die Aufzeichnung einer neuen Outdoor-Tour
   */
  public static startRecording(title?: string): RecordedTrack {
    const startTime = Date.now();
    this.currentTrack = {
      id: `track-${startTime}`,
      title: title || `Tour ${new Date(startTime).toLocaleDateString('de-DE')} ${new Date(startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`,
      startTime,
      durationSeconds: 0,
      distanceKm: 0,
      elevationGainMeters: 0,
      maxSpeedKmh: 0,
      avgSpeedKmh: 0,
      points: [],
    };
    this.isRecording = true;
    return this.currentTrack;
  }

  /**
   * Prüft ob aktuell eine Tour aufgezeichnet wird
   */
  public static getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Gibt den aktuell aktiven Track zurück
   */
  public static getCurrentTrack(): RecordedTrack | null {
    return this.currentTrack;
  }

  /**
   * Fügt einen neuen Standort-Punkt zur aktiven Aufzeichnung hinzu
   */
  public static addPoint(point: { latitude: number; longitude: number; altitude?: number; speed?: number }): RecordedTrack | null {
    if (!this.isRecording || !this.currentTrack) return null;

    const newPoint: TrackPoint = {
      ...point,
      timestamp: Date.now(),
    };

    const points = this.currentTrack.points;
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      const distMeter = this.calculateDistanceMeters(lastPoint, newPoint);
      this.currentTrack.distanceKm = parseFloat((this.currentTrack.distanceKm + distMeter / 1000).toFixed(3));

      // Höhengewinn berechnen
      if (point.altitude && lastPoint.altitude && point.altitude > lastPoint.altitude) {
        const gain = point.altitude - lastPoint.altitude;
        this.currentTrack.elevationGainMeters += Math.round(gain);
      }

      // Geschwindigkeiten berechnen
      const speedKmh = point.speed ? point.speed * 3.6 : (distMeter / ((newPoint.timestamp - lastPoint.timestamp) / 1000)) * 3.6;
      if (!isNaN(speedKmh) && speedKmh > this.currentTrack.maxSpeedKmh && speedKmh < 150) {
        this.currentTrack.maxSpeedKmh = parseFloat(speedKmh.toFixed(1));
      }
    }

    points.push(newPoint);
    this.currentTrack.durationSeconds = Math.round((Date.now() - this.currentTrack.startTime) / 1000);
    
    if (this.currentTrack.durationSeconds > 0) {
      this.currentTrack.avgSpeedKmh = parseFloat((this.currentTrack.distanceKm / (this.currentTrack.durationSeconds / 3600)).toFixed(1));
    }

    return { ...this.currentTrack };
  }

  /**
   * Beendet die Aufzeichnung und speichert den Track lokal ab
   */
  public static async stopRecording(): Promise<RecordedTrack | null> {
    if (!this.isRecording || !this.currentTrack) return null;

    this.currentTrack.endTime = Date.now();
    this.currentTrack.durationSeconds = Math.round((this.currentTrack.endTime - this.currentTrack.startTime) / 1000);
    this.isRecording = false;

    const finishedTrack = { ...this.currentTrack };
    await this.saveTrack(finishedTrack);

    this.currentTrack = null;
    return finishedTrack;
  }

  /**
   * Bricht die Aufzeichnung ohne Speichern ab
   */
  public static cancelRecording(): void {
    this.isRecording = false;
    this.currentTrack = null;
  }

  /**
   * Speichert einen Track in AsyncStorage
   */
  public static async saveTrack(track: RecordedTrack): Promise<void> {
    try {
      const tracks = await this.getSavedTracks();
      const existingIndex = tracks.findIndex(t => t.id === track.id);
      if (existingIndex >= 0) {
        tracks[existingIndex] = track;
      } else {
        tracks.unshift(track);
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    } catch (e) {
      console.warn('[TrackRecordingService] Error saving track:', e);
    }
  }

  /**
   * Lädt alle gespeicherten Tracks aus AsyncStorage
   */
  public static async getSavedTracks(): Promise<RecordedTrack[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as RecordedTrack[];
    } catch (e) {
      console.warn('[TrackRecordingService] Error reading tracks:', e);
      return [];
    }
  }

  /**
   * Löscht einen gespeicherten Track
   */
  public static async deleteTrack(id: string): Promise<void> {
    try {
      const tracks = await this.getSavedTracks();
      const filtered = tracks.filter(t => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('[TrackRecordingService] Error deleting track:', e);
    }
  }

  /**
   * Exportiert einen aufgezeichneten Track als GPX-Datei
   */
  public static async exportTrackToGpx(track: RecordedTrack): Promise<boolean> {
    const routeOption = {
      id: track.id,
      mode: 'hiking' as const,
      title: track.title,
      distanceKm: track.distanceKm,
      durationMinutes: Math.round(track.durationSeconds / 60),
      elevationGainMeters: track.elevationGainMeters,
      trafficDelayMinutes: 0,
      coordinates: track.points.map(p => ({ latitude: p.latitude, longitude: p.longitude, altitude: p.altitude })),
      steps: [],
      isFastest: false,
      isScenic: true,
      warnings: [],
    };
    return GpxService.exportAndShareGpx(routeOption);
  }

  /**
   * Hilfsmethode: Haversine Distanz-Berechnung in Metern
   */
  private static calculateDistanceMeters(p1: TrackPoint, p2: TrackPoint): number {
    const R = 6371000;
    const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
    const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.latitude * Math.PI) / 180) *
        Math.cos((p2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
