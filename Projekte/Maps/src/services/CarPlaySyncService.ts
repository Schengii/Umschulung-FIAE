import { CarPlayDisplayState } from '../types/navigation';

export class CarPlaySyncService {
  private static state: CarPlayDisplayState = {
    isConnected: true,
    displayMode: 'carplay',
    nightMode: true,
    speedLimitKmh: 120,
    currentSpeedKmh: 105,
    quickPOIFilter: undefined,
  };

  private static listeners: Set<(state: CarPlayDisplayState) => void> = new Set();

  public static getState(): CarPlayDisplayState {
    return this.state;
  }

  public static setQuickPOIFilter(filter?: CarPlayDisplayState['quickPOIFilter']) {
    this.state = { ...this.state, quickPOIFilter: filter };
    this.notify();
  }

  public static toggleDisplayMode(): 'carplay' | 'android_auto' {
    const next = this.state.displayMode === 'carplay' ? 'android_auto' : 'carplay';
    this.state = { ...this.state, displayMode: next };
    this.notify();
    return next;
  }

  public static subscribe(callback: (state: CarPlayDisplayState) => void): () => void {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  private static notify() {
    this.listeners.forEach(cb => cb(this.state));
  }
}
