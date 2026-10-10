// @ts-check
/**
 * @file usvCalculationsEngine.js
 * USV-Dimensionierungs- & Energieberechnungs-Engine (Ununterbrochene Stromversorgung).
 * Behandelt Scheinleistung (S in VA), Wirkleistung (P in W), Leistungsfaktor (cos phi),
 * Autonomiezeit-Kalkulation, DIN EN 62040-3 USV-Typen (VFD, VI, VFI) und PUE-Metrik.
 */

/**
 * @typedef {'VFD' | 'VI' | 'VFI'} UsvTopology
 * 
 * @typedef {object} ItConsumerItem
 * @property {string} id
 * @property {string} name
 * @property {number} count
 * @property {number} wattPerUnit
 * @property {number} cosPhi
 */

/**
 * @typedef {object} UsvTypeInfo
 * @property {UsvTopology} code
 * @property {string} name
 * @property {string} germanName
 * @property {string} switchTime
 * @property {string} waveform
 * @property {string} recommendedFor
 * @property {string} explanation
 */

/**
 * USV-Klassifizierung nach DIN EN 62040-3
 * @type {UsvTypeInfo[]}
 */
export const USV_TOPOLOGIES = [
  {
    code: 'VFD',
    name: 'Voltage and Frequency Dependent',
    germanName: 'Offline- / Standby-USV',
    switchTime: '4 – 10 ms',
    waveform: 'Rechteckig / Trapezförmig',
    recommendedFor: 'Einzelplatzrechner, Office-PCs, Router, Telefonanlagen',
    explanation: 'Verbraucher werden im Normalbetrieb direkt aus dem Stromnetz versorgt. Bei Stromausfall schaltet ein Relais mit kurzer Unterbrechung (4-10 ms) auf Akkubetrieb um.'
  },
  {
    code: 'VI',
    name: 'Voltage Independent',
    germanName: 'Line-Interactive USV',
    switchTime: '2 – 4 ms',
    waveform: 'Sinusähnlich / Reine Sinuswelle',
    recommendedFor: 'Netzwerkschränke, Switche, Abteilungs-Server, NAS-Systeme',
    explanation: 'Verfügt über einen automatischen Spannungsregler (AVR / Autotransformator), der Unter- und Überspannungen ohne Akku-Einsatz ausgleicht. Kürzere Umschaltzeit als VFD.'
  },
  {
    code: 'VFI',
    name: 'Voltage and Frequency Independent',
    germanName: 'Online- / Dauerwandler-USV',
    switchTime: '0 ms (unterbrechungsfrei)',
    waveform: 'Perfekte Sinuswelle',
    recommendedFor: 'Rechenzentren, Core-Switche, geschäftskritische Datenbank-Server, Medizintechnik',
    explanation: 'Doppelwandler-Prinzip: Netzwechselspannung wird kontinuierlich in Gleichspannung gewandelt und über einen Wechselrichter wieder in sauberen Wechselstrom gespeist. 0 ms Umschaltzeit!'
  }
];

/**
 * Berechnet Wirk-, Schein- und Blindleistung für gegebene Verbraucher
 * @param {number} totalWatt - Gesamtwirkleistung P in Watt
 * @param {number} cosPhi - Leistungsfaktor (typisch 0.8 bis 0.9)
 * @param {number} [safetyMarginPercent] - IHK-Sicherheitsreserve in Prozent (Standard 25%)
 * @returns {{
 *   activePowerW: number,
 *   activePowerKw: number,
 *   apparentPowerVa: number,
 *   apparentPowerKva: number,
 *   reactivePowerVar: number,
 *   requiredUsvWatt: number,
 *   requiredUsvVa: number,
 *   cosPhi: number
 * }}
 */
export function calculatePowerMetrics(totalWatt, cosPhi = 0.8, safetyMarginPercent = 25) {
  const effectiveCosPhi = Math.max(0.1, Math.min(1.0, cosPhi));
  const activePowerW = Math.max(0, totalWatt);
  const activePowerKw = Math.round((activePowerW / 1000) * 100) / 100;

  // Scheinleistung S = P / cos(phi)
  const apparentPowerVa = Math.round(activePowerW / effectiveCosPhi);
  const apparentPowerKva = Math.round((apparentPowerVa / 1000) * 100) / 100;

  // Blindleistung Q = sqrt(S^2 - P^2)
  const reactivePowerVar = Math.round(Math.sqrt(Math.max(0, apparentPowerVa * apparentPowerVa - activePowerW * activePowerW)));

  // Mit Sicherheitszuschlag (z.B. +25%)
  const marginFactor = 1 + (safetyMarginPercent / 100);
  const requiredUsvWatt = Math.round(activePowerW * marginFactor);
  const requiredUsvVa = Math.round(apparentPowerVa * marginFactor);

  return {
    activePowerW,
    activePowerKw,
    apparentPowerVa,
    apparentPowerKva,
    reactivePowerVar,
    requiredUsvWatt,
    requiredUsvVa,
    cosPhi: effectiveCosPhi
  };
}

/**
 * Berechnet die Autonomiezeit / Überbrückungszeit in Minuten
 * @param {number} totalWatt - Lastleistung in Watt
 * @param {number} batteryVoltageV - Batteriespannung (z.B. 12V, 24V, 48V)
 * @param {number} batteryCapacityAh - Akkukapazität in Amperestunden
 * @param {number} [efficiency] - Wirkungsgrad der USV (typisch 0.85 bis 0.92)
 * @param {number} [depthOfDischarge] - Maximale Entladetiefe (typisch 0.8 bis 0.9)
 * @returns {{
 *   runtimeMinutes: number,
 *   totalEnergyWh: number,
 *   usableEnergyWh: number,
 *   loadWatt: number
 * }}
 */
export function calculateAutonomyTime(
  totalWatt,
  batteryVoltageV,
  batteryCapacityAh,
  efficiency = 0.85,
  depthOfDischarge = 0.85
) {
  if (totalWatt <= 0) {
    return { runtimeMinutes: 0, totalEnergyWh: 0, usableEnergyWh: 0, loadWatt: 0 };
  }

  // Bruttoenergie: E = U * Q
  const totalEnergyWh = Math.round(batteryVoltageV * batteryCapacityAh * 10) / 10;
  // Nutzbare Energie unter Berücksichtigung von Wirkungsgrad und Entladetiefe
  const usableEnergyWh = Math.round(totalEnergyWh * efficiency * depthOfDischarge * 10) / 10;

  // Zeit in Stunden t = E_nutzbar / P, umgerechnet in Minuten
  const runtimeHours = usableEnergyWh / totalWatt;
  const runtimeMinutes = Math.round(runtimeHours * 60 * 10) / 10;

  return {
    runtimeMinutes,
    totalEnergyWh,
    usableEnergyWh,
    loadWatt: totalWatt
  };
}

/**
 * Berechnet die Power Usage Effectiveness (PUE) für Rechenzentren
 * @param {number} totalFacilityEnergyKwh - Gesamte aufgenommene Energie (inkl. Kühlung, Licht, USV-Verluste)
 * @param {number} itEquipmentEnergyKwh - Reine IT-Energie (Server, Storage, Netzwerk)
 * @returns {{
 *   pue: number,
 *   overheadPercent: number,
 *   rating: 'Hervorragend' | 'Sehr gut' | 'Durchschnittlich' | 'Inoffizient'
 * }}
 */
export function calculatePue(totalFacilityEnergyKwh, itEquipmentEnergyKwh) {
  if (itEquipmentEnergyKwh <= 0) {
    return { pue: 1.0, overheadPercent: 0, rating: 'Durchschnittlich' };
  }

  const pue = Math.round((totalFacilityEnergyKwh / itEquipmentEnergyKwh) * 100) / 100;
  const overheadPercent = Math.round((pue - 1.0) * 100);

  let rating = 'Durchschnittlich';
  if (pue <= 1.2) rating = 'Hervorragend';
  else if (pue <= 1.4) rating = 'Sehr gut';
  else if (pue <= 1.8) rating = 'Durchschnittlich';
  else rating = 'Inoffizient';

  // @ts-ignore
  return { pue, overheadPercent, rating };
}

/**
 * Typisches IHK Serverrack Musterszenario
 * @type {ItConsumerItem[]}
 */
export const DEFAULT_SERVER_RACK_CONSUMERS = [
  { id: 'c1', name: 'Virtualisierungs-Host 1 (2x Xeon, 128GB, RAID)', count: 2, wattPerUnit: 350, cosPhi: 0.85 },
  { id: 'c2', name: 'SAN-Storage-Array (24x SAS SSD)', count: 1, wattPerUnit: 400, cosPhi: 0.9 },
  { id: 'c3', name: 'Core-Switch (48x 10GbE PoE)', count: 2, wattPerUnit: 120, cosPhi: 0.8 },
  { id: 'c4', name: 'NGFW Firewall Appliance', count: 1, wattPerUnit: 80, cosPhi: 0.85 }
];

/**
 * IHK Prüfungsdrill Fragen für USV & Energieversorgung
 */
export const USV_DRILL_QUESTIONS = [
  {
    id: 'usv_1',
    frage: 'Welche USV-Topologie nach DIN EN 62040-3 bietet eine Umschaltzeit von 0 ms (unterbrechungsfrei) durch permanente Doppelwandlung?',
    optionen: [
      'VFD (Voltage and Frequency Dependent / Offline-USV)',
      'VI (Voltage Independent / Line-Interactive USV)',
      'VFI (Voltage and Frequency Independent / Online-USV)',
      'Bypass-Modus nach VDE 0100'
    ],
    korrektIndex: 2,
    erklaerung: 'VFI-Dauerwandler wandeln Wechselstrom kontinuierlich in Gleichstrom und über den Wechselrichter wieder in sauberen Sinus-Wechselstrom. Da die Last stets über den Wechselrichter läuft, existiert keine Umschaltzeit (0 ms).'
  },
  {
    id: 'usv_2',
    frage: 'Ein Serverrack hat eine Gesamtwirkleistung von P = 1.600 Watt bei einem Leistungsfaktor cos phi = 0,8. Welche minimale Scheinleistung S muss die USV bereitstellen können?',
    optionen: [
      '1.280 VA',
      '1.600 VA',
      '2.000 VA',
      '2.560 VA'
    ],
    korrektIndex: 2,
    erklaerung: 'S = P / cos phi = 1.600 W / 0,8 = 2.000 VA.'
  },
  {
    id: 'usv_3',
    frage: 'Warum sollte bei der Dimensionierung einer USV für ein Rechenzentrum ein Sicherheitszuschlag von 20–30 % einkalkuliert werden?',
    optionen: [
      'Ausschließlich zur Kompensation von Netzfrequenzschwankungen.',
      'Um Einschaltströme (Inrush Currents) abzufangen, zukünftige Rackerweiterungen zu ermöglichen und die USV nicht dauerhaft an der Volllastgrenze zu betreiben.',
      'Weil der PUE-Wert sonst unter 1,0 fallen würde.',
      'Weil BSI IT-Grundschutz zwingend 50 % Reserve vorschreibt.'
    ],
    korrektIndex: 1,
    erklaerung: 'Ein Sicherheitszuschlag stellt sicher, dass Einschaltstromspitzen die USV nicht überlasten, Akkus geschont werden und spätere Hardware-Erweiterungen ohne USV-Austausch möglich sind.'
  },
  {
    id: 'usv_4',
    frage: 'Was bedeutet ein PUE-Wert (Power Usage Effectiveness) von 1,25 in einem Rechenzentrum?',
    optionen: [
      'Das Rechenzentrum erzeugt 25 % mehr Energie als es verbraucht.',
      'Für jedes verbrauchte Watt an reiner IT-Leistung werden zusätzlich 0,25 Watt für Infrastruktur (Kühlung, USV-Verluste, Beleuchtung) benötigt.',
      'Die USV hat einen Wirkungsgrad von genau 25 %.',
      'Die IT-Geräte laufen 25 % über ihrer Nennleistung.'
    ],
    korrektIndex: 1,
    erklaerung: 'PUE = Gesamtenergie / IT-Energie. Ein Wert von 1,25 bedeutet: 1,00 für die IT-Server plus 0,25 (25 %) Overhead für Kühlung, Lüftung und USV-Verlustleistung.'
  }
];
