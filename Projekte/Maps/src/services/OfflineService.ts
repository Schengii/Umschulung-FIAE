import * as Network from 'expo-network';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

export class OfflineService {
  private static listeners: Array<(status: NetworkStatus) => void> = [];
  private static currentStatus: NetworkStatus = {
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  };

  /**
   * Prüft aktuellen Netzwerkstatus (einmalig)
   */
  public static async checkConnectivity(): Promise<NetworkStatus> {
    try {
      const state = await Network.getNetworkStateAsync();
      const status: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type ?? 'UNKNOWN',
      };
      OfflineService.currentStatus = status;
      return status;
    } catch (error) {
      return OfflineService.currentStatus;
    }
  }

  /**
   * Gibt aktuellen gecachten Status zurück
   */
  public static getStatus(): NetworkStatus {
    return OfflineService.currentStatus;
  }

  /**
   * Gibt an ob Karten-Tiles geladen werden können
   */
  public static canLoadTiles(): boolean {
    return OfflineService.currentStatus.isConnected &&
           OfflineService.currentStatus.isInternetReachable;
  }

  /**
   * Gibt an ob Routing-API erreichbar ist
   */
  public static canRoute(): boolean {
    return OfflineService.canLoadTiles();
  }

  /**
   * Berechnet geschätzte Anzahl der Tile-Kacheln für eine Region & Zoom-Level für Offline-Cache
   */
  public static estimateRegionTiles(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number,
    zoomLevel = 14
  ): number {
    const latTiles = Math.abs(Math.ceil((maxLat - minLat) * Math.pow(2, zoomLevel - 3)));
    const lonTiles = Math.abs(Math.ceil((maxLon - minLon) * Math.pow(2, zoomLevel - 3)));
    return Math.max(1, latTiles * lonTiles);
  }
}
