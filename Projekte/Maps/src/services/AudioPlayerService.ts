import { AudioTrack } from '../types/navigation';

export class AudioPlayerService {
  private static tracks: AudioTrack[] = [
    {
      id: 'track-1',
      title: 'Bayern 3 Live Stream',
      artist: 'Bayerischer Rundfunk',
      album: 'Live Radio',
      durationSeconds: 0,
      streamType: 'radio',
    },
    {
      id: 'track-2',
      title: 'Navigation Chillout & Deep Focus',
      artist: 'Spotify Playlist',
      album: 'Roadtrip Essentials',
      durationSeconds: 215,
      streamType: 'spotify',
    },
    {
      id: 'track-3',
      title: 'Outdoor & Hiking Podcast #42',
      artist: 'Bergwelten Talk',
      album: 'Alpen-Abenteuer',
      durationSeconds: 1420,
      streamType: 'podcast',
    },
  ];

  private static currentTrackIndex = 0;
  private static isPlaying = false;
  private static isDucked = false; // Audio-Ducking bei Turn-by-Turn Sprachanweisungen
  private static listeners: Set<() => void> = new Set();

  public static getTracks(): AudioTrack[] {
    return this.tracks;
  }

  public static getCurrentTrack(): AudioTrack {
    return this.tracks[this.currentTrackIndex] || this.tracks[0];
  }

  public static getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public static togglePlayPause(): boolean {
    this.isPlaying = !this.isPlaying;
    this.notify();
    return this.isPlaying;
  }

  public static nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.isPlaying = true;
    this.notify();
  }

  public static prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.isPlaying = true;
    this.notify();
  }

  public static setAudioDucking(duck: boolean) {
    this.isDucked = duck;
    this.notify();
  }

  public static subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notify() {
    this.listeners.forEach(cb => cb());
  }
}
