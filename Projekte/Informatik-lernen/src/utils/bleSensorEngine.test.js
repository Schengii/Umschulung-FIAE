import { describe, it, expect } from 'vitest';
import {
  generateSensorPacket,
  decodeBleTemperatureBytes,
  BLE_SERVICES
} from './bleSensorEngine';

describe('bleSensorEngine', () => {
  it('generiert gültige Sensor-Telemetrie-Pakete', () => {
    const packet = generateSensorPacket(23.0, 50, 75, 90);

    expect(packet.temperature).toBeGreaterThan(20);
    expect(packet.temperature).toBeLessThan(26);
    expect(packet.humidity).toBeGreaterThan(40);
    expect(packet.rawHex).toBeDefined();
    expect(packet.rssi).toBeLessThan(0);
  });

  it('dekodiert BLE Raw Bytes (0x2A6E) präzise in Temperaturwert', () => {
    // 22.50 °C = 2250 = 0x08CA (Byte0 = 0xCA, Byte1 = 0x08)
    const temp = decodeBleTemperatureBytes(0xCA, 0x08);
    expect(temp).toBe(22.5);
  });

  it('definiert standardisierte GATT Services', () => {
    expect(BLE_SERVICES.length).toBe(3);
    expect(BLE_SERVICES[0].uuid).toBe('0x181A');
  });
});
