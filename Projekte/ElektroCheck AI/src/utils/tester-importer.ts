export interface ImportedMeasurement {
  circuitNumber?: string;
  name: string;
  rPe?: string;
  rIso?: string;
  rcdTripTimeMs?: string;
  rcdTripCurrentMa?: string;
  loopImpedanceZs?: string;
  voltageV?: string;
  passed: boolean;
  date?: string;
}

export interface TesterImportResult {
  deviceType: 'BENNING' | 'GOSSEN_METRAWATT' | 'FLUKE' | 'GENERIC_CSV';
  measurements: ImportedMeasurement[];
  errors: string[];
}

/**
 * Parst CSV- oder Text-Exportdateien gängiger VDE-Installationstester
 * (Benning IT 130 / IT 200, Gossen Metrawatt Profitest Master, Fluke 1664 FC sowie Standard-Tabellen)
 */
export function parseTesterFile(content: string): TesterImportResult {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const errors: string[] = [];
  const measurements: ImportedMeasurement[] = [];

  if (lines.length === 0) {
    return { deviceType: 'GENERIC_CSV', measurements: [], errors: ['Datei ist leer'] };
  }

  // Erkennung des Messgeräte-Herstellers
  let deviceType: TesterImportResult['deviceType'] = 'GENERIC_CSV';
  const fullUpper = content.toUpperCase();
  if (fullUpper.includes('BENNING')) {
    deviceType = 'BENNING';
  } else if (fullUpper.includes('PROFITEST') || fullUpper.includes('GMC') || fullUpper.includes('GOSSEN')) {
    deviceType = 'GOSSEN_METRAWATT';
  } else if (fullUpper.includes('FLUKE') || fullUpper.includes('1664FC')) {
    deviceType = 'FLUKE';
  }

  // Finde die eigentliche Spaltenüberschriften-Zeile (enthält mindestens 2 typische Begriffe)
  const headerKeys = ['NAME', 'CIRCUIT', 'RPE', 'R-LOW', 'PE', 'RISO', 'R-INS', 'TA', 'TRIP', 'ZS', 'STATUS', 'POS', 'NR'];
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const rowUpper = lines[i].toUpperCase();
    const matches = headerKeys.filter(k => rowUpper.includes(k));
    if (matches.length >= 2) {
      headerRowIndex = i;
      break;
    }
  }

  const headerLine = lines[headerRowIndex];
  const delimiter = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(delimiter).map(h => h.trim().toUpperCase().replace(/["']/g, ''));
  
  const findCol = (keys: string[]) => {
    return headers.findIndex(h => keys.some(k => h.includes(k)));
  };

  const nameIdx = findCol(['NAME', 'OBJEKT', 'STROMKREIS', 'CIRCUIT', 'BEZEICHNUNG']);
  const rPeIdx = findCol(['RPE', 'R_PE', 'R-LOW', 'RLOW', 'PE']);
  const rIsoIdx = findCol(['RISO', 'R_ISO', 'R-ISO', 'R-INS', 'ISOLATION']);
  const rcdTimeIdx = findCol(['TA', 'T_A', 'T-RCD', 'RCD-T', 'AUSLÖSEZEIT', 'TRIP_TIME']);
  const rcdCurrentIdx = findCol(['IDN', 'I_DELTA', 'I-RCD', 'RCD-I', 'AUSLÖSESTROM', 'TRIP_CURRENT']);
  const zsIdx = findCol(['ZS', 'Z_S', 'ZLOOP', 'SCHLEIFE', 'LOOP']);
  const statusIdx = findCol(['STATUS', 'ERGEBNIS', 'RESULT', 'BEWERTUNG']);
  const circuitNrIdx = findCol(['NR', 'NUMMER', 'INDEX', 'POS', 'CIRCUIT']);

  for (let i = headerRowIndex + 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;
    const cols = rawLine.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));

    const cleanNum = (val: string | undefined): string | undefined => {
      if (!val) return undefined;
      const m = val.replace(',', '.').match(/[0-9.]+/);
      return m ? m[0] : undefined;
    };

    const circuitName = (nameIdx !== -1 && cols[nameIdx]) ? cols[nameIdx] : `Stromkreis ${i}`;
    const rPe = rPeIdx !== -1 ? cleanNum(cols[rPeIdx]) : undefined;
    const rIso = rIsoIdx !== -1 ? cleanNum(cols[rIsoIdx]) : undefined;
    const rcdTripTimeMs = rcdTimeIdx !== -1 ? cleanNum(cols[rcdTimeIdx]) : undefined;
    const rcdTripCurrentMa = rcdCurrentIdx !== -1 ? cleanNum(cols[rcdCurrentIdx]) : undefined;
    const loopImpedanceZs = zsIdx !== -1 ? cleanNum(cols[zsIdx]) : undefined;
    const circuitNumber = circuitNrIdx !== -1 && cols[circuitNrIdx] ? cols[circuitNrIdx] : `F${i}`;

    let passed = true;
    if (statusIdx !== -1 && cols[statusIdx]) {
      const st = cols[statusIdx].toUpperCase();
      passed = st.includes('PASS') || st.includes('GUT') || st.includes('BESTANDEN') || st.includes('OK');
    } else {
      // Automatische Plausibilitätsprüfung
      if (rPe && parseFloat(rPe) > 1.0) passed = false;
      if (rIso && parseFloat(rIso) < 1.0) passed = false;
      if (rcdTripTimeMs && parseFloat(rcdTripTimeMs) > 300) passed = false;
      if (rcdTripCurrentMa && (parseFloat(rcdTripCurrentMa) > 30 || parseFloat(rcdTripCurrentMa) < 15)) passed = false;
    }

    measurements.push({
      circuitNumber,
      name: circuitName,
      rPe,
      rIso,
      rcdTripTimeMs,
      rcdTripCurrentMa,
      loopImpedanceZs,
      passed
    });
  }

  return { deviceType, measurements, errors };
}
