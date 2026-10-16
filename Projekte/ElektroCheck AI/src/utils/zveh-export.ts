import type { DiagnosisResult } from '../services/ai-types';

export interface InspectionExportData {
  diagnosis: DiagnosisResult;
  dguvData?: {
    protectionClass?: string;
    rPe?: string;
    rIso?: string;
    iLeak?: string;
    iTouch?: string;
    rcdTripTimeMs?: string;
    rcdTripCurrentMa?: string;
    loopImpedanceZs?: string;
    equipmentName?: string;
    inventoryNumber?: string;
    nextInspectionDate?: string;
    status: string;
    details: string[];
  };
  inspectorData?: {
    name?: string;
    company?: string;
    id?: string;
  };
}

const EMPTY_DGUV: Partial<NonNullable<InspectionExportData['dguvData']>> = {};

/**
 * Erstellt einen CSV-Export im ZVEH-kompatiblen Format für Handwerker-Software (z.B. KWP, Streit V.1, Kplus)
 */
export function generateZvehCsv(data: InspectionExportData): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const d = data.dguvData || EMPTY_DGUV;
  const diag = data.diagnosis;
  const insp = data.inspectorData || {};

  const headers = [
    'ZVEH_DATENFORMAT_VERSION',
    'DATUM',
    'PRUEFER_NAME',
    'PRUEFER_FIRMA',
    'GERAET_NAME',
    'INVENTAR_NR',
    'SCHUTZKLASSE_NORM',
    'R_PE_OHM',
    'R_ISO_MOHM',
    'I_PE_MA',
    'I_TOUCH_MA',
    'RCD_TA_MS',
    'RCD_IDN_MA',
    'ZS_OHM',
    'GESAMTBEWERTUNG',
    'NAECHSTE_PRUEFUNG',
    'BEFUND_DIAGNOSE',
    'REPARATUR_EMPFEHLUNG'
  ];

  const escapeCsv = (val: string | undefined | null) => {
    if (!val) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const values = [
    '"ZVEH-VDE-1.0"',
    escapeCsv(dateStr),
    escapeCsv(insp.name || ''),
    escapeCsv(insp.company || ''),
    escapeCsv(d.equipmentName || diag.deviceName),
    escapeCsv(d.inventoryNumber || ''),
    escapeCsv(d.protectionClass || 'SK_I'),
    escapeCsv(d.rPe || ''),
    escapeCsv(d.rIso || ''),
    escapeCsv(d.iLeak || ''),
    escapeCsv(d.iTouch || ''),
    escapeCsv(d.rcdTripTimeMs || ''),
    escapeCsv(d.rcdTripCurrentMa || ''),
    escapeCsv(d.loopImpedanceZs || ''),
    escapeCsv(d.status || 'UNGEPRÜFT'),
    escapeCsv(d.nextInspectionDate || ''),
    escapeCsv(diag.identifiedDefect || ''),
    escapeCsv(diag.recommendation || '')
  ];

  return `${headers.join(';')}\r\n${values.join(';')}`;
}

/**
 * Erzeugt einen ZVEH-konformen XML-Export (E-CHECK Standard)
 */
export function generateZvehXml(data: InspectionExportData): string {
  const dateStr = new Date().toISOString();
  const d = data.dguvData || EMPTY_DGUV;
  const diag = data.diagnosis;
  const insp = data.inspectorData || {};

  const escXml = (val: string | undefined | null) => {
    if (!val) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<ZVEH_E_CHECK version="1.0" generated="${dateStr}">
  <Pruefer>
    <Name>${escXml(insp.name || '')}</Name>
    <Firma>${escXml(insp.company || '')}</Firma>
    <AusweisNr>${escXml(insp.id || '')}</AusweisNr>
  </Pruefer>
  <Pruefobjekt>
    <Bezeichnung>${escXml(d.equipmentName || diag.deviceName)}</Bezeichnung>
    <Inventarnummer>${escXml(d.inventoryNumber || '')}</Inventarnummer>
    <SchutzklasseNorm>${escXml(d.protectionClass || 'SK_I')}</SchutzklasseNorm>
  </Pruefobjekt>
  <Messwerte>
    <R_PE unit="Ohm">${escXml(d.rPe || '')}</R_PE>
    <R_ISO unit="MOhm">${escXml(d.rIso || '')}</R_ISO>
    <I_PE unit="mA">${escXml(d.iLeak || '')}</I_PE>
    <I_Touch unit="mA">${escXml(d.iTouch || '')}</I_Touch>
    <RCD_ta unit="ms">${escXml(d.rcdTripTimeMs || '')}</RCD_ta>
    <RCD_Idn unit="mA">${escXml(d.rcdTripCurrentMa || '')}</RCD_Idn>
    <LoopImpedance_Zs unit="Ohm">${escXml(d.loopImpedanceZs || '')}</LoopImpedance_Zs>
  </Messwerte>
  <Beurteilung>
    <Status>${escXml(d.status || 'UNGEPRÜFT')}</Status>
    <NaechstePruefung>${escXml(d.nextInspectionDate || '')}</NaechstePruefung>
    <Befund>${escXml(diag.identifiedDefect || '')}</Befund>
    <Empfehlung>${escXml(diag.recommendation || '')}</Empfehlung>
  </Beurteilung>
</ZVEH_E_CHECK>`;
}

/**
 * Triggert den Browser-Download eines Text-Strings (CSV/XML/JSON)
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
