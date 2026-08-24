import { BLESensorDevice, BLESensorMetrics, BLESensorType } from '../types/navigation';

export class BLESensorService {
  private static connectedSensors: Map<string, BLESensorDevice> = new Map();
  private static metricListeners: Set<(metrics: BLESensorMetrics) => void> = new Set();
  private static currentMetrics: BLESensorMetrics = {};
  private static simulationInterval: any = null;

  /**
   * Scannt nach verfügbaren Bluetooth LE Fitness-Sensoren (Polar H10, Garmin HRM, Wahoo Cadence etc.)
   */
  public static async scanForDevices(): Promise<BLESensorDevice[]> {
    // Simuliert realistischen BLE Discovery Scan
    await new Promise(resolve => setTimeout(resolve, 600));

    return [
      {
        id: 'ble-hr-polar-h10',
        name: 'Polar H10 Heart Rate Sensor',
        type: 'heart_rate',
        isConnected: this.connectedSensors.has('ble-hr-polar-h10'),
        batteryLevel: 88,
        rssi: -58,
      },
      {
        id: 'ble-cad-wahoo-rpm',
        name: 'Wahoo RPM Cadence Sensor',
        type: 'cadence',
        isConnected: this.connectedSensors.has('ble-cad-wahoo-rpm'),
        batteryLevel: 94,
        rssi: -64,
      },
      {
        id: 'ble-pwr-garmin-rally',
        name: 'Garmin Rally Power Meter',
        type: 'power_meter',
        isConnected: this.connectedSensors.has('ble-pwr-garmin-rally'),
        batteryLevel: 76,
        rssi: -72,
      },
    ];
  }

  /**
   * Verbindet einen BLE-Sensor
   */
  public static async connectDevice(device: BLESensorDevice): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    device.isConnected = true;
    this.connectedSensors.set(device.id, device);
    this.startMetricsSimulation();
    return true;
  }

  /**
   * Trennt einen BLE-Sensor
   */
  public static async disconnectDevice(deviceId: string): Promise<boolean> {
    this.connectedSensors.delete(deviceId);
    if (this.connectedSensors.size === 0) {
      this.stopMetricsSimulation();
      this.currentMetrics = {};
      this.notifyListeners();
    }
    return true;
  }

  public static getConnectedDevices(): BLESensorDevice[] {
    return Array.from(this.connectedSensors.values());
  }

  public static getCurrentMetrics(): BLESensorMetrics {
    return this.currentMetrics;
  }

  public static subscribeMetrics(callback: (metrics: BLESensorMetrics) => void): () => void {
    this.metricListeners.add(callback);
    callback(this.currentMetrics);
    return () => this.metricListeners.delete(callback);
  }

  public static calculateHeartRateZone(bpm: number, maxHr: number = 190): BLESensorMetrics['heartRateZone'] {
    const percent = (bpm / maxHr) * 100;
    if (percent < 60) return 'Regeneration';
    if (percent < 70) return 'Fettverbrennung';
    if (percent < 80) return 'Ausdauer';
    if (percent < 90) return 'Schwellentraining';
    return 'Maximal';
  }

  private static startMetricsSimulation() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      let hr = this.currentMetrics.heartRateBpm || 135;
      let cad = this.currentMetrics.cadenceRpm || 82;
      let pwr = this.currentMetrics.powerWatts || 190;

      // Realistische Fluktuationen
      hr = Math.min(185, Math.max(90, hr + Math.floor(Math.random() * 5) - 2));
      cad = Math.min(110, Math.max(60, cad + Math.floor(Math.random() * 3) - 1));
      pwr = Math.min(380, Math.max(120, pwr + Math.floor(Math.random() * 11) - 5));

      const hasHR = Array.from(this.connectedSensors.values()).some(s => s.type === 'heart_rate');
      const hasCad = Array.from(this.connectedSensors.values()).some(s => s.type === 'cadence');
      const hasPwr = Array.from(this.connectedSensors.values()).some(s => s.type === 'power_meter');

      this.currentMetrics = {
        heartRateBpm: hasHR ? hr : undefined,
        cadenceRpm: hasCad ? cad : undefined,
        powerWatts: hasPwr ? pwr : undefined,
        heartRateZone: hasHR ? this.calculateHeartRateZone(hr) : undefined,
      };

      this.notifyListeners();
    }, 1000);
  }

  private static stopMetricsSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private static notifyListeners() {
    this.metricListeners.forEach(cb => cb(this.currentMetrics));
  }
}
