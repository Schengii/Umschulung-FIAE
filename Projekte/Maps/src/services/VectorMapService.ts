import { VectorMapRegion } from '../types/navigation';

export class VectorMapService {
  private static availableRegions: VectorMapRegion[] = [
    {
      id: 'vector-bayern',
      name: 'Bayern & Alpenland (Hochauflösend)',
      country: 'Deutschland',
      sizeMb: 145,
      isDownloaded: true,
      lastUpdated: '2026-08-10',
      format: 'mbtiles',
    },
    {
      id: 'vector-bw',
      name: 'Baden-Württemberg & Schwarzwald',
      country: 'Deutschland',
      sizeMb: 110,
      isDownloaded: false,
      lastUpdated: '2026-08-01',
      format: 'mbtiles',
    },
    {
      id: 'vector-tirol',
      name: 'Tirol & Dolomiten (Outdoor Spezial)',
      country: 'Österreich / Italien',
      sizeMb: 95,
      isDownloaded: false,
      lastUpdated: '2026-08-05',
      format: 'mbtiles',
    },
    {
      id: 'vector-nrw',
      name: 'Nordrhein-Westfalen & Ruhrgebiet',
      country: 'Deutschland',
      sizeMb: 130,
      isDownloaded: false,
      lastUpdated: '2026-07-28',
      format: 'mbtiles',
    },
  ];

  public static async getAvailableRegions(): Promise<VectorMapRegion[]> {
    return this.availableRegions;
  }

  public static async downloadRegion(
    regionId: string,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    const region = this.availableRegions.find(r => r.id === regionId);
    if (!region) return false;

    // Simulierter Download-Fortschritt
    for (let i = 1; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 80));
      region.downloadProgress = i / 10;
      onProgress?.(i / 10);
    }

    region.isDownloaded = true;
    region.downloadProgress = undefined;
    region.lastUpdated = new Date().toISOString().split('T')[0];
    return true;
  }

  public static async deleteRegion(regionId: string): Promise<boolean> {
    const region = this.availableRegions.find(r => r.id === regionId);
    if (!region) return false;
    region.isDownloaded = false;
    return true;
  }
}
