import { SmartwatchSyncState, NavigationStep } from '../types/navigation';

export class SmartwatchSyncService {
  private static isConnected: boolean = true;
  private static subscribers: Set<(state: SmartwatchSyncState) => void> = new Set();
  private static currentState: SmartwatchSyncState = {
    isConnected: true,
    watchModel: 'Apple Watch Series 9 / Ultra',
    batteryPercent: 84,
    nextTurnInstruction: 'In 250m rechts abbiegen',
    distanceToTurnMeters: 250,
    estimatedArrival: '14:45',
    currentHeartRate: 128,
    hapticPattern: 'triple_right',
  };

  public static getSyncState(): SmartwatchSyncState {
    return this.currentState;
  }

  public static updateNavigationData(
    step: NavigationStep | undefined,
    etaString: string,
    currentHr?: number
  ) {
    if (!step) return;

    let haptic: SmartwatchSyncState['hapticPattern'] = 'single_tap';
    if (step.iconName.includes('left')) haptic = 'double_left';
    else if (step.iconName.includes('right')) haptic = 'triple_right';

    this.currentState = {
      ...this.currentState,
      nextTurnInstruction: step.instruction,
      distanceToTurnMeters: step.distanceMeter,
      estimatedArrival: etaString,
      currentHeartRate: currentHr || this.currentState.currentHeartRate,
      hapticPattern: haptic,
    };

    this.subscribers.forEach(cb => cb(this.currentState));
  }

  public static subscribe(callback: (state: SmartwatchSyncState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.currentState);
    return () => this.subscribers.delete(callback);
  }

  public static toggleConnection(): boolean {
    this.isConnected = !this.isConnected;
    this.currentState.isConnected = this.isConnected;
    this.subscribers.forEach(cb => cb(this.currentState));
    return this.isConnected;
  }
}
