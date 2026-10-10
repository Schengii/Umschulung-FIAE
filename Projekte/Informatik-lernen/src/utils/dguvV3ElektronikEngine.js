// @ts-check
/**
 * DGUV Vorschrift 3 & ITSE Elektrotechnik Prüfungs-Engine
 * Gemäß DIN VDE 0701-0702 (Wiederholungsprüfung elektrischer Geräte),
 * DIN VDE 0100-410 (Schutz gegen elektrischen Schlag / RCD Abschaltung),
 * DIN VDE 0100-600 (Prüfungen von Niederspannungsanlagen).
 * 
 * Relevanter Prüfungskern für:
 * - IT-System-Elektroniker (ITSE AP1 & AP2 Bereich 2)
 * - Fachinformatiker Systemintegration (FISI Lernfeld 2 & Rechenzentrum-Stromversorgung)
 */

/**
 * Schutzklassen nach DIN EN 61140 (VDE 0140-1)
 */
export const ELECTRICAL_PROTECTION_CLASSES = {
  class_1: {
    id: 'class_1',
    name: 'Schutzklasse I (Schutzerdung / PE)',
    symbol: '⏚',
    description: 'Geräte mit Schutzleiteranschluss und metallischem Gehäuse (z. B. Servernetzteil, PC-Gehäuse, USV, Kaltgerätestecker). Bei Körperschluss fließt der Fehlerstrom über PE ab und löst Sicherung oder RCD aus.',
    requiredTests: ['R_PE', 'R_ISO', 'I_EA']
  },
  class_2: {
    id: 'class_2',
    name: 'Schutzklasse II (Schutzisolierung / Doppelte Isolierung)',
    symbol: '回',
    description: 'Geräte mit doppelter oder verstärkter Isolierung ohne Schutzleiter (z. B. Notebook-Netzteile mit Euro-Stecker, Kunststoffgehäuse).',
    requiredTests: ['R_ISO', 'I_BA']
  },
  class_3: {
    id: 'class_3',
    name: 'Schutzklasse III (Schutzkleinspannung / SELV/PELV)',
    symbol: '⬖',
    description: 'Sicherheitsextra-Kleinspannung (SELV / Safety Extra Low Voltage, z. B. PoE mit bis zu 57 V DC oder interne PC-Komponenten mit 12 V / 5 V / 3,3 V). Keine lebensgefährlichen Spannungen (> 50 V AC oder > 120 V DC).',
    requiredTests: ['U_SELV']
  }
};

/**
 * Bewertet den Schutzleiterwiderstand (R_PE) nach DIN VDE 0701-0702
 * Grenzwert: Maximal 0,3 Ω für Leitungen bis 5 m Länge.
 * Für jede weiteren 7,5 m Leitungslänge erhöht sich der Grenzwert um 0,1 Ω (bis max 1,0 Ω).
 * @param {number} rPeMeasured Gemessener Widerstand in Ohm (Ω)
 * @param {number} [cableLengthMeters] Leitungslänge in Metern (Standard 2m)
 * @returns {{ isPassed: boolean, limitOhm: number, message: string }}
 */
export function evaluatePeResistance(rPeMeasured, cableLengthMeters = 2) {
  let limitOhm = 0.3;
  if (cableLengthMeters > 5) {
    const extraLength = cableLengthMeters - 5;
    const additionalOhms = Math.ceil(extraLength / 7.5) * 0.1;
    limitOhm = Math.min(1.0, parseFloat((0.3 + additionalOhms).toFixed(2)));
  }

  const isPassed = rPeMeasured >= 0 && rPeMeasured <= limitOhm;
  return {
    isPassed,
    limitOhm,
    message: isPassed 
      ? `Bestanden: ${rPeMeasured} Ω liegt innerhalb des zulässigen Grenzwerts von max. ${limitOhm} Ω.`
      : `Nicht bestanden: ${rPeMeasured} Ω überschreitet den Grenzwert von max. ${limitOhm} Ω (Gefahr eines unzureichenden Schutzleiter-Querschnitts oder korrodierter Kontakte!).`
  };
}

/**
 * Bewertet den Isolationswiderstand (R_ISO) nach DIN VDE 0701-0702
 * Grenzwerte:
 * - SK I: Mindestens 1,0 MΩ (bzw. 0,3 MΩ bei eingeschalteten Heizelementen)
 * - SK II: Mindestens 2,0 MΩ
 * - SK III: Mindestens 0,25 MΩ
 * @param {number} rIsoMeasuredMOhm Gemessener Widerstand in Megaohm (MΩ)
 * @param {'class_1' | 'class_2' | 'class_3'} protectionClass
 * @returns {{ isPassed: boolean, minLimitMOhm: number, message: string }}
 */
export function evaluateIsoResistance(rIsoMeasuredMOhm, protectionClass = 'class_1') {
  let minLimitMOhm = 1.0;
  if (protectionClass === 'class_2') minLimitMOhm = 2.0;
  if (protectionClass === 'class_3') minLimitMOhm = 0.25;

  const isPassed = rIsoMeasuredMOhm >= minLimitMOhm;
  return {
    isPassed,
    minLimitMOhm,
    message: isPassed
      ? `Bestanden: ${rIsoMeasuredMOhm} MΩ liegt über dem geforderten Mindestwert von ${minLimitMOhm} MΩ.`
      : `Nicht bestanden: ${rIsoMeasuredMOhm} MΩ unterschreitet die Mindestanforderung von ${minLimitMOhm} MΩ (Gefahr von Kriechströmen oder Isolationsbruch!).`
  };
}

/**
 * Berechnet und bewertet RCD / FI-Schutzschalter-Parameter nach DIN VDE 0100-410
 * Im TN-System: Maximale Abschaltzeit t_a = 0,4 s (400 ms) bei 230 V Steckdosenstromkreisen
 * Im TT-System: Maximale Abschaltzeit t_a = 0,2 s (200 ms)
 * Typischer Bemessungsfehlerstrom I_Δn = 30 mA für Personenschutz.
 * @param {number} tripCurrentMa Gemessener Auslösestrom in mA
 * @param {number} tripTimeMs Gemessene Auslösezeit in Millisekunden
 * @param {number} [ratedTripCurrentMa] Bemessungsstrom I_Δn (Standard 30 mA)
 * @param {'TN' | 'TT'} [netSystem] Netzsystem (Standard 'TN')
 * @returns {{ isPassed: boolean, tripCurrentPassed: boolean, tripTimePassed: boolean, explanation: string }}
 */
export function evaluateRcdProtection(tripCurrentMa, tripTimeMs, ratedTripCurrentMa = 30, netSystem = 'TN') {
  const maxTripTimeMs = netSystem === 'TN' ? 400 : 200;
  // Nach Norm muss RCD zwischen 0,5 * I_Δn und 1,0 * I_Δn auslösen
  const minCurrent = 0.5 * ratedTripCurrentMa;
  const maxCurrent = 1.0 * ratedTripCurrentMa;

  const tripCurrentPassed = tripCurrentMa >= minCurrent && tripCurrentMa <= maxCurrent;
  const tripTimePassed = tripTimeMs > 0 && tripTimeMs <= maxTripTimeMs;
  const isPassed = tripCurrentPassed && tripTimePassed;

  let explanation = '';
  if (!tripCurrentPassed) {
    explanation = `Fehlerhafter Auslösestrom: ${tripCurrentMa} mA liegt außerhalb des Normbereichs (erlaubt: ${minCurrent} mA bis ${maxCurrent} mA).`;
  } else if (!tripTimePassed) {
    explanation = `Abschaltzeit zu langsam: ${tripTimeMs} ms überschreitet die maximal erlaubte Abschaltzeit von ${maxTripTimeMs} ms nach VDE 0100-410!`;
  } else {
    explanation = `RCD-Prüfung erfolgreich! Auslösestrom (${tripCurrentMa} mA) und Abschaltzeit (${tripTimeMs} ms) genügen VDE 0100-410.`;
  }

  return {
    isPassed,
    tripCurrentPassed,
    tripTimePassed,
    explanation
  };
}

/**
 * Berechnet USV-Laufzeit und Batteriedimensionierung für IT-Systeme
 * Formel: Laufzeit (Minuten) = (Batteriekapazität Ah * Batteriespannung V * Wirkungsgrad η) / Last W * 60
 * @param {number} batteryCapacityAh Batteriekapazität in Amperestunden (z.B. 100 Ah)
 * @param {number} batteryVoltageV Batteriespannung in Volt (z.B. 48 V)
 * @param {number} loadWatts Verbraucherlast in Watt (z.B. 1200 W Serverlast)
 * @param {number} [efficiency] Wechselrichter-Wirkungsgrad (z.B. 0.85)
 * @returns {{ runtimeMinutes: number, storedEnergyWh: number, autonomyEvaluation: string }}
 */
export function calculateUpsBatteryRuntime(batteryCapacityAh, batteryVoltageV, loadWatts, efficiency = 0.85) {
  if (loadWatts <= 0) {
    return { runtimeMinutes: 0, storedEnergyWh: 0, autonomyEvaluation: 'Keine Last angegeben.' };
  }
  const storedEnergyWh = batteryCapacityAh * batteryVoltageV;
  const effectiveWh = storedEnergyWh * efficiency;
  const runtimeHours = effectiveWh / loadWatts;
  const runtimeMinutes = parseFloat((runtimeHours * 60).toFixed(1));

  let autonomyEvaluation = 'Geringe Überbrückungszeit (< 15 Min) – Reicht für kontrollierten Shutdown.';
  if (runtimeMinutes >= 60) {
    autonomyEvaluation = 'Exzellente Autonomiezeit (> 60 Min) – Erlaubt Weiterbetrieb bei Netzstörungen.';
  } else if (runtimeMinutes >= 30) {
    autonomyEvaluation = 'Solide Überbrückungszeit (> 30 Min) – Ausreichend für Generator-Anlauf.';
  }

  return {
    runtimeMinutes,
    storedEnergyWh,
    autonomyEvaluation
  };
}
