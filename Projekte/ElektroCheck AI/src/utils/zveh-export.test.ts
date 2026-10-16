import { describe, it, expect } from 'vitest';
import { generateZvehCsv, generateZvehXml, type InspectionExportData } from './zveh-export';
import { buildDistributionLegendPdf } from './distribution-legend-generator';

describe('zveh-export', () => {
  it('funktioniert wie erwartet', () => {
    const dummyData: InspectionExportData = {
      diagnosis: {
        deviceName: 'Bohrhammer GBH 2-28',
        identifiedDefect: 'Kabelbruch Zuleitung',
        safetyLevel: 'WARNING' as const,
        estimatedRepairCost: '35 €',
        repairDifficulty: 2 as const,
        recommendation: 'Netzkabel ersetzen',
        additionalTips: [],
        sparePartSearchTerm: 'Netzkabel H07RN-F',
        customerExperience: 'Häufiger Fehler'
      },
      dguvData: {
        protectionClass: 'SK_II',
        rIso: '50.0',
        iTouch: '0.05',
        status: 'BESTANDEN',
        details: ['R_ISO bestanden']
      }
    };

    const csv = generateZvehCsv(dummyData);
    expect(csv.includes('ZVEH_DATENFORMAT_VERSION'), 'CSV Header fehlt').toBe(true);
    expect(csv.includes('Bohrhammer GBH 2-28'), 'Gerätename in CSV fehlt').toBe(true);

    const xml = generateZvehXml(dummyData);
    expect(xml.includes('<ZVEH_E_CHECK'), 'XML Root Element fehlt').toBe(true);
    expect(xml.includes('50.0'), 'Messwert in XML fehlt').toBe(true);

    const pdfDef = buildDistributionLegendPdf({
      boardName: 'UV-01',
      location: 'Technikraum',
      ratedVoltage: '400V',
      incomingFeed: '5x10',
      circuits: [{ circuitNumber: 'F1', name: 'Licht', mcbRating: 'B16', cableType: '3x1.5', rcdGroup: 'RCD1', room: 'Flur' }]
    });
    expect(Array.isArray(pdfDef.content) && pdfDef.content.length > 0, 'PDF Content fehlt').toBe(true);
  });
});
