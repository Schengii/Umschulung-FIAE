// @ts-check
/**
 * IHK Übertragungszeit- & Bandbreiten-Engine
 * Berechnung von Datenmengen, Bandbreiten, Protokoll-Overhead und Übertragungszeiten
 * nach IHK-Standard (Dezimal vs. Binärpräfixe, MTU, Protocol Overhead).
 * @module transferTimeEngine
 */

/**
 * Präfix-Definitionen:
 * Dezimal (SI): 1 kB = 1.000 Byte, 1 MB = 1.000.000 Byte, 1 GB = 1.000.000.000 Byte
 * Binär (IEC): 1 KiB = 1.024 Byte, 1 MiB = 1.048.576 Byte, 1 GiB = 1.073.741.824 Byte
 */
export const DATA_UNITS = {
  B: { label: 'Byte (B)', bytes: 1, type: 'exact' },
  KB: { label: 'Kilobyte (kB - Dezimal, 10³)', bytes: 1_000, type: 'si' },
  MB: { label: 'Megabyte (MB - Dezimal, 10⁶)', bytes: 1_000_000, type: 'si' },
  GB: { label: 'Gigabyte (GB - Dezimal, 10⁹)', bytes: 1_000_000_000, type: 'si' },
  TB: { label: 'Terabyte (TB - Dezimal, 10¹²)', bytes: 1_000_000_000_000, type: 'si' },
  KIB: { label: 'Kibibyte (KiB - Binär, 2¹⁰)', bytes: 1024, type: 'iec' },
  MIB: { label: 'Mebibyte (MiB - Binär, 2²⁰)', bytes: 1024 ** 2, type: 'iec' },
  GIB: { label: 'Gibibyte (GiB - Binär, 2³⁰)', bytes: 1024 ** 3, type: 'iec' },
  TIB: { label: 'Tebibyte (TiB - Binär, 2⁴⁰)', bytes: 1024 ** 4, type: 'iec' },
};

/**
 * Bandbreiten-Einheiten in Bit pro Sekunde (bit/s)
 */
export const SPEED_UNITS = {
  BPS: { label: 'Bit/s (bps)', bps: 1 },
  KBPS: { label: 'kbit/s (10³ bit/s)', bps: 1_000 },
  MBPS: { label: 'Mbit/s (10⁶ bit/s)', bps: 1_000_000 },
  GBPS: { label: 'Gbit/s (10⁹ bit/s)', bps: 1_000_000_000 },
};

/**
 * Typische IHK-Anschlussarten & Bandbreiten (Down/Up in Mbit/s)
 */
export const PRESET_CONNECTIONS = [
  { id: 'dsl_16', name: 'ADSL2+ (16 Mbit/s)', downMbps: 16, upMbps: 1, desc: 'Klassischer Kupfer-Anschluss' },
  { id: 'vdsl_50', name: 'VDSL 50 (50 Mbit/s)', downMbps: 50, upMbps: 10, desc: 'Vectoring FTTC' },
  { id: 'vdsl_100', name: 'VDSL 100 (100 Mbit/s)', downMbps: 100, upMbps: 40, desc: 'Supervectoring' },
  { id: 'cable_250', name: 'Kabel DOCSIS 3.1 (250 Mbit/s)', downMbps: 250, upMbps: 25, desc: 'Koaxial/HFC' },
  { id: 'cable_1000', name: 'Gigabit Kabel (1000 Mbit/s)', downMbps: 1000, upMbps: 50, desc: 'DOCSIS 3.1 Gigabit' },
  { id: 'ftth_1000', name: 'FTTH Glasfaser (1 Gbit/s Symmetrisch)', downMbps: 1000, upMbps: 1000, desc: 'Reine Glasfaser direkt ins Gebäude' },
  { id: 'lan_1g', name: 'Gigabit LAN (1000BASE-T)', downMbps: 1000, upMbps: 1000, desc: 'Internes Firmennetzwerk Cat 5e/6' },
  { id: 'lan_10g', name: '10G Ethernet (10GBASE-T)', downMbps: 10000, upMbps: 10000, desc: 'Rechenzentrum / Server-Backbone' },
];

/**
 * Typische IHK-Prüfungsszenarien
 */
export const IHK_SCENARIOS = [
  {
    id: 'backup_san',
    title: 'Rechenzentrums-Backup (IHK AP1)',
    description: 'Ein nächtliches inkrementelles Backup von 450 GiB soll über eine 1 Gbit/s Leitung übertragen werden. Berücksichtigen Sie 5% Protokoll-Overhead.',
    dataAmount: 450,
    dataUnit: 'GIB',
    speedAmount: 1,
    speedUnit: 'GBPS',
    overheadPercent: 5,
  },
  {
    id: 'os_rollout',
    title: 'Betriebssystem-Image Rollout (IHK AP2)',
    description: 'Ein Golden Image von 35 GB (Dezimal) wird über eine 100 Mbit/s Verbindung an einen Standort übertragen (10% TCP/IP Overhead).',
    dataAmount: 35,
    dataUnit: 'GB',
    speedAmount: 100,
    speedUnit: 'MBPS',
    overheadPercent: 10,
  },
  {
    id: 'cloud_sync',
    title: 'Cloud-Migration Datenbank-Dump',
    description: 'Eine 120 GB SQL-Dumpdatei wird über DSL 100 mit 40 Mbit/s Upload synchronisiert.',
    dataAmount: 120,
    dataUnit: 'GB',
    speedAmount: 40,
    speedUnit: 'MBPS',
    overheadPercent: 8,
  }
];

/**
 * Konvertiert eine Datenmenge in Gesamt-Bytes.
 * @param {number} amount
 * @param {keyof typeof DATA_UNITS} unitKey
 * @returns {number}
 */
export function toBytes(amount, unitKey) {
  const unit = DATA_UNITS[unitKey] || DATA_UNITS.MB;
  return amount * unit.bytes;
}

/**
 * Konvertiert eine Bandbreite in Bits pro Sekunde.
 * @param {number} amount
 * @param {keyof typeof SPEED_UNITS} unitKey
 * @returns {number}
 */
export function toBps(amount, unitKey) {
  const unit = SPEED_UNITS[unitKey] || SPEED_UNITS.MBPS;
  return amount * unit.bps;
}

/**
 * Berechnet die Übertragungszeit.
 * @param {object} params
 * @param {number} params.dataAmount - Betrag der Datenmenge
 * @param {keyof typeof DATA_UNITS} params.dataUnit - Einheit der Datenmenge
 * @param {number} params.speedAmount - Betrag der Bandbreite
 * @param {keyof typeof SPEED_UNITS} params.speedUnit - Einheit der Bandbreite
 * @param {number} [params.overheadPercent=0] - Zusätzlicher Protokoll-Overhead in Prozent (z. B. 5 für 5%)
 * @returns {{
 *   totalBytes: number;
 *   totalBits: number;
 *   effectiveBits: number;
 *   bps: number;
 *   seconds: number;
 *   formattedTime: string;
 *   steps: string[];
 * }}
 */
export function calculateTransferTime({
  dataAmount,
  dataUnit,
  speedAmount,
  speedUnit,
  overheadPercent = 0,
}) {
  if (dataAmount <= 0 || speedAmount <= 0) {
    return {
      totalBytes: 0,
      totalBits: 0,
      effectiveBits: 0,
      bps: 0,
      seconds: 0,
      formattedTime: '0 Sekunden',
      steps: ['Ungültige Eingabe: Datenmenge und Geschwindigkeit müssen > 0 sein.']
    };
  }

  const unitDef = DATA_UNITS[dataUnit] || DATA_UNITS.MB;
  const speedDef = SPEED_UNITS[speedUnit] || SPEED_UNITS.MBPS;

  const totalBytes = toBytes(dataAmount, dataUnit);
  const totalBits = totalBytes * 8;
  const overheadFactor = 1 + (Math.max(0, overheadPercent) / 100);
  const effectiveBits = totalBits * overheadFactor;
  const bps = toBps(speedAmount, speedUnit);

  const seconds = effectiveBits / bps;

  const steps = [
    `1. Datenmenge in Byte: ${dataAmount} ${unitDef.label} = ${totalBytes.toLocaleString('de-DE')} Byte`,
    `2. Datenmenge in Bit: ${totalBytes.toLocaleString('de-DE')} Byte × 8 Bit/Byte = ${totalBits.toLocaleString('de-DE')} Bit`,
    overheadPercent > 0
      ? `3. Mit Protokoll-Overhead (+${overheadPercent}%): ${totalBits.toLocaleString('de-DE')} Bit × ${overheadFactor.toFixed(3)} = ${Math.round(effectiveBits).toLocaleString('de-DE')} Bit`
      : `3. Ohne Overhead: ${totalBits.toLocaleString('de-DE')} Bit`,
    `4. Bandbreite: ${speedAmount} ${speedDef.label} = ${bps.toLocaleString('de-DE')} Bit/s`,
    `5. Berechnung Übertragungszeit: ${Math.round(effectiveBits).toLocaleString('de-DE')} Bit ÷ ${bps.toLocaleString('de-DE')} Bit/s = ${seconds.toFixed(2)} Sekunden`
  ];

  return {
    totalBytes,
    totalBits,
    effectiveBits,
    bps,
    seconds,
    formattedTime: formatDuration(seconds),
    steps,
  };
}

/**
 * Formatiert Sekunden in eine lesbare Zeitangabe (Tage, Stunden, Minuten, Sekunden).
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)} ms`;
  }
  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  }

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d} ${d === 1 ? 'Tag' : 'Tage'}`);
  if (h > 0) parts.push(`${h} Std.`);
  if (m > 0) parts.push(`${m} Min.`);
  if (s > 0 || parts.length === 0) parts.push(`${s} Sek.`);

  return parts.join(' ');
}
