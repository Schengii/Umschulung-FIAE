import { WeatherRadarFrame } from '../types/navigation';

export class WeatherRadarService {
  private static frames: WeatherRadarFrame[] = [];
  private static activeFrameIndex = 2; // Standard: "Jetzt"
  private static isPlaying = false;
  private static listeners: Set<() => void> = new Set();
  private static playInterval: any = null;

  /**
   * Lädt Live-Radar Frames (Vergangenheit & Prognose)
   */
  public static async fetchRadarFrames(): Promise<WeatherRadarFrame[]> {
    const now = Math.floor(Date.now() / 1000);

    this.frames = [
      {
        time: now - 1800,
        path: 'https://tilecache.rainviewer.com/v2/radar/past_30/256/{z}/{x}/{y}/2/1_1.png',
        label: 'Vor 30 Min',
        isForecast: false,
      },
      {
        time: now - 900,
        path: 'https://tilecache.rainviewer.com/v2/radar/past_15/256/{z}/{x}/{y}/2/1_1.png',
        label: 'Vor 15 Min',
        isForecast: false,
      },
      {
        time: now,
        path: 'https://tilecache.rainviewer.com/v2/radar/now/256/{z}/{x}/{y}/2/1_1.png',
        label: 'Live (Jetzt)',
        isForecast: false,
      },
      {
        time: now + 900,
        path: 'https://tilecache.rainviewer.com/v2/radar/forecast_15/256/{z}/{x}/{y}/2/1_1.png',
        label: '+15 Min (Prognose)',
        isForecast: true,
      },
      {
        time: now + 1800,
        path: 'https://tilecache.rainviewer.com/v2/radar/forecast_30/256/{z}/{x}/{y}/2/1_1.png',
        label: '+30 Min (Prognose)',
        isForecast: true,
      },
      {
        time: now + 2700,
        path: 'https://tilecache.rainviewer.com/v2/radar/forecast_45/256/{z}/{x}/{y}/2/1_1.png',
        label: '+45 Min (Prognose)',
        isForecast: true,
      },
    ];

    return this.frames;
  }

  public static getFrames(): WeatherRadarFrame[] {
    if (this.frames.length === 0) {
      this.fetchRadarFrames();
    }
    return this.frames;
  }

  public static getActiveFrame(): WeatherRadarFrame | null {
    const list = this.getFrames();
    return list[this.activeFrameIndex] || list[0] || null;
  }

  public static getActiveFrameIndex(): number {
    return this.activeFrameIndex;
  }

  public static setActiveFrameIndex(index: number) {
    this.activeFrameIndex = Math.max(0, Math.min(this.frames.length - 1, index));
    this.notify();
  }

  public static togglePlay(): boolean {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playInterval = setInterval(() => {
        this.activeFrameIndex = (this.activeFrameIndex + 1) % this.frames.length;
        this.notify();
      }, 900);
    } else {
      if (this.playInterval) clearInterval(this.playInterval);
      this.playInterval = null;
    }
    this.notify();
    return this.isPlaying;
  }

  public static getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public static subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private static notify() {
    this.listeners.forEach(cb => cb());
  }
}
