import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { BleMultimeterService, type BleMeasurement } from "./ble-multimeter-service";

describe("BleMultimeterService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("prüft Web Bluetooth Unterstützung", () => {
    const service = new BleMultimeterService();

    vi.stubGlobal("navigator", {});
    expect(service.isBluetoothSupported()).toBe(false);

    vi.stubGlobal("navigator", { bluetooth: {} });
    expect(service.isBluetoothSupported()).toBe(true);
  });

  it("fällt auf Simulator-Modus zurück, wenn kein Bluetooth verfügbar ist", async () => {
    vi.stubGlobal("navigator", {});
    const service = new BleMultimeterService();

    const measurements: BleMeasurement[] = [];
    const statusChanges: Array<{ connected: boolean; deviceName?: string }> = [];

    const ok = await service.connect(
      (m) => measurements.push(m),
      (connected, deviceName) => statusChanges.push({ connected, deviceName }),
    );

    expect(ok).toBe(true);
    expect(service.isConnected).toBe(true);
    expect(statusChanges).toEqual([
      { connected: true, deviceName: "Simulierte BLE-Messspitze (Bluetooth Demo)" },
    ]);

    // Simuliere Timer-Ticks für Messdaten
    vi.advanceTimersByTime(1300);
    expect(measurements.length).toBeGreaterThan(0);
    expect(measurements[0].value).toBeGreaterThan(0);

    // Trennen
    service.disconnect();
    expect(service.isConnected).toBe(false);
  });

  it("verbindet sich erfolgreich über Web Bluetooth GATT und empfängt Messwerte", async () => {
    type EventCallback = (event: Event) => void;
    type VoidCallback = () => void;
    let charListener: EventCallback | undefined;
    const mockCharacteristic = {
      startNotifications: vi.fn(async () => {}),
      addEventListener: vi.fn((_type: string, listener: EventCallback) => {
        charListener = listener;
      }),
    };

    const mockPrimaryService = {
      getCharacteristic: vi.fn(async () => mockCharacteristic),
    };

    const disconnectFn = vi.fn();
    const mockGatt = {
      connected: true,
      connect: vi.fn(async () => ({
        getPrimaryService: vi.fn(async () => mockPrimaryService),
      })),
      disconnect: disconnectFn,
    };

    let disconnectListener: VoidCallback | undefined;
    const mockDevice = {
      name: "Voltcraft BLE VC-880",
      gatt: mockGatt,
      addEventListener: vi.fn((_type: string, listener: VoidCallback) => {
        disconnectListener = listener;
      }),
    };

    vi.stubGlobal("navigator", {
      bluetooth: {
        requestDevice: vi.fn(async () => mockDevice),
      },
    });

    const service = new BleMultimeterService();
    const measurements: BleMeasurement[] = [];
    const statuses: Array<{ connected: boolean; deviceName?: string }> = [];

    const ok = await service.connect(
      (m) => measurements.push(m),
      (connected, deviceName) => statuses.push({ connected, deviceName }),
    );

    expect(ok).toBe(true);
    expect(service.isConnected).toBe(true);
    expect(statuses[0]).toEqual({ connected: true, deviceName: "Voltcraft BLE VC-880" });
    expect(mockCharacteristic.startNotifications).toHaveBeenCalled();

    // Sende simuliertes Event vom Multimeter mit 230 V (23.0 V intern skaliert)
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint8(0, 230);

    const mockEvent = {
      target: { value: view },
    } as unknown as Event;

    charListener?.(mockEvent);

    expect(measurements).toHaveLength(1);
    expect(measurements[0].value).toBe(23.0);
    expect(measurements[0].unit).toBe("V");
    expect(measurements[0].stable).toBe(true);

    // Simuliere unerwartetes Trennen des Geräts
    disconnectListener?.();
    expect(service.isConnected).toBe(false);
    expect(statuses[statuses.length - 1]).toEqual({ connected: false });
  });

  it("fällt bei GATT-Fehler oder Abbruch auf Simulation zurück", async () => {
    vi.stubGlobal("navigator", {
      bluetooth: {
        requestDevice: vi.fn(async () => {
          throw new Error("User cancelled device selection");
        }),
      },
    });

    const service = new BleMultimeterService();
    const measurements: BleMeasurement[] = [];
    const statuses: Array<{ connected: boolean; deviceName?: string }> = [];

    const ok = await service.connect(
      (m) => measurements.push(m),
      (connected, deviceName) => statuses.push({ connected, deviceName }),
    );

    expect(ok).toBe(true);
    expect(service.isConnected).toBe(true);
    expect(statuses[0].deviceName).toContain("Simulierte BLE-Messspitze");

    service.disconnect((conn) => statuses.push({ connected: conn }));
    expect(service.isConnected).toBe(false);
  });
});
