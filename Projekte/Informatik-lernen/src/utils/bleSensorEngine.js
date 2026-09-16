/**
 * Bluetooth Low Energy (BLE) & GATT Telemetry Engine
 * Simulates BLE GATT Server, Services, Characteristics, and raw byte decoding.
 */

export const BLE_SERVICES = [
  {
    uuid: '0x181A',
    name: 'Environmental Sensing Service',
    description: 'Umgebungsdaten (Temperatur & Luftfeuchtigkeit)',
    characteristics: [
      {
        uuid: '0x2A6E',
        name: 'Temperature',
        type: 'int16',
        unit: '°C',
        properties: ['Read', 'Notify']
      },
      {
        uuid: '0x2A6F',
        name: 'Humidity',
        type: 'uint16',
        unit: '% rH',
        properties: ['Read', 'Notify']
      }
    ]
  },
  {
    uuid: '0x180D',
    name: 'Heart Rate Service',
    description: 'Vitaldaten (Puls & Herzfrequenz)',
    characteristics: [
      {
        uuid: '0x2A37',
        name: 'Heart Rate Measurement',
        type: 'uint8',
        unit: 'bpm',
        properties: ['Notify']
      }
    ]
  },
  {
    uuid: '0x180F',
    name: 'Battery Service',
    description: 'Akkuladestand des Sensors',
    characteristics: [
      {
        uuid: '0x2A19',
        name: 'Battery Level',
        type: 'uint8',
        unit: '%',
        properties: ['Read', 'Notify']
      }
    ]
  }
];

export function generateSensorPacket(baseTemp = 22.5, baseHumidity = 48, baseHeartRate = 72, baseBattery = 95) {
  const tempOffset = (Math.random() - 0.5) * 0.8;
  const currentTemp = Number((baseTemp + tempOffset).toFixed(1));
  const currentHumidity = Math.min(100, Math.max(0, Math.round(baseHumidity + (Math.random() - 0.5) * 2)));
  const currentHeartRate = Math.round(baseHeartRate + (Math.random() - 0.5) * 4);
  const rssi = Math.round(-65 + (Math.random() - 0.5) * 8);

  // Encode temperature to raw int16 (hundredths of a degree Celsius)
  const rawTempInt = Math.round(currentTemp * 100);
  const byte0 = rawTempInt & 0xFF;
  const byte1 = (rawTempInt >> 8) & 0xFF;
  const hexBytes = `0x${byte0.toString(16).padStart(2, '0').toUpperCase()} 0x${byte1.toString(16).padStart(2, '0').toUpperCase()}`;

  return {
    timestamp: new Date().toLocaleTimeString(),
    temperature: currentTemp,
    humidity: currentHumidity,
    heartRate: currentHeartRate,
    battery: baseBattery,
    rssi,
    rawHex: hexBytes
  };
}

export function decodeBleTemperatureBytes(byte0, byte1) {
  const combined = (byte1 << 8) | byte0;
  return Number((combined / 100).toFixed(2));
}
