import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildDguvPayload,
  sendReportEmail,
  createPdfPreviewUrl,
  downloadReportPdf,
  exportZvehCsv,
  exportZvehXml,
  downloadLegendPdf,
  type ReportContext,
} from './report-actions';
import * as pdfGenerator from './pdf-generator';
import * as fetchTimeoutModule from './fetch-timeout';
import * as zvehExportModule from './zveh-export';
import * as legendModule from './distribution-legend-generator';

vi.mock('./pdf-generator', () => ({
  buildPdfDocDefinition: vi.fn(() => ({ doc: 'definition' })),
  downloadPdf: vi.fn(async () => {}),
  generatePdfBlob: vi.fn(async () => new Blob(['pdf-data'], { type: 'application/pdf' })),
}));

vi.mock('./fetch-timeout', () => ({
  fetchWithTimeout: vi.fn(),
}));

vi.mock('./zveh-export', () => ({
  downloadFile: vi.fn(),
  generateZvehCsv: vi.fn(() => 'csv-content'),
  generateZvehXml: vi.fn(() => '<xml></xml>'),
}));

vi.mock('./distribution-legend-generator', () => ({
  downloadDistributionLegend: vi.fn(async () => {}),
}));

describe('buildDguvPayload', () => {
  it('liefert undefined ohne Messwerte', () => {
    expect(buildDguvPayload({ rPe: '', rIso: ' ', iLeak: '', signatureUrl: null })).toBeUndefined();
  });

  it('übernimmt Messwerte, Status und Unterschrift', () => {
    const payload = buildDguvPayload({ rPe: '0.2', rIso: '', iLeak: '', signatureUrl: 'data:image/png;base64,x' });
    expect(payload).toMatchObject({
      protectionClass: 'SK_I',
      rPe: '0.2',
      status: 'BESTANDEN',
      signatureUrl: 'data:image/png;base64,x',
    });
    expect(payload?.details).toEqual(['R_PE: 0.2 Ω (≤ 0.3 Ω) ✅']);
  });

  it('übernimmt die Auswertung des Prüfassistenten (Schutzklasse, Status, nächste Prüfung)', () => {
    const payload = buildDguvPayload({
      rPe: '0.2', rIso: '2', iLeak: '', signatureUrl: null,
      form: { protectionClass: 'SK_II', status: 'BESTANDEN', details: ['ok'], nextInspectionDate: '10/2027', equipmentName: 'Bohrhammer', inventoryNumber: 'INV-7' },
    });
    expect(payload).toMatchObject({ protectionClass: 'SK_II', status: 'BESTANDEN', details: ['ok'], nextInspectionDate: '10/2027', equipmentName: 'Bohrhammer', inventoryNumber: 'INV-7' });
  });

  it('ignoriert eine Formularauswertung ohne Messdaten', () => {
    expect(buildDguvPayload({ rPe: '', rIso: '', iLeak: '', signatureUrl: null, form: { status: 'KEINE MESSDATEN' } })).toBeUndefined();
  });

  it('markiert Grenzwertverletzungen als nicht bestanden', () => {
    expect(buildDguvPayload({ rPe: '1', rIso: '', iLeak: '', signatureUrl: null })?.status).toBe('NICHT BESTANDEN');
  });
});

describe('Report Actions & Email Dispatch', () => {
  const originalFileReader = globalThis.FileReader;

  const sampleContext: ReportContext = {
    result: {
      deviceName: 'Hauptverteilung UV-1',
      identifiedDefect: 'RCD defekt',
      recommendation: 'Austausch erforderlich',
      safetyLevel: 'DANGER',
      estimatedRepairCost: '150 €',
      repairDifficulty: 3,
      location: 'Keller',
      additionalTips: ['Vorgeschriebene Prüffrist beachten'],
      sparePartSearchTerm: 'RCD 40A 30mA',
      customerExperience: 'Kein Strom im Keller',
    },
    image: 'data:image/jpeg;base64,fakeimg',
    disclaimerText: 'Haftungsausschluss',
    inspector: {
      name: 'Max Mustermann',
      company: 'Elektro Meister GmbH',
    },
    dguv: {
      protectionClass: 'SK_I',
      rPe: '0.1',
      rIso: '20',
      iLeak: '0.5',
      iTouch: '',
      status: 'BESTANDEN',
      details: ['OK'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    class MockFileReader {
      result: string = 'data:application/pdf;base64,mocked-pdf-base64';
      onloadend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() {
        setTimeout(() => this.onloadend?.(), 0);
      }
    }
    (globalThis as unknown as Record<string, unknown>).FileReader = MockFileReader;
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
  });

  it('versendet Prüfbericht erfolgreich per E-Mail-API', async () => {
    const fetchMock = vi.mocked(fetchTimeoutModule.fetchWithTimeout);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'E-Mail erfolgreich versendet' }),
    } as unknown as Response);

    const message = await sendReportEmail(sampleContext, {
      recipient: ' kunde@example.com ',
      backendUrl: 'http://localhost:3000',
      headers: { Authorization: 'Bearer test' },
    });

    expect(message).toBe('E-Mail erfolgreich versendet');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/reports/send-email',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test' },
        body: expect.stringContaining('"recipientEmail":"kunde@example.com"'),
      }),
    );
    const parsedBody = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(parsedBody.recipientName).toBe('Kunde von Elektro Meister GmbH');
    expect(parsedBody.reportTitle).toContain('Hauptverteilung UV-1');
    expect(parsedBody.pdfBase64).toBe('data:application/pdf;base64,mocked-pdf-base64');
  });

  it('wirft Fehler bei fehlerhafter Server-Antwort', async () => {
    const fetchMock = vi.mocked(fetchTimeoutModule.fetchWithTimeout);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'SMTP Server nicht erreichbar' }),
    } as unknown as Response);

    await expect(
      sendReportEmail(sampleContext, {
        recipient: 'kunde@example.com',
        backendUrl: 'http://localhost:3000',
        headers: {},
      }),
    ).rejects.toThrow('SMTP Server nicht erreichbar');
  });

  it('nutzt Standard-Empfängername wenn keine Firma im Prüfer-Objekt angegeben ist', async () => {
    const fetchMock = vi.mocked(fetchTimeoutModule.fetchWithTimeout);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as unknown as Response);

    const ctxWithoutCompany: ReportContext = {
      ...sampleContext,
      inspector: { name: 'Erika', company: '' },
    };

    await sendReportEmail(ctxWithoutCompany, {
      recipient: 'test@example.com',
      backendUrl: 'http://localhost:3000',
      headers: {},
    });

    const parsedBody = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(parsedBody.recipientName).toBe('Auftraggeber');
  });

  it('unterstützt createPdfPreviewUrl', async () => {
    const originalCreateObjectURL = URL.createObjectURL;
    (URL as unknown as Record<string, unknown>).createObjectURL = vi.fn(() => 'blob:http://localhost/mock-preview');

    try {
      const previewUrl = await createPdfPreviewUrl(sampleContext);
      expect(previewUrl).toBe('blob:http://localhost/mock-preview');
      expect(pdfGenerator.generatePdfBlob).toHaveBeenCalled();
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
    }
  });

  it('unterstützt downloadReportPdf', async () => {
    await downloadReportPdf(sampleContext);
    expect(pdfGenerator.downloadPdf).toHaveBeenCalledWith(
      expect.anything(),
      'Protokoll_Hauptverteilung_UV-1.pdf',
    );
  });

  it('unterstützt exportZvehCsv und exportZvehXml', () => {
    exportZvehCsv(sampleContext);
    expect(zvehExportModule.generateZvehCsv).toHaveBeenCalled();
    expect(zvehExportModule.downloadFile).toHaveBeenCalledWith(
      'csv-content',
      'ZVEH_Export_Hauptverteilung_UV-1.csv',
      'text/csv;charset=utf-8;',
    );

    exportZvehXml(sampleContext);
    expect(zvehExportModule.generateZvehXml).toHaveBeenCalled();
    expect(zvehExportModule.downloadFile).toHaveBeenCalledWith(
      '<xml></xml>',
      'ZVEH_ECHECK_Hauptverteilung_UV-1.xml',
      'application/xml;charset=utf-8;',
    );
  });

  it('unterstützt downloadLegendPdf', async () => {
    await downloadLegendPdf(sampleContext);
    expect(legendModule.downloadDistributionLegend).toHaveBeenCalledWith(
      expect.objectContaining({
        boardName: 'Verteilung Hauptverteilung UV-1',
        location: 'Keller',
      }),
      'Stromkreisverzeichnis_Hauptverteilung_UV-1.pdf',
    );
  });
});

